'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { 
  EyeIcon, 
  PencilIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { OrdersAdminService, OrderSearchParams, OrderStats } from '@/lib/supabase/orders-admin-temp'
import type { Order } from '@/lib/supabase/formations-types'
import { toast } from 'react-hot-toast'

const OrdersAdminPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [searchParams])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const result = await OrdersAdminService.getOrders(searchParams)
      if (result.success) {
        setOrders(result.data)
        setPagination(result.pagination)
      } else {
        toast.error('Erreur lors du chargement des commandes')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await OrdersAdminService.getOrdersStats()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }))
  }

  const handleFilterChange = (filters: Partial<OrderSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...filters, page: 1 }))
  }

  const handleSort = (sortBy: string) => {
    const newOrder = searchParams.sort_by === sortBy && searchParams.sort_order === 'desc' ? 'asc' : 'desc'
    setSearchParams(prev => ({ ...prev, sort_by: sortBy as any, sort_order: newOrder }))
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const result = await OrdersAdminService.updateOrderStatus(orderId, status as any)
      if (result.success) {
        toast.success('Statut mis à jour')
        loadOrders()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const result = await OrdersAdminService.updatePaymentStatus(orderId, paymentStatus as any)
      if (result.success) {
        toast.success('Statut de paiement mis à jour')
        loadOrders()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleExport = async () => {
    try {
      const csvContent = await OrdersAdminService.exportOrders(searchParams)
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        toast.success('Export réussi')
      } else {
        toast.error('Aucune donnée à exporter')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || colors.pending
      }`}>
        {status}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      partial: 'bg-orange-100 text-orange-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || colors.pending
      }`}>
        {status}
      </span>
    )
  }

  const getFormationColorBadge = (formationTitle: string) => {
    // Couleurs fixes basées sur le hash du titre pour consistance
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    
    // Simple hash pour avoir toujours la même couleur pour la même formation
    let hash = 0
    for (let i = 0; i < formationTitle.length; i++) {
      hash = ((hash << 5) - hash + formationTitle.charCodeAt(i)) & 0xffffffff
    }
    const colorIndex = Math.abs(hash) % colors.length
    
    return (
      <div 
        className={`w-3 h-3 rounded-full ${colors[colorIndex]} flex-shrink-0`}
        title={formationTitle}
      />
    )
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayout currentPage="orders">
          <div className="nc-OrdersAdminPage">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commandes</h1>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Gestion de toutes les commandes de formations
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                    Filtres
                  </button>
                  
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <ArrowDownTrayIcon className="-ml-1 mr-2 h-4 w-4" />
                    Exporter
                  </button>
                  
                  <button
                    onClick={loadOrders}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
                    Actualiser
                  </button>
                </div>
              </div>

              {/* Statistiques */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stats.total_orders}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total commandes
                            </dt>
                            <dd className="text-lg font-medium text-gray-900 dark:text-white">
                              {formatPrice(stats.total_revenue)}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stats.pending_orders}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              En attente
                            </dt>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stats.completed_orders}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Terminées
                            </dt>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{formatPrice(stats.average_order_value).replace('€', '').trim()}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Panier moyen
                            </dt>
                            <dd className="text-lg font-medium text-gray-900 dark:text-white">
                              {formatPrice(stats.average_order_value)}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Barre de recherche */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                <div className="p-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher par numéro de commande, client, email..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtres */}
              {showFilters && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Statut commande
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="processing">En traitement</option>
                          <option value="completed">Terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Statut paiement
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ payment_status: e.target.value as any })}
                        >
                          <option value="all">Tous les paiements</option>
                          <option value="pending">En attente</option>
                          <option value="paid">Payé</option>
                          <option value="failed">Échoué</option>
                          <option value="refunded">Remboursé</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date de début
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ date_from: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ date_to: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Légende des couleurs */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Légende formations</h3>
                  <div className="flex flex-wrap gap-3">
                    {/* Générer la légende basée sur les formations uniques */}
                    {Array.from(new Set(
                      orders.flatMap(order => 
                        order.items?.map(item => item.session?.formation?.title) || []
                      ).filter(Boolean)
                    )).map(formationTitle => (
                      <div key={formationTitle} className="flex items-center space-x-2">
                        {getFormationColorBadge(formationTitle)}
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {formationTitle}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Les pastilles de couleur permettent d'identifier rapidement les commandes pour la même formation
                  </p>
                </div>
              </div>

              {/* Liste des commandes */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-gray-500">Aucune commande trouvée</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={() => handleSort('order_number')}
                            >
                              Commande
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={() => handleSort('created_at')}
                            >
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Formations
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={() => handleSort('total_amount')}
                            >
                              Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Paiement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    #{order.order_number}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {order.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {order.user?.first_name} {order.user?.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {order.user?.email}
                                  </div>
                                  {order.user?.company && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {order.user.company}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {order.items?.map((item, index) => (
                                    <div key={index} className="mb-1 flex items-center space-x-2">
                                      {getFormationColorBadge(item.session?.formation?.title || '')}
                                      <div>
                                        <div>{item.session?.formation?.title}</div>
                                        <div className="text-xs text-gray-500">
                                          {item.session?.city} • {item.quantity}x
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatPrice(order.total_amount)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirmé</option>
                                  <option value="processing">En traitement</option>
                                  <option value="completed">Terminé</option>
                                  <option value="cancelled">Annulé</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={order.payment_status}
                                  onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="paid">Payé</option>
                                  <option value="failed">Échoué</option>
                                  <option value="refunded">Remboursé</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  >
                                    <EyeIcon className="h-5 w-5" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} résultats
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSearchParams(prev => ({ ...prev, page: Math.max(1, pagination.page - 1) }))}
                          disabled={pagination.page <= 1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Précédent
                        </button>
                        <button
                          onClick={() => setSearchParams(prev => ({ ...prev, page: Math.min(pagination.total_pages, pagination.page + 1) }))}
                          disabled={pagination.page >= pagination.total_pages}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default OrdersAdminPage