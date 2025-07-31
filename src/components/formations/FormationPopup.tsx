'use client'

import React from 'react'
import { Formation } from '@/lib/supabase/formations-types'
import { XMarkIcon, CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { ShoppingCartIcon } from '@heroicons/react/24/solid'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import Link from 'next/link'
import Image from 'next/image'

interface FormationPopupProps {
  formation: Formation
  isOpen: boolean
  onClose: () => void
  onAddToCart: (formation: Formation) => void
}

export default function FormationPopup({ formation, isOpen, onClose, onAddToCart }: FormationPopupProps) {
  if (!isOpen) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDifficultyLabel = (level?: string) => {
    const levels: Record<string, string> = {
      'beginner': 'Débutant',
      'intermediate': 'Intermédiaire',
      'advanced': 'Avancé',
      'expert': 'Expert'
    }
    return levels[level || 'beginner'] || 'Débutant'
  }

  const getDifficultyColor = (level?: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'advanced': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'expert': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[level || 'beginner'] || colors.beginner
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header avec image */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-cyan-600">
            {formation.featured_image && (
              <Image
                src={formation.featured_image}
                alt={formation.title}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>

            {/* Badge niveau */}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(formation.level)}`}>
                {getDifficultyLabel(formation.level)}
              </span>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
            {/* Titre et prix */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white pr-4">
                {formation.title}
              </h2>
              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                  {formation.price} €
                </p>
                {formation.early_bird_price && formation.early_bird_price < formation.price && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-through">
                    {formation.price} €
                  </p>
                )}
              </div>
            </div>

            {/* Description courte */}
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              {formation.short_description}
            </p>

            {/* Infos clés */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Dates</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {formation.start_date && formatDate(formation.start_date)}
                    {formation.end_date && formation.end_date !== formation.start_date && (
                      <> - {formatDate(formation.end_date)}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Durée</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Places</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {formation.capacity} participants max
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Formateur</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {typeof formation.instructor === 'string' ? formation.instructor : formation.instructor?.name || 'Expert ONM'}
                  </p>
                </div>
              </div>
            </div>

            {/* Objectifs */}
            {formation.learning_objectives && formation.learning_objectives.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Objectifs de la formation
                </h3>
                <ul className="space-y-2">
                  {formation.learning_objectives.slice(0, 3).map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {objective}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Link href={`/formations/${formation.slug}`} className="flex-1">
                <ButtonSecondary className="w-full">
                  Plus d'infos
                </ButtonSecondary>
              </Link>
              
              <button
                onClick={() => onAddToCart(formation)}
                className="flex-1 group relative overflow-hidden"
              >
                <ButtonPrimary className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transform transition-all duration-200 hover:scale-[1.02]">
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>Réserver maintenant</span>
                  </span>
                </ButtonPrimary>
                <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
              </button>
            </div>

            {/* Message incitatif */}
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
              🔥 Places limitées - Ne manquez pas cette opportunité !
            </p>
          </div>
        </div>
      </div>
    </>
  )
}