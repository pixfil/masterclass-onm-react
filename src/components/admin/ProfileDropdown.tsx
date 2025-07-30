'use client'

import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/auth'
import Link from 'next/link'
import Avatar from '@/shared/Avatar'
import { getCurrentUserProfile, UserProfile } from '@/lib/supabase/profiles'
import {
  UserCircleIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export const ProfileDropdown = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getCurrentUserProfile()
        setProfile(userProfile)
      }
    }
    loadProfile()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Obtenir les initiales pour l'avatar
  const getInitials = (email: string) => {
    // Si on a le prénom et nom
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    // Sinon utiliser l'email
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const menuItems = [
    {
      label: 'Mon compte',
      href: '/admin/profile',
      icon: UserIcon
    },
    {
      label: 'Modèles emails',
      href: '/admin/email-templates',
      icon: DocumentTextIcon
    },
    {
      label: 'Logs emails',
      href: '/admin/email-logs',
      icon: ClipboardDocumentListIcon
    },
    {
      label: 'Notifications',
      href: '/admin/notifications',
      icon: BellIcon
    },
    {
      label: 'Abonnement',
      href: '/admin/subscription',
      icon: CreditCardIcon
    },
    {
      label: 'Paramètres',
      href: '/admin/settings',
      icon: CogIcon
    }
  ]

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center">
        {profile?.avatar_url ? (
          <Avatar 
            src={profile.avatar_url} 
            className="h-10 w-10 hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer" 
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium hover:bg-primary-700 transition-colors">
            {user?.email ? getInitials(user.email) : 'U'}
          </div>
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-neutral-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:divide-neutral-700">
          {/* Header avec email et nom */}
          <div className="px-4 py-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Connecté en tant que</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : user?.email
              }
            </p>
            {profile?.first_name && profile?.last_name && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {user?.email}
              </p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Menu.Item key={item.href}>
                {({ active }) => (
                  <Link
                    href={item.href}
                    className={`${
                      active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                    } flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
                  >
                    <item.icon className="mr-3 h-5 w-5 text-neutral-400" />
                    {item.label}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </div>

          {/* Déconnexion */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-neutral-400" />
                  Déconnexion
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}