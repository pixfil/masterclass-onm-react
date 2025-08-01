'use client'

import React from 'react'
import Image from 'next/image'
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  TagIcon,
  ChartBarIcon,
  BeakerIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { useParams } from 'next/navigation'

// Données détaillées pour chaque cas
const casCliniqueDetails = {
  1: {
    id: 1,
    title: "Correction d'une Classe II avec approche neuro-musculaire",
    description: "Patient de 14 ans présentant une classe II division 1 avec surplomb important. Traitement par rééducation fonctionnelle et aligneurs.",
    category: "Classe II",
    difficulty: "Intermédiaire",
    duration: "18 mois",
    author: "Dr. Sophie Martin",
    date: "Mars 2024",
    patientInfo: {
      age: "14 ans",
      sexe: "Masculin",
      chiefComplaint: "Surplomb important et difficulté à fermer les lèvres",
      medicalHistory: "Respiration buccale depuis l'enfance"
    },
    diagnosis: {
      skeletal: "Classe II squelettique avec rétromandibulie",
      dental: "Classe II division 1 d'Angle, surplomb de 8mm",
      functional: "Dysfonction linguale, respiration buccale, déglutition atypique",
      tmj: "Légère subluxation condylienne droite"
    },
    treatmentPlan: {
      phase1: {
        title: "Phase 1 - Rééducation fonctionnelle (0-6 mois)",
        steps: [
          "Exercices de rééducation linguale quotidiens",
          "Apprentissage de la respiration nasale",
          "Port d'un activateur fonctionnel nocturne",
          "Suivi kinésithérapique bimensuel"
        ]
      },
      phase2: {
        title: "Phase 2 - Alignement dentaire (6-18 mois)",
        steps: [
          "Mise en place d'aligneurs transparents",
          "Élastiques de Classe II progressifs",
          "Ajustements mensuels du plan de traitement",
          "Maintien des exercices fonctionnels"
        ]
      },
      phase3: {
        title: "Phase 3 - Stabilisation (18+ mois)",
        steps: [
          "Port de gouttières de contention",
          "Exercices de maintien fonctionnel",
          "Contrôles trimestriels",
          "Évaluation de la stabilité occlusale"
        ]
      }
    },
    results: {
      skeletal: "Amélioration significative de la position mandibulaire",
      dental: "Classe I d'Angle obtenue, surplomb réduit à 2mm",
      functional: "Respiration nasale établie, déglutition normalisée",
      esthetic: "Profil harmonieux, fermeture labiale naturelle",
      stability: "Excellente stabilité à 6 mois post-traitement"
    },
    images: {
      before: {
        profile: "/images/formation-default.svg",
        frontal: "/images/formation-default.svg",
        occlusal: "/images/formation-default.svg",
        xray: "/images/formation-default.svg"
      },
      during: {
        month6: "/images/formation-default.svg",
        month12: "/images/formation-default.svg"
      },
      after: {
        profile: "/images/formation-default.svg",
        frontal: "/images/formation-default.svg",
        occlusal: "/images/formation-default.svg",
        xray: "/images/formation-default.svg"
      }
    },
    videos: [
      {
        title: "Analyse initiale du cas",
        duration: "5:30",
        thumbnail: "/images/formation-default.svg"
      },
      {
        title: "Évolution du traitement",
        duration: "8:45",
        thumbnail: "/images/formation-default.svg"
      }
    ],
    keyPoints: [
      "Importance du diagnostic fonctionnel initial",
      "Synergie entre rééducation et mécanique orthodontique",
      "Rôle crucial de la compliance patient",
      "Stabilité obtenue par l'équilibre neuro-musculaire"
    ],
    tags: ["Adolescent", "Classe II", "Aligneurs", "Rééducation", "Cas complexe"]
  },
  3: {
    id: 3,
    title: "Expansion palatine chez l'enfant",
    description: "Enfant de 8 ans avec palais étroit et respiration buccale. Traitement par expansion palatine et rééducation de la déglutition.",
    category: "Pédiatrie",
    difficulty: "Débutant",
    duration: "12 mois",
    author: "Dr. Marie Lefebvre",
    date: "Janvier 2024",
    patientInfo: {
      age: "8 ans",
      sexe: "Féminin",
      chiefComplaint: "Encombrement dentaire et respiration buccale",
      medicalHistory: "Allergies saisonnières, ronflements nocturnes"
    },
    diagnosis: {
      skeletal: "Déficit transversal maxillaire de 6mm",
      dental: "Encombrement antérieur sévère, occlusion croisée bilatérale",
      functional: "Respiration buccale prédominante, position linguale basse",
      tmj: "Pas de dysfonction articulaire"
    },
    treatmentPlan: {
      phase1: {
        title: "Phase 1 - Expansion rapide (0-3 mois)",
        steps: [
          "Mise en place d'un disjoncteur palatin",
          "Activation quotidienne pendant 2 semaines",
          "Stabilisation pendant 3 mois",
          "Début des exercices de positionnement lingual"
        ]
      },
      phase2: {
        title: "Phase 2 - Rééducation fonctionnelle (3-9 mois)",
        steps: [
          "Exercices de rééducation linguale intensifs",
          "Apprentissage de la respiration nasale",
          "Travail sur la déglutition physiologique",
          "Collaboration avec ORL pour dégager les voies aériennes"
        ]
      },
      phase3: {
        title: "Phase 3 - Guidage de l'éruption (9-12 mois)",
        steps: [
          "Surveillance de l'éruption des dents permanentes",
          "Maintien de l'expansion obtenue",
          "Poursuite des exercices fonctionnels",
          "Mise en place d'un mainteneur d'espace si nécessaire"
        ]
      }
    },
    results: {
      skeletal: "Expansion transversale de 7mm obtenue",
      dental: "Résolution de l'occlusion croisée, espace créé pour l'alignement",
      functional: "Respiration nasale rétablie à 90%, déglutition normalisée",
      esthetic: "Amélioration du sourire et de l'harmonie faciale",
      stability: "Excellente stabilité grâce à la rééducation fonctionnelle"
    },
    images: {
      before: {
        profile: "/images/formation-default.svg",
        frontal: "/images/formation-default.svg",
        occlusal: "/images/formation-default.svg",
        xray: "/images/formation-default.svg"
      },
      during: {
        month3: "/images/formation-default.svg",
        month6: "/images/formation-default.svg"
      },
      after: {
        profile: "/images/formation-default.svg",
        frontal: "/images/formation-default.svg",
        occlusal: "/images/formation-default.svg",
        xray: "/images/formation-default.svg"
      }
    },
    videos: [
      {
        title: "Technique d'expansion palatine",
        duration: "7:15",
        thumbnail: "/images/formation-default.svg"
      },
      {
        title: "Exercices de rééducation pour enfants",
        duration: "10:20",
        thumbnail: "/images/formation-default.svg"
      }
    ],
    keyPoints: [
      "Timing optimal pour l'expansion chez l'enfant",
      "Importance de la rééducation fonctionnelle précoce",
      "Collaboration interdisciplinaire (ORL, orthophoniste)",
      "Prévention des récidives par l'équilibre fonctionnel"
    ],
    tags: ["Enfant", "Expansion", "Respiration", "Déglutition", "Prévention"]
  }
}

