'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Heading } from '@/shared/Heading'
import { PromoCodesService } from '@/lib/supabase/promo-codes'
import { PromoCode, PromoCodeFilters } from '@/lib/supabase/promo-codes-types'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TicketIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'

const PromoCodesContent = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PromoCodeFilters>({})

  useEffect(() => {
    fetchPromoCodes()
  }, [filters])

  const fetchPromoCodes = async () => {
    try {
      setLoading(true)
      const codes = await PromoCodesService.getPromoCodes(filters)
      setPromoCodes(codes)
    } catch (err) {
      console.error('Erreur lors du chargement des codes promo:', err)
      setError('Erreur lors du chargement des codes promo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return

    try {
      await PromoCodesService.deletePromoCode(id)
      fetchPromoCodes()
    } catch (err) {
      console.error('Erreur suppression:', err)
      setError('Erreur lors de la suppression')
    }
  }

  const handleDuplicate = async (id: string, originalCode: string) => {
    const newCode = prompt('Nouveau code promo:', `${originalCode}_COPY`)
    if (!newCode) return

    try {
      await PromoCodesService.duplicatePromoCode(id, newCode)
      fetchPromoCodes()
    } catch (err) {
      console.error('Erreur duplication:', err)
      setError('Erreur lors de la duplication')
    }
  }

  const formatDiscount = (code: PromoCode) => {
    switch (code.discount_type) {
      case 'percentage':
        return `${code.discount_value}%`
      case 'fixed_amount':
        return `${code.discount_value}€`
      case 'free_shipping':
        return 'Livraison gratuite'
      default:
        return `${code.discount_value}`
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    }

    const statusLabels = {
      active: 'Actif',
      inactive: 'Inactif',
      expired: 'Expiré',
      draft: 'Brouillon'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    )
  }

  const getUsageProgress = (code: PromoCode) => {
    if (!code.usage_limit) return null
    
    const percentage = (code.current_usage / code.usage_limit) * 100
    
    return (
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    )
  }

  const isExpired = (code: PromoCode) => {
    if (!code.valid_until) return false
    return new Date(code.valid_until) < new Date()
  }

  const getActiveCodesCount = () => promoCodes.filter(c => c.status === 'active' && !isExpired(c)).length
  const getTotalUsage = () => promoCodes.reduce((sum, c) => sum + c.current_usage, 0)
  const getAverageDiscount = () => {
    const totalCodes = promoCodes.length
    if (totalCodes === 0) return 0
    
    const totalDiscount = promoCodes.reduce((sum, c) => {
      if (c.discount_type === 'percentage') return sum + c.discount_value
      if (c.discount_type === 'fixed_amount') return sum + c.discount_value
      return sum
    }, 0)
    
    return Math.round(totalDiscount / totalCodes)
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
              Chargement des codes promo...
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
          <div>
            <Heading as="h1" className="text-2xl">
              Codes promo
            </Heading>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Gérer les codes de réduction pour vos formations
            </p>
          </div>
          <Link href="/admin/promo-codes/edit/new">
            <ButtonPrimary className="flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau code promo
            </ButtonPrimary>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <TicketIcon className="w-6 h-6 text-blue-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total codes
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {promoCodes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-green-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Codes actifs
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getActiveCodesCount()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-cyan-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Utilisations
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getTotalUsage()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <TicketIcon className="w-6 h-6 text-orange-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Remise moy.
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getAverageDiscount()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Filtres
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Code ou nom..."
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Statut
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="expired">Expiré</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Type de remise
              </label>
              <select
                value={filters.discount_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, discount_type: e.target.value as any }))}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="percentage">Pourcentage</option>
                <option value="fixed_amount">Montant fixe</option>
                <option value="free_shipping">Livraison gratuite</option>
              </select>
            </div>

            <div className="flex items-end">
              <ButtonSecondary
                onClick={() => setFilters({})}
                className="w-full"
              >
                Réinitialiser
              </ButtonSecondary>
            </div>
          </div>
        </div>

        {/* Promo Codes List */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          {promoCodes.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Aucun code promo
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Commencez par créer votre premier code promo
              </p>
              <Link href="/admin/promo-codes/edit/new">
                <ButtonPrimary>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Créer mon premier code promo
                </ButtonPrimary>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Remise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Utilisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Validité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {promoCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white font-mono">
                            {code.code}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {code.name}
                          </div>
                          {code.auto_apply && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 mt-1">
                              Auto-appliqué
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {formatDiscount(code)}
                        </div>
                        {code.minimum_order_amount && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            Min. {code.minimum_order_amount}€
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-white">
                          {code.current_usage}
                          {code.usage_limit && ` / ${code.usage_limit}`}
                        </div>
                        {getUsageProgress(code)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        <div>
                          Du {new Date(code.valid_from).toLocaleDateString('fr-FR')}
                        </div>
                        {code.valid_until && (
                          <div className={isExpired(code) ? 'text-red-600' : ''}>
                            Au {new Date(code.valid_until).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(isExpired(code) ? 'expired' : code.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(code.code)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            title="Copier le code"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                          <Link 
                            href={`/admin/promo-codes/stats/${code.id}`}
                            className="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400"
                            title="Voir les statistiques"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </Link>
                          <Link 
                            href={`/admin/promo-codes/edit/${code.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(code.id, code.code)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400"
                            title="Dupliquer"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminPromoCodesPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <PromoCodesContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}