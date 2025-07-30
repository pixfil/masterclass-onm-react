'use client'

import { useState, useEffect } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/supabase/clients'
import { useAuth } from '@/contexts/AuthContext'

interface WishlistButtonProps {
  propertyId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const WishlistButton = ({ 
  propertyId, 
  className = '',
  size = 'md',
  showText = false 
}: WishlistButtonProps) => {
  const { user } = useAuth()
  const [isInList, setIsInList] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Tailles des icônes selon la prop size
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  // Vérifier le statut initial
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user?.id) {
        setCheckingStatus(false)
        return
      }

      try {
        const inList = await isInWishlist(user.id, propertyId)
        setIsInList(inList)
      } catch (error) {
        console.error('Erreur lors de la vérification de la wishlist:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    checkWishlistStatus()
  }, [user?.id, propertyId])

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Empêcher la navigation si le bouton est dans un lien
    e.stopPropagation()

    if (!user?.id) {
      // TODO: Rediriger vers la page de connexion ou afficher une modal
      alert('Vous devez être connecté pour ajouter des propriétés à votre liste de souhaits')
      return
    }

    if (loading) return

    try {
      setLoading(true)

      if (isInList) {
        await removeFromWishlist(user.id, propertyId)
        setIsInList(false)
      } else {
        await addToWishlist(user.id, propertyId)
        setIsInList(true)
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la wishlist:', error)
      alert(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Si on ne peut pas déterminer le statut et qu'on n'est pas connecté
  if (checkingStatus && !user) {
    return null
  }

  // Affichage pendant le chargement du statut initial
  if (checkingStatus) {
    return (
      <button
        disabled
        className={`
          inline-flex items-center justify-center
          p-2 rounded-full transition-colors
          bg-white/80 backdrop-blur-sm
          border border-neutral-200
          ${className}
        `}
        title="Chargement..."
      >
        <div className={`animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600 ${iconSizes[size]}`}></div>
      </button>
    )
  }

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`
        inline-flex items-center justify-center gap-2
        p-2 rounded-full transition-all duration-200
        ${isInList 
          ? 'bg-red-500 text-white shadow-lg hover:bg-red-600' 
          : 'bg-white/80 backdrop-blur-sm text-neutral-600 hover:text-red-500 border border-neutral-200 hover:border-red-300'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={isInList ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`}></div>
      ) : isInList ? (
        <HeartSolidIcon className={iconSizes[size]} />
      ) : (
        <HeartIcon className={iconSizes[size]} />
      )}
      
      {showText && (
        <span className="text-sm font-medium">
          {isInList ? 'Ajouté' : 'Ajouter'}
        </span>
      )}
    </button>
  )
}