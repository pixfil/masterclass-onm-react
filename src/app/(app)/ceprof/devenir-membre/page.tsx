'use client'

import React, { useState } from 'react'
import { Heading } from '@/shared/Heading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ModernHeader from '@/components/Header/ModernHeader'

export default function DevenirMembrePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profession: '',
    speciality: '',
    experience: '',
    city: '',
    country: '',
    motivation: '',
    contributions: ''
  })

  const avantages = [
    {
      icon: UserGroupIcon,
      title: "Réseau d'Excellence",
      description: "Accès à un réseau exclusif de spécialistes reconnus dans l'orthodontie neuro-musculaire"
    },
    {
      icon: AcademicCapIcon,
      title: "Formation Continue",
      description: "Tarifs préférentiels sur toutes nos formations et accès prioritaire aux nouveaux modules"
    },
    {
      icon: SparklesIcon,
      title: "Innovation & Recherche",
      description: "Participation aux projets de recherche et accès en avant-première aux innovations"
    },
    {
      icon: BuildingOffice2Icon,
      title: "Visibilité Professionnelle",
      description: "Référencement sur notre annuaire et mise en avant de votre expertise"
    },
    {
      icon: GlobeAltIcon,
      title: "Événements Exclusifs",
      description: "Invitations aux conférences privées et événements réservés aux membres"
    },
    {
      icon: ChartBarIcon,
      title: "Ressources Premium",
      description: "Accès à notre bibliothèque de cas cliniques et outils de diagnostic avancés"
    }
  ]

  const criteres = [
    "Être diplômé en orthodontie ou en cours de spécialisation",
    "Avoir suivi au moins une formation ONM ou s'engager à le faire",
    "Partager les valeurs d'excellence et d'innovation du CEPROF",
    "S'engager dans une démarche de formation continue",
    "Contribuer activement à la communauté (cas cliniques, recherche, mentorat)"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logique d'envoi du formulaire
    console.log('Formulaire soumis:', formData)
  }

  return (
    <div className="nc-DevenirMembrePage">
      <ModernHeader />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Cercle d'Excellence des Praticiens
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Rejoignez le <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CEPROF</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Intégrez le cercle d'excellence des praticiens en orthodontie fonctionnelle
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

      {/* Avantages */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Les Avantages Membres
            </Heading>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Rejoindre le CEPROF, c'est intégrer une communauté d'excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {avantages.map((avantage, index) => (
              <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-4">
                  <avantage.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{avantage.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {avantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Critères d'admission */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-4">
                Critères d'Admission
              </Heading>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                Le CEPROF maintient des standards d'excellence élevés
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="space-y-4">
                {criteres.map((critere, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-lg text-neutral-700 dark:text-neutral-300">
                      {critere}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-center text-blue-800 dark:text-blue-300">
                  <strong>Note :</strong> Chaque candidature est étudiée individuellement par le comité d'admission
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de candidature */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-4">
                Formulaire de Candidature
              </Heading>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                Commencez votre parcours d'excellence
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Prénom *
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Téléphone *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Profession *
                  </label>
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2"
                    required
                  >
                    <option value="">Sélectionnez</option>
                    <option value="orthodontiste">Orthodontiste</option>
                    <option value="dentiste">Dentiste</option>
                    <option value="etudiant">Étudiant en spécialisation</option>
                    <option value="autre">Autre spécialiste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Années d'expérience *
                  </label>
                  <Input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Ville *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Pays *
                  </label>
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Pourquoi souhaitez-vous rejoindre le CEPROF ? *
                </label>
                <Textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  rows={4}
                  placeholder="Décrivez vos motivations et vos objectifs..."
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Comment envisagez-vous de contribuer à la communauté ?
                </label>
                <Textarea
                  value={formData.contributions}
                  onChange={(e) => setFormData({...formData, contributions: e.target.value})}
                  rows={4}
                  placeholder="Partage de cas cliniques, mentorat, recherche..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <ButtonPrimary type="submit" className="flex-1">
                  Soumettre ma candidature
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </ButtonPrimary>
                <Link href="/ceprof" className="flex-1">
                  <ButtonPrimary className="w-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600">
                    En savoir plus sur le CEPROF
                  </ButtonPrimary>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-12">
              Ils ont rejoint le CEPROF
            </Heading>
            
            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 md:p-12 shadow-xl">
              <blockquote className="text-xl italic text-neutral-700 dark:text-neutral-300 mb-6">
                "Rejoindre le CEPROF a transformé ma pratique. L'accès aux dernières innovations et le partage d'expérience avec des experts reconnus m'ont permis d'offrir des soins d'excellence à mes patients."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
                <div className="text-left">
                  <p className="font-semibold">Dr. Sophie Martin</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Membre CEPROF depuis 2022</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}