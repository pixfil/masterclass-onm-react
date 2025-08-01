'use client'

import React from 'react'
import Image from 'next/image'
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  LightBulbIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'

const LaMethodePage = () => {
  const benefits = [
    {
      icon: BeakerIcon,
      title: "Approche scientifique",
      description: "Une méthode basée sur la compréhension approfondie de la dynamique mandibulaire"
    },
    {
      icon: UserGroupIcon,
      title: "Vision interdisciplinaire",
      description: "Intégration de différentes spécialités pour une prise en charge globale"
    },
    {
      icon: CogIcon,
      title: "Outils hybrides",
      description: "Utilisation optimisée des technologies numériques et conventionnelles"
    },
    {
      icon: SparklesIcon,
      title: "Respect tissulaire",
      description: "Préservation maximale de l'émail et des tissus parodontaux"
    }
  ]

  const objectives = [
    "Corriger la classification d'Angle en 6 mois",
    "Optimiser les outils orthodontiques disponibles",
    "Améliorer la coopération patient",
    "Minimiser les effets parasites des appareils",
    "Garantir la sécurité de l'émail et des gencives",
    "Prévenir les récidives par une approche fonctionnelle"
  ]

  const principles = [
    {
      number: "01",
      title: "Diagnostic approfondi",
      description: "L'orthodontie neuromusculaire commence par une analyse complète de la dynamique mandibulaire et des fonctions oro-faciales."
    },
    {
      number: "02",
      title: "Optimisation des appareils",
      description: "Utilisation stratégique des multi-attaches, aligneurs, et vis d'ancrage pour maximiser l'efficacité tout en minimisant l'inconfort."
    },
    {
      number: "03",
      title: "Approche fonctionnelle",
      description: "Traitement des causes profondes des malocclusions en rééduquant les fonctions musculaires et respiratoires."
    },
    {
      number: "04",
      title: "Suivi interdisciplinaire",
      description: "Collaboration étroite avec kinésithérapeutes, ostéopathes et autres professionnels de santé pour un résultat optimal."
    }
  ]

  return (
    <div className="nc-LaMethodePage">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <LightBulbIcon className="w-4 h-4 mr-2" />
              Innovation en Orthodontie
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              L'Orthodontie <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Neuro-Musculaire</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Une approche révolutionnaire qui associe la réhabilitation du système mandibulaire 
              aux outils numériques et aligneurs pour des résultats optimaux.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <ButtonPrimary className="w-full sm:w-auto">
                  Découvrir nos formations
                </ButtonPrimary>
              </Link>
              <Link href="#philosophie">
                <ButtonSecondary className="w-full sm:w-auto">
                  En savoir plus
                </ButtonSecondary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophie" className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Notre Philosophie
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 italic">
                "L'orthodontie neuromusculaire c'est l'art du diagnostic, de l'optimisation des appareils orthodontiques, 
                des acteurs de santé et des fonctions."
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead">
                L'Orthodontie Neuro-Musculaire (ONM) représente une évolution majeure dans la pratique orthodontique moderne. 
                Cette approche novatrice va au-delà du simple alignement dentaire pour considérer l'ensemble du système 
                stomatognathique dans sa globalité.
              </p>

              <p>
                Notre méthode se distingue par sa capacité à traiter les malocclusions complexes en comprenant et en 
                corrigeant les dysfonctions sous-jacentes. En intégrant les dernières avancées technologiques aux 
                principes fondamentaux de la physiologie oro-faciale, nous offrons des traitements plus efficaces, 
                plus confortables et plus durables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Les Avantages de la Méthode ONM
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Une approche complète qui révolutionne la pratique orthodontique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Objectifs en 6 Mois
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Des résultats concrets et mesurables
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-300">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Les Principes Fondamentaux
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Une méthodologie éprouvée pour des traitements orthodontiques réussis
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {principles.map((principle, index) => (
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

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à révolutionner votre pratique ?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Rejoignez les praticiens qui ont déjà adopté l'approche ONM
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

export default LaMethodePage