'use client'

import React, { useState } from 'react'
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import ButtonPrimary from '@/shared/ButtonPrimary'
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
    <ButtonPrimary
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      sizeClass="px-4 py-2 sm:px-5"
    >
      {justAdded ? (
        <>
          <CheckIcon className="w-5 h-5 mr-2" />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          {availableSpots <= 0 ? 'Complet' : 'Ajouter au panier'}
        </>
      )}
    </ButtonPrimary>
  )
}

export default AddToCartButton