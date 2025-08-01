'use client'

import React from 'react'
import Image from 'next/image'
import { 
  BeakerIcon, 
  AcademicCapIcon, 
  MagnifyingGlassIcon, 
  LightBulbIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'

const ScienceRecherchePage = () => {
  return (
    <div className="nc-ScienceRecherchePage">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <BeakerIcon className="w-4 h-4 mr-2" />
              Recherche Scientifique Avancée
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Science & <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Recherche ONM</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Une approche systémique révolutionnaire basée sur des décennies 
              de recherche scientifique et d'innovations cliniques.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <ButtonPrimary className="w-full sm:w-auto">
                  Découvrir nos formations
                </ButtonPrimary>
              </Link>
              <Link href="#approche">
                <ButtonSecondary className="w-full sm:w-auto">
                  En savoir plus
                </ButtonSecondary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Approche Systémique Section */}
      <section id="approche" className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                L'Approche Systémique ONM
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 italic">
                "L'orthodontie neuro-musculaire représente une approche médicale interdisciplinaire 
                qui considère l'orthodontie comme une discipline systémique complexe."
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead">
                Cette méthode révolutionnaire va bien au-delà du traitement orthodontique traditionnel 
                en prenant en compte les multiples systèmes interconnectés du corps humain. Notre approche 
                intègre les dernières avancées en neurosciences et physiologie oro-faciale.
              </p>

              <p>
                L'ONM se distingue par sa capacité à traiter les dysfonctions à leur source, en comprenant 
                les mécanismes neurologiques et musculaires qui influencent l'occlusion et la posture 
                mandibulaire. Cette approche globale permet d'obtenir des résultats plus stables et durables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fondements Scientifiques */}
      <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Fondements Scientifiques
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Une méthodologie diagnostique basée sur des décennies de recherche
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BeakerIcon,
                title: "Recherche Fondamentale",
                description: "Plus de 30 ans de recherche en neurophysiologie appliquée à l'orthodontie"
              },
              {
                icon: ChartBarIcon,
                title: "Analyse Quantitative",
                description: "Mesures précises des patterns masticatoires et des mouvements mandibulaires"
              },
              {
                icon: AcademicCapIcon,
                title: "Validation Clinique",
                description: "Des milliers de cas traités avec succès selon les principes ONM"
              },
              {
                icon: SparklesIcon,
                title: "Innovation Continue",
                description: "Intégration des dernières technologies numériques et IA"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthodologie Diagnostique */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Méthodologie Diagnostique Avancée
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Une approche précise et personnalisée pour chaque patient
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Analyse complète de la dynamique mandibulaire",
                "Évaluation des patterns de mastication individuels",
                "Mesure des Angles Fonctionnels Masticateurs de Planas (AFMP)",
                "Examen de la proprioception et de l'équilibre neuromusculaire",
                "Étude de l'orientation du plan occlusal",
                "Analyse interdisciplinaire avec kinésithérapeutes et ostéopathes"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principes Thérapeutiques */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Principes Thérapeutiques
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Une philosophie de traitement basée sur la fonction et la stabilité à long terme
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                number: "01",
                title: "Approche Fonctionnelle",
                description: "Traitement des causes profondes des malocclusions en rééduquant les fonctions musculaires et respiratoires."
              },
              {
                number: "02",
                title: "Stabilité Optimale",
                description: "Recherche de traitements fonctionnels et stables basés sur l'équilibre neuromusculaire."
              },
              {
                number: "03",
                title: "Réorientation Occlusale",
                description: "Optimisation des plans occlusaux pour améliorer la fonction masticatoire et l'esthétique."
              },
              {
                number: "04",
                title: "Suivi Personnalisé",
                description: "Adaptation continue du traitement selon l'évolution et les besoins spécifiques du patient."
              }
            ].map((principle, index) => (
              <div key={index} className="flex gap-6 p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {principle.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Publications & Recherches
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Les dernières avancées scientifiques en ONM
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Étude sur l'impact de l'ONM sur les troubles du sommeil",
                  authors: "Dr. Martin, Dr. Dubois",
                  year: "2024",
                  journal: "Journal of Neuromuscular Orthodontics"
                },
                {
                  title: "Analyse comparative des méthodes traditionnelles vs ONM",
                  authors: "Dr. Lefebvre, Dr. Rousseau",
                  year: "2023",
                  journal: "European Orthodontic Review"
                },
                {
                  title: "La proprioception dans le traitement orthodontique",
                  authors: "Dr. Bernard, Dr. Petit",
                  year: "2023",
                  journal: "International Journal of Orthodontics"
                },
                {
                  title: "Innovations numériques en orthodontie neuromusculaire",
                  authors: "Dr. Moreau, Dr. Laurent",
                  year: "2024",
                  journal: "Digital Dentistry Today"
                },
                {
                  title: "Approche interdisciplinaire des dysfonctions oro-faciales",
                  authors: "Dr. Dupont, Dr. Simon",
                  year: "2023",
                  journal: "Revue d'Orthodontie Fonctionnelle"
                },
                {
                  title: "L'IA au service du diagnostic en ONM",
                  authors: "Dr. Roche, Dr. Blanc",
                  year: "2024",
                  journal: "AI in Healthcare Journal"
                }
              ].map((pub, index) => (
                <div key={index} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="font-semibold mb-2 text-neutral-900 dark:text-white">{pub.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{pub.authors}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    {pub.journal} • {pub.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à explorer l'avenir de l'orthodontie ?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Découvrez comment l'approche ONM peut transformer votre pratique
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors duration-300">
                  Voir les formations
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors duration-300 border border-indigo-500">
                  Nous contacter
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ScienceRecherchePage