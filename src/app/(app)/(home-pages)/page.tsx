import React from 'react'
import ModernHero from '@/components/hero/ModernHero'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserGroupIcon,
  AcademicCapIcon,
  CogIcon,
  HeartIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

function HomePage() {
  return (
    <div className="min-h-screen">
      <ModernHero />
      
      {/* Section de présentation ONM */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
              <HeartIcon className="w-4 h-4 mr-2" />
              Orthodontie Neuro-Musculaire
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Outils hybrides et traitements <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">interdisciplinaires</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed">
              Une approche révolutionnaire de la rééducation du système mandibulaire 
              utilisant des outils digitaux et des gouttières pour des résultats optimaux.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/10 dark:to-cyan-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Résultats en 6 mois</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Correction de l'alignement dentaire avec des résultats visibles rapidement 
                grâce à notre approche neuro-musculaire.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/10 dark:to-cyan-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CogIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Outils Optimisés</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Optimisation des outils orthodontiques et amélioration de la coopération 
                des patients pour un traitement efficace.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/10 dark:to-cyan-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Santé Préservée</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Minimisation des effets secondaires sur la santé dentaire et gingivale 
                grâce à une approche douce et naturelle.
              </p>
            </div>
          </div>

          {/* Approche interdisciplinaire */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-6">
                Une approche interdisciplinaire
              </h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                L'orthodontie ONM utilise des outils conventionnels (multi-attaches, sectionnel, gouttières, vis) 
                dans une approche interdisciplinaire de la pratique orthodontique, avec un art diagnostique 
                axé sur la fonction et l'équilibre.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">Outils conventionnels optimisés</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">Multi-attaches, sectionnel, gouttières, vis</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">Art diagnostique avancé</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">Focus sur la fonction et l'équilibre</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">Collaboration interdisciplinaire</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">Travail en équipe avec différents spécialistes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-3xl p-8 text-white">
                <div className="text-center mb-6">
                  <AcademicCapIcon className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
                  <h4 className="text-2xl font-bold mb-2">Dr. Romain de Papé</h4>
                  <p className="text-indigo-200">Fondateur de la méthode ONM</p>
                </div>
                <blockquote className="text-center italic text-lg leading-relaxed">
                  "J'ai décidé de créer le master 'ONM' pour promouvoir une philosophie médicale 
                  que je crois être l'avenir de l'orthodontie fonctionnelle."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section modules de formation */}
      <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
              Nos Modules de Formation
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Découvrez nos formations complètes en orthodontie neuro-musculaire
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Module 1 */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-3">
                    Module 01
                  </span>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Fondamentaux
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Formation initiale de 3 jours à Paris
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">2 500€</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Formation complète</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Cours d'introduction à l'ONM</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Pratique sur cas cliniques</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Certification CEPROF</span>
                </div>
              </div>

              <ButtonPrimary href="/formations?module=1" className="w-full">
                Découvrir le Module 1
              </ButtonPrimary>
            </div>

            {/* Module 2 */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 mb-3">
                    Module 02
                  </span>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Perfectionnement
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    1 jour à Paris ou 4 jours à Dakhla
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-600">950€</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Formation avancée</div>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
                  <StarIcon className="w-4 h-4" />
                  Prérequis : Module 01 complété
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Techniques avancées</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Cas complexes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Certification avancée</span>
                </div>
              </div>

              <ButtonSecondary href="/formations?module=2" className="w-full">
                Découvrir le Module 2
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
              Ce que disent nos étudiants
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Découvrez les témoignages de praticiens formés à l'ONM
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <StarIcon key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-neutral-700 dark:text-neutral-300 mb-6">
                "La formation ONM a complètement transformé ma pratique. Les résultats sont visibles 
                dès les premiers traitements."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Dr. Marie L.</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Orthodontiste, Paris</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <StarIcon key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-neutral-700 dark:text-neutral-300 mb-6">
                "L'approche interdisciplinaire m'a permis d'améliorer considérablement 
                la satisfaction de mes patients."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Dr. Jean M.</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Dentiste, Lyon</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <StarIcon key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-neutral-700 dark:text-neutral-300 mb-6">
                "Une formation exceptionnelle qui allie théorie et pratique. 
                Je recommande vivement !"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Dr. Sophie D.</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Orthodontiste, Marseille</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA finale */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à révolutionner votre pratique ?
            </h2>
            <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
              Rejoignez la communauté des orthodontistes formés à la méthode ONM 
              et découvrez une nouvelle approche du traitement orthodontique basée sur l'excellence scientifique.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <ButtonPrimary 
                href="/formations" 
                className="bg-white text-indigo-600 hover:bg-indigo-50"
                sizeClass="px-8 py-4 text-lg"
              >
                <span className="flex items-center gap-2">
                  Découvrir nos formations
                  <ArrowRightIcon className="w-5 h-5" />
                </span>
              </ButtonPrimary>
              <ButtonSecondary 
                href="/contact" 
                className="border-white text-white hover:bg-white/10"
                sizeClass="px-8 py-4 text-lg"
              >
                Nous contacter
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
