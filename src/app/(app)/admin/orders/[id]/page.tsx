'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  AcademicCapIcon,
  PrinterIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { OrdersAdminService } from '@/lib/supabase/orders-admin-temp'
import type { Order } from '@/lib/supabase/formations-types'
import { toast } from 'react-hot-toast'

const OrderDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingStatus, setEditingStatus] = useState(false)
  const [editingPayment, setEditingPayment] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string)
    }
  }, [params.id])

  const loadOrder = async (id: string) => {
    setLoading(true)
    try {
      const result = await OrdersAdminService.getOrderById(id)
      if (result.success && result.data) {
        setOrder(result.data)
      } else {
        toast.error('Commande non trouvée')
        router.push('/admin/orders')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!order) return
    
    try {
      const result = await OrdersAdminService.updateOrderStatus(order.id, status as any)
      if (result.success) {
        toast.success('Statut mis à jour')
        loadOrder(order.id)
        setEditingStatus(false)
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handlePaymentStatusUpdate = async (paymentStatus: string) => {
    if (!order) return
    
    try {
      const result = await OrdersAdminService.updatePaymentStatus(order.id, paymentStatus as any)
      if (result.success) {
        toast.success('Statut de paiement mis à jour')
        loadOrder(order.id)
        setEditingPayment(false)
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    const reason = prompt('Raison de l\'annulation (optionnel):')
    if (reason === null) return // L'utilisateur a annulé
    
    try {
      const result = await OrdersAdminService.cancelOrder(order.id, reason)
      if (result.success) {
        toast.success('Commande annulée')
        loadOrder(order.id)
      } else {
        toast.error('Erreur lors de l\'annulation')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'En attente' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Confirmé' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'En traitement' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Terminé' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Annulé' },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, label: 'Remboursé' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'En attente' },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Payé' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Échoué' },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, label: 'Remboursé' },
      partial: { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, label: 'Partiel' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    )
  }

  const getFormationColorBadge = (formationTitle: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-blue-500',
      'bg-pink-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    
    let hash = 0
    for (let i = 0; i < formationTitle.length; i++) {
      hash = ((hash << 5) - hash + formationTitle.charCodeAt(i)) & 0xffffffff
    }
    const colorIndex = Math.abs(hash) % colors.length
    
    return (
      <div 
        className={`w-4 h-4 rounded-full ${colors[colorIndex]} flex-shrink-0`}
        title={formationTitle}
      />
    )
  }

  if (loading) {
    return (
      <AuthProvider>
        <ProtectedRoute>
          <AdminLayout currentPage="orders">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Chargement de la commande...</p>
              </div>
            </div>
          </AdminLayout>
        </ProtectedRoute>
      </AuthProvider>
    )
  }

  if (!order) {
    return (
      <AuthProvider>
        <ProtectedRoute>
          <AdminLayout currentPage="orders">
            <div className="text-center py-12">
              <XCircleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">Commande non trouvée</p>
              <Link
                href="/admin/orders"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Retour aux commandes
              </Link>
            </div>
          </AdminLayout>
        </ProtectedRoute>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayout currentPage="orders">
          <div className="nc-OrderDetailPage">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="mb-8">
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Retour aux commandes
                </Link>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Commande #{order.order_number}
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      Créée le {new Date(order.created_at).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      <PrinterIcon className="-ml-1 mr-2 h-4 w-4" />
                      Imprimer
                    </button>
                    
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <button
                        onClick={handleCancelOrder}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-gray-600"
                      >
                        <XCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Statuts */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Statuts</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Statut de la commande
                          </label>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(order.status)}
                            <button
                              onClick={() => setEditingStatus(!editingStatus)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {editingStatus && (
                            <div className="mt-3">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option value="pending">En attente</option>
                                <option value="confirmed">Confirmé</option>
                                <option value="processing">En traitement</option>
                                <option value="completed">Terminé</option>
                                <option value="cancelled">Annulé</option>
                              </select>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Statut du paiement
                          </label>
                          <div className="flex items-center space-x-3">
                            {getPaymentStatusBadge(order.payment_status)}
                            <button
                              onClick={() => setEditingPayment(!editingPayment)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {editingPayment && (
                            <div className="mt-3">
                              <select
                                value={order.payment_status}
                                onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option value="pending">En attente</option>
                                <option value="paid">Payé</option>
                                <option value="failed">Échoué</option>
                                <option value="refunded">Remboursé</option>
                                <option value="partial">Partiel</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formations commandées */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Formations commandées</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex-shrink-0 flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              {getFormationColorBadge(item.session?.formation?.title || '')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {item.session?.formation?.title}
                              </h4>
                              <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  {item.session?.city}
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="w-4 h-4 mr-1" />
                                  {item.session?.start_date && new Date(item.session.start_date).toLocaleDateString('fr-FR')} - {item.session?.end_date && new Date(item.session.end_date).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="flex items-center">
                                  <UserIcon className="w-4 h-4 mr-1" />
                                  {item.session?.formation?.instructor?.name}
                                </div>
                                <div>
                                  Quantité: {item.quantity} x {formatPrice(item.unit_price)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {formatPrice(item.total_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Informations de paiement */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Informations de paiement
                      </h3>
                    </div>
                    <div className="p-6">
                      {order.payments && order.payments.length > 0 ? (
                        <div className="space-y-4">
                          {order.payments.map((payment, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID Transaction</label>
                                  <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                                    {payment.lcl_transaction_id || payment.id}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
                                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {formatPrice(payment.amount)} {payment.currency || 'EUR'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Méthode</label>
                                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {payment.payment_method || 'LCL Sherlocks'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                                  <p className="mt-1">
                                    {getPaymentStatusBadge(payment.status)}
                                  </p>
                                </div>
                                {payment.three_d_secure_status && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">3D Secure</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                      {payment.three_d_secure_status}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {new Date(payment.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              
                              {payment.failure_reason && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                                  <p className="text-sm text-red-800 dark:text-red-200">
                                    <strong>Raison de l'échec:</strong> {payment.failure_reason}
                                  </p>
                                  {payment.failure_code && (
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                      Code: {payment.failure_code}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CreditCardIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucune information de paiement disponible
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne latérale */}
                <div className="space-y-8">
                  
                  {/* Résumé de la commande */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Résumé</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                        <span className="font-medium">{formatPrice(order.subtotal_amount || order.total_amount - (order.tax_amount || 0))}</span>
                      </div>
                      
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Remise</span>
                          <span className="font-medium text-green-600">-{formatPrice(order.discount_amount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                        <span className="font-medium">{formatPrice(order.tax_amount || 0)}</span>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">Total TTC</span>
                          <span className="text-2xl font-bold text-blue-600">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                      
                      {order.coupon_code && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Code promo appliqué:</strong> {order.coupon_code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations client */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <UserIcon className="w-5 h-5 mr-2" />
                        Informations client
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {order.user?.first_name} {order.user?.last_name}
                        </h4>
                        {order.user?.company && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.user.company}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          {order.user?.email}
                        </div>
                        
                        {order.user?.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {order.user.phone}
                          </div>
                        )}
                      </div>
                      
                      {order.billing_address && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            Adresse de facturation
                          </h5>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p>{order.billing_address.street}</p>
                            <p>{order.billing_address.postal_code} {order.billing_address.city}</p>
                            <p>{order.billing_address.country}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inscriptions */}
                  {order.registrations && order.registrations.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                          <DocumentTextIcon className="w-5 h-5 mr-2" />
                          Inscriptions
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {order.registrations.map((registration, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {registration.session?.formation?.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Statut: {registration.status}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {registration.certificate_issued && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Certifié
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.notes}
                        </p>
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

export default OrderDetailPage