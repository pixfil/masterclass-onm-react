"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Award, BookOpen, Trophy, Target, TrendingUp, Clock, Star, Filter } from 'lucide-react'
import { TimelineService } from '@/lib/supabase/timeline'
import type { TimelineEvent, TimelineStats } from '@/lib/supabase/types/timeline-types'
import ModernHeader from '@/components/Header/ModernHeader'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function TimelinePage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [stats, setStats] = useState<TimelineStats | null>(null)
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | ''>(new Date().getFullYear())
  const [selectedType, setSelectedType] = useState<string>('')
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    if (user) {
      fetchTimelineData()
    }
  }, [user, selectedYear, selectedType])

  const fetchTimelineData = async () => {
    setLoading(true)
    
    const filters: any = {}
    if (selectedYear) filters.year = selectedYear
    if (selectedType) filters.event_type = selectedType

    const [timelineRes, statsRes, yearsRes, milestonesRes] = await Promise.all([
      TimelineService.getUserTimeline(undefined, filters),
      TimelineService.getTimelineStats(),
      TimelineService.getAvailableYears(),
      TimelineService.getUpcomingMilestones()
    ])

    if (timelineRes.data) setEvents(timelineRes.data)
    if (statsRes.data) setStats(statsRes.data)
    if (yearsRes.data) setAvailableYears(yearsRes.data)
    if (milestonesRes.data) setUpcomingMilestones(milestonesRes.data)
    
    setLoading(false)
  }

  const eventIcons = {
    formation_started: { icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    formation_completed: { icon: Award, color: 'bg-green-100 text-green-600' },
    certification_earned: { icon: Trophy, color: 'bg-yellow-100 text-yellow-600' },
    badge_earned: { icon: Star, color: 'bg-purple-100 text-purple-600' },
    milestone_reached: { icon: Target, color: 'bg-red-100 text-red-600' },
    custom: { icon: Calendar, color: 'bg-gray-100 text-gray-600' }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const groupEventsByMonth = (events: TimelineEvent[]) => {
    const grouped: { [key: string]: TimelineEvent[] } = {}
    
    events.forEach(event => {
      const date = new Date(event.event_date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(event)
    })

    return Object.entries(grouped).map(([key, events]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month))
      return {
        key,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        events: events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      }
    }).sort((a, b) => b.key.localeCompare(a.key))
  }

  if (!user) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour accéder à votre timeline</h2>
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mon Parcours ONM
            </h1>
            <p className="text-xl opacity-90">
              Visualisez votre progression et célébrez chaque étape de votre apprentissage
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Formations terminées</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.formations_completed}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certifications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.certifications_earned}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Badges obtenus</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.badges_earned}</p>
                  </div>
                  <Star className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jalons atteints</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.milestones_reached}</p>
                  </div>
                  <Target className="w-12 h-12 text-red-500 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Prochains jalons */}
          {upcomingMilestones.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prochains objectifs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingMilestones.map((milestone, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{milestone.description}</p>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                            {Math.round(milestone.progress)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-indigo-600">
                            {milestone.current}/{milestone.target}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                        <div 
                          style={{ width: `${milestone.progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par année
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Toutes les années</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'événement
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tous les types</option>
                  <option value="formation_completed">Formations terminées</option>
                  <option value="certification_earned">Certifications</option>
                  <option value="badge_earned">Badges</option>
                  <option value="milestone_reached">Jalons</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedYear(new Date().getFullYear())
                    setSelectedType('')
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun événement dans votre timeline</p>
              <p className="text-gray-400 text-sm mt-2">Commencez une formation pour voir votre progression</p>
              <Link
                href="/formations"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mt-4"
              >
                Explorer les formations
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Ligne verticale centrale */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>

              {/* Événements groupés par mois */}
              {groupEventsByMonth(events).map((group, groupIndex) => (
                <div key={group.key} className="mb-12">
                  {/* Label du mois */}
                  <div className="text-center mb-6">
                    <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-600 border border-gray-200">
                      {group.label}
                    </span>
                  </div>

                  {/* Événements du mois */}
                  {group.events.map((event, index) => {
                    const config = eventIcons[event.event_type] || eventIcons.custom
                    const Icon = config.icon
                    const isLeft = index % 2 === 0

                    return (
                      <div key={event.id} className="relative mb-8">
                        <div className={`flex items-center ${isLeft ? 'justify-end pr-8 md:pr-12' : 'justify-start pl-8 md:pl-12 flex-row-reverse'}`}>
                          {/* Contenu de l'événement */}
                          <div className={`w-full md:w-5/12 ${isLeft ? 'text-right' : 'text-left'}`}>
                            <div className={`bg-white rounded-lg shadow-sm p-4 ${event.is_milestone ? 'ring-2 ring-yellow-400' : ''}`}>
                              <div className={`flex items-center gap-3 mb-2 ${isLeft ? 'justify-end' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">
                                  {event.title}
                                </h3>
                                {event.is_milestone && (
                                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {formatDate(event.event_date)}
                              </p>
                              {event.formation && (
                                <Link
                                  href={`/formations/${event.formation.slug}`}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 inline-block"
                                >
                                  Voir la formation →
                                </Link>
                              )}
                              {event.badge && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    Badge: {event.badge.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Point sur la ligne */}
                          <div className="absolute left-1/2 transform -translate-x-1/2">
                            <div className={`w-4 h-4 rounded-full border-4 border-white ${event.is_milestone ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  )
}