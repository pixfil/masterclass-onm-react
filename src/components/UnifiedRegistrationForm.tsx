'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { createClient } from '@/lib/supabase/clients'
import { createAgent } from '@/lib/supabase/agents'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

type RegistrationType = 'client' | 'agent'

interface UnifiedRegistrationFormProps {
  defaultType?: RegistrationType
  onSuccess?: (type: RegistrationType, data: any) => void
}

const SPECIALITES_OPTIONS = [
  'Vente résidentielle',
  'Location résidentielle', 
  'Immobilier commercial',
  'Immobilier de luxe',
  'Gestion locative',
  'Investissement immobilier',
  'Primo-accédants',
  'Terrain et construction'
]

const PREFERENCE_OPTIONS = [
  'Vente',
  'Location',
  'Maison',
  'Appartement',
  'Terrain',
  'Immobilier commercial',
  'Immobilier de luxe',
  'Investissement locatif',
  'Résidence principale',
  'Résidence secondaire'
]

export const UnifiedRegistrationForm = ({ 
  defaultType = 'client',
  onSuccess 
}: UnifiedRegistrationFormProps) => {
  const router = useRouter()
  const [registrationType, setRegistrationType] = useState<RegistrationType>(defaultType)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSpecialites, setSelectedSpecialites] = useState<string[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    // Champs communs
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    
    // Champs d'adresse
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    
    // Champs clients
    birth_date: '',
    newsletter_consent: false,
    
    // Champs agents
    photo_url: '',
    description: '',
    date_embauche: '',
    annees_experience: '',
    taux_reponse: '98',
    temps_reponse_moyen: 'dans l\'heure'
  })

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecialiteToggle = (specialite: string) => {
    setSelectedSpecialites(prev => {
      if (prev.includes(specialite)) {
        return prev.filter(s => s !== specialite)
      }
      return [...prev, specialite]
    })
  }

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preference)) {
        return prev.filter(p => p !== preference)
      }
      return [...prev, preference]
    })
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('Le prénom est requis')
      return false
    }
    if (!formData.last_name.trim()) {
      setError('Le nom est requis') 
      return false
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('L\'email n\'est pas valide')
      return false
    }

    // Validation spécifique aux agents
    if (registrationType === 'agent') {
      if (!formData.annees_experience || parseInt(formData.annees_experience) < 0) {
        setError('Les années d\'expérience sont requises pour les agents')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      let result

      if (registrationType === 'client') {
        const clientData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
          birth_date: formData.birth_date || null,
          preferences: {
            interests: selectedPreferences,
            created_at: new Date().toISOString()
          },
          newsletter_consent: formData.newsletter_consent,
          is_active: true
        }
        
        result = await createClient(clientData)
      } else {
        const agentData = {
          prenom: formData.first_name,
          nom: formData.last_name,
          email: formData.email || null,
          telephone: formData.phone || null,
          photo_agent: formData.photo_url || null,
          description_agent: formData.description || null,
          specialites: selectedSpecialites,
          est_super_agent: false,
          est_verifie: false,
          date_embauche: formData.date_embauche || null,
          annees_experience: formData.annees_experience ? parseInt(formData.annees_experience) : 0,
          taux_reponse: formData.taux_reponse ? parseInt(formData.taux_reponse) : 98,
          temps_reponse_moyen: formData.temps_reponse_moyen,
          est_actif: true
        }
        
        result = await createAgent(agentData)
      }

      if (onSuccess) {
        onSuccess(registrationType, result)
      } else {
        // Redirection par défaut
        if (registrationType === 'client') {
          router.push('/account')
        } else {
          router.push('/admin/agents')
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Sélection du type d'inscription */}
        <div className="space-y-4">
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Type de compte
          </Heading>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRegistrationType('client')}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${registrationType === 'client'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                }
              `}
            >
              <UserIcon className="h-6 w-6 mb-2 text-primary-600" />
              <div className="font-medium text-neutral-900 dark:text-white">Client</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Je cherche un bien immobilier
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistrationType('agent')}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${registrationType === 'agent'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                }
              `}
            >
              <BriefcaseIcon className="h-6 w-6 mb-2 text-primary-600" />
              <div className="font-medium text-neutral-900 dark:text-white">Agent</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Je suis un professionnel de l'immobilier
              </div>
            </button>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            <UserIcon className="h-5 w-5 text-primary-600" />
            <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
              Informations personnelles
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Prénom *"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              required
              placeholder="Marie"
              icon={UserIcon}
            />

            <Input
              label="Nom *"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              required
              placeholder="Martin"
            />

            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="marie.martin@example.com"
              icon={EnvelopeIcon}
            />

            <Input
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="06 12 34 56 78"
              icon={PhoneIcon}
            />

            {registrationType === 'client' && (
              <Input
                label="Date de naissance"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                icon={CalendarIcon}
              />
            )}
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            <MapPinIcon className="h-5 w-5 text-primary-600" />
            <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
              Adresse
            </Heading>
          </div>

          <div className="space-y-4">
            <Input
              label="Adresse complète"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 rue de la République"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Paris"
              />

              <Input
                label="Code postal"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="75001"
              />

              <Input
                label="Pays"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="France"
              />
            </div>
          </div>
        </div>

        {/* Champs spécifiques aux clients */}
        {registrationType === 'client' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
              <UserIcon className="h-5 w-5 text-primary-600" />
              <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
                Préférences immobilières
              </Heading>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Centres d'intérêt
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREFERENCE_OPTIONS.map(preference => (
                  <label
                    key={preference}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPreferences.includes(preference)}
                      onChange={() => handlePreferenceToggle(preference)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {preference}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.newsletter_consent}
                onChange={(e) => handleInputChange('newsletter_consent', e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                J'accepte de recevoir la newsletter
              </span>
            </label>
          </div>
        )}

        {/* Champs spécifiques aux agents */}
        {registrationType === 'agent' && (
          <>
            {/* Informations professionnelles */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                <AcademicCapIcon className="h-5 w-5 text-primary-600" />
                <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Expérience professionnelle
                </Heading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date d'embauche"
                  type="date"
                  value={formData.date_embauche}
                  onChange={(e) => handleInputChange('date_embauche', e.target.value)}
                  icon={CalendarIcon}
                />

                <Input
                  label="Années d'expérience *"
                  type="number"
                  value={formData.annees_experience}
                  onChange={(e) => handleInputChange('annees_experience', e.target.value)}
                  placeholder="5"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Photo de profil
                </label>
                <Input
                  value={formData.photo_url}
                  onChange={(e) => handleInputChange('photo_url', e.target.value)}
                  placeholder="URL de la photo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description professionnelle
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  placeholder="Décrivez votre expérience et vos compétences..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Spécialités
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALITES_OPTIONS.map(specialite => (
                    <label
                      key={specialite}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialites.includes(specialite)}
                        onChange={() => handleSpecialiteToggle(specialite)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {specialite}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bouton de soumission */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full"
          >
            {loading ? 'Inscription en cours...' : `S'inscrire comme ${registrationType === 'client' ? 'client' : 'agent'}`}
          </Button>
        </div>
      </form>
    </div>
  )
}