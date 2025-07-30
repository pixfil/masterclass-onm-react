'use client'

import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'
import { CheckIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  read: boolean
  createdAt: string
}

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nouvelle propriété ajoutée',
      message: 'Villa moderne à Nice vient d\'être publiée',
      type: 'success',
      read: false,
      createdAt: 'Il y a 5 min'
    },
    {
      id: '2',
      title: 'Message client',
      message: 'Jean Dupont a envoyé une demande de contact',
      type: 'info',
      read: false,
      createdAt: 'Il y a 2h'
    },
    {
      id: '3',
      title: 'Limite IA atteinte',
      message: 'Vous avez utilisé 90% de vos crédits IA ce mois',
      type: 'warning',
      read: true,
      createdAt: 'Hier'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-neutral-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:divide-neutral-700">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Aucune notification
                </p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={`${
                          active ? 'bg-neutral-50 dark:bg-neutral-700' : ''
                        } ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        } w-full px-4 py-3 text-left transition-colors`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-neutral-900 dark:text-white ${
                              !notification.read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                              {notification.createdAt}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="py-2">
            <Link
              href="/admin/notifications"
              className="block px-4 py-2 text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}