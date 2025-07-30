'use client'

import { AgentImmobilier } from '@/lib/supabase/types'
import { FC, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { StarIcon, CheckBadgeIcon, PhoneIcon, EnvelopeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

interface Props {
  className?: string
  agents: AgentImmobilier[]
}

const AgentCard: FC<{ agent: AgentImmobilier }> = ({ agent }) => {
  return (
    <div className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex-shrink-0 w-80 border border-neutral-100 dark:border-neutral-700">
      {/* Photo de profil */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <Image
          src={agent.photo_agent || '/default-avatar.png'}
          alt={`${agent.prenom} ${agent.nom}`}
          fill
          className="object-cover rounded-full"
          sizes="80px"
        />
        {agent.est_verifie && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
            <CheckBadgeIcon className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Informations de base */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="font-semibold text-base text-neutral-900 dark:text-white">
            {agent.prenom} {agent.nom}
          </h3>
          {agent.est_super_agent && (
            <StarIcon className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center justify-center gap-1 mb-2">
          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {agent.note_moyenne.toFixed(1)}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            ({agent.nombre_avis_agent} avis)
          </span>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {agent.annees_experience} ans d'expérience
        </p>

        {/* Description courte */}
        {agent.description_agent && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
            {agent.description_agent}
          </p>
        )}
      </div>

      {/* Spécialités */}
      {agent.specialites && agent.specialites.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {agent.specialites.slice(0, 2).map((specialite, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
              >
                {specialite}
              </span>
            ))}
            {agent.specialites.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                +{agent.specialites.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        <div className="text-center">
          <div className="font-semibold text-neutral-900 dark:text-white">
            {agent.nombre_proprietes_gerees}
          </div>
          <div>Propriétés</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-neutral-900 dark:text-white">
            {agent.taux_reponse}%
          </div>
          <div>Réponse</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-neutral-900 dark:text-white text-xs">
            {agent.temps_reponse_moyen}
          </div>
          <div>Délai</div>
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <div className="flex gap-2 justify-center">
          {agent.telephone && (
            <a
              href={`tel:${agent.telephone}`}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              title="Appeler"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>Appeler</span>
            </a>
          )}
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              title="Email"
            >
              <EnvelopeIcon className="h-4 w-4" />
              <span>Email</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const SectionGridAgentsHorizontal: FC<Props> = ({
  className = '',
  agents,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)
  
  // Filtrer les agents actifs
  const activeAgents = agents.filter(agent => agent.est_actif)

  const scrollLeftButton = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320, // largeur d'une carte + gap
        behavior: 'smooth'
      })
    }
  }

  const scrollRightButton = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320, // largeur d'une carte + gap
        behavior: 'smooth'
      })
    }
  }

  // Fonctions de drag-to-scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeftPos(scrollContainerRef.current.scrollLeft)
    
    // Empêcher la sélection de texte pendant le drag
    e.preventDefault()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Multiplier pour une vitesse de scroll plus rapide
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Événements globaux pour le mouse up
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mouseleave', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mouseleave', handleGlobalMouseUp)
    }
  }, [isDragging])

  if (activeAgents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Aucun agent disponible pour le moment.
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Boutons de navigation */}
      {activeAgents.length > 3 && (
        <>
          <button
            onClick={scrollLeftButton}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-neutral-800 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
            aria-label="Voir les agents précédents"
          >
            <ChevronLeftIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
          </button>
          
          <button
            onClick={scrollRightButton}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-neutral-800 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
            aria-label="Voir les agents suivants"
          >
            <ChevronRightIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
          </button>
        </>
      )}

      {/* Container scrollable */}
      <div 
        ref={scrollContainerRef}
        className={`flex gap-6 overflow-x-auto scrollbar-hide pb-4 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollSnapType: isDragging ? 'none' : 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {activeAgents.map((agent) => (
          <div key={agent.id} style={{ scrollSnapAlign: 'start' }}>
            <AgentCard agent={agent} />
          </div>
        ))}
      </div>

      {/* Indicateur de scroll pour mobile */}
      {activeAgents.length > 1 && (
        <div className="flex justify-center mt-4 lg:hidden">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            <div className="w-8 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
            <div className="w-2 h-2 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SectionGridAgentsHorizontal