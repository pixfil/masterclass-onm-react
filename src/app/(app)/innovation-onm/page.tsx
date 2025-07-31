'use client'

import React, { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, MeshDistortMaterial, Float, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'
import { Heading } from '@/shared/Heading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Link from 'next/link'
import { 
  SparklesIcon, 
  CpuChipIcon, 
  BeakerIcon, 
  RocketLaunchIcon,
  LightBulbIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

// Composant 3D animé
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.5}>
        <MeshDistortMaterial
          color="#3B82F6"
          attach="material"
          distort={0.6}
          speed={1.5}
          roughness={0}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

// Particules flottantes
function Particles() {
  const ref = useRef<THREE.Points>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05
      ref.current.rotation.y = state.clock.elapsedTime * 0.075
    }
  })

  const particlesCount = 1000
  const positions = new Float32Array(particlesCount * 3)
  
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        color="#06B6D4"
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  )
}

export default function InnovationONMPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const innovations = [
    {
      icon: CpuChipIcon,
      title: "IA & Diagnostic",
      description: "Intelligence artificielle pour l'analyse précise des cas et l'aide au diagnostic",
      color: "blue"
    },
    {
      icon: BeakerIcon,
      title: "Matériaux Innovants",
      description: "Nouveaux alliages et biomatériaux pour des traitements plus confortables",
      color: "cyan"
    },
    {
      icon: SparklesIcon,
      title: "Technologies 3D",
      description: "Impression 3D et modélisation avancée pour des appareils sur mesure",
      color: "indigo"
    },
    {
      icon: RocketLaunchIcon,
      title: "Protocoles Accélérés",
      description: "Techniques révolutionnaires pour réduire la durée des traitements",
      color: "purple"
    }
  ]

  const futureFeatures = [
    {
      title: "Réalité Augmentée",
      description: "Visualisation en temps réel des résultats de traitement",
      progress: 85
    },
    {
      title: "Capteurs Intelligents",
      description: "Monitoring continu de la progression du traitement",
      progress: 70
    },
    {
      title: "Biomécanique Quantique",
      description: "Application des principes quantiques à l'orthodontie",
      progress: 45
    },
    {
      title: "Nano-orthodontie",
      description: "Appareils invisibles à l'échelle nanométrique",
      progress: 30
    }
  ]

  return (
    <div className="nc-InnovationONMPage overflow-hidden">
      {/* Hero Section avec Three.js */}
      <div className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
          {mounted && (
            <div className="absolute inset-0 opacity-50">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <AnimatedSphere />
                  <Particles />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Suspense>
              </Canvas>
            </div>
          )}
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container text-center text-white">
            <Heading as="h1" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
              L'Innovation ONM
            </Heading>
            <p className="text-xl md:text-3xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Le futur de l'orthodontie est déjà là
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#innovations">
                <ButtonPrimary className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Découvrir les innovations
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </ButtonPrimary>
              </Link>
              <Link href="/formations">
                <ButtonPrimary className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30">
                  Se former au futur
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Technologies Révolutionnaires */}
      <section id="innovations" className="py-24 lg:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Technologies Révolutionnaires
            </Heading>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Nous repoussons les limites de l'orthodontie traditionnelle avec des innovations qui transforment l'expérience patient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {innovations.map((item, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-600/10 to-${item.color}-600/5 rounded-3xl`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Le Futur en Développement */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
                Le Futur en Développement
              </Heading>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                Nos équipes de R&D travaillent sur les technologies de demain
              </p>
            </div>

            <div className="space-y-8">
              {futureFeatures.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 ml-8">
                      {feature.progress}%
                    </div>
                  </div>
                  <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-1000"
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <LightBulbIcon className="w-20 h-20 mx-auto mb-8 text-yellow-300" />
            <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Notre Vision
            </Heading>
            <p className="text-2xl leading-relaxed text-blue-100 mb-12">
              "Transformer l'orthodontie en une expérience prédictive, personnalisée et parfaitement intégrée à la vie moderne de nos patients."
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/ceprof">
                <ButtonPrimary className="bg-white text-blue-600 hover:bg-blue-50">
                  Rejoindre le mouvement
                </ButtonPrimary>
              </Link>
              <Link href="/formations">
                <ButtonPrimary className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  Se former aux innovations
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats dynamiques */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15+", label: "Brevets déposés" },
              { value: "500+", label: "Praticiens formés" },
              { value: "95%", label: "Satisfaction patient" },
              { value: "3x", label: "Plus rapide" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}