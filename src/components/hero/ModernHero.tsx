'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { 
  ChevronRightIcon,
  PlayIcon,
  CheckCircleIcon,
  StarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  GlobeEuropeAfricaIcon
} from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

// Dynamic import pour Three.js pour éviter les problèmes SSR
const DNAAnimation = dynamic(() => import('./DNAAnimation'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg w-full h-full"></div>
    </div>
  )
})

const ModernHero: React.FC = () => {
  const stats = [
    { value: '500+', label: 'Orthodontistes formés', icon: UserGroupIcon },
    { value: '15+', label: 'Pays présents', icon: GlobeEuropeAfricaIcon },
    { value: '20+', label: 'Années d\'expérience', icon: AcademicCapIcon },
    { value: '98%', label: 'Taux de satisfaction', icon: StarIcon }
  ]

  const benefits = [
    'Approche scientifique validée',
    'Formation certifiante reconnue',
    'Accompagnement personnalisé',
    'Communauté internationale',
    'Outils numériques innovants'
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-30">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-cyan-900/20" />}>
          <DNAAnimation />
        </Suspense>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Column - Content */}
          <div className="text-white space-y-8">
            
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium backdrop-blur-sm">
              <StarIcon className="w-4 h-4 mr-2" />
              Formation d'excellence en orthodontie
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Masterclass
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ONM
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 font-light leading-relaxed">
                L'orthodontie neuro-musculaire révolutionnaire
                <br />
                <span className="text-blue-300">Transformez votre pratique clinique</span>
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/formations"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                Découvrir nos formations
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group inline-flex items-center px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <PlayIcon className="w-5 h-5 mr-2" />
                Voir la vidéo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center group">
                    <div className="flex justify-center mb-2">
                      <Icon className="w-6 h-6 text-blue-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className="hidden lg:block">
            <div className="relative">
              
              {/* Main DNA Animation Container */}
              <div className="w-full h-[600px] relative">
                <Suspense fallback={
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl animate-pulse" />
                }>
                  <DNAAnimation className="rounded-2xl" />
                </Suspense>
              </div>

              {/* Floating Cards */}
              <div className="absolute top-20 -left-20 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="font-semibold">Formation certifiante</div>
                    <div className="text-sm text-gray-300">Reconnue internationalement</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -right-20 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="font-semibold">Méthode ONM</div>
                    <div className="text-sm text-gray-300">Innovation scientifique</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  )
}

export default ModernHero