'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { CartService } from '@/lib/supabase/cart'
import { useSupabase } from './SupabaseProvider'
import { useUser } from '@/hooks/useUser'
import type { Cart, CartItem } from '@/lib/supabase/formations-types'
import { v4 as uuidv4 } from 'uuid'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  itemsCount: number
  total: number
  addToCart: (sessionId: string, quantity?: number) => Promise<boolean>
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>
  removeFromCart: (itemId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const user = useUser()
  const { supabase } = useSupabase()

  // Calculer le nombre total d'items et le montant total
  const itemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const total = cart?.items?.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0) || 0

  // Générer ou récupérer l'ID de session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('cart_session_id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      const newSessionId = uuidv4()
      localStorage.setItem('cart_session_id', newSessionId)
      setSessionId(newSessionId)
    }
  }, [])

  // Charger le panier
  const loadCart = useCallback(async () => {
    if (!sessionId && !user?.id) return

    setLoading(true)
    try {
      const result = await CartService.getOrCreateCart(user?.id, sessionId || undefined)
      console.log('LoadCart result:', result)
      if (result.success && result.data) {
        // Créer un nouvel objet pour forcer la mise à jour de React
        const newCart = {
          ...result.data,
          items: result.data.items ? [...result.data.items] : []
        }
        setCart(newCart)
        console.log('Cart updated with', newCart.items.length, 'items')
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, sessionId])

  // Charger le panier au montage et lors des changements d'utilisateur
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Transférer le panier anonyme lors de la connexion
  useEffect(() => {
    if (user?.id && sessionId) {
      CartService.transferCartToUser(sessionId, user.id).then(() => {
        localStorage.removeItem('cart_session_id')
        loadCart()
      })
    }
  }, [user?.id, sessionId, loadCart])

  // Ajouter au panier
  const addToCart = async (formationSessionId: string, quantity = 1): Promise<boolean> => {
    if (!cart) {
      console.error('Pas de panier disponible')
      return false
    }

    try {
      console.log('Adding to cart:', { cartId: cart.id, sessionId: formationSessionId, quantity })
      const result = await CartService.addToCart(cart.id, formationSessionId, quantity)
      console.log('Add to cart result:', result)
      
      if (result.success) {
        // Attendre un peu avant de recharger pour s'assurer que la BD est à jour
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Réinitialiser l'état du panier pour forcer React à re-render
        setCart(null)
        
        // Forcer le rechargement complet du panier
        const reloadResult = await CartService.getOrCreateCart(user?.id, sessionId || undefined)
        console.log('Reload cart result:', reloadResult)
        
        if (reloadResult.success && reloadResult.data) {
          setCart(reloadResult.data)
          console.log('Cart reloaded with', reloadResult.data.items?.length || 0, 'items')
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur ajout panier:', error)
      return false
    }
  }

  // Mettre à jour la quantité
  const updateItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const result = await CartService.updateCartItemQuantity(itemId, quantity)
      if (result.success) {
        await loadCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur mise à jour quantité:', error)
      return false
    }
  }

  // Retirer du panier
  const removeFromCart = async (itemId: string): Promise<boolean> => {
    try {
      const result = await CartService.removeFromCart(itemId)
      if (result.success) {
        await loadCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur suppression panier:', error)
      return false
    }
  }

  // Vider le panier
  const clearCart = async (): Promise<boolean> => {
    if (!cart) return false

    try {
      const result = await CartService.clearCart(cart.id)
      if (result.success) {
        await loadCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur vidage panier:', error)
      return false
    }
  }

  const value = {
    cart,
    loading,
    itemsCount,
    total,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}