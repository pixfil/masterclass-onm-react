'use client'

import React from 'react'
import Image from 'next/image'
import heroImg from '@/images/hero-right.png'

const HeroFormations = () => {
  return (
    <div className="nc-HeroFormations relative">
      <div className="absolute inset-0 z-0">
        <Image
          className="object-cover"
          fill
          src={heroImg}
          alt="Formations orthodontie"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      <div className="relative z-10 container">
        <div className="flex flex-col items-center justify-center space-y-8 py-20 lg:py-32">
          <div className="text-center space-y-6 max-w-4xl">
            <span className="inline-block text-white text-sm font-medium px-4 py-2 bg-primary-500 bg-opacity-20 backdrop-blur-sm rounded-full">
              Formations Orthodontie Neuro-Musculaire
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Développez votre expertise en ONM
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Formations présentielles avec les meilleurs experts. 
              De l'initiation au perfectionnement, trouvez la formation adaptée à votre niveau.
            </p>
          </div>


          <div className="flex flex-wrap gap-8 justify-center text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-80">Sessions par an</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">15</div>
              <div className="text-sm opacity-80">Villes en France</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">2500+</div>
              <div className="text-sm opacity-80">Praticiens formés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm opacity-80">Satisfaction moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroFormations