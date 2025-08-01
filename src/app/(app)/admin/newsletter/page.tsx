'use client'

import { useState, useEffect } from 'react'
import { getAllNewsletterSubscriptions, getNewsletterStats, unsubscribeFromNewsletter } from '@/lib/supabase/newsletter'
import { NewsletterSubscription } from '@/lib/supabase/types'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { 
  AtSymbolIcon,
  UserIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'

const NewsletterContent = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [subscriptionsData, statsData] = await Promise.all([
          getAllNewsletterSubscriptions({
            is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
            search: searchTerm || undefined
          }),
          getNewsletterStats()
        ])
        
        setSubscriptions(subscriptionsData)
        setStats(statsData)
      } catch (error) {
        console.error('Erreur lors du chargement des données newsletter:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [statusFilter, searchTerm])


  const handleUnsubscribe = async (email: string, id: string) => {
    if (!confirm('Désabonner cet email de la newsletter ?')) {
      return
    }

    setActionLoading(id)
    try {
      await unsubscribeFromNewsletter(email)
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, is_active: false, unsubscribed_at: new Date().toISOString() }
            : sub
        )
      )
      // Les stats se rechargeront automatiquement via useEffect
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error)
      alert('Erreur lors du désabonnement')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout currentPage="newsletter">
      <div className="space-y-6">
        {/* Header avec statistiques */}
        <div className="space-y-4">
          <div>
            <Heading as="h2">Gestion Newsletter</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez les abonnements à votre newsletter
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AtSymbolIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Total abonnements
                  </p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Abonnements actifs
                  </p>
                  <p className="text-2xl font-semibold text-green-600">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <NoSymbolIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Désabonnements
                  </p>
                  <p className="text-2xl font-semibold text-red-600">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Rechercher par email ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="all">Tous les abonnements</option>
              <option value="active">Abonnements actifs</option>
              <option value="inactive">Désabonnements</option>
            </select>
          </div>
        </div>

        {/* Liste des abonnements */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des abonnements...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {subscriptions.length} abonnement(s) trouvé(s)
                  </p>
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">
                      Filtres actifs: {[searchTerm, statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Abonné
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Date d'inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {subscription.email}
                            </div>
                            {subscription.prenom && (
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {subscription.prenom}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscription.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {subscription.is_active ? 'Actif' : 'Désabonné'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          {subscription.source || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDate(subscription.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {subscription.is_active && (
                            <Button
                              onClick={() => handleUnsubscribe(subscription.email, subscription.id)}
                              disabled={actionLoading === subscription.id}
                              variant="secondary"
                              size="sm"
                              className="text-red-600 hover:text-red-900"
                            >
                              {actionLoading === subscription.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                              ) : (
                                'Désabonner'
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {subscriptions.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-neutral-400 mb-4">
                      <AtSymbolIcon className="mx-auto h-12 w-12" />
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Aucun abonnement ne correspond aux critères de recherche'
                        : 'Aucun abonnement trouvé'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminNewsletterPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <NewsletterContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}