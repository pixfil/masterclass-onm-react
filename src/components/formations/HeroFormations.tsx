'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { 
  AcademicCapIcon,
  UserGroupIcon,
  GlobeEuropeAfricaIcon,
  StarIcon,
  ChevronRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

// Dynamic import pour Three.js pour éviter les problèmes SSR
const JawAnimation = dynamic(() => import('../hero/JawAnimation'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-lg w-full h-full"></div>
    </div>
  )
})

const HeroFormations = () => {
  const stats = [
    { value: '50+', label: 'Sessions par an', icon: AcademicCapIcon },
    { value: '15', label: 'Villes en France', icon: GlobeEuropeAfricaIcon },
    { value: '2500+', label: 'Praticiens formés', icon: UserGroupIcon },
    { value: '4.9/5', label: 'Satisfaction moyenne', icon: StarIcon }
  ]

  return (
    <div className="nc-HeroFormations relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900">
      
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-cyan-900/20" />}>
          <JawAnimation />
        </Suspense>
      </div>

      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-cyan-900/20" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen">
          
          {/* Left Column - Content */}
          <div className="flex-1 flex flex-col justify-center space-y-8 lg:pr-16">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-200 border border-indigo-500/30 backdrop-blur-sm">
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                Formations Orthodontie Neuro-Musculaire
              </span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                <span className="block text-white">Développez votre</span>
                <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  expertise en ONM
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl leading-relaxed">
                Formations présentielles avec les meilleurs experts. 
                De l'initiation au perfectionnement, trouvez la formation adaptée à votre niveau.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/formations#catalog" className="group">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                  <span>Voir les formations</span>
                  <ChevronRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button className="group w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
                <PlayIcon className="mr-2 w-5 h-5" />
                <span>Voir la présentation</span>
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-xl mb-3 group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Animation (visible on larger screens) */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="w-full max-w-lg aspect-square">
              <Suspense fallback={
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-3xl animate-pulse" />
              }>
                <JawAnimation />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroFormations