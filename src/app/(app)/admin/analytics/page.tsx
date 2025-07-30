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
  HomeIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  TrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

const AnalyticsContent = () => {
  const { subscription, loading: subscriptionLoading, hasFeature } = useSubscription()
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  // Données simulées (à remplacer par de vraies données)
  const [analytics, setAnalytics] = useState({
    // Métriques générales
    totalViews: 15420,
    uniqueVisitors: 8932,
    contactRequests: 127,
    estimationRequests: 89,
    
    // Performance ventes
    propertiesSold: 12,
    totalRevenue: 245000,
    avgSaleTime: 45,
    conversionRate: 2.8,
    
    // Top propriétés
    topProperties: [
      { id: '1', title: 'Appartement Strasbourg Centre', views: 892, contacts: 15 },
      { id: '2', title: 'Maison Robertsau', views: 734, contacts: 12 },
      { id: '3', title: 'Villa Cronenbourg', views: 623, contacts: 8 }
    ],
    
    // Performance par quartier
    quarterStats: [
      { name: 'Strasbourg Centre', properties: 45, avgPrice: 285000, sold: 3 },
      { name: 'Robertsau', properties: 32, avgPrice: 425000, sold: 4 },
      { name: 'Cronenbourg', properties: 28, avgPrice: 195000, sold: 2 },
      { name: 'Neudorf', properties: 25, avgPrice: 235000, sold: 3 }
    ]
  })

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 1000)
  }, [timeRange])

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">{value}</p>
          {change && (
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
            color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
            color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
            'bg-neutral-100 dark:bg-neutral-700'
          }`}>
            <Icon className={`h-6 w-6 ${
              color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              color === 'green' ? 'text-green-600 dark:text-green-400' :
              color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
              color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              'text-neutral-600 dark:text-neutral-400'
            }`} />
          </div>
        )}
      </div>
    </div>
  )

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
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
              Analytics & Performance
            </Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Analysez les performances de votre activité immobilière
            </p>
          </div>
          
          <SubscriptionPaywall
            feature="analytics"
            title="Analytics Premium"
            description="Accédez à des statistiques détaillées sur vos propriétés, suivez le comportement des visiteurs et optimisez vos annonces avec des données précises."
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
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
              Analytics & Performance
            </Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Analysez les performances de votre activité immobilière
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">12 derniers mois</option>
            </select>
            <Button size="sm" color="light">
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Vues totales"
            value={analytics.totalViews.toLocaleString()}
            change={12.5}
            icon={EyeIcon}
            color="blue"
          />
          <StatCard
            title="Visiteurs uniques"
            value={analytics.uniqueVisitors.toLocaleString()}
            change={8.2}
            icon={UserGroupIcon}
            color="green"
          />
          <StatCard
            title="Demandes de contact"
            value={analytics.contactRequests}
            change={-3.1}
            icon={PhoneIcon}
            color="purple"
          />
          <StatCard
            title="Demandes d'estimation"
            value={analytics.estimationRequests}
            change={15.7}
            icon={EnvelopeIcon}
            color="orange"
          />
        </div>

        {/* Métriques business */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Biens vendus"
            value={analytics.propertiesSold}
            change={22.3}
            icon={HomeIcon}
            color="green"
          />
          <StatCard
            title="Chiffre d'affaires"
            value={`${(analytics.totalRevenue / 1000).toFixed(0)}k €`}
            change={18.9}
            icon={CurrencyEuroIcon}
            color="green"
          />
          <StatCard
            title="Temps de vente moyen"
            value={`${analytics.avgSaleTime} jours`}
            change={-12.4}
            icon={CalendarIcon}
            color="blue"
          />
          <StatCard
            title="Taux de conversion"
            value={`${analytics.conversionRate}%`}
            change={5.2}
            icon={TrendingUpIcon}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top propriétés */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Propriétés les plus vues</h3>
              <Button size="sm" color="light">Voir tout</Button>
            </div>
            <div className="space-y-4">
              {analytics.topProperties.map((property, index) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      index === 1 ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-200' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">{property.title}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{property.views} vues</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900 dark:text-white">{property.contacts}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">contacts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance par quartier */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Performance par quartier</h3>
              <MapPinIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {analytics.quarterStats.map((quarter) => (
                <div key={quarter.name} className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-900 dark:text-white">{quarter.name}</h4>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {quarter.sold} vendus
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{quarter.properties} biens actifs</span>
                    <span>Prix moyen: {(quarter.avgPrice / 1000).toFixed(0)}k €</span>
                  </div>
                  <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(quarter.sold / quarter.properties) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placeholder pour graphiques détaillés */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Évolution des ventes (30 derniers jours)</h3>
          <div className="h-64 bg-neutral-50 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400">
                Graphique interactif en cours de développement
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Chart.js ou Recharts sera intégré ici
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