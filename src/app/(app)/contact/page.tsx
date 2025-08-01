'use client'

import React, { useState } from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import Select from '@/shared/Select'
import ModernHeader from '@/components/Header/ModernHeader'
import Link from 'next/link'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    profession: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Message envoyé !
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <ButtonPrimary href="/" sizeClass="px-6 py-3">
              Retour à l'accueil
            </ButtonPrimary>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="nc-ContactPage">
      <ModernHeader />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Nous sommes là pour vous
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Contactez</span> Notre Équipe
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Des questions sur nos formations ONM ? Notre équipe d'experts 
              est là pour vous accompagner dans votre parcours professionnel
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

      {/* Contact Content */}
      <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
                    Informations de Contact
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-8">
                    Nous répondons généralement sous 24h à toutes vos demandes d'information.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Email</h3>
                      <p className="text-neutral-600 dark:text-neutral-300">contact@masterclass-onm.com</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pour toutes vos questions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Téléphone</h3>
                      <p className="text-neutral-600 dark:text-neutral-300">01 23 45 67 89</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Lun - Ven, 9h-18h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Adresse</h3>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Formation Masterclass ONM<br />
                        Paris, France
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Horaires</h3>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Lundi - Vendredi : 9h - 18h<br />
                        Samedi : 9h - 12h
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formation Locations */}
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
                    <AcademicCapIcon className="w-5 h-5 mr-2" />
                    Villes de Formation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-indigo-800 dark:text-indigo-200">• Paris (formations principales)</p>
                    <p className="text-indigo-800 dark:text-indigo-200">• Lyon (sessions régionales)</p>
                    <p className="text-indigo-800 dark:text-indigo-200">• Marseille (sur demande)</p>
                    <p className="text-indigo-800 dark:text-indigo-200">• Bordeaux (sessions spécialisées)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-3xl p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                  Envoyez-nous un Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Dr. Jean Dupont"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="jean.dupont@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Téléphone
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Profession
                      </label>
                      <Select
                        value={formData.profession}
                        onChange={(e) => handleInputChange('profession', e.target.value)}
                      >
                        <option value="">Sélectionnez votre profession</option>
                        <option value="orthodontiste">Orthodontiste</option>
                        <option value="dentiste">Dentiste</option>
                        <option value="kinesitherapeute">Kinésithérapeute</option>
                        <option value="orthophoniste">Orthophoniste</option>
                        <option value="etudiant">Étudiant en santé</option>
                        <option value="autre">Autre</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Sujet *
                    </label>
                    <Select
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    >
                      <option value="">Choisissez un sujet</option>
                      <option value="informations-formations">Informations sur les formations</option>
                      <option value="inscription">Inscription aux formations</option>
                      <option value="ceprof">Questions sur CEPROF</option>
                      <option value="tarifs">Tarifs et financement</option>
                      <option value="calendrier">Calendrier des sessions</option>
                      <option value="partenariat">Partenariat professionnel</option>
                      <option value="autre">Autre demande</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Décrivez votre demande ou vos questions concernant nos formations ONM..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      className="mt-1"
                    />
                    <label htmlFor="privacy" className="text-sm text-neutral-600 dark:text-neutral-400">
                      J'accepte que mes données personnelles soient utilisées pour traiter ma demande. 
                      Ces informations ne seront pas partagées avec des tiers.
                    </label>
                  </div>

                  <div className="pt-4">
                    <ButtonPrimary
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto"
                      sizeClass="px-8 py-4"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer le Message'
                      )}
                    </ButtonPrimary>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                Questions Fréquentes
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-300">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Qui peut suivre les formations ONM ?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Nos formations s'adressent aux orthodontistes, dentistes, kinésithérapeutes 
                    et autres professionnels de santé intéressés par l'approche neuro-musculaire.
                  </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Les formations sont-elles certifiantes ?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Oui, toutes nos formations délivrent une certification CEPROF reconnue 
                    dans le domaine de l'orthodontie neuro-musculaire.
                  </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Quels sont les prérequis ?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Un diplôme en médecine dentaire ou dans une profession de santé connexe 
                    est requis pour accéder à nos formations.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Comment se déroulent les formations ?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Nos formations combinent théorie et pratique avec des cas cliniques 
                    concrets et des ateliers hands-on.
                  </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Y a-t-il un suivi post-formation ?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Oui, nous proposons un accompagnement personnalisé et un accès 
                    à notre communauté d'experts CEPROF.
                  </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Puis-je financer ma formation ?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Nos formations sont éligibles au financement DPC et nous proposons 
                    des facilités de paiement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage