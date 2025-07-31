'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPinIcon, CalendarIcon, UsersIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'
import ButtonPrimary from '@/shared/ButtonPrimary'
import AddToCartButton from './AddToCartButton'
import type { FormationSession } from '@/lib/supabase/formations-types'

interface FormationCardProps {
  session: FormationSession
  className?: string
}

const FormationCard: React.FC<FormationCardProps> = ({ session, className = '' }) => {
  const formation = session.formation

  if (!formation) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'debutant': return 'green'
      case 'intermediaire': return 'yellow'
      case 'avance': return 'blue'
      case 'expert': return 'red'
      default: return 'gray'
    }
  }

  const spotsPercentage = ((session.total_spots - session.available_spots) / session.total_spots) * 100

  return (
    <div className={`nc-FormationCard group relative bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
      <Link href={`/formations/${formation.slug}`} className="absolute inset-0 z-0" />
      
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={formation.thumbnail_image || formation.featured_image || '/images/formation-default.svg'}
          alt={formation.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 z-10">
          <Badge color={getLevelColor(formation.level)} name={formation.level || 'Tous niveaux'} />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary-600 transition-colors">
            {formation.title}
          </h3>
          {formation.instructor && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Par {formation.instructor.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <MapPinIcon className="w-4 h-4" />
            <span>{session.city}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(session.start_date)}</span>
            {formation.duration_days > 1 && (
              <span>- {formatDate(session.end_date)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <AcademicCapIcon className="w-4 h-4" />
            <span>{formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Places disponibles</span>
            <span className="font-medium">{session.available_spots} / {session.total_spots}</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${spotsPercentage}%` }}
            />
          </div>
          {session.available_spots <= 5 && session.available_spots > 0 && (
            <p className="text-xs text-orange-500">Plus que {session.available_spots} places !</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              {session.price_override || formation.price}€
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400"> TTC</span>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/formations/${formation.slug}`} className="relative z-10">
              <ButtonPrimary 
                sizeClass="px-4 py-2"
                className="!bg-neutral-200 !text-neutral-700 hover:!bg-neutral-300 dark:!bg-neutral-700 dark:!text-neutral-200 dark:hover:!bg-neutral-600"
              >
                Détails
              </ButtonPrimary>
            </Link>
            <AddToCartButton
              sessionId={session.id}
              sessionName={`${formation.title} - ${session.city}`}
              availableSpots={session.available_spots}
              className="relative z-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormationCard