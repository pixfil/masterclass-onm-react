'use client'

import Avatar from '@/shared/Avatar'
import T from '@/utils/getT'
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { BellIcon, HomeIcon, UserPlusIcon, CalculatorIcon, EnvelopeIcon, StarIcon, CheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { getRecentNotifications, getUnreadNotificationsCount, markNotificationAsRead, getNotificationLink, ActionNotification } from '@/lib/supabase/notifications'


interface Props {
  className?: string
}

const NotifyDropdown: FC<Props> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<ActionNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await getRecentNotifications(5)
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
    return `Il y a ${diffInDays}j`
  }

  return (
    <Popover className={className}>
      <>
        <PopoverButton
          className={
            'relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-hidden dark:hover:bg-neutral-800'
          }
        >
          {unreadCount > 0 && (
            <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <BellIcon className="h-6 w-6" />
        </PopoverButton>

        <PopoverPanel
          transition
          anchor={{
            to: 'bottom end',
            gap: 16,
          }}
          className="z-40 w-sm rounded-3xl shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0"
        >
          <div className="relative bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold">{T['Header']['Notifications']['Notifications']}</h3>
              {notifications.length > 0 && (
                <Link 
                  href="/admin/notifications" 
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Voir tout
                </Link>
              )}
            </div>
            
            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  const hasLink = getNotificationLink(notification)
                  return (
                    <button
                      key={notification.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationClick(notification)
                      }}
                      className={`relative w-full flex items-start p-4 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-hidden dark:hover:bg-gray-700 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 text-left ${
                        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      } ${hasLink ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10' : 'cursor-default'}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        notification.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        notification.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        notification.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                        notification.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-gray-100 dark:bg-gray-900/30'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          notification.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          notification.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          notification.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                          notification.color === 'red' ? 'text-red-600 dark:text-red-400' :
                          notification.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200 text-left">
                          {notification.title}
                        </p>
                        {notification.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 text-left">
                            {notification.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400 dark:text-gray-500 text-left">
                            {getTimeAgo(notification.created_at)}
                          </p>
                          {notification.user_name && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                              {notification.user_name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        {!notification.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {hasLink && (
                          <div className="text-xs text-primary-600 dark:text-primary-400">
                            →
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucune notification pour le moment
                </p>
              </div>
            )}
            
            {/* Lien "Voir tout" toujours visible */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 p-3">
              <Link 
                href="/notifications" 
                className="block w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Voir toutes les notifications
              </Link>
            </div>
          </div>
        </PopoverPanel>
      </>
    </Popover>
  )
}

export default NotifyDropdown
