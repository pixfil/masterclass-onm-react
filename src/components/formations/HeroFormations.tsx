'use client'

import React from 'react'
import { 
  AcademicCapIcon,
  UserGroupIcon,
  GlobeEuropeAfricaIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const HeroFormations = () => {
  const stats = [
    { value: '50+', label: 'Sessions par an', icon: AcademicCapIcon },
    { value: '15', label: 'Villes en France', icon: GlobeEuropeAfricaIcon },
    { value: '2500+', label: 'Praticiens formés', icon: UserGroupIcon },
    { value: '4.9/5', label: 'Satisfaction moyenne', icon: StarIcon }
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
            <AcademicCapIcon className="w-4 h-4 mr-2" />
            Formations Orthodontie Neuro-Musculaire
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Développez votre <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">expertise en ONM</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
            Formations présentielles avec les meilleurs experts. 
            De l'initiation au perfectionnement, trouvez la formation adaptée à votre niveau.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroFormations