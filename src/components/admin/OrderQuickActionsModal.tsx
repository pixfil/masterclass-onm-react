'use client'

import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { Order, OrderStatus, PaymentStatus } from '@/lib/supabase/formations-types'
import { Button } from '@/shared/Button'

interface OrderQuickActionsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onPaymentStatusChange: (orderId: string, status: PaymentStatus) => void
}

export const OrderQuickActionsModal: React.FC<OrderQuickActionsModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onPaymentStatusChange
}) => {
  if (!order) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return colors[status] || colors.pending
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    }
    return colors[status] || colors.pending
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Commande #{order.order_number}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <div className="space-y-6">
                  {/* Informations client */}
                  <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Informations client
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Nom</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.user?.first_name} {order.user?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                        <a href={`mailto:${order.user?.email}`} className="text-sm text-primary-600 hover:text-primary-700">
                          {order.user?.email}
                        </a>
                      </div>
                      {order.user?.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Téléphone</span>
                          <a href={`tel:${order.user.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                            {order.user.phone}
                          </a>
                        </div>
                      )}
                      {order.user?.company && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Entreprise</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.user.company}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formations commandées */}
                  <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Formations commandées
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.session?.formation?.title}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {item.session?.start_date ? formatDate(item.session.start_date) : 'Date à définir'}
                            </span>
                            <span className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {item.session?.city}
                            </span>
                            <span className="font-medium">
                              {item.quantity} place(s)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Montants */}
                  <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <CurrencyEuroIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Détails financiers
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sous-total</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(order.subtotal_amount)}
                        </span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Remise</span>
                          <span className="text-sm font-medium text-green-600">
                            -{formatPrice(order.discount_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">TVA</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(order.tax_amount)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-neutral-600">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">Total TTC</span>
                          <span className="text-lg font-bold text-primary-600">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statuts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Statut commande
                      </h4>
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="processing">En traitement</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                        <option value="refunded">Remboursée</option>
                      </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Statut paiement
                      </h4>
                      <select
                        value={order.payment_status}
                        onChange={(e) => onPaymentStatusChange(order.id, e.target.value as PaymentStatus)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${getPaymentStatusColor(order.payment_status)} border-0 focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="pending">En attente</option>
                        <option value="paid">Payé</option>
                        <option value="failed">Échoué</option>
                        <option value="refunded">Remboursé</option>
                        <option value="partial">Partiel</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates importantes */}
                  <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Historique
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Créée le</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(order.created_at)}</span>
                      </div>
                      {order.payment_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Payée le</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(order.payment_date)}</span>
                        </div>
                      )}
                      {order.completed_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Terminée le</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(order.completed_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-neutral-600">
                    <Button
                      onClick={onClose}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
                    >
                      Fermer
                    </Button>
                    <Button
                      href={`/admin/orders/${order.id}`}
                      className="bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Voir les détails complets
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}