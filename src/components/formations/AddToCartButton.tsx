'use client'

import React, { useState } from 'react'
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-hot-toast'

interface AddToCartButtonProps {
  sessionId: string
  sessionName?: string
  availableSpots: number
  className?: string
  fullWidth?: boolean
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  sessionId,
  sessionName = 'cette formation',
  availableSpots,
  className = '',
  fullWidth = false
}) => {
  const { addToCart, loading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async () => {
    if (availableSpots <= 0) {
      toast.error('Cette session est complète')
      return
    }

    setIsAdding(true)
    try {
      const success = await addToCart(sessionId)
      if (success) {
        setJustAdded(true)
        toast.success(`${sessionName} ajoutée au panier`)
        setTimeout(() => setJustAdded(false), 2000)
      } else {
        toast.error('Erreur lors de l\'ajout au panier')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier')
    } finally {
      setIsAdding(false)
    }
  }

  const isDisabled = loading || isAdding || availableSpots <= 0

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg ${fullWidth ? 'w-full justify-center' : ''} ${className}`}
    >
      {justAdded ? (
        <>
          <CheckIcon className="w-5 h-5" />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-5 h-5" />
          {availableSpots <= 0 ? 'Complet' : 'Ajouter au panier'}
        </>
      )}
    </button>
  )
}

export default AddToCartButton