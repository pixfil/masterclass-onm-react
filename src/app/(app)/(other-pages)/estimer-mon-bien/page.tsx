'use client'

import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import Select from '@/shared/Select'
import Textarea from '@/shared/Textarea'
import { PropertyType, PropertyCategory } from '@/type'
import { supabase } from '@/lib/supabaseClient'
import { PropertyEstimationInsert } from '@/lib/supabase/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const propertyTypes: PropertyType[] = [
  { name: 'Maison', value: 'maison', description: 'Maison individuelle' },
  { name: 'Appartement', value: 'appartement', description: 'Appartement en immeuble' },
  { name: 'Locaux commerciaux', value: 'locaux_commerciaux', description: 'Bureaux, commerces' },
  { name: 'Parking', value: 'parking', description: 'Place de parking ou garage' },
  { name: 'Terrain', value: 'terrain', description: 'Terrain constructible ou non' },
  { name: 'Autres', value: 'autres', description: 'Autres types de biens' },
]

const conditions = [
  { label: 'Neuf', value: 'neuf' },
  { label: 'Très bon état', value: 'tres_bon' },
  { label: 'Bon état', value: 'bon' },
  { label: 'À rafraîchir', value: 'a_rafraichir' },
  { label: 'À rénover', value: 'a_renover' },
]

export default function EstimerMonBienPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<PropertyEstimationInsert>>({
    property_type: 'maison',
    condition: 'bon',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('property_estimations')
        .insert([formData as PropertyEstimationInsert])

      if (error) throw error

      // Rediriger vers une page de confirmation
      alert('Votre demande d\'estimation a été envoyée avec succès. Nous vous contacterons dans les plus brefs délais.')
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof PropertyEstimationInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container relative py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <Heading level={1}>Estimer mon bien</Heading>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            Obtenez une estimation gratuite de votre bien immobilier en quelques minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de contact */}
          <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h3 className="mb-6 text-xl font-semibold">Vos coordonnées</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                placeholder="Jean Dupont"
                required
                onChange={(e) => updateFormData('name', e.target.value)}
              />
              <Input
                // label="Email"
                type="email"
                placeholder="jean.dupont@email.com"
                required
                onChange={(e) => updateFormData('email', e.target.value)}
              />
              <Input
                // label="Téléphone"
                type="tel"
                placeholder="06 12 34 56 78"
                required
                onChange={(e) => updateFormData('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Informations du bien */}
          <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h3 className="mb-6 text-xl font-semibold">Informations sur votre bien</h3>
            <div className="grid gap-5">
              <Select
                // label="Type de bien"
                value={formData.property_type}
                onChange={(e) => updateFormData('property_type', e.target.value)}
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </Select>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  // label="Adresse (optionnel)"
                  placeholder="123 rue de la Paix"
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
                <Input
                  // label="Ville"
                  placeholder="Strasbourg"
                  required
                  onChange={(e) => updateFormData('city', e.target.value)}
                />
                <Input
                  // label="Code postal"
                  placeholder="67000"
                  required
                  pattern="[0-9]{5}"
                  onChange={(e) => updateFormData('zipcode', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h3 className="mb-6 text-xl font-semibold">Caractéristiques du bien</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                // label="Surface (m²)"
                type="number"
                placeholder="75"
                onChange={(e) => updateFormData('surface', parseFloat(e.target.value))}
              />
              <Input
                // label="Nombre de pièces"
                type="number"
                placeholder="3"
                onChange={(e) => updateFormData('rooms', parseInt(e.target.value))}
              />
              <Input
                // label="Année de construction"
                type="number"
                placeholder="1990"
                onChange={(e) => updateFormData('year_built', parseInt(e.target.value))}
              />
              <Select
                // label="État général"
                value={formData.condition || ''}
                onChange={(e) => updateFormData('condition', e.target.value)}
              >
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-5">
              <Textarea
                // label="Description et particularités"
                placeholder="Décrivez votre bien, ses atouts, travaux effectués, équipements..."
                rows={5}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
              {isSubmitting ? 'Envoi en cours...' : 'Obtenir mon estimation'}
            </Button>
          </div>
        </form>

        <div className="mt-12 rounded-2xl bg-primary-50 p-6 text-center dark:bg-primary-900/20">
          <h4 className="mb-2 font-semibold">Estimation gratuite et sans engagement</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Un expert immobilier vous contactera sous 48h pour affiner l'estimation de votre bien
          </p>
        </div>
      </div>
    </div>
  )
}