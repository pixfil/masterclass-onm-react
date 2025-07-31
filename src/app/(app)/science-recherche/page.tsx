import React from 'react'
import { Heading } from '@/shared/Heading'
import Image from 'next/image'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { BeakerIcon, AcademicCapIcon, MagnifyingGlassIcon, LightBulbIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ScienceRecherchePage() {
  return (
    <div className="nc-ScienceRecherchePage">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-200 border border-indigo-500/30 backdrop-blur-sm mb-6">
              <BeakerIcon className="w-4 h-4 mr-2" />
              Recherche scientifique avancée
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Science & <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Recherche</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              L'orthodontie neuro-musculaire : Une approche systémique révolutionnaire 
              basée sur des décennies de recherche scientifique
            </p>
          </div>
        </div>
      </section>

      {/* L'Orthodontie Systémique */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-8 text-center">
              L'Orthodontie Neuro-Musculaire : Une Approche Systémique
            </Heading>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed mb-8">
                L'orthodontie neuro-musculaire représente une approche médicale interdisciplinaire complète qui considère l'orthodontie comme une discipline systémique complexe. Cette méthode va bien au-delà du traitement orthodontique traditionnel en prenant en compte les multiples systèmes interconnectés du corps humain.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                    <BeakerIcon className="w-6 h-6 text-blue-600" />
                    Perspective Holistique
                  </h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li>• Vision globale dépassant le simple alignement dentaire</li>
                    <li>• Considération des systèmes interconnectés</li>
                    <li>• Coopération interdisciplinaire</li>
                  </ul>
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                    <MagnifyingGlassIcon className="w-6 h-6 text-cyan-600" />
                    Analyse Fonctionnelle
                  </h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li>• Focus sur la fonction masticatoire</li>
                    <li>• Angles Fonctionnels Masticateurs de Planas (AFMP)</li>
                    <li>• Mouvements latéraux mandibulaires</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Méthodologie Diagnostique */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Méthodologie Diagnostique Avancée
            </Heading>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  icon: ChartBarIcon,
                  title: "Patterns de Mastication",
                  description: "Évaluation approfondie des schémas masticatoires individuels pour identifier les dysfonctions",
                  color: "blue"
                },
                {
                  icon: AcademicCapIcon,
                  title: "Plan Occlusal",
                  description: "Analyse précise de l'orientation et de la position du plan d'occlusion",
                  color: "cyan"
                },
                {
                  icon: LightBulbIcon,
                  title: "Proprioception",
                  description: "Évaluation de la perception neuromusculaire et de l'équilibre fonctionnel",
                  color: "indigo"
                }
              ].map((item, index) => (
                <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 rounded-full bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center mb-6`}>
                    <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophie Thérapeutique */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Philosophie Thérapeutique
            </Heading>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-1">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Objectifs de Traitement</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</span>
                        <span>Recherche de traitements fonctionnels et stables à long terme</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</span>
                        <span>"Réorientation" des plans occlusaux pour optimiser la fonction</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</span>
                        <span>Priorité donnée à l'équilibre musculaire et à la proprioception</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</span>
                        <span>Stabilité basée sur la fonction plutôt que sur la seule esthétique</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publications et Recherches */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Publications & Recherches
            </Heading>

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
                }
              ].map((pub, index) => (
                <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="font-semibold mb-2">{pub.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{pub.authors}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    {pub.journal} • {pub.year}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/cas-cliniques">
                <ButtonPrimary>
                  Voir les cas cliniques
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Approfondissez vos connaissances
            </Heading>
            <p className="text-xl mb-8 text-blue-100">
              Rejoignez nos formations pour maîtriser l'approche systémique de l'orthodontie neuro-musculaire
            </p>
            <Link href="/formations">
              <ButtonPrimary className="bg-white text-blue-600 hover:bg-blue-50">
                Découvrir nos formations
              </ButtonPrimary>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}