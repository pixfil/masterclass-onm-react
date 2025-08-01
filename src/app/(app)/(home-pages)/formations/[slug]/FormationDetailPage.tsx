'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  ClockIcon,
  AcademicCapIcon,
  CheckIcon,
  StarIcon,
  ArrowLeftIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  BoltIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'
import ButtonPrimary from '@/shared/ButtonPrimary'
import AddToCartButton from '@/components/formations/AddToCartButton'
import HeroFormationDetail from '@/components/formations/HeroFormationDetail'
import type { Formation } from '@/lib/supabase/formations-types'

interface FormationDetailPageProps {
  formation: Formation
}

const FormationDetailPage: React.FC<FormationDetailPageProps> = ({ formation }) => {
  const [activeTab, setActiveTab] = useState<'program' | 'sessions' | 'informations' | 'instructor' | 'reviews'>('program')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showReservationModal, setShowReservationModal] = useState(false)
  
  const images = [
    formation.hero_image || formation.featured_image || '/images/formation-default.svg',
    ...(formation.gallery_images || [])
  ].filter(Boolean)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
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

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'debutant': return 'Débutant'
      case 'intermediaire': return 'Intermédiaire'
      case 'avance': return 'Avancé'
      case 'expert': return 'Expert'
      default: return 'Tous niveaux'
    }
  }

  const renderTabs = () => {
    const tabs = [
      { id: 'program', label: 'Programme', icon: AcademicCapIcon },
      { id: 'sessions', label: 'Sessions', icon: CalendarIcon },
      { id: 'informations', label: 'Informations', icon: InformationCircleIcon },
      { id: 'instructor', label: 'Formateur', icon: UsersIcon },
      { id: 'reviews', label: 'Avis', icon: StarIcon }
    ]

    return (
      <nav className="flex space-x-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          )
        })}
      </nav>
    )
  }

  const renderProgram = () => (
    <div className="space-y-8">
      {/* Programme avec la nouvelle structure */}
      {formation.program ? (
        <>
          {/* Objectifs d'apprentissage */}
          {formation.program.objectives && formation.program.objectives.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                Objectifs pédagogiques
              </h3>
              <div className="space-y-2">
                {formation.program.objectives.map((objective: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programme par jour */}
          {formation.program.curriculum && formation.program.curriculum.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                Programme détaillé
              </h3>
              <div className="space-y-6">
                {formation.program.curriculum.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-4">
                      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                        {day.day} {day.title && `- ${day.title}`}
                      </h4>
                    </div>
                    <div className="p-6 space-y-6">
                      {day.topics.map((topic: any, topicIndex: number) => (
                        <div key={topicIndex} className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h5 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {topic.title}
                            </h5>
                            {topic.duration && (
                              <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                                <ClockIcon className="w-4 h-4" />
                                {topic.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prérequis */}
          {formation.program.prerequisites && formation.program.prerequisites.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Prérequis</h3>
              <div className="space-y-2">
                {formation.program.prerequisites.map((prerequisite: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-neutral-700 dark:text-neutral-300">{prerequisite}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ce qui est inclus */}
          {formation.program.includes && formation.program.includes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Ce qui est inclus</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formation.program.includes.map((include: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-neutral-600 dark:text-neutral-400">{include}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Fallback à l'ancienne structure */}
          {formation.learning_objectives && formation.learning_objectives.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                Objectifs pédagogiques
              </h3>
              <div className="space-y-2">
                {formation.learning_objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formation.prerequisites && formation.prerequisites.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Prérequis</h3>
              <div className="space-y-2">
                {formation.prerequisites.map((prerequisite, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-neutral-700 dark:text-neutral-300">{prerequisite}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  const renderSessions = () => (
    <div className="space-y-6">
      {formation.sessions && formation.sessions.length > 0 ? (
        <>
          <p className="text-neutral-600 dark:text-neutral-400">
            {formation.sessions.length} session{formation.sessions.length > 1 ? 's' : ''} disponible{formation.sessions.length > 1 ? 's' : ''}
          </p>
          
          <div className="grid gap-4">
            {formation.sessions.map((session) => (
              <div key={session.id} className="bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="font-medium">{session.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(session.start_date)}</span>
                        {formation.duration_days > 1 && (
                          <span>- {formatDate(session.end_date)}</span>
                        )}
                      </div>
                    </div>

                    {session.venue_name && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Lieu : {session.venue_name}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {session.available_spots} / {session.total_spots} places disponibles
                        </span>
                      </div>
                      
                      <div className="text-lg font-bold text-blue-600">
                        {session.price_override || formation.price}€ TTC
                      </div>
                    </div>

                    {session.available_spots <= 5 && session.available_spots > 0 && (
                      <p className="text-sm text-orange-500 font-medium">
                        Plus que {session.available_spots} places disponibles !
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {session.available_spots > 0 ? (
                      <AddToCartButton
                        sessionId={session.id}
                        sessionName={`${formation.title} - ${session.city}`}
                        availableSpots={session.available_spots}
                      />
                    ) : (
                      <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-lg text-center">
                        Complet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            Aucune session programmée pour le moment
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
            Nouvelles dates bientôt disponibles
          </p>
        </div>
      )}
    </div>
  )

  const renderInstructor = () => (
    <div>
      {formation.instructor ? (
        <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8 shadow-sm">
          <div className="flex items-start gap-6">
            {formation.instructor.photo_url && (
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={formation.instructor.photo_url}
                  alt={formation.instructor.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{formation.instructor.name}</h3>
              {formation.instructor.title && (
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {formation.instructor.title}
                </p>
              )}
              
              {formation.instructor.bio && (
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {formation.instructor.bio}
                </p>
              )}

              {formation.instructor.specialties && formation.instructor.specialties.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Spécialités</h4>
                  <div className="flex flex-wrap gap-2">
                    {formation.instructor.specialties.map((specialty, index) => (
                      <Badge key={index} name={specialty} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                {formation.instructor.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span>{formation.instructor.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <div>{formation.instructor.formations_count} formations</div>
                <div>{formation.instructor.total_students} étudiants</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-neutral-500 dark:text-neutral-400">
          Informations sur le formateur non disponibles
        </p>
      )}
    </div>
  )

  const renderInformations = () => (
    <div className="space-y-8">
      {/* Lieu et Adresse */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <MapPinIcon className="w-6 h-6 text-white" />
          </div>
          Lieu de formation
        </h3>
        <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                {formation.venue_name || 'Centre de formation ONM'}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                {formation.venue_address || 'Adresse à confirmer selon la session'}
              </p>
            </div>
            {formation.venue_details && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
                {formation.venue_details}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Horaires */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          Horaires
        </h3>
        <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Début</h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                {formation.start_time || '9h00'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Fin</h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                {formation.end_time || '17h30'}
              </p>
            </div>
          </div>
          {formation.schedule_details && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {formation.schedule_details}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Éléments inclus */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <CheckIcon className="w-6 h-6 text-white" />
          </div>
          Inclus dans la formation
        </h3>
        <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formation.included_services || [
              'Support de cours complet',
              'Certificat de formation',
              'Accès à la plateforme en ligne',
              'Petit-déjeuner et pauses café',
              'Déjeuner inclus'
            ]).map((service, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-300">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderReviews = () => (
    <div className="space-y-6">
      {formation.average_rating > 0 ? (
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/20 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formation.average_rating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(formation.average_rating) ? 'text-yellow-400' : 'text-neutral-300'}`}
                  />
                ))}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {formation.total_registrations} avis
              </div>
            </div>
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-400">
            Les avis détaillés seront bientôt disponibles.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <StarIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            Aucun avis pour le moment
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
            Soyez le premier à donner votre avis !
          </p>
        </div>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'program': return renderProgram()
      case 'sessions': return renderSessions()
      case 'informations': return renderInformations()
      case 'instructor': return renderInstructor()
      case 'reviews': return renderReviews()
      default: return renderProgram()
    }
  }

  return (
    <div className="nc-FormationDetailPage">
      {/* Hero animé avec JawAnimation */}
      <HeroFormationDetail 
        formation={formation} 
        onReservationClick={() => setShowReservationModal(true)}
      />

      {/* Header avec image et infos principales (masqué car remplacé par le hero) */}
      <div className="relative hidden">
        <div className="aspect-[21/9] sm:aspect-[3/1] lg:aspect-[4/1] relative overflow-hidden">
          <Image
            src={images[selectedImageIndex]}
            alt={formation.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Contrôles en bas à gauche */}
          <div className="absolute bottom-4 left-4 flex items-end gap-4">
            {/* Galerie d'images miniatures */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-white' : 'border-white/50 hover:border-white'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      width={64}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {images.length > 5 && (
                  <div className="w-16 h-12 rounded-lg bg-black/50 flex items-center justify-center text-white text-xs">
                    +{images.length - 5}
                  </div>
                )}
              </div>
            )}

            {/* Bouton vidéo de présentation */}
            {formation.video_preview_url && (
              <button
                onClick={() => window.open(formation.video_preview_url, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all"
              >
                <PlayIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Voir la présentation</span>
              </button>
            )}
          </div>

          {/* Bouton brochure en haut à droite */}
          {formation.brochure_url && (
            <div className="absolute top-4 right-4">
              <a
                href={formation.brochure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Télécharger la brochure</span>
              </a>
            </div>
          )}
        </div>

        {/* Contenu superposé (masqué car déplacé dans le hero) */}
        <div className="absolute inset-0 flex items-end hidden">
          <div className="container pb-8">
            <div className="max-w-3xl text-white">
              <div className="mb-4">
                <Badge 
                  name={getLevelLabel(formation.level)} 
                  color={getLevelColor(formation.level)}
                  className="mb-2"
                />
                {formation.module_number && (
                  <Badge 
                    name={`Module ${formation.module_number}`} 
                    className="ml-2"
                  />
                )}
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                {formation.title}
              </h1>
              
              {formation.short_description && (
                <p className="text-lg lg:text-xl text-neutral-200 mb-6 max-w-2xl">
                  {formation.short_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  <span>{formation.capacity} places max</span>
                </div>
                
                {formation.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span>{formation.average_rating.toFixed(1)} ({formation.total_registrations} avis)</span>
                  </div>
                )}
                
                <div className="text-2xl font-bold">
                  À partir de {formation.price}€ TTC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-neutral-50 dark:bg-neutral-900">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            {/* Navigation par onglets */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-2 mb-8">
              {renderTabs()}
            </div>
            
            {/* Contenu des onglets */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* CTA fixe en bas */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="container">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <p className="font-semibold text-lg">{formation.title}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                À partir de <span className="font-bold text-blue-600">{formation.price}€ TTC</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  switch(activeTab) {
                    case 'program':
                      setActiveTab('sessions')
                      break
                    case 'sessions':
                      setActiveTab('informations')
                      break
                    case 'informations':
                      setActiveTab('instructor')
                      break
                    case 'instructor':
                      setActiveTab('reviews')
                      break
                    case 'reviews':
                      setShowReservationModal(true)
                      break
                  }
                }}
                className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {activeTab === 'program' && 'Voir les sessions'}
                {activeTab === 'sessions' && 'Voir les informations'}
                {activeTab === 'informations' && 'Voir le formateur'}
                {activeTab === 'instructor' && 'Voir les avis'}
                {activeTab === 'reviews' && 'Réserver maintenant'}
                {activeTab === 'reviews' ? (
                  <BoltIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : (
                  <ArrowLeftIcon className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowReservationModal(false)}
          />
          <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Réserver votre formation</h2>
                  <p className="text-blue-100">{formation.title}</p>
                </div>
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Sessions disponibles</h3>
              
              {formation.sessions && formation.sessions.length > 0 ? (
                <div className="space-y-4">
                  {formation.sessions.map((session) => (
                    <div 
                      key={session.id}
                      className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">
                                {formatDate(session.start_date)}
                                {formation.duration_days > 1 && ` - ${formatDate(session.end_date)}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="w-5 h-5 text-blue-600" />
                              <span>{session.city}</span>
                            </div>
                          </div>
                          
                          {session.venue_name && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                              {session.venue_name}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                {session.price || formation.price}€ TTC
                              </p>
                              {session.early_bird_price && new Date(session.early_bird_deadline) > new Date() && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  Tarif early bird : {session.early_bird_price}€ jusqu'au {formatDate(session.early_bird_deadline)}
                                </p>
                              )}
                            </div>
                            
                            <AddToCartButton
                              formation={formation}
                              session={session}
                              onSuccess={() => setShowReservationModal(false)}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                            />
                          </div>

                          {session.available_seats !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-neutral-600 dark:text-neutral-400">Places disponibles</span>
                                <span className={`font-medium ${
                                  session.available_seats <= 5 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                  {session.available_seats} / {session.total_seats}
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    session.available_seats <= 5 
                                      ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  }`}
                                  style={{ width: `${(session.available_seats / session.total_seats) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Aucune session disponible pour le moment
                  </p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                    Inscrivez-vous à la newsletter pour être informé des prochaines dates
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormationDetailPage