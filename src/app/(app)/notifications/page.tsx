'use client'

import { useState, useEffect } from 'react'
import { 
  BellIcon,
  HomeIcon,
  UserPlusIcon,
  CalculatorIcon,
  EnvelopeIcon,
  StarIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { getRecentNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, getNotificationLink, ActionNotification } from '@/lib/supabase/notifications'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ActionNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRead, setShowRead] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getRecentNotifications(50) // Plus de notifications sur la page complète
      setNotifications(data)
    } catch (error) {
      console.error('Erreur notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationsCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Erreur compteur:', error)
    }
  }

  const handleNotificationClick = async (notification: ActionNotification) => {
    // Marquer comme lue
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Rediriger vers le lien si disponible
    const link = getNotificationLink(notification)
    if (link) {
      window.location.href = link
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: diffInDays > 365 ? 'numeric' : undefined
    })
  }

  const getColorClasses = (color: string, isRead: boolean) => {
    const colors = {
      blue: `bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400`,
      green: `bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400`,
      yellow: `bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400`,
      red: `bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400`,
      purple: `bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400`,
      gray: `bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400`
    }
    
    return `${colors[color as keyof typeof colors]} ${isRead ? 'opacity-70' : ''}`
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesReadFilter = showRead || !notification.is_read
    return matchesSearch && matchesReadFilter
  })

  // Filtrage des notifications selon les critères

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading as="h1" className="flex items-center gap-3">
            <BellIcon className="h-8 w-8 text-primary-600" />
            Notifications
          </Heading>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Restez informé de toutes les activités importantes
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button outline onClick={handleMarkAllAsRead}>
            Tout marquer comme lu ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 dark:bg-neutral-800">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRead(!showRead)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showRead 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
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
            
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {filteredNotifications.length} notification(s)
            </span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const hasLink = getNotificationLink(notification)
            
            return (
              <div 
                key={notification.id} 
                className={`border rounded-xl p-6 transition-all hover:shadow-md ${hasLink ? 'cursor-pointer hover:border-primary-300' : 'cursor-default'} ${getColorClasses(notification.color, notification.is_read)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      notification.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      notification.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      notification.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      notification.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                      notification.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        notification.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        notification.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        notification.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                        notification.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        notification.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                        )}
                        {hasLink && (
                          <div className="text-primary-600 dark:text-primary-400 text-sm">
                            →
                          </div>
                        )}
                      </div>
                      
                      {notification.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                          {notification.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{getTimeAgo(notification.created_at)}</span>
                        
                        <div className="flex items-center gap-4">
                          {notification.user_name && (
                            <span>par {notification.user_name}</span>
                          )}
                          
                          {notification.entity_name && (
                            <span>• {notification.entity_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center dark:bg-neutral-800">
            <BellIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              {searchTerm || !showRead ? 'Aucune notification trouvée' : 'Aucune notification'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchTerm 
                ? 'Aucune notification ne correspond à votre recherche' 
                : !showRead
                ? 'Vous n\'avez aucune notification non lue'
                : 'Les notifications apparaîtront ici quand il y aura de l\'activité'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}