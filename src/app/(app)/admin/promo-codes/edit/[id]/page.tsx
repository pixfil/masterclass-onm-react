'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Heading } from '@/shared/Heading'
import { PromoCodesService } from '@/lib/supabase/promo-codes'
import { PromoCode, CreatePromoCodeData } from '@/lib/supabase/promo-codes-types'
import { getAllFormations, getCategories } from '@/lib/supabase/formations'
import { Formation, FormationCategory } from '@/lib/supabase/formations-types'
import { ArrowLeftIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'

const EditPromoCodeContent = () => {
  const params = useParams()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null)
  const [formations, setFormations] = useState<Formation[]>([])
  const [categories, setCategories] = useState<FormationCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const promoCodeId = params.id as string
  const isNew = promoCodeId === 'new'

  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: 0,
    applicable_formations: [],
    excluded_formations: [],
    applicable_categories: [],
    excluded_categories: [],
    applicable_users: [],
    excluded_users: [],
    user_role_restrictions: ['all'],
    usage_limit: 0,
    usage_limit_per_user: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    first_order_only: false,
    auto_apply: false,
    stackable: false,
    applicable_countries: [],
    excluded_countries: [],
    status: 'draft'
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Charger formations et catégories
        const [formationsData, categoriesData] = await Promise.all([
          getAllFormations(),
          getCategories()
        ])
        
        setFormations(formationsData || [])
        setCategories(categoriesData || [])

        // Charger le code promo si édition
        if (!isNew) {
          const codeData = await PromoCodesService.getPromoCodeById(promoCodeId)
          if (!codeData) {
            setError('Code promo non trouvé')
            return
          }
          
          setPromoCode(codeData)
          setFormData({
            code: codeData.code,
            name: codeData.name,
            description: codeData.description || '',
            discount_type: codeData.discount_type,
            discount_value: codeData.discount_value,
            minimum_order_amount: codeData.minimum_order_amount || 0,
            maximum_discount_amount: codeData.maximum_discount_amount || 0,
            applicable_formations: codeData.applicable_formations || [],
            excluded_formations: codeData.excluded_formations || [],
            applicable_categories: codeData.applicable_categories || [],
            excluded_categories: codeData.excluded_categories || [],
            applicable_users: codeData.applicable_users || [],
            excluded_users: codeData.excluded_users || [],
            user_role_restrictions: codeData.user_role_restrictions || ['all'],
            usage_limit: codeData.usage_limit || 0,
            usage_limit_per_user: codeData.usage_limit_per_user || 0,
            valid_from: codeData.valid_from.split('T')[0],
            valid_until: codeData.valid_until ? codeData.valid_until.split('T')[0] : '',
            first_order_only: codeData.first_order_only,
            auto_apply: codeData.auto_apply,
            stackable: codeData.stackable,
            applicable_countries: codeData.applicable_countries || [],
            excluded_countries: codeData.excluded_countries || [],
            status: codeData.status
          })
        }
      } catch (err) {
        console.error('Erreur chargement:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [promoCodeId, isNew])

  const handleInputChange = (field: keyof CreatePromoCodeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleArrayChange = (field: keyof CreatePromoCodeData, values: string[]) => {
    setFormData(prev => ({ ...prev, [field]: values }))
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    handleInputChange('code', result)
  }

  const validateForm = (): boolean => {
    if (!formData.code.trim()) {
      setError('Le code est requis')
      return false
    }
    if (!formData.name.trim()) {
      setError('Le nom est requis')
      return false
    }
    if (formData.discount_value <= 0) {
      setError('La valeur de remise doit être supérieure à 0')
      return false
    }
    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      setError('Le pourcentage ne peut pas dépasser 100%')
      return false
    }
    if (!formData.valid_from) {
      setError('La date de début est requise')
      return false
    }
    if (formData.valid_until && formData.valid_until <= formData.valid_from) {
      setError('La date de fin doit être après la date de début')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Préparer les données
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : undefined,
        minimum_order_amount: formData.minimum_order_amount || undefined,
        maximum_discount_amount: formData.maximum_discount_amount || undefined,
        usage_limit: formData.usage_limit || undefined,
        usage_limit_per_user: formData.usage_limit_per_user || undefined,
        applicable_formations: formData.applicable_formations.length ? formData.applicable_formations : undefined,
        excluded_formations: formData.excluded_formations.length ? formData.excluded_formations : undefined,
        applicable_categories: formData.applicable_categories.length ? formData.applicable_categories : undefined,
        excluded_categories: formData.excluded_categories.length ? formData.excluded_categories : undefined,
        applicable_users: formData.applicable_users.length ? formData.applicable_users : undefined,
        excluded_users: formData.excluded_users.length ? formData.excluded_users : undefined,
        applicable_countries: formData.applicable_countries.length ? formData.applicable_countries : undefined,
        excluded_countries: formData.excluded_countries.length ? formData.excluded_countries : undefined
      }

      if (isNew) {
        await PromoCodesService.createPromoCode(submitData)
        setSuccess('Code promo créé avec succès')
        setTimeout(() => router.push('/admin/promo-codes'), 2000)
      } else {
        await PromoCodesService.updatePromoCode(promoCodeId, submitData)
        setSuccess('Code promo mis à jour avec succès')
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="promo-codes">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gradient-to-r from-blue-600 to-cyan-600 transition ease-in-out duration-150">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="promo-codes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/promo-codes"
              className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour
            </Link>
            <div>
              <Heading as="h1" className="text-2xl">
                {isNew ? 'Nouveau code promo' : `Éditer: ${promoCode?.code}`}
              </Heading>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {isNew 
                  ? 'Créer un nouveau code de réduction'
                  : 'Modifier ce code promo'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-400">{success}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Informations de base
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Code promo *
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="PROMO2024"
                    className="flex-1 font-mono"
                    required
                  />
                  <ButtonSecondary
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3"
                  >
                    Générer
                  </ButtonSecondary>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nom *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Promotion Été 2024"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description de la promotion..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Type de remise *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => handleInputChange('discount_type', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed_amount">Montant fixe</option>
                  <option value="free_shipping">Livraison gratuite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Valeur de remise *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => handleInputChange('discount_value', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                      {formData.discount_type === 'percentage' ? '%' : '€'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Conditions d'application
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Montant minimum (€)
                </label>
                <Input
                  type="number"
                  value={formData.minimum_order_amount}
                  onChange={(e) => handleInputChange('minimum_order_amount', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Remise maximum (€)
                </label>
                <Input
                  type="number"
                  value={formData.maximum_discount_amount}
                  onChange={(e) => handleInputChange('maximum_discount_amount', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Limite d'utilisation globale
                </label>
                <Input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => handleInputChange('usage_limit', Number(e.target.value))}
                  min="0"
                  placeholder="Illimité si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Limite par utilisateur
                </label>
                <Input
                  type="number"
                  value={formData.usage_limit_per_user}
                  onChange={(e) => handleInputChange('usage_limit_per_user', Number(e.target.value))}
                  min="0"
                  placeholder="Illimité si vide"
                />
              </div>
            </div>
          </div>

          {/* Période de validité */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Période de validité
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Date de début *
                </label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => handleInputChange('valid_from', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleInputChange('valid_until', e.target.value)}
                  placeholder="Pas de date de fin"
                />
              </div>
            </div>
          </div>

          {/* Options avancées */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Options avancées
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="auto_apply"
                  type="checkbox"
                  checked={formData.auto_apply}
                  onChange={(e) => handleInputChange('auto_apply', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                />
                <label htmlFor="auto_apply" className="ml-2 block text-sm text-neutral-900 dark:text-white">
                  Application automatique
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="first_order_only"
                  type="checkbox"
                  checked={formData.first_order_only}
                  onChange={(e) => handleInputChange('first_order_only', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                />
                <label htmlFor="first_order_only" className="ml-2 block text-sm text-neutral-900 dark:text-white">
                  Première commande uniquement
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="stackable"
                  type="checkbox"
                  checked={formData.stackable}
                  onChange={(e) => handleInputChange('stackable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                />
                <label htmlFor="stackable" className="ml-2 block text-sm text-neutral-900 dark:text-white">
                  Cumulable avec d'autres codes
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <ButtonSecondary 
              onClick={() => router.back()}
              disabled={saving}
            >
              Annuler
            </ButtonSecondary>
            
            <ButtonPrimary
              type="submit"
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : isNew ? 'Créer le code promo' : 'Mettre à jour'}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default function EditPromoCodePage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EditPromoCodeContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}