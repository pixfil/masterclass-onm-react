'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { createAgent, updateAgent } from '@/lib/supabase/agents'
import { AgentImmobilier } from '@/lib/supabase/types'
import Image from 'next/image'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  StarIcon,
  CheckBadgeIcon,
  CalendarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface AgentFormProps {
  agent?: AgentImmobilier
  isEdit?: boolean
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

export const AgentForm = ({ agent, isEdit = false }: AgentFormProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSpecialites, setSelectedSpecialites] = useState<string[]>(
    agent?.specialites || []
  )
  
  const [formData, setFormData] = useState({
    prenom: agent?.prenom || '',
    nom: agent?.nom || '',
    email: agent?.email || '',
    telephone: agent?.telephone || '',
    photo_agent: agent?.photo_agent || '',
    photo_couverture: agent?.photo_couverture || '',
    description_agent: agent?.description_agent || '',
    est_super_agent: agent?.est_super_agent || false,
    est_verifie: agent?.est_verifie || true,
    date_embauche: agent?.date_embauche || '',
    annees_experience: agent?.annees_experience?.toString() || '',
    taux_reponse: agent?.taux_reponse?.toString() || '98',
    temps_reponse_moyen: agent?.temps_reponse_moyen || 'dans l\'heure',
    est_actif: agent?.est_actif ?? true
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const agentData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email || null,
        telephone: formData.telephone || null,
        photo_agent: formData.photo_agent || null,
        photo_couverture: formData.photo_couverture || null,
        description_agent: formData.description_agent || null,
        specialites: selectedSpecialites,
        est_super_agent: formData.est_super_agent,
        est_verifie: formData.est_verifie,
        date_embauche: formData.date_embauche || null,
        annees_experience: formData.annees_experience ? parseInt(formData.annees_experience) : null,
        taux_reponse: formData.taux_reponse ? parseInt(formData.taux_reponse) : 98,
        temps_reponse_moyen: formData.temps_reponse_moyen,
        est_actif: formData.est_actif
      }

      if (isEdit && agent) {
        await updateAgent(agent.id, agentData)
      } else {
        await createAgent(agentData)
      }

      router.push('/admin/agents')
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Heading 
          as="h2" 
          className="text-2xl font-bold text-neutral-900 dark:text-white"
        >
          {isEdit ? 'Modifier l\'agent' : 'Nouvel agent'}
        </Heading>
        <Button
          type="button"
          onClick={() => router.push('/admin/agents')}
          className="inline-flex items-center gap-2"
          color="light"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retour à la liste
        </Button>
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
            value={formData.prenom}
            onChange={(e) => handleInputChange('prenom', e.target.value)}
            required
            placeholder="Jean"
            icon={UserIcon}
          />

          <Input
            label="Nom *"
            value={formData.nom}
            onChange={(e) => handleInputChange('nom', e.target.value)}
            required
            placeholder="Dupont"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="jean.dupont@example.com"
            icon={EnvelopeIcon}
          />

          <Input
            label="Téléphone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => handleInputChange('telephone', e.target.value)}
            placeholder="06 12 34 56 78"
            icon={PhoneIcon}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Photo de profil
          </label>
          <div className="flex items-center gap-4">
            {formData.photo_agent && (
              <Image
                src={formData.photo_agent}
                alt="Photo de l'agent"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            )}
            <Input
              value={formData.photo_agent}
              onChange={(e) => handleInputChange('photo_agent', e.target.value)}
              placeholder="URL de la photo de profil"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Photo de couverture
          </label>
          <div className="flex items-center gap-4">
            {formData.photo_couverture && (
              <Image
                src={formData.photo_couverture}
                alt="Photo de couverture"
                width={128}
                height={64}
                className="rounded-lg object-cover"
              />
            )}
            <Input
              value={formData.photo_couverture}
              onChange={(e) => handleInputChange('photo_couverture', e.target.value)}
              placeholder="URL de la photo de couverture (800x400px recommandé)"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Image utilisée en arrière-plan sur la fiche détaillée de l'agent
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description_agent}
            onChange={(e) => handleInputChange('description_agent', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            placeholder="Décrivez l'expérience et les compétences de l'agent..."
          />
        </div>
      </div>

      {/* Expérience et compétences */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <AcademicCapIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Expérience et compétences
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
            label="Années d'expérience"
            type="number"
            value={formData.annees_experience}
            onChange={(e) => handleInputChange('annees_experience', e.target.value)}
            placeholder="5"
            min="0"
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

      {/* Performances et statuts */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <StarIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Performances et statuts
          </Heading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Taux de réponse (%)"
            type="number"
            value={formData.taux_reponse}
            onChange={(e) => handleInputChange('taux_reponse', e.target.value)}
            min="0"
            max="100"
            placeholder="98"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Temps de réponse moyen
            </label>
            <select
              value={formData.temps_reponse_moyen}
              onChange={(e) => handleInputChange('temps_reponse_moyen', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="dans l'heure">Dans l'heure</option>
              <option value="dans les 2 heures">Dans les 2 heures</option>
              <option value="dans la journée">Dans la journée</option>
              <option value="sous 24h">Sous 24h</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.est_super_agent}
              onChange={(e) => handleInputChange('est_super_agent', e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Super Agent
            </span>
            <CheckBadgeIcon className="h-5 w-5 text-yellow-500" />
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.est_verifie}
              onChange={(e) => handleInputChange('est_verifie', e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Agent vérifié
            </span>
            <CheckBadgeIcon className="h-5 w-5 text-green-500" />
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.est_actif}
              onChange={(e) => handleInputChange('est_actif', e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Agent actif
            </span>
          </label>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-end gap-x-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          type="button"
          onClick={() => router.push('/admin/agents')}
          disabled={loading}
          color="light"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
        >
          {isEdit ? 'Mettre à jour' : 'Créer l\'agent'}
        </Button>
      </div>
    </form>
  )
}