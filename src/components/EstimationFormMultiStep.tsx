'use client'

import { useState } from 'react'
import { Button } from '@/shared/Button'
import React from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'

interface PropertyTypeOption {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

interface ConditionOption {
  id: string
  label: string
  description: string
  color: string
}

export const EstimationFormMultiStep = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_type: '',
    address: '',
    city: '',
    zipcode: '',
    surface: '',
    rooms: '',
    year_built: '',
    condition: '',
    description: ''
  })

  const propertyTypes: PropertyTypeOption[] = [
    {
      id: 'appartement',
      label: 'Appartement',
      icon: <BuildingOfficeIcon className="h-8 w-8" />,
      description: 'Studio, T1, T2, T3...'
    },
    {
      id: 'maison',
      label: 'Maison',
      icon: <HomeIcon className="h-8 w-8" />,
      description: 'Individuelle, mitoyenne'
    },
    {
      id: 'locaux_commerciaux',
      label: 'Local commercial',
      icon: <BuildingOffice2Icon className="h-8 w-8" />,
      description: 'Bureau, commerce, entrepôt'
    },
    {
      id: 'terrain',
      label: 'Terrain',
      icon: <MapPinIcon className="h-8 w-8" />,
      description: 'Constructible ou non'
    }
  ]

  const conditionOptions: ConditionOption[] = [
    { id: 'neuf', label: 'Neuf', description: 'Construction récente', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'tres_bon', label: 'Très bon état', description: 'Aucun travaux à prévoir', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'bon', label: 'Bon état', description: 'Petits travaux de rafraîchissement', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'a_rafraichir', label: 'À rafraîchir', description: 'Peinture, sols...', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { id: 'a_renover', label: 'À rénover', description: 'Gros travaux nécessaires', color: 'bg-red-100 text-red-800 border-red-200' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedStep1 = formData.property_type && formData.city && formData.zipcode
  const canProceedStep2 = formData.surface && formData.condition

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Veuillez saisir un email valide')
      setLoading(false)
      return
    }

    try {
      const estimationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        property_type: formData.property_type as 'maison' | 'appartement' | 'locaux_commerciaux' | 'terrain',
        address: formData.address || null,
        city: formData.city,
        zipcode: formData.zipcode,
        surface: formData.surface ? parseInt(formData.surface) : null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        condition: formData.condition as 'neuf' | 'tres_bon' | 'bon' | 'a_rafraichir' | 'a_renover' | null,
        description: formData.description || null
      }

      const { error } = await supabase
        .from('property_estimations')
        .insert(estimationData)

      if (error) throw error

      setSuccess(true)
      setFormData({
        name: '', email: '', phone: '', property_type: '', address: '',
        city: '', zipcode: '', surface: '', rooms: '', year_built: '',
        condition: '', description: ''
      })

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setCurrentStep(1)
    setFormData({
      name: '', email: '', phone: '', property_type: '', address: '',
      city: '', zipcode: '', surface: '', rooms: '', year_built: '',
      condition: '', description: ''
    })
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-2xl text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Demande envoyée !
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
          Merci pour votre demande d'estimation. Nos experts vous contacteront sous 24h pour évaluer votre bien.
        </p>
        <Button onClick={resetForm} className="w-full">
          Faire une nouvelle demande
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
            Étape {currentStep} sur 3
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {currentStep === 1 && 'Votre bien'}
            {currentStep === 2 && 'Caractéristiques'}
            {currentStep === 3 && 'Vos coordonnées'}
          </div>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Type de bien et localisation */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Quel type de bien souhaitez-vous estimer ?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Sélectionnez le type qui correspond à votre bien
                </p>
              </div>

              {/* Sélection du type de bien */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {propertyTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('property_type', type.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                      formData.property_type === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                    }`}
                  >
                    <div className={`${formData.property_type === type.id ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-400'} mb-3`}>
                      {type.icon}
                    </div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                      {type.label}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Localisation */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Où se situe votre bien ?
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Strasbourg"
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      value={formData.zipcode}
                      onChange={(e) => handleInputChange('zipcode', e.target.value)}
                      placeholder="67000"
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Adresse (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 rue de la République"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Caractéristiques */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Parlez-nous de votre bien
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Ces informations nous aideront à mieux évaluer votre propriété
                </p>
              </div>

              {/* Caractéristiques principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Surface (m²) *
                  </label>
                  <input
                    type="number"
                    value={formData.surface}
                    onChange={(e) => handleInputChange('surface', e.target.value)}
                    placeholder="85"
                    min="1"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nombre de pièces
                  </label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => handleInputChange('rooms', e.target.value)}
                    placeholder="4"
                    min="1"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Année de construction
                  </label>
                  <input
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => handleInputChange('year_built', e.target.value)}
                    placeholder="1985"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  />
                </div>
              </div>

              {/* État du bien */}
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Dans quel état est votre bien ? *
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {conditionOptions.map((condition) => (
                    <button
                      key={condition.id}
                      type="button"
                      onClick={() => handleInputChange('condition', condition.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        formData.condition === condition.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                      }`}
                    >
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${condition.color}`}>
                        {condition.label}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {condition.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description complémentaire
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="Travaux récents, particularités, environnement..."
                />
              </div>
            </div>
          )}

          {/* Étape 3: Informations de contact */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Comment vous contacter ?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Nos experts vous contacteront sous 24h avec votre estimation
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="jean.dupont@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                      Votre estimation gratuite inclut :
                    </h4>
                    <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
                      <li>• Analyse comparative du marché</li>
                      <li>• Conseils personnalisés de nos experts</li>
                      <li>• Accompagnement pour la vente si souhaité</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  <span>Précédent</span>
                </button>
              )}
            </div>

            <div>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2)
                  }
                  className="flex items-center space-x-2"
                >
                  <span>Suivant</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Recevoir mon estimation</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-6">
          Vos données sont traitées de manière confidentielle conformément à notre politique de confidentialité.
        </p>
      </div>
    </div>
  )
}