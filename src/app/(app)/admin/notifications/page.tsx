'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  TrashIcon,
  HomeIcon,
  UserPlusIcon,
  StarIcon,
  EnvelopeIcon,
  CalculatorIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface ActionNotification {
  id: string
  type: 'property_published' | 'agent_created' | 'estimation_received' | 'contact_received' | 'user_registered' | 'property_sold' | 'property_rented'
  title: string
  description?: string
  icon?: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  user_id?: string
  user_name?: string
  entity_type?: string
  entity_id?: string
  entity_name?: string
  is_read: boolean
  created_at: string
}

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState<ActionNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showRead, setShowRead] = useState(true)

  // TODO: Remplacer par de vraies données depuis Supabase
  useEffect(() => {
    // Simulation de données
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'property_published',
          title: '🏠 Nouvelle propriété publiée !',
          description: 'Un magnifique appartement 3 pièces à Strasbourg vient d\'être mis en ligne',
          color: 'green',
          user_name: 'Marie Martin',
          entity_type: 'property',
          entity_name: 'Appartement 3P - Strasbourg Centre',
          is_read: false,
          created_at: '2024-01-20T15:30:00Z'
        },
        {
          id: '2',
          type: 'contact_received',
          title: '📞 Nouvelle demande de contact',
          description: 'Un client s\'intéresse à votre bien à Mulhouse',
          color: 'blue',
          user_name: 'Jean Dupont',
          entity_type: 'property',
          entity_name: 'Maison 5P - Mulhouse',
          is_read: true,
          created_at: '2024-01-20T14:15:00Z'
        },
        {
          id: '3',
          type: 'estimation_received',
          title: '📊 Demande d\'estimation reçue',
          description: 'Un propriétaire souhaite faire estimer son bien à Colmar',
          color: 'purple',
          user_name: 'Sophie Bernard',
          entity_type: 'estimation',
          entity_name: 'Estimation - Colmar',
          is_read: false,
          created_at: '2024-01-20T11:45:00Z'
        },
        {
          id: '4',
          type: 'agent_created',
          title: '👤 Nouvel agent rejoint l\'équipe !',
          description: 'Pierre Durand a rejoint l\'agence Initiative Immobilier',
          color: 'green',
          entity_type: 'agent',
          entity_name: 'Pierre Durand',
          is_read: true,
          created_at: '2024-01-20T09:00:00Z'
        },
        {
          id: '5',
          type: 'property_sold',
          title: '🎉 Propriété vendue !',
          description: 'Félicitations ! La villa à Haguenau a trouvé son acquéreur',
          color: 'yellow',
          user_name: 'Marie Martin',
          entity_type: 'property',
          entity_name: 'Villa 6P - Haguenau',
          is_read: false,
          created_at: '2024-01-19T16:20:00Z'
        },
        {
          id: '6',
          type: 'user_registered',
          title: '🆕 Nouvel utilisateur inscrit',
          description: 'Un nouveau client s\'est inscrit sur la plateforme',
          color: 'blue',
          entity_type: 'user',
          entity_name: 'Nouveau client',
          is_read: true,
          created_at: '2024-01-19T13:10:00Z'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeIcon = (type: string) => {
    const icons = {
      property_published: HomeIcon,
      agent_created: UserPlusIcon,
      estimation_received: CalculatorIcon,
      contact_received: EnvelopeIcon,
      user_registered: UserPlusIcon,
      property_sold: StarIcon,
      property_rented: CheckIcon
    }
    return icons[type as keyof typeof icons] || HomeIcon
  }

  const getColorClasses = (color: string, isRead: boolean) => {
    const baseOpacity = isRead ? '0.6' : '1'
    const colors = {
      blue: `bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400`,
      green: `bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400`,
      yellow: `bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400`,
      red: `bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400`,
      purple: `bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400`,
      gray: `bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400`
    }
    
    return `${colors[color as keyof typeof colors]} ${isRead ? 'opacity-60' : ''}`
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, is_read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || notification.type === typeFilter
    const matchesReadFilter = showRead || !notification.is_read
    return matchesSearch && matchesType && matchesReadFilter
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <AdminLayout currentPage="notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Notifications & Logs</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Suivi des actions et événements de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button outline onClick={markAllAsRead}>
                Tout marquer comme lu ({unreadCount})
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Tous les types</option>
              <option value="property_published">Propriétés publiées</option>
              <option value="contact_received">Demandes de contact</option>
              <option value="estimation_received">Demandes d'estimation</option>
              <option value="agent_created">Nouveaux agents</option>
              <option value="property_sold">Propriétés vendues</option>
              <option value="user_registered">Nouveaux utilisateurs</option>
            </select>

            <div className="flex items-center">
              <button
                onClick={() => setShowRead(!showRead)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showRead 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                {showRead ? (
                  <>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Afficher lues
                  </>
                ) : (
                  <>
                    <EyeSlashIcon className="h-4 w-4 mr-2" />
                    Masquer lues
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              {filteredNotifications.length} notification(s)
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = getTypeIcon(notification.type)
              
              return (
                <div 
                  key={notification.id} 
                  className={`border rounded-xl p-6 transition-all hover:shadow-md ${getColorClasses(notification.color, notification.is_read)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        notification.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        notification.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        notification.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        notification.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                        notification.color === 'purple' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-gray-100 dark:bg-gray-900/30'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          notification.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          notification.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          notification.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                          notification.color === 'red' ? 'text-red-600 dark:text-red-400' :
                          notification.color === 'purple' ? 'text-blue-600 dark:text-blue-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        {notification.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {notification.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                          <span>
                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          {notification.user_name && (
                            <span>par {notification.user_name}</span>
                          )}
                          
                          {notification.entity_name && (
                            <span>• {notification.entity_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-neutral-400 hover:text-neutral-600 p-1 rounded"
                          title="Marquer comme lu"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center dark:bg-neutral-800">
              <div className="text-neutral-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5H9l5-5h5l-5-5v10z" />
                </svg>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm || typeFilter || !showRead
                  ? 'Aucune notification ne correspond aux critères'
                  : 'Aucune notification pour le moment'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminNotificationsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <NotificationsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}