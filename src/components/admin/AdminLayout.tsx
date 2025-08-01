'use client'

import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/auth'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
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
  UserCircleIcon,
  FaceSmileIcon,
  PresentationChartLineIcon,
  FolderIcon,
  MicrophoneIcon,
  UserPlusIcon,
  TrophyIcon,
  TicketIcon,
  BoltIcon,
  EnvelopeOpenIcon,
  ClockIcon,
  InboxIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: 'dashboard' | 'properties' | 'experts' | 'clients' | 'contacts' | 'newsletter' | 'accounts' | 'email-templates' | 'email-logs' | 'notifications' | 'analytics' | 'subscription' | 'settings' | 'formations' | 'orders' | 'satisfaction' | 'evaluations' | 'resources' | 'podcasts' | 'referrals' | 'badges' | 'promo-codes' | 'workflows' | 'historique'
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
      name: 'Satisfaction',
      href: '/admin/satisfaction',
      icon: FaceSmileIcon,
      current: currentPage === 'satisfaction'
    },
    {
      name: 'Évaluations',
      href: '/admin/evaluations',
      icon: PresentationChartLineIcon,
      current: currentPage === 'evaluations'
    },
    {
      name: 'Ressources',
      href: '/admin/resources',
      icon: FolderIcon,
      current: currentPage === 'resources'
    },
    {
      name: 'Podcasts',
      href: '/admin/podcasts',
      icon: MicrophoneIcon,
      current: currentPage === 'podcasts'
    },
    {
      name: 'Parrainages',
      href: '/admin/referrals',
      icon: UserPlusIcon,
      current: currentPage === 'referrals'
    },
    {
      name: 'Badges',
      href: '/admin/badges',
      icon: TrophyIcon,
      current: currentPage === 'badges'
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
    {
      name: 'Codes Promo',
      href: '/admin/promo-codes',
      icon: TicketIcon,
      current: currentPage === 'promo-codes'
    },
    {
      name: 'Workflows',
      href: '/admin/workflows',
      icon: BoltIcon,
      current: currentPage === 'workflows'
    },
    {
      name: 'Templates Emails',
      href: '/admin/email-templates',
      icon: EnvelopeOpenIcon,
      current: currentPage === 'email-templates'
    },
    {
      name: 'Historique',
      href: '/admin/historique',
      icon: ClockIcon,
      current: currentPage === 'historique'
    },
    {
      name: 'Logs Emails',
      href: '/admin/email-logs',
      icon: InboxIcon,
      current: currentPage === 'email-logs'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: BellIcon,
      current: currentPage === 'notifications'
    },
    {
      name: 'Abonnement',
      href: '/admin/subscription',
      icon: CurrencyEuroIcon,
      current: currentPage === 'subscription'
    },
    {
      name: 'Paramètres',
      href: '/admin/settings',
      icon: CogIcon,
      current: currentPage === 'settings'
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
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                    MASTERCLASS ONM
                  </div>
                </Link>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                Administration
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-4">
              
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
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      item.current
                        ? 'bg-gradient-to-r from-indigo-50 to-cyan-50 text-blue-700 border border-indigo-200 dark:from-indigo-900/20 dark:to-cyan-900/20 dark:text-blue-400 dark:border-indigo-800'
                        : 'text-neutral-700 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-cyan-50/50 hover:text-blue-600 dark:text-neutral-300 dark:hover:bg-neutral-700/50'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        item.current
                          ? 'text-blue-600'
                          : 'text-neutral-400 group-hover:text-blue-500'
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