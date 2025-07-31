'use client'

import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  StarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/Button'
import Link from 'next/link'

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  formType: 'satisfaction' | 'evaluation'
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  formType
}) => {
  const benefits = [
    {
      icon: AcademicCapIcon,
      title: 'Badge Orthodontiste Certifié ONM',
      description: 'Soyez automatiquement référencé sur notre carte des praticiens formés, visible par des milliers de patients'
    },
    {
      icon: ChartBarIcon,
      title: 'Suivi de votre progression',
      description: 'Accédez à vos statistiques personnelles, historique de formations et certificats'
    },
    {
      icon: BookOpenIcon,
      title: 'Accès E-Learning exclusif',
      description: 'Débloquez du contenu premium et des formations continues en ligne'
    },
    {
      icon: UserGroupIcon,
      title: 'Communauté CEPROF',
      description: 'Rejoignez le cercle fermé des experts ONM et échangez avec vos pairs'
    }
  ]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 text-left align-middle shadow-xl transition-all">
                {/* Header avec gradient */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-cyan-600 p-6 pb-8">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-white" />
                  </button>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                      <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Connexion requise pour continuer
                    </Dialog.Title>
                    <p className="text-indigo-100">
                      {formType === 'satisfaction' 
                        ? 'Votre retour est essentiel pour améliorer nos formations'
                        : 'Validez vos connaissances et obtenez votre certificat'}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Message personnalisé */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Cher praticien,</strong><br />
                      Dans un souci d'amélioration continue et pour permettre au Dr. Romain de Papé de personnaliser 
                      les futures formations, nous avons besoin de vous identifier. Cette connexion vous offre également 
                      de nombreux avantages exclusifs !
                    </p>
                  </div>

                  {/* Bénéfices */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                      <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                      Vos avantages en vous connectant
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {benefits.map((benefit, index) => {
                        const Icon = benefit.icon
                        return (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                {benefit.title}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {benefit.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Stats de confiance */}
                  <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2500+</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Praticiens formés</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">98%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Taux de satisfaction</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">15</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Villes en France</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Link href="/connexion" className="block">
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-700 hover:to-cyan-700"
                        sizeClass="px-6 py-3"
                      >
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Se connecter pour continuer
                      </Button>
                    </Link>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pas encore de compte ?{' '}
                        <Link href="/inscription" className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Inscrivez-vous gratuitement
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Garantie */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-600">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>Données sécurisées • Conformité RGPD • Accès immédiat</span>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}