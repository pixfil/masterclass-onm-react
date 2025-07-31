'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  HomeIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FormationDashboardService, FormationDashboardStats, FormationPopularity, DashboardActivity } from '@/lib/supabase/dashboard-formations'
import { getAllFormations } from '@/lib/supabase/formations'
import { Formation } from '@/lib/supabase/formations-types'

const DashboardContent = () => {
  const [formations, setFormations] = useState<Formation[]>([])
  const [stats, setStats] = useState<FormationDashboardStats | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Dashboard: Début du chargement des données...')
        
        // Charger les formations, statistiques et sessions à venir
        const formationsPromise = getAllFormations({ limit: 5 })
        const statsPromise = FormationDashboardService.getDashboardStats()
        const upcomingSessionsPromise = FormationDashboardService.getUpcomingSessions(5)
        
        const [formationsData, statsData, upcomingSessionsData] = await Promise.all([
          formationsPromise,
          statsPromise,
          upcomingSessionsPromise
        ])
        
        console.log('Dashboard: Formations chargées:', formationsData?.length || 0)
        console.log('Dashboard: Stats chargées:', statsData)
        console.log('Dashboard: Sessions à venir chargées:', upcomingSessionsData?.length || 0)
        
        setFormations(formationsData || [])
        setStats(statsData)
        setUpcomingSessions(upcomingSessionsData || [])
      } catch (error) {
        console.error('Dashboard: Erreur lors du chargement des données:', error)
        // Définir des valeurs par défaut en cas d'erreur
        setFormations([])
        setUpcomingSessions([])
        setStats({
          total_formations: 0,
          active_formations: 0,
          draft_formations: 0,
          featured_formations: 0,
          total_sessions: 0,
          upcoming_sessions: 0,
          ongoing_sessions: 0,
          completed_sessions: 0,
          total_registrations: 0,
          registrations_this_month: 0,
          registrations_growth: 0,
          pending_registrations: 0,
          total_revenue: 0,
          revenue_this_month: 0,
          revenue_growth: 0,
          average_order_value: 0,
          average_rating: 0,
          total_reviews: 0,
          satisfaction_rate: 0,
          completion_rate: 0,
          conversion_rate: 0,
          popular_formations: [],
          recent_activity: []
        })
      } finally {
        console.log('Dashboard: Chargement terminé')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        <div>
          <Heading as="h2" className="text-2xl">Tableau de bord</Heading>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Vue d'ensemble de votre plateforme de formations ONM
          </p>
        </div>

        {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse dark:bg-neutral-800">
                    <div className="h-4 bg-neutral-200 rounded mb-2 dark:bg-neutral-700"></div>
                    <div className="h-8 bg-neutral-200 rounded dark:bg-neutral-700"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-900/20">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg">
                      <HomeIcon className="h-6 w-6 text-indigo-100" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total formations
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.total_formations || 0}
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        +{stats?.draft_formations || 0} brouillons
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                      <DocumentTextIcon className="h-6 w-6 text-green-100" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Inscriptions
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.total_registrations || 0}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {stats?.registrations_growth ? 
                          (stats.registrations_growth > 0 ? '+' : '') + stats.registrations_growth.toFixed(1) + '% ce mois' 
                          : 'Aucune évolution'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800 border border-cyan-100 dark:border-cyan-900/20">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg">
                      <HomeIcon className="h-6 w-6 text-cyan-100" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Chiffre d'affaires
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.total_revenue ? 
                          new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(stats.total_revenue)
                          : '0 €'
                        }
                      </p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400">
                        {stats?.revenue_growth ? 
                          (stats.revenue_growth > 0 ? '+' : '') + stats.revenue_growth.toFixed(1) + '% ce mois' 
                          : 'Aucune évolution'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800 border border-orange-100 dark:border-orange-900/20">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                      <HomeIcon className="h-6 w-6 text-orange-100" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Satisfaction
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.average_rating ? stats.average_rating.toFixed(1) : '0'}/5
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        {stats?.satisfaction_rate ? stats.satisfaction_rate.toFixed(0) + '% satisfaits' : 'Aucun avis'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
        )}

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <Heading as="h3" className="mb-4 text-lg">Sessions de formation</Heading>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">À venir</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats?.upcoming_sessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">En cours</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{stats?.ongoing_sessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Terminées</span>
                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{stats?.completed_sessions || 0}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats?.total_sessions || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <Heading as="h3" className="mb-4 text-lg">Performance</Heading>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Taux de conversion</span>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {stats?.conversion_rate ? stats.conversion_rate.toFixed(1) + '%' : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Panier moyen</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {stats?.average_order_value ? 
                    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.average_order_value)
                    : '0 €'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Taux de complétion</span>
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  {stats?.completion_rate ? stats.completion_rate.toFixed(0) + '%' : '0%'}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">Commandes en attente</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats?.pending_registrations || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <Heading as="h3" className="mb-4 text-lg">Actions rapides</Heading>
            <div className="space-y-3">
              <Link
                href="/admin/formations/edit/new"
                className="flex items-center p-3 border border-neutral-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors dark:border-neutral-600"
              >
                <PlusIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Nouvelle formation</p>
                </div>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center p-3 border border-neutral-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors dark:border-neutral-600"
              >
                <DocumentTextIcon className="h-5 w-5 text-cyan-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Gérer les commandes</p>
                </div>
              </Link>

              <Link
                href="/formations"
                className="flex items-center p-3 border border-neutral-300 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors dark:border-neutral-600"
              >
                <EyeIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Voir le site</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Prochaines formations */}
        <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <Heading as="h3" className="text-lg">Prochaines formations</Heading>
              <Link
                href="/admin/formations"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Voir toutes
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg dark:bg-neutral-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-200 rounded w-3/4 dark:bg-neutral-700"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2 dark:bg-neutral-700"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                          {session.formation?.title || 'Formation'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {new Date(session.start_date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{session.location || 'À définir'}</span>
                          </div>
                          {session.max_participants && (
                            <div className="flex items-center space-x-1">
                              <UserGroupIcon className="w-4 h-4" />
                              <span>{session.current_participants || 0}/{session.max_participants}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {session.formation?.price ? 
                          new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(session.formation.price)
                          : 'Gratuit'
                        }
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Dans {Math.ceil((new Date(session.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">Aucune formation planifiée</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Commencez par créer une nouvelle formation.
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/formations/edit/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Nouvelle formation
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formations populaires et activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formations populaires */}
          <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <Heading as="h3">Formations populaires</Heading>
                <Link
                  href="/admin/formations"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats?.popular_formations && stats.popular_formations.length > 0 ? (
                <div className="space-y-4">
                  {stats.popular_formations.slice(0, 5).map((formation, index) => (
                    <div key={formation.formation_id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                            {formation.formation_title}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formation.total_registrations} inscriptions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(formation.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune formation populaire pour le moment
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <Heading as="h3">Activité récente</Heading>
            </div>
            <div className="p-6">
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_activity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 dark:text-white">
                          {activity.description}
                          {activity.formation_title && (
                            <span className="text-neutral-500 dark:text-neutral-400">
                              {' '}pour "{activity.formation_title}"
                            </span>
                          )}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {activity.amount && (
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(activity.amount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HomeIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune activité récente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}