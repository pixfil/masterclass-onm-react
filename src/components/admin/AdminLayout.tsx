'use client'

import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/auth'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import { AIUsageIndicator } from './AIUsageIndicator'
import { ProfileDropdown } from './ProfileDropdown'
import { NotificationsDropdown } from './NotificationsDropdown'
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  AtSymbolIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserGroupIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChartBarIcon,
  CreditCardIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: 'dashboard' | 'properties' | 'experts' | 'clients' | 'contacts' | 'newsletter' | 'accounts' | 'email-templates' | 'email-logs' | 'notifications' | 'analytics' | 'subscription' | 'settings' | 'formations' | 'orders'
}

export const AdminLayout = ({ children, currentPage }: AdminLayoutProps) => {
  const { user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/admin/dashboard',
      icon: HomeIcon,
      current: currentPage === 'dashboard'
    },
    {
      name: 'Propriétés',
      href: '/admin/properties',
      icon: BuildingOfficeIcon,
      current: currentPage === 'properties'
    },
    {
      name: 'Experts CEPROF',
      href: '/admin/experts',
      icon: UserCircleIcon,
      current: currentPage === 'experts'
    },
    {
      name: 'Clients',
      href: '/admin/clients',
      icon: UsersIcon,
      current: currentPage === 'clients'
    },
    {
      name: 'Formations',
      href: '/admin/formations',
      icon: AcademicCapIcon,
      current: currentPage === 'formations'
    },
    {
      name: 'Commandes',
      href: '/admin/orders',
      icon: ShoppingBagIcon,
      current: currentPage === 'orders'
    },
    {
      name: 'Messages',
      href: '/admin/contacts',
      icon: EnvelopeIcon,
      current: currentPage === 'contacts'
    },
    {
      name: 'Newsletter',
      href: '/admin/newsletter',
      icon: AtSymbolIcon,
      current: currentPage === 'newsletter'
    },
    {
      name: 'Comptes',
      href: '/admin/accounts',
      icon: UserGroupIcon,
      current: currentPage === 'accounts'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: currentPage === 'analytics'
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et Administration */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  {/* Logo pour le mode normal (dark logo) */}
                  <img
                    src="/logo-initiative-dark.png"
                    alt="Initiative Immobilier"
                    className="h-8 w-auto block dark:hidden"
                  />
                  {/* Logo pour le mode dark (light logo) */}
                  <img
                    src="/logo-initiative-light.png"
                    alt="Initiative Immobilier"
                    className="h-8 w-auto hidden dark:block"
                  />
                </Link>
              </div>
              <div className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                Administration
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-4">
              {/* Indicateur usage IA avec cache */}
              <AIUsageIndicator />
              
              <Link
                href="/real-estate"
                target="_blank"
                className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                title="Voir le site"
              >
                <EyeIcon className="h-5 w-5" />
                <span className="text-sm">Voir le site</span>
              </Link>
              <div className="border-l border-neutral-300 dark:border-neutral-600 pl-4 flex items-center space-x-2">
                <NotificationsDropdown />
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm border-r border-neutral-200 min-h-screen dark:bg-neutral-800 dark:border-neutral-700">
          <div className="p-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.current
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        item.current
                          ? 'text-primary-500'
                          : 'text-neutral-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="max-w-[1600px] mx-auto px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}