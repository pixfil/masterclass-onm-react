'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, ClockIcon, AcademicCapIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'
import ButtonPrimary from '@/shared/ButtonPrimary'
import type { Formation } from '@/lib/supabase/formations-types'

interface FormationCardSimpleProps {
  formation: Formation
  className?: string
}

const FormationCardSimple: React.FC<FormationCardSimpleProps> = ({ formation, className = '' }) => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <div className={`nc-FormationCardSimple group relative bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
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
        {formation.module_number && (
          <div className="absolute top-4 right-4 z-10">
            <Badge color="dark" name={`Module ${formation.module_number}`} />
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {formation.title}
          </h3>
          {formation.short_description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
              {formation.short_description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {formation.start_date && formation.end_date && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(formation.start_date)}</span>
              {formation.duration_days > 1 && (
                <>
                  <span>-</span>
                  <span>{formatDate(formation.end_date)}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}</span>
          </div>

          {formation.capacity && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <UsersIcon className="w-4 h-4" />
              <span>{formation.capacity} places</span>
            </div>
          )}

          {formation.instructor && typeof formation.instructor === 'object' && formation.instructor.name && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <AcademicCapIcon className="w-4 h-4" />
              <span>Formateur: {formation.instructor.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatPrice(formation.price)}
            </span>
          </div>
          <ButtonPrimary 
            href={`/formations/${formation.slug}`}
            sizeClass="px-4 py-2"
            className="relative z-10"
          >
            Voir détails
          </ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default FormationCardSimple