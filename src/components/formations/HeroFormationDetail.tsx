'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'
import Link from 'next/link'
import type { Formation } from '@/lib/supabase/formations-types'

// Dynamic import pour Three.js pour éviter les problèmes SSR
const JawAnimation = dynamic(() => import('../hero/JawAnimation').catch(() => {
  // Fallback component si l'import échoue
  return { default: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl">
      <div className="text-center text-white/80">
        <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
          <AcademicCapIcon className="w-12 h-12" />
        </div>
        <p className="text-lg font-medium">Formation ONM</p>
      </div>
    </div>
  )}
}), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg w-full h-full"></div>
    </div>
  )
})

interface HeroFormationDetailProps {
  formation: Formation
  onReservationClick?: () => void
}

const HeroFormationDetail: React.FC<HeroFormationDetailProps> = ({ formation, onReservationClick }) => {
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

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'debutant': return 'Débutant'
      case 'intermediaire': return 'Intermédiaire'
      case 'avance': return 'Avancé'
      case 'expert': return 'Expert'
      default: return 'Tous niveaux'
    }
  }

  // Prochaine session disponible
  const nextSession = formation.upcoming_sessions?.[0]

  return (
    <section className="relative min-h-[70vh] lg:min-h-[85vh] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col lg:flex-row items-center min-h-[70vh] lg:min-h-[85vh] py-12 lg:py-20">
          
          {/* Left Column - Content */}
          <div className="flex-1 space-y-6 lg:pr-8">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/formations" className="text-blue-300 hover:text-blue-200 transition-colors">
                Formations
              </Link>
              <span className="text-blue-400">/</span>
              <span className="text-white/80">{formation.title}</span>
            </nav>
            
            {/* Badge et Niveau */}
            <div className="flex items-center gap-3">
              <Badge color={getLevelColor(formation.level)}>
                {getLevelLabel(formation.level)}
              </Badge>
              {formation.is_new && (
                <Badge color="purple">
                  Nouvelle formation
                </Badge>
              )}
              {formation.is_popular && (
                <Badge color="orange">
                  Populaire
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {formation.title}
            </h1>
            
            {/* Description courte */}
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed">
              {formation.short_description || formation.description?.substring(0, 150) + '...'}
            </p>
            
            {/* Infos clés */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-blue-200">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                <span>{formation.duration || '2 jours'}</span>
              </div>
              <div className="flex items-center gap-3 text-blue-200">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <span>{formation.max_participants || 20} participants max</span>
              </div>
              {nextSession && (
                <>
                  <div className="flex items-center gap-3 text-blue-200">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    <span>{formatDate(nextSession.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-200">
                    <MapPinIcon className="w-5 h-5 text-blue-400" />
                    <span>{nextSession.location}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onReservationClick}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                S'inscrire à la formation
              </button>
              <button 
                onClick={() => {
                  const programSection = document.querySelector('.bg-neutral-50.dark\\:bg-neutral-900')
                  if (programSection) {
                    const yOffset = -100; // Offset pour ne pas masquer les titres
                    const y = programSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
              >
                Voir le programme
              </button>
            </div>
          </div>
          
          {/* Right Column - Animation with Floating Dates */}
          <div className="hidden lg:flex flex-1 items-center justify-center mt-8 lg:mt-0 relative -mr-8">
            {/* Floating Dates Card */}
            {formation.upcoming_sessions && formation.upcoming_sessions.length > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 animate-float">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-xs shadow-2xl">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-300" />
                    Prochaines sessions
                  </h3>
                  <div className="space-y-3">
                    {formation.upcoming_sessions.slice(0, 3).map((session, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-white font-medium">
                          {formatDate(session.date)}
                        </div>
                        <div className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {session.location}
                        </div>
                        {session.available_seats !== undefined && (
                          <div className="text-xs text-blue-300 mt-2">
                            {session.available_seats > 0 
                              ? `${session.available_seats} places restantes`
                              : 'Complet'
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {formation.upcoming_sessions.length > 3 && (
                    <p className="text-xs text-blue-300 mt-3 text-center">
                      +{formation.upcoming_sessions.length - 3} autres dates
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="w-full max-w-xl aspect-square relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl" />
              <Suspense fallback={
                <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl animate-pulse" />
              }>
                <JawAnimation />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroFormationDetail