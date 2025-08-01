// Service Supabase pour le panier - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Cart, 
  CartItem,
  APIResponse
} from './formations-types'

export class CartService {
  // =============================================================================
  // GESTION DU PANIER
  // =============================================================================

  /**
   * Récupère ou crée un panier pour l'utilisateur
   */
  static async getOrCreateCart(userId?: string, sessionId?: string): Promise<APIResponse<Cart>> {
    try {
      // Recherche d'un panier existant
      let query = supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            formation_sessions (
              *,
              formations (*)
            )
          )
        `)
        .gte('expires_at', new Date().toISOString())

      if (userId) {
        query = query.eq('user_id', userId)
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
      } else {
        return {
          data: null as any,
          success: false,
          message: 'Identifiant utilisateur ou session requis'
        }
      }

      console.log('Recherche panier avec:', { userId, sessionId })
      const { data: existingCart, error: fetchError } = await query.single()

      if (existingCart && !fetchError) {
        // Mapper cart_items vers items et formation_sessions vers session
        const cartWithItems = {
          ...existingCart,
          items: existingCart.cart_items?.map((item: any) => ({
            ...item,
            session: item.formation_sessions ? {
              ...item.formation_sessions,
              formation: item.formation_sessions.formations
            } : undefined
          })) || []
        }
        
        // Supprimer cart_items pour éviter la confusion
        delete cartWithItems.cart_items
        
        console.log('Panier trouvé:', cartWithItems)
        console.log('Items dans le panier:', cartWithItems.items)
        console.log('Nombre d\'items:', cartWithItems.items?.length || 0)
        
        // Vérifier si les items sont bien chargés
        if (cartWithItems.items && cartWithItems.items.length > 0) {
          console.log('Premier item:', cartWithItems.items[0])
        }
        
        return {
          data: cartWithItems,
          success: true
        }
      }

      // Créer un nouveau panier si inexistant
      const newCartData = userId 
        ? { user_id: userId }
        : { session_id: sessionId }

      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert([newCartData])
        .select()
        .single()

      if (createError) throw createError

      return {
        data: { ...newCart, items: [] },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la récupération du panier'
      }
    }
  }

  /**
   * Ajoute un item au panier
   */
  static async addToCart(
    cartId: string, 
    sessionId: string, 
    quantity: number = 1
  ): Promise<APIResponse<CartItem>> {
    try {
      console.log('AddToCart appelé avec:', { cartId, sessionId, quantity })
      
      // Vérifier si l'item existe déjà
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('session_id', sessionId)
        .single()
      
      console.log('Item existant:', existingItem, 'Erreur:', checkError)

      if (existingItem) {
        // Mettre à jour la quantité
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            added_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select(`
            *,
            formation_sessions (
              *,
              formations (*)
            )
          `)
          .single()

        if (error) throw error

        return {
          data,
          success: true,
          message: 'Quantité mise à jour'
        }
      }

      // Récupérer le prix de la session
      const { data: session } = await supabase
        .from('formation_sessions')
        .select(`
          price_override,
          formation:formations(price)
        `)
        .eq('id', sessionId)
        .single()

      const price = session?.price_override || session?.formation?.price || 0

      // Créer un nouvel item
      console.log('Création nouvel item avec:', {
        cart_id: cartId,
        session_id: sessionId,
        quantity,
        price_at_time: price
      })
      
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          session_id: sessionId,
          quantity,
          price_at_time: price
        }])
        .select(`
          *,
          formation_sessions (
            *,
            formations (*)
          )
        `)
        .single()

      console.log('Résultat insertion:', { data, error })
      
      if (error) throw error

      // Mettre à jour l'expiration du panier
      await this.extendCartExpiration(cartId)

      console.log('Item ajouté avec succès:', data)

      // Vérifier immédiatement après l'ajout
      const { data: verifyCart } = await supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            formation_sessions (
              *,
              formations (*)
            )
          )
        `)
        .eq('id', cartId)
        .single()
      
      if (verifyCart) {
        console.log('Vérification après ajout - Panier brut:', verifyCart)
        console.log('Vérification après ajout - cart_items:', verifyCart.cart_items)
        console.log('Vérification après ajout - Nombre cart_items:', verifyCart.cart_items?.length || 0)
      }

      // Mapper les données pour cohérence avec le format attendu
      const itemWithSession = {
        ...data,
        session: data.formation_sessions ? {
          ...data.formation_sessions,
          formation: data.formation_sessions.formations
        } : undefined
      }
      delete itemWithSession.formation_sessions

