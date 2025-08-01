'use client'

import React, { useState } from 'react'
import { Heading } from '@/shared/Heading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import Image from 'next/image'
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  HandRaisedIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import ModernHeader from '@/components/Header/ModernHeader'
import Link from 'next/link'

export default function CommunautePage() {
  const [activeTab, setActiveTab] = useState('discussions')

  const discussions = [
    {
      id: 1,
      title: "Cas complexe de Classe II : besoin de conseils",
      author: "Dr. Sophie Martin",
      avatar: "/images/formation-default.svg",
      category: "Cas cliniques",
      replies: 12,
      views: 234,
      lastReply: "Il y a 2 heures",
      excerpt: "J'ai un patient de 15 ans avec une Classe II division 2 sévère. J'aimerais avoir vos avis sur l'approche ONM..."
    },
    {
      id: 2,
      title: "Retour d'expérience : Aligneurs + dispositifs auxiliaires",
      author: "Dr. Jean Dubois",
      avatar: "/images/formation-default.svg",
      category: "Techniques",
      replies: 8,
      views: 156,
      lastReply: "Il y a 5 heures",
      excerpt: "Après 6 mois d'utilisation de la méthode hybride, voici mes observations..."
    },
    {
      id: 3,
      title: "Question sur la rééducation linguale",
      author: "Dr. Marie Lefebvre",
      avatar: "/images/formation-default.svg",
      category: "Rééducation",
      replies: 15,
      views: 312,
      lastReply: "Hier",
      excerpt: "Quel est votre protocole pour la rééducation linguale chez l'adulte ?"
    }
  ]

  const events = [
    {
      id: 1,
      title: "Webinaire : Cas complexes en ONM",
      date: "15 Novembre 2024",
      time: "20h00",
      type: "En ligne",
      speaker: "Dr. Romain de Papé",
      participants: 45
    },
    {
      id: 2,
      title: "Rencontre régionale CEPROF - Paris",
      date: "2 Décembre 2024",
      time: "14h00",
      type: "Présentiel",
      location: "Paris",
      participants: 28
    },
    {
      id: 3,
      title: "Atelier pratique : Diagnostic 3D",
      date: "18 Décembre 2024",
      time: "9h00",
      type: "Présentiel",
      location: "Lyon",
      participants: 15
    }
  ]

  const resources = [
    {
      id: 1,
      title: "Guide pratique : Intégration ONM au cabinet",
      type: "PDF",
      author: "CEPROF",
      downloads: 234,
      category: "Guides"
    },
    {
      id: 2,
      title: "Protocoles de rééducation fonctionnelle",
      type: "Document",
      author: "Dr. Philippe Bernard",
      downloads: 189,
      category: "Protocoles"
    },
    {
      id: 3,
      title: "Cas cliniques commentés - Volume 1",
      type: "Présentation",
      author: "Collectif CEPROF",
      downloads: 156,
      category: "Cas cliniques"
    }
  ]

  return (
    <div className="nc-CommunautePage">
      <ModernHeader />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Espace d'échange et de partage
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Communauté <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CEPROF</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Échangez, partagez et progressez avec les meilleurs experts 
              en orthodontie neuro-musculaire
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

      {/* Statistiques de la communauté */}
      <section className="py-12 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">200+</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Membres actifs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600">1,250</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Discussions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">850</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Cas partagés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600">95%</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'discussions'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline-block mr-2" />
              Discussions
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <CalendarIcon className="w-5 h-5 inline-block mr-2" />
              Événements
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <LightBulbIcon className="w-5 h-5 inline-block mr-2" />
              Ressources
            </button>
            <button
              onClick={() => setActiveTab('mentorship')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'mentorship'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <HandRaisedIcon className="w-5 h-5 inline-block mr-2" />
              Mentorat
            </button>
          </div>

          {/* Contenu des tabs */}
          <div className="max-w-6xl mx-auto">
            {/* Discussions */}
            {activeTab === 'discussions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <Heading as="h2" className="text-2xl font-bold">
                    Discussions récentes
                  </Heading>
                  <ButtonPrimary>
                    Nouvelle discussion
                  </ButtonPrimary>
                </div>

                {discussions.map(discussion => (
                  <div key={discussion.id} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Image
                        src={discussion.avatar}
                        alt={discussion.author}
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 hover:text-indigo-600 cursor-pointer">
                          {discussion.title}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                          {discussion.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>{discussion.author}</span>
                          <span>•</span>
                          <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
                            {discussion.category}
                          </span>
                          <span>•</span>
                          <span>{discussion.replies} réponses</span>
                          <span>•</span>
                          <span>{discussion.views} vues</span>
                          <span className="ml-auto">{discussion.lastReply}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Événements */}
            {activeTab === 'events' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <Heading as="h2" className="text-2xl font-bold">
                    Événements à venir
                  </Heading>
                  <ButtonPrimary>
                    Proposer un événement
                  </ButtonPrimary>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(event => (
                    <div key={event.id} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-600">
                          {event.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Animé par {event.speaker}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          {event.type === 'En ligne' ? (
                            <SparklesIcon className="w-4 h-4" />
                          ) : (
                            <MapPinIcon className="w-4 h-4" />
                          )}
                          {event.type === 'En ligne' ? event.type : event.location}
                        </span>
                        <span className="text-neutral-500">
                          {event.participants} inscrits
                        </span>
                      </div>
                      <ButtonSecondary className="w-full mt-4">
                        S'inscrire
                      </ButtonSecondary>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ressources */}
            {activeTab === 'resources' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <Heading as="h2" className="text-2xl font-bold">
                    Ressources partagées
                  </Heading>
                  <ButtonPrimary>
                    Partager une ressource
                  </ButtonPrimary>
                </div>

                <div className="space-y-4">
                  {resources.map(resource => (
                    <div key={resource.id} className="bg-white dark:bg-neutral-800 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <ShareIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{resource.title}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {resource.author} • {resource.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500">
                          {resource.downloads} téléchargements
                        </span>
                        <ButtonSecondary sizeClass="px-4 py-2">
                          Télécharger
                        </ButtonSecondary>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentorat */}
            {activeTab === 'mentorship' && (
              <div className="text-center py-12">
                <div className="max-w-2xl mx-auto">
                  <HandRaisedIcon className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
                  <Heading as="h2" className="text-2xl font-bold mb-4">
                    Programme de Mentorat CEPROF
                  </Heading>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                    Bénéficiez de l'accompagnement personnalisé d'un expert certifié 
                    pour développer votre pratique de l'orthodontie neuro-musculaire.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
                      <AcademicCapIcon className="w-8 h-8 text-indigo-600 mb-4" />
                      <h3 className="font-semibold mb-2">Devenir Mentor</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Partagez votre expertise et accompagnez les nouveaux praticiens ONM
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                      <HeartIcon className="w-8 h-8 text-cyan-600 mb-4" />
                      <h3 className="font-semibold mb-2">Trouver un Mentor</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Accélérez votre apprentissage avec un accompagnement personnalisé
                      </p>
                    </div>
                  </div>
                  <ButtonPrimary>
                    En savoir plus sur le mentorat
                  </ButtonPrimary>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Rejoignez une communauté d'excellence
            </Heading>
            <p className="text-xl mb-8 text-indigo-100">
              Échangez avec les meilleurs experts et développez votre pratique de l'ONM
            </p>
            <ButtonPrimary className="bg-white text-indigo-600 hover:bg-indigo-50">
              Devenir membre CEPROF
            </ButtonPrimary>
          </div>
        </div>
      </section>
    </div>
  )
}