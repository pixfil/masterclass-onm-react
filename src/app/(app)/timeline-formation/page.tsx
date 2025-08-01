'use client'

import { useState } from 'react'
import { ChevronRightIcon, DocumentTextIcon, VideoCameraIcon, QuestionMarkCircleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface TimelineStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  status: 'completed' | 'current' | 'upcoming'
  resources: {
    videos?: string[]
    documents?: string[]
    faq?: { question: string; answer: string }[]
  }
}

const timelineSteps: TimelineStep[] = [
  {
    id: 'inscription',
    title: 'Inscription',
    description: 'Commencez votre parcours ONM',
    icon: DocumentTextIcon,
    status: 'completed',
    resources: {
      videos: ['Guide d\'inscription', 'Présentation de la plateforme'],
      documents: ['Formulaire d\'inscription', 'Conditions générales'],
      faq: [
        { question: 'Comment m\'inscrire ?', answer: 'Cliquez sur le bouton inscription et suivez les étapes.' },
        { question: 'Quels sont les prérequis ?', answer: 'Être orthodontiste diplômé et exercer en France.' }
      ]
    }
  },
  {
    id: 'preparation',
    title: 'Préparation',
    description: 'Préparez-vous pour la formation',
    icon: ClockIcon,
    status: 'current',
    resources: {
      videos: ['Introduction à l\'ONM', 'Les bases de la posturologie'],
      documents: ['Programme détaillé', 'Bibliographie recommandée'],
      faq: [
        { question: 'Combien de temps dure la préparation ?', answer: 'Environ 2 semaines avant le début de la formation.' },
        { question: 'Que dois-je préparer ?', answer: 'Consultez les documents et vidéos mis à disposition.' }
      ]
    }
  },
  {
    id: 'formation',
    title: 'Formation',
    description: 'Suivez les modules de formation',
    icon: VideoCameraIcon,
    status: 'upcoming',
    resources: {
      videos: ['Module 1 - Fondamentaux', 'Module 2 - Pratique clinique'],
      documents: ['Support de cours', 'Cas cliniques'],
      faq: [
        { question: 'Quelle est la durée de la formation ?', answer: '3 jours intensifs en présentiel.' },
        { question: 'Où se déroule la formation ?', answer: 'Dans nos centres à Paris, Lyon ou Marseille.' }
      ]
    }
  },
  {
    id: 'evaluation',
    title: 'Évaluation',
    description: 'Validez vos connaissances',
    icon: QuestionMarkCircleIcon,
    status: 'upcoming',
    resources: {
      videos: ['Préparation à l\'évaluation'],
      documents: ['Exemples de questions', 'Critères d\'évaluation'],
      faq: [
        { question: 'Comment se passe l\'évaluation ?', answer: 'QCM de 50 questions et présentation d\'un cas clinique.' },
        { question: 'Quel score pour valider ?', answer: 'Il faut obtenir au moins 80% de réussite.' }
      ]
    }
  },
  {
    id: 'certification',
    title: 'Certification',
    description: 'Obtenez votre certification ONM',
    icon: CheckCircleIcon,
    status: 'upcoming',
    resources: {
      videos: ['Félicitations !', 'Prochaines étapes'],
      documents: ['Certificat ONM', 'Badge numérique'],
      faq: [
        { question: 'Comment récupérer mon certificat ?', answer: 'Il est disponible dans votre espace personnel.' },
        { question: 'Quelle est la durée de validité ?', answer: 'La certification est valable 3 ans.' }
      ]
    }
  }
]

export default function TimelineFormationPage() {
  const [selectedStep, setSelectedStep] = useState<TimelineStep | null>(null)
  const [activeTab, setActiveTab] = useState<'videos' | 'documents' | 'faq'>('videos')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-cyan-900/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Timeline de Formation ONM
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Visualisez votre parcours de formation étape par étape
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-500 rounded-full" />

            {/* Steps */}
            <div className="space-y-12">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon
                const isLeft = index % 2 === 0

                return (
                  <div key={step.id} className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}>
                    {/* Content */}
                    <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div
                        className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105 ${
                          step.status === 'current' ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                        }`}
                        onClick={() => setSelectedStep(step)}
                      >
                        <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                          <Icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {step.description}
                        </p>
                        <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                          Voir les ressources
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Circle */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'current' ? 'bg-blue-500 animate-pulse' :
                        'bg-gray-300'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" />
                        ) : (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resource Modal */}
          {selectedStep && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStep.title} - Ressources
                    </h2>
                    <button
                      onClick={() => setSelectedStep(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-4 mt-4">
                    {['videos', 'documents', 'faq'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === tab
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tab === 'videos' ? 'Vidéos' : tab === 'documents' ? 'Documents' : 'FAQ'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                  {activeTab === 'videos' && selectedStep.resources.videos && (
                    <div className="space-y-3">
                      {selectedStep.resources.videos.map((video, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <VideoCameraIcon className="w-6 h-6 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300">{video}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'documents' && selectedStep.resources.documents && (
                    <div className="space-y-3">
                      {selectedStep.resources.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'faq' && selectedStep.resources.faq && (
                    <div className="space-y-4">
                      {selectedStep.resources.faq.map((item, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {item.question}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}