      return {
        data: itemWithSession,
        success: true,
        message: 'Formation ajoutée au panier'
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error?.message || error)
      return {
        data: null as any,
        success: false,
        message: error?.message || 'Erreur lors de l\'ajout au panier'
      }
    }
  }

  /**
   * Met à jour la quantité d'un item
   */
  static async updateCartItemQuantity(
    itemId: string, 
    quantity: number
  ): Promise<APIResponse<CartItem>> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(itemId)
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select(`
          *,
          session:formation_sessions(
            *,
            formation:formations(*)
          )
        `)
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Quantité mise à jour'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime un item du panier
   */
  static async removeFromCart(itemId: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Formation retirée du panier'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  /**
   * Vide complètement le panier
   */
  static async clearCart(cartId: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Panier vidé'
      }
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors du vidage'
      }
    }
  }

  // =============================================================================
  // TRANSFERT DE PANIER
  // =============================================================================

  /**
   * Transfère un panier anonyme vers un utilisateur connecté
   */
  static async transferCartToUser(
    sessionId: string, 
    userId: string
  ): Promise<APIResponse<Cart>> {
    try {
      // Récupérer le panier anonyme
      const { data: anonymousCart } = await supabase
        .from('carts')
        .select('id')
        .eq('session_id', sessionId)
        .single()

      if (!anonymousCart) {
        return this.getOrCreateCart(userId)
      }

      // Vérifier si l'utilisateur a déjà un panier
      const { data: userCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (userCart) {
        // Fusionner les paniers
        await this.mergeCarts(anonymousCart.id, userCart.id)
        
        // Supprimer le panier anonyme
        await supabase
          .from('carts')
          .delete()
          .eq('id', anonymousCart.id)

        return this.getOrCreateCart(userId)
      }

      // Transférer le panier anonyme à l'utilisateur
      const { error } = await supabase
        .from('carts')
        .update({ 
          user_id: userId,
          session_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', anonymousCart.id)

      if (error) throw error

      return this.getOrCreateCart(userId)
    } catch (error) {
      console.error('Erreur lors du transfert du panier:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors du transfert'
      }
    }
  }

  // =============================================================================
  // CALCULS ET VALIDATIONS
  // =============================================================================

  /**
   * Calcule le total du panier
   */
  static async getCartTotal(cartId: string): Promise<APIResponse<{
    subtotal: number
    tax: number
    total: number
    itemsCount: number
  }>> {
    try {
      const { data: items } = await supabase
        .from('cart_items')
        .select('quantity, price_at_time')
        .eq('cart_id', cartId)

      const subtotal = items?.reduce((sum, item) => 
        sum + (item.price_at_time * item.quantity), 0
      ) || 0

      const tax = subtotal * 0.20 // TVA 20%
      const total = subtotal + tax
      const itemsCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0

      return {
        data: { subtotal, tax, total, itemsCount },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du calcul du total:', error)
      return {
        data: { subtotal: 0, tax: 0, total: 0, itemsCount: 0 },
        success: false,
        message: 'Erreur lors du calcul'
      }
    }
  }

  /**
   * Vérifie la disponibilité des places
   */
  static async validateCartAvailability(cartId: string): Promise<APIResponse<{
    valid: boolean
    errors: string[]
  }>> {
    try {
      const { data: items } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          session:formation_sessions(
            id,
            available_spots,
            status,
            formation:formations(title)
          )
        `)
        .eq('cart_id', cartId)

      const errors: string[] = []

      for (const item of items || []) {
        if (item.session?.status !== 'scheduled' && item.session?.status !== 'confirmed') {
          errors.push(`La session "${item.session?.formation?.title}" n'est plus disponible`)
        } else if (item.quantity > (item.session?.available_spots || 0)) {
          errors.push(`Seulement ${item.session?.available_spots} places disponibles pour "${item.session?.formation?.title}"`)
        }
      }

      return {
        data: { 
          valid: errors.length === 0, 
          errors 
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      return {
        data: { valid: false, errors: ['Erreur de validation'] },
        success: false,
        message: 'Erreur lors de la validation'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES PRIVÉS
  // =============================================================================

  /**
   * Étend l'expiration du panier
   */
  private static async extendCartExpiration(cartId: string): Promise<void> {
    await supabase
      .from('carts')
      .update({ 
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId)
  }

  /**
   * Fusionne deux paniers
   */
  private static async mergeCarts(fromCartId: string, toCartId: string): Promise<void> {
    const { data: fromItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', fromCartId)

    for (const item of fromItems || []) {
      await this.addToCart(toCartId, item.session_id, item.quantity)
    }
  }
}