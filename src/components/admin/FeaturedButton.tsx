'use client'

import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabaseClient'

interface FeaturedButtonProps {
  propertyId: string
  isFeatured: boolean
  onToggle?: (newState: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const FeaturedButton = ({ 
  propertyId, 
  isFeatured, 
  onToggle,
  size = 'md',
  className = '' 
}: FeaturedButtonProps) => {
  const [loading, setLoading] = useState(false)
  const [featured, setFeatured] = useState(isFeatured)

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    try {
      setLoading(true)
      
      const newFeaturedState = !featured
      
      const { error } = await supabase
        .from('properties')
        .update({ 
          is_featured: newFeaturedState,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (error) {
        throw error
      }

      setFeatured(newFeaturedState)
      
      if (onToggle) {
        onToggle(newFeaturedState)
      }

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut vedette:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200
        ${featured 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-neutral-400 hover:text-yellow-500'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
        ${className}
      `}
      title={featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`}></div>
      ) : featured ? (
        <StarSolidIcon className={`${iconSizes[size]} fill-current`} />
      ) : (
        <StarIcon className={iconSizes[size]} />
      )}
    </button>
  )
}