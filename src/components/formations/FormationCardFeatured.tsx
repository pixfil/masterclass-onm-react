'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { StarIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/solid'
import { Badge } from '@/shared/Badge'
import ButtonPrimary from '@/shared/ButtonPrimary'
import type { Formation } from '@/lib/supabase/formations-types'

interface FormationCardFeaturedProps {
  formation: Formation
  featured?: boolean
  className?: string
}

const FormationCardFeatured: React.FC<FormationCardFeaturedProps> = ({ 
  formation, 
  featured = false,
  className = '' 
}) => {
  const renderRating = () => {
    return (
      <div className="flex items-center gap-1">
        <StarIcon className="w-5 h-5 text-yellow-400" />
        <span className="font-medium">{formation.average_rating.toFixed(1)}</span>
        <span className="text-neutral-500 dark:text-neutral-400">
          ({formation.total_registrations} avis)
        </span>
      </div>
    )
  }

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'debutant': return 'Débutant'
      case 'intermediaire': return 'Intermédiaire'
      case 'avance': return 'Avancé'
      case 'expert': return 'Expert'
      default: return 'Tous niveaux'
    }
  }

  return (
    <div className={`nc-FormationCardFeatured group relative ${featured ? 'lg:scale-105' : ''} ${className}`}>
      <div className={`relative bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${featured ? 'ring-2 ring-primary-500' : ''}`}>
        {featured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge name="Recommandé" color="red" />
          </div>
        )}
        
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={formation.featured_image || '/images/formation-default.jpg'}
            alt={formation.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Badge 
              name={getLevelLabel(formation.level)} 
              className="mb-2"
            />
            <h3 className="text-2xl font-bold line-clamp-2">
              {formation.title}
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {formation.instructor && (
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Formateur : {formation.instructor.name}
            </p>
          )}

          <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3">
            {formation.short_description || formation.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-neutral-500" />
              <span>{formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <UsersIcon className="w-4 h-4 text-neutral-500" />
              <span>{formation.capacity} places max</span>
            </div>
          </div>

          {formation.average_rating > 0 && renderRating()}

          <div className="pt-4 space-y-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">À partir de</p>
                <p className="text-2xl font-bold text-primary-600">{formation.price}€ TTC</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formation.total_sessions} sessions
                </p>
                <p className="text-sm font-medium text-green-600">
                  Disponibles
                </p>
              </div>
            </div>

            <ButtonPrimary 
              href={`/formations/${formation.slug}`}
              className="w-full justify-center"
            >
              Voir les dates et s'inscrire
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormationCardFeatured