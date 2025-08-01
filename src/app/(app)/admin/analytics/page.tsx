'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionPaywall } from '@/components/SubscriptionPaywall'
import { 
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  CheckBadgeIcon,
  ChatBubbleBottomCenterTextIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

const AnalyticsContent = () => {
  const { subscription, loading: subscriptionLoading, hasFeature } = useSubscription()
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  // Données orientées formation orthophonistes
  const [analytics, setAnalytics] = useState({
    // Métriques générales
    totalUsers: 1847,
    activeUsers: 892,
    newUsersThisMonth: 156,
    avgSessionDuration: '24:36',
    
    // Métriques de formation
    certifiedOrtho: 423,
    inProgressOrtho: 469,
    completionRate: 78.5,
    avgTimeToComplete: '3.2 mois',
    
    // Modules
    moduleStats: [
      { name: 'Module 01 - Fondamentaux', enrolled: 892, completed: 687, avgScore: 85.3 },
      { name: 'Module 02 - Techniques avancées', enrolled: 645, completed: 423, avgScore: 82.7 },
      { name: 'Module 03 - Cas cliniques', enrolled: 423, completed: 234, avgScore: 79.2 },
      { name: 'Module 04 - Spécialisation', enrolled: 234, completed: 89, avgScore: 88.1 }
    ],
    
    // Évaluations et avis
    avgRating: 4.7,
    totalReviews: 342,
    reviewsBreakdown: {
      5: 234,
      4: 87,
      3: 15,
      2: 4,
      1: 2
    },
    
    // Google Analytics Mock Data
    pageViews: 45832,
    uniquePageViews: 28943,
    bounceRate: 32.5,
    avgTimeOnPage: '3:45',
    
    // Sources de trafic
    trafficSources: [
      { source: 'Google', sessions: 12453, percentage: 43 },
      { source: 'Direct', sessions: 8234, percentage: 28 },
      { source: 'Social', sessions: 4532, percentage: 16 },
      { source: 'Email', sessions: 3724, percentage: 13 }
    ],
    
    // Appareils
    deviceBreakdown: {
      desktop: 58,
      mobile: 35,
      tablet: 7
    },
    
    // Top pages
    topPages: [
      { page: '/formations/module-01', views: 8932, avgTime: '4:23' },
      { page: '/cas-cliniques', views: 6734, avgTime: '6:12' },
      { page: '/la-methode', views: 5423, avgTime: '2:45' },
      { page: '/webinaires', views: 4123, avgTime: '15:34' }
    ]
  })

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 1000)
  }, [timeRange])

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }: any) => (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
              {Math.abs(change)}% vs période précédente
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${
            color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
            color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
            color === 'purple' ? 'bg-blue-100 dark:bg-blue-900/20' :
            color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
            color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
            'bg-neutral-100 dark:bg-neutral-700'
          }`}>
            <Icon className={`h-6 w-6 ${
              color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              color === 'green' ? 'text-green-600 dark:text-green-400' :
              color === 'purple' ? 'text-blue-600 dark:text-blue-400' :
              color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-neutral-600 dark:text-neutral-400'
            }`} />
          </div>
        )}
      </div>
    </div>
  )

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        ))}
      </div>
    )
  }

  if (subscriptionLoading || loading) {
    return (
      <AdminLayout currentPage="analytics">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Vérifier l'accès aux analytics
  if (!hasFeature('analytics')) {
    return (
      <AdminLayout currentPage="analytics">
        <div className="space-y-6">
          <div>
            <Heading as="h1" className="flex items-center gap-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              Analytics & Performance
            </Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Analysez les performances de votre plateforme de formation
            </p>
          </div>
          
          <SubscriptionPaywall
            feature="analytics"
            title="Analytics Premium"
            description="Accédez à des statistiques détaillées sur vos formations, suivez la progression de vos apprenants et optimisez vos contenus avec des données précises."
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h1" className="flex items-center gap-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              Analytics & Performance
            </Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Vue d'ensemble de votre plateforme de formation
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">12 derniers mois</option>
            </select>
            <Button size="sm" color="light">
              Exporter Rapport
            </Button>
          </div>
        </div>

        {/* Section 1: Métriques principales */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Métriques principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Orthophonistes certifiés"
              value={analytics.certifiedOrtho}
              change={15.3}
              icon={CheckBadgeIcon}
              color="green"
              subtitle="Total depuis le lancement"
            />
            <StatCard
              title="En cours de formation"
              value={analytics.inProgressOrtho}
              change={8.7}
              icon={AcademicCapIcon}
              color="blue"
              subtitle="Apprenants actifs"
            />
            <StatCard
              title="Taux de complétion"
              value={`${analytics.completionRate}%`}
              change={3.2}
              icon={DocumentCheckIcon}
              color="purple"
              subtitle="Moyenne globale"
            />
            <StatCard
              title="Note moyenne"
              value={analytics.avgRating}
              icon={StarIcon}
              color="yellow"
              subtitle={`Sur ${analytics.totalReviews} avis`}
            />
          </div>
        </div>

        {/* Section 2: Google Analytics */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5" />
            Google Analytics - Vue d'ensemble
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Pages vues"
              value={analytics.pageViews.toLocaleString()}
              change={12.5}
              icon={ComputerDesktopIcon}
              color="blue"
            />
            <StatCard
              title="Visiteurs uniques"
              value={analytics.uniquePageViews.toLocaleString()}
              change={8.2}
              icon={UserGroupIcon}
              color="green"
            />
            <StatCard
              title="Taux de rebond"
              value={`${analytics.bounceRate}%`}
              change={-3.1}
              icon={ArrowTrendingUpIcon}
              color="orange"
            />
            <StatCard
              title="Durée moyenne"
              value={analytics.avgTimeOnPage}
              change={5.4}
              icon={ClockIcon}
              color="purple"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance par module */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Performance par module</h3>
              <AcademicCapIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {analytics.moduleStats.map((module) => (
                <div key={module.name} className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-900 dark:text-white text-sm">{module.name}</h4>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {module.completed} complétés
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    <span>{module.enrolled} inscrits</span>
                    <span>Score moy: {module.avgScore}%</span>
                  </div>
                  <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(module.completed / module.enrolled) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évaluations et avis */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Évaluations et avis</h3>
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                {analytics.avgRating}
              </div>
              <RatingStars rating={analytics.avgRating} />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Basé sur {analytics.totalReviews} avis
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(analytics.reviewsBreakdown).reverse().map(([stars, count]) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 w-3">{stars}</span>
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(count / analytics.totalReviews) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 w-10 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sources de trafic et Top pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sources de trafic */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-6">Sources de trafic</h3>
            <div className="space-y-4">
              {analytics.trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-500">{source.sessions.toLocaleString()} sessions</span>
                    <span className="text-sm font-medium">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-6">Pages les plus visitées</h3>
            <div className="space-y-4">
              {analytics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-500 w-4">{index + 1}</span>
                    <span className="font-medium text-sm">{page.page}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span>{page.views.toLocaleString()} vues</span>
                    <span>{page.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Répartition par appareil */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Répartition par appareil</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <ComputerDesktopIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-2xl font-semibold">{analytics.deviceBreakdown.desktop}%</p>
              <p className="text-sm text-neutral-500">Desktop</p>
            </div>
            <div className="text-center">
              <DevicePhoneMobileIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-2xl font-semibold">{analytics.deviceBreakdown.mobile}%</p>
              <p className="text-sm text-neutral-500">Mobile</p>
            </div>
            <div className="text-center">
              <DevicePhoneMobileIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3 rotate-90" />
              <p className="text-2xl font-semibold">{analytics.deviceBreakdown.tablet}%</p>
              <p className="text-sm text-neutral-500">Tablette</p>
            </div>
          </div>
        </div>

        {/* Placeholder pour graphiques */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Évolution des inscriptions</h3>
          <div className="h-64 bg-neutral-50 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400">
                Intégration Google Analytics en cours
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Les graphiques seront connectés à votre compte Google Analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AnalyticsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="admin">
        <AnalyticsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}