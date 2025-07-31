'use client'

import React, { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Heading } from '@/shared/Heading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Link from 'next/link'
import Image from 'next/image'
import { 
  TrophyIcon,
  StarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  UsersIcon,
  ChartBarIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

// Composant 3D pour l'animation du trophée
function Trophy3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#FFD700"
          emissiveIntensity={0.2}
        />
      </mesh>
      <pointLight position={[0, 2, 0]} intensity={1} color="#FFD700" />
    </Float>
  )
}

export default function CercleExcellencePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const valeurs = [
    {
      icon: StarIcon,
      title: "Excellence",
      description: "Recherche constante de la perfection dans la pratique orthodontique",
      color: "yellow"
    },
    {
      icon: LightBulbIcon,
      title: "Innovation",
      description: "Adoption des dernières avancées technologiques et scientifiques",
      color: "blue"
    },
    {
      icon: UsersIcon,
      title: "Collaboration",
      description: "Partage de connaissances et entraide entre membres",
      color: "green"
    },
    {
      icon: ShieldCheckIcon,
      title: "Éthique",
      description: "Engagement envers les plus hauts standards professionnels",
      color: "purple"
    }
  ]

  const membres = [
    {
      name: "Dr. Philippe Martin",
      title: "Président du CEPROF",
      speciality: "Expert ONM International",
      image: "/api/placeholder/200/200",
      quote: "L'excellence n'est pas un acte, mais une habitude"
    },
    {
      name: "Dr. Marie Lefebvre",
      title: "Vice-Présidente",
      speciality: "Spécialiste Pédiatrique",
      image: "/api/placeholder/200/200",
      quote: "Innover pour mieux soigner"
    },
    {
      name: "Dr. Jean Dubois",
      title: "Directeur Scientifique",
      speciality: "Recherche & Développement",
      image: "/api/placeholder/200/200",
      quote: "La science au service du patient"
    },
    {
      name: "Dr. Sophie Bernard",
      title: "Responsable Formation",
      speciality: "Formatrice Senior ONM",
      image: "/api/placeholder/200/200",
      quote: "Transmettre pour progresser"
    }
  ]

  const achievements = [
    { number: "50+", label: "Publications scientifiques", icon: ChartBarIcon },
    { number: "1000+", label: "Cas traités avec succès", icon: TrophyIcon },
    { number: "200+", label: "Membres actifs", icon: UsersIcon },
    { number: "15", label: "Pays représentés", icon: SparklesIcon }
  ]

  return (
    <div className="nc-CercleExcellencePage overflow-hidden">
      {/* Hero Section avec Three.js */}
      <div className="relative h-[80vh] min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 via-amber-800 to-orange-700">
          {mounted && (
            <div className="absolute inset-0 opacity-60">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={0.5} />
                  <Trophy3D />
                  <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
                </Suspense>
              </Canvas>
            </div>
          )}
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-6">
              <TrophyIcon className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-medium">CEPROF</span>
            </div>
            <Heading as="h1" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
              Cercle d'Excellence
            </Heading>
            <p className="text-xl md:text-3xl text-yellow-100 mb-8 max-w-3xl mx-auto">
              L'élite de l'orthodontie neuro-musculaire réunie pour façonner l'avenir
            </p>
            <Link href="/ceprof/devenir-membre">
              <ButtonPrimary className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                Rejoindre l'Excellence
              </ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>

      {/* Nos Valeurs */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Nos Valeurs Fondamentales
            </Heading>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Le CEPROF est guidé par des principes qui définissent notre identité et notre mission
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valeurs.map((valeur, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <valeur.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{valeur.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {valeur.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membres d'honneur */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="container">
          <div className="text-center mb-16">
            <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Membres d'Honneur
            </Heading>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Les leaders qui façonnent l'avenir de l'orthodontie neuro-musculaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {membres.map((membre, index) => (
              <div key={index} className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all group">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-neutral-800">
                      <Image
                        src={membre.image}
                        alt={membre.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">{membre.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{membre.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{membre.speciality}</p>
                  <p className="text-sm italic text-neutral-500 dark:text-neutral-500">
                    "{membre.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Réalisations */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Nos Réalisations
            </Heading>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Des chiffres qui témoignent de notre engagement envers l'excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <achievement.icon className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text mb-2">
                  {achievement.number}
                </div>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  {achievement.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600">
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <AcademicCapIcon className="w-16 h-16 mb-6 text-yellow-300" />
                <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Notre Mission
                </Heading>
                <p className="text-xl leading-relaxed text-yellow-100">
                  Élever les standards de l'orthodontie neuro-musculaire à travers la formation continue, 
                  la recherche innovante et le partage d'expertise entre praticiens d'excellence.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-white">Objectifs 2025</h3>
                <ul className="space-y-4">
                  {[
                    "Lancer 5 nouveaux programmes de recherche",
                    "Former 500 nouveaux praticiens ONM",
                    "Publier le guide de référence ONM",
                    "Établir des partenariats internationaux"
                  ].map((objectif, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-white">{objectif}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à rejoindre l'Excellence ?
            </Heading>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
              Le CEPROF recherche des praticiens passionnés et engagés dans l'excellence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ceprof/devenir-membre">
                <ButtonPrimary className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  Postuler maintenant
                </ButtonPrimary>
              </Link>
              <Link href="/ceprof">
                <ButtonPrimary className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600">
                  En savoir plus
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}