const CasCliniqueDetailPage = () => {
  const params = useParams()
  const caseId = params?.id as string
  const caseData = casCliniqueDetails[parseInt(caseId)]

  // Si le cas n'existe pas, afficher les données du cas 1 par défaut
  const currentCase = caseData || casCliniqueDetails[1]

  return (
    <div className="nc-CasCliniqueDetailPage">
      {/* Hero Section avec le même style que /la-methode */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <AcademicCapIcon className="w-4 h-4 mr-2" />
              Cas Clinique Détaillé
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {currentCase.title}
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {currentCase.description}
            </p>

            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <UserIcon className="w-4 h-4" />
                <span>{currentCase.author}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <ClockIcon className="w-4 h-4" />
                <span>{currentCase.duration}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <TagIcon className="w-4 h-4" />
                <span>{currentCase.category}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/cas-cliniques">
              <ButtonSecondary sizeClass="px-4 py-2">
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Retour aux cas
              </ButtonSecondary>
            </Link>
            
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Informations Patient */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Informations Patient
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Âge</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.patientInfo.age}</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Sexe</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.patientInfo.sexe}</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Motif de consultation</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.patientInfo.chiefComplaint}</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Antécédents</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.patientInfo.medicalHistory}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic */}
      <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Diagnostic Complet
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Analyse Squelettique</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.diagnosis.skeletal}</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <BeakerIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Analyse Dentaire</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.diagnosis.dental}</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Analyse Fonctionnelle</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.diagnosis.functional}</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">ATM</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{currentCase.diagnosis.tmj}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie d'images */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Documentation Photographique
            </h2>
            
            <div className="space-y-12">
              {/* Avant traitement */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-center">Avant Traitement</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.before.profile}
                      alt="Profil avant"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Profil
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.before.frontal}
                      alt="Face avant"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Face
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.before.occlusal}
                      alt="Occlusal avant"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Occlusal
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.before.xray}
                      alt="Radio avant"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Radiographie
                    </div>
                  </div>
                </div>
              </div>

              {/* Après traitement */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-center">Après Traitement</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.after.profile}
                      alt="Profil après"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Profil
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.after.frontal}
                      alt="Face après"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Face
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.after.occlusal}
                      alt="Occlusal après"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Occlusal
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={currentCase.images.after.xray}
                      alt="Radio après"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      Radiographie
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan de traitement */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Plan de Traitement Détaillé
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {Object.values(currentCase.treatmentPlan).map((phase, index) => (
                <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold">{phase.title}</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {phase.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-600 dark:text-neutral-400">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vidéos */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Vidéos Explicatives
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {currentCase.videos.map((video, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayIcon className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm opacity-80">{video.duration}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Résultats Obtenus
            </h2>
            
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {Object.entries(currentCase.results).map(([key, value]) => (
                  <div key={key} className="border-l-4 border-indigo-500 pl-6">
                    <h3 className="text-lg font-semibold mb-2 capitalize">
                      {key === 'skeletal' && 'Résultats Squelettiques'}
                      {key === 'dental' && 'Résultats Dentaires'}
                      {key === 'functional' && 'Résultats Fonctionnels'}
                      {key === 'esthetic' && 'Résultats Esthétiques'}
                      {key === 'stability' && 'Stabilité'}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Points clés */}
      <section className="py-20 lg:py-28 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
              Points Clés à Retenir
            </h2>
            
            <div className="space-y-4">
              {currentCase.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-lg text-neutral-700 dark:text-neutral-300">{point}</p>
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
              Maîtrisez ces techniques
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Apprenez à traiter des cas similaires avec notre formation en orthodontie neuro-musculaire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors duration-300">
                  Voir les formations
                </button>
              </Link>
              <Link href="/cas-cliniques">
                <button className="px-8 py-4 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors duration-300 border border-indigo-500">
                  Autres cas cliniques
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CasCliniqueDetailPage