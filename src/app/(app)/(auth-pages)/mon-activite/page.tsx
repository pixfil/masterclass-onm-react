"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Calendar, Clock, TrendingUp, BookOpen, Download, Video, Mic, Award, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { ActivityLogsService } from '@/lib/supabase/activity-logs'
import type { UserActivityLog, ActivitySummary } from '@/lib/supabase/types/activity-types'
import ModernHeader from '@/components/Header/ModernHeader'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function MonActivitePage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<UserActivityLog[]>([])
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<ActivitySummary['period']>('week')
  const [selectedType, setSelectedType] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (user) {
      fetchActivityData()
    }
  }, [user, selectedPeriod, selectedType, dateRange, currentPage])

  const fetchActivityData = async () => {
    setLoading(true)
    
    const filters: any = {
      date_from: dateRange.from + 'T00:00:00.000Z',
      date_to: dateRange.to + 'T23:59:59.999Z'
    }
    if (selectedType) {
      filters.action_type = selectedType
    }

    const [historyRes, summaryRes] = await Promise.all([
      ActivityLogsService.getUserActivityHistory({
        filters,
        page: currentPage,
        limit: 20
      }),
      ActivityLogsService.getActivitySummary(undefined, selectedPeriod)
    ])

    if (historyRes.data) {
      setActivities(historyRes.data)
      setTotalPages(historyRes.pagination.total_pages)
    }
    if (summaryRes.data) setSummary(summaryRes.data)
    setLoading(false)
  }

  const getActionIcon = (actionType: string) => {
    const icons: { [key: string]: any } = {
      'view_formation': BookOpen,
      'complete_formation': Award,
      'download_resource': Download,
      'watch_video': Video,
      'listen_podcast': Mic,
      'earn_badge': Award,
      'send_referral': Users,
      'default': Activity
    }
    return icons[actionType] || icons.default
  }

  const getActionLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
      'view_formation': 'Formation consultée',
      'complete_formation': 'Formation terminée',
      'download_resource': 'Ressource téléchargée',
      'watch_video': 'Vidéo regardée',
      'listen_podcast': 'Podcast écouté',
      'earn_badge': 'Badge obtenu',
      'send_referral': 'Parrainage envoyé',
      'login': 'Connexion',
      'logout': 'Déconnexion'
    }
    return labels[actionType] || actionType
  }

  const formatActivityTime = (date: string) => {
    const activityDate = new Date(date)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    
    return activityDate.toLocaleDateString('fr-FR')
  }

  const formatLearningTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`
  }

  if (!user) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour voir votre activité</h2>
            <Link href="/connexion" className="text-blue-600 hover:text-blue-700">Se connecter</Link>
          </div>
        </div>
        </>
    )
  }

  return (
    <>
      <ModernHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mon Journal d'Activité
            </h1>
            <p className="text-xl opacity-90">
              Suivez votre progression et visualisez votre parcours d'apprentissage ONM
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Résumé d'activité */}
          {summary && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Vue d'ensemble</h2>
                <div className="flex gap-2">
                  {(['day', 'week', 'month', 'year'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedPeriod === period
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{summary.total_actions}</div>
                  <div className="text-sm text-gray-600">Actions totales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatLearningTime(summary.learning_time_minutes)}
                  </div>
                  <div className="text-sm text-gray-600">Temps d'apprentissage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {summary.formations_viewed}
                  </div>
                  <div className="text-sm text-gray-600">Formations vues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {summary.resources_downloaded}
                  </div>
                  <div className="text-sm text-gray-600">Ressources téléchargées</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Podcasts écoutés:</span>
                    <span className="font-medium text-gray-900">{summary.podcasts_listened}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Badges gagnés:</span>
                    <span className="font-medium text-gray-900">{summary.badges_earned}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Parrainages envoyés:</span>
                    <span className="font-medium text-gray-900">{summary.referrals_sent}</span>
                  </div>
                </div>

                {summary.most_active_hour !== undefined && (
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Votre heure la plus active: <span className="font-medium text-gray-900">{summary.most_active_hour}h-{summary.most_active_hour + 1}h</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <span className="px-2 py-2">à</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'activité
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Toutes les activités</option>
                  <option value="view_formation">Formations consultées</option>
                  <option value="complete_formation">Formations terminées</option>
                  <option value="download_resource">Ressources téléchargées</option>
                  <option value="watch_video">Vidéos regardées</option>
                  <option value="listen_podcast">Podcasts écoutés</option>
                  <option value="earn_badge">Badges obtenus</option>
                  <option value="send_referral">Parrainages envoyés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Journal d'activité */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Historique détaillé</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune activité trouvée pour cette période</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.map((activity) => {
                  const Icon = getActionIcon(activity.action_type)
                  const actionLabel = getActionLabel(activity.action_type)
                  
                  return (
                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{actionLabel}</h4>
                              {activity.action_details?.entity_name && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {activity.action_details.entity_name}
                                </p>
                              )}
                              {activity.action_details?.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {activity.action_details.description}
                                </p>
                              )}
                              {activity.action_details?.duration && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Durée: {formatLearningTime(activity.action_details.duration)}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              {formatActivityTime(activity.created_at)}
                            </div>
                          </div>
                          
                          {activity.action_details?.entity_url && (
                            <Link
                              href={activity.action_details.entity_url}
                              className="inline-flex items-center text-sm text-green-600 hover:text-green-700 mt-2"
                            >
                              Voir plus →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Graphiques d'activité */}
          {summary && summary.actions_by_type && Object.keys(summary.actions_by_type).length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type d'activité</h3>
              <div className="space-y-3">
                {Object.entries(summary.actions_by_type)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const Icon = getActionIcon(type)
                    const label = getActionLabel(type)
                    const percentage = (count / summary.total_actions) * 100
                    
                    return (
                      <div key={type} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <span className="text-sm text-gray-500">{count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  )
}