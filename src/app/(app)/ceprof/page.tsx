'use client'

import React from 'react'
import { 
  AcademicCapIcon, 
  UserGroupIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  StarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import ModernHeader from '@/components/Header/ModernHeader'
import Link from 'next/link'

const CEPROFPage = () => {
  return (
    <div className="nc-CEPROFPage">
      <ModernHeader />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Cercle d'expertise pluridisciplinaire
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CEPROF</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Cercle d'Étude Pluridisciplinaire pour la Rééducation Oro-Faciale - 
              Une approche interdisciplinaire réunissant les meilleurs experts
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <ButtonPrimary className="w-full sm:w-auto">
                  Découvrir nos formations
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                Notre Mission
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed">
                CEPROF rassemble une équipe d'experts pluridisciplinaires dédiés à l'avancement 
                de l'orthodontie neuro-musculaire et de la rééducation oro-faciale.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpenIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Recherche & Innovation</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Développement continu des techniques orthodontiques avec une approche systémique
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Formation d'Excellence</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Transmission des connaissances avancées en orthodontie fonctionnelle
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Approche Pluridisciplinaire</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Collaboration entre orthodontistes, kinésithérapeutes et autres spécialistes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Profile - Dr. Romain de Papé */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                Notre Expert Principal
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-300">
                Rencontrez le fondateur et président de CEPROF
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-96 lg:h-full bg-gradient-to-br from-indigo-600 to-cyan-600">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <AcademicCapIcon className="w-16 h-16 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold mb-2">Dr. Romain de Papé</h3>
                      <p className="text-xl text-indigo-100">Président de CEPROF</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 lg:p-12">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 flex items-center">
                        <CheckBadgeIcon className="w-6 h-6 text-indigo-600 mr-2" />
                        Qualifications Professionnelles
                      </h4>
                      <ul className="space-y-2 text-neutral-600 dark:text-neutral-300">
                        <li>• Spécialiste Qualifié en Orthopédie Dento-Faciale - Paris 7</li>
                        <li>• Ancien Assistant Hospitalo-Universitaire à Strasbourg</li>
                        <li>• Membre du Bureau AFOS AFFPP</li>
                        <li>• Membre du Conseil Scientifique de la FFO</li>
                        <li>• Président du CEPROF</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 flex items-center">
                        <StarIcon className="w-6 h-6 text-indigo-600 mr-2" />
                        Expertise & Innovation
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                        "Après le CECSMO à Paris 7 et l'apprentissage de la technique linguale, 
                        ma rencontre avec le Dr Jean Louis Raymond a changé ma perspective diagnostique. 
                        J'ai continuellement développé les techniques orthodontiques avec une approche systémique."
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">Développement de l'Orthodontie Hybride et Digitale</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">Combinaison d'aligneurs et de dispositifs auxiliaires</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">Approche fonctionnelle avec perspective systémique</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold mb-2 text-indigo-900 dark:text-indigo-300">Mission Personnelle</h4>
                      <p className="text-indigo-800 dark:text-indigo-200 italic">
                        "J'ai décidé de créer le master 'ONM' pour promouvoir une philosophie médicale 
                        que je crois être l'avenir de l'orthodontie fonctionnelle."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach & Philosophy */}
      <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                Notre Approche CEPROF
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-300">
                Une vision moderne et intégrée de l'orthodontie
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="border-l-4 border-indigo-600 pl-6">
                    <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
                      Orthodontie Hybride & Digitale
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Combinaison innovante d'aligneurs transparents et de dispositifs auxiliaires 
                      pour une approche personnalisée et efficace.
                    </p>
                  </div>

                  <div className="border-l-4 border-cyan-600 pl-6">
                    <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
                      Approche Systémique
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Prise en compte de l'ensemble du système oro-facial dans le diagnostic 
                      et le traitement orthodontique.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-600 pl-6">
                    <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
                      Rééducation Oro-Faciale
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Intégration de la rééducation neuro-musculaire pour des résultats 
                      durables et fonctionnels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Philosophie CEPROF</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-6 h-6 text-indigo-200 flex-shrink-0 mt-1" />
                      <p>Approche médicale rigoureuse de l'orthodontie</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-6 h-6 text-indigo-200 flex-shrink-0 mt-1" />
                      <p>Collaboration interdisciplinaire systématique</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-6 h-6 text-indigo-200 flex-shrink-0 mt-1" />
                      <p>Innovation technologique au service du patient</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-6 h-6 text-indigo-200 flex-shrink-0 mt-1" />
                      <p>Formation continue des praticiens</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Rejoignez l'Excellence CEPROF
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Découvrez nos formations avancées en orthodontie neuro-musculaire 
              et développez votre expertise avec les meilleurs spécialistes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <ButtonPrimary 
                href="/formations" 
                className="bg-white text-indigo-600 hover:bg-indigo-50"
                sizeClass="px-8 py-4"
              >
                Nos Formations ONM
              </ButtonPrimary>
              <ButtonSecondary 
                href="/contact" 
                className="border-white text-white hover:bg-white/10"
                sizeClass="px-8 py-4"
              >
                Nous Contacter
              </ButtonSecondary>
            </div>
            
            {/* Nouveaux boutons pour les pages CEPROF */}
            <div className="pt-8 border-t border-white/20">
              <p className="text-indigo-100 mb-4">Découvrez le CEPROF</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ButtonPrimary 
                  href="/ceprof/cercle-excellence" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600"
                  sizeClass="px-6 py-3"
                >
                  Cercle d'Excellence
                </ButtonPrimary>
                <ButtonPrimary 
                  href="/ceprof/devenir-membre" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600"
                  sizeClass="px-6 py-3"
                >
                  Devenir Membre
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CEPROFPage