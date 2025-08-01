"use client"

import React, { useState, useEffect } from 'react'
import { Trophy, Star, Target, TrendingUp, Award, Lock, CheckCircle, Clock, Zap, ChevronRight, Sparkles, Medal, BookOpen, Calendar } from 'lucide-react'
import { BadgesService } from '@/lib/supabase/badges'
import { TimelineService } from '@/lib/supabase/timeline'
import { FormationsService } from '@/lib/supabase/formations'
import type { Badge, BadgeStats } from '@/lib/supabase/types/badge-types'
import type { TimelineStats } from '@/lib/supabase/types/timeline-types'
import type { Formation } from '@/lib/supabase/formations-types'
import ModernHeader from '@/components/Header/ModernHeader'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function MonParcoursPage() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null)
  const [timelineStats, setTimelineStats] = useState<TimelineStats | null>(null)
  const [upcomingFormations, setUpcomingFormations] = useState<Formation[]>([])
  const [nextMilestones, setNextMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userLevel, setUserLevel] = useState(1)
  const [userXP, setUserXP] = useState(0)
  const [xpToNextLevel, setXpToNextLevel] = useState(100)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    const [badgesRes, badgeStatsRes, timelineStatsRes, formationsRes, milestonesRes] = await Promise.all([
      BadgesService.getAllBadges(),
      BadgesService.getBadgeStats(),
      TimelineService.getTimelineStats(),
      FormationsService.getFormations({ limit: 3 }),
      TimelineService.getUpcomingMilestones()
    ])

    if (badgesRes.data) setBadges(badgesRes.data)
    if (badgeStatsRes.data) {
      setBadgeStats(badgeStatsRes.data)
      // Calculer le niveau et l'XP
      const totalXP = badgeStatsRes.data.total_points
      const level = Math.floor(totalXP / 100) + 1
      const xpInCurrentLevel = totalXP % 100
      setUserLevel(level)
      setUserXP(xpInCurrentLevel)
      setXpToNextLevel(100)
    }
    if (timelineStatsRes.data) setTimelineStats(timelineStatsRes.data)
    if (formationsRes.data) setUpcomingFormations(formationsRes.data)
    if (milestonesRes.data) setNextMilestones(milestonesRes.data)
    setLoading(false)
  }

  const getPathStages = () => [
    {
      id: 1,
      name: 'Initiation ONM',
      description: 'Découvrez les fondamentaux de l\'orthodontie neuro-musculaire',
      requiredXP: 0,
      icon: Sparkles,
      status: userLevel >= 1 ? 'completed' : 'locked',
      rewards: ['Badge Débutant', 'Accès aux ressources de base']
    },
    {
      id: 2,
      name: 'Praticien ONM',
      description: 'Maîtrisez les techniques essentielles',
      requiredXP: 100,
      icon: Medal,
      status: userLevel >= 2 ? 'completed' : userLevel === 1 ? 'current' : 'locked',
      rewards: ['Badge Praticien', 'Accès aux cas cliniques']
    },
    {
      id: 3,
      name: 'Expert ONM',
      description: 'Perfectionnez votre pratique',
      requiredXP: 300,
      icon: Award,
      status: userLevel >= 4 ? 'completed' : userLevel === 3 ? 'current' : 'locked',
      rewards: ['Badge Expert', 'Invitations aux webinaires exclusifs']
    },
    {
      id: 4,
      name: 'Maître ONM',
      description: 'Rejoignez l’élite de la pratique ONM',
      requiredXP: 600,
      icon: Trophy,
      status: userLevel >= 7 ? 'completed' : userLevel >= 4 && userLevel < 7 ? 'current' : 'locked',
      rewards: ['Badge Maître', 'Accès au cercle d\'excellence']
    },
    {
      id: 5,
      name: 'Ambassadeur ONM',
      description: 'Devenez un leader de la communauté',
      requiredXP: 1000,
      icon: Star,
      status: userLevel >= 11 ? 'completed' : userLevel === 10 ? 'current' : 'locked',
      rewards: ['Badge Ambassadeur', 'Opportunités de mentorat']
    }
  ]

  const getLevelTitle = (level: number) => {
    if (level < 2) return 'Débutant ONM'
    if (level < 4) return 'Praticien ONM'
    if (level < 7) return 'Expert ONM'
    if (level < 11) return 'Maître ONM'
    return 'Ambassadeur ONM'
  }

  const getAchievementProgress = () => {
    if (!badgeStats || !timelineStats) return []
    
    return [
      {
        label: 'Formations complétées',
        current: timelineStats.formations_completed,
        target: 10,
        icon: BookOpen,
        color: 'bg-blue-500'
      },
      {
        label: 'Badges obtenus',
        current: badgeStats.total_badges,
        target: 25,
        icon: Trophy,
        color: 'bg-purple-500'
      },
      {
        label: 'Jours actifs',
        current: timelineStats.active_months * 30, // Approximation
        target: 100,
        icon: Calendar,
        color: 'bg-green-500'
      },
      {
        label: 'Certifications',
        current: timelineStats.certifications_earned,
        target: 3,
        icon: Award,
        color: 'bg-yellow-500'
      }
    ]
  }

  if (!user) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour voir votre parcours</h2>
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mon Parcours ONM Gamifié
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Progressez, gagnez des récompenses et devenez un expert reconnu de l’orthodontie neuro-musculaire
            </p>
            
            {/* Niveau et XP */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">Niveau {userLevel}</div>
                  <div className="text-sm opacity-90">{getLevelTitle(userLevel)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{badgeStats?.total_points || 0} XP</div>
                  <div className="text-sm opacity-90">Total</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression niveau</span>
                  <span>{userXP} / {xpToNextLevel} XP</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(userXP / xpToNextLevel) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {/* Parcours principal */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Votre chemin vers l’excellence</h2>
                
                <div className="relative max-w-4xl mx-auto">
                  {/* Ligne de progression */}
                  <div className="absolute top-24 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000"
                      style={{ width: `${Math.min((userLevel / 11) * 100, 100)}%` }}
                    />
                  </div>

                  {/* Étapes */}
                  <div className="relative grid grid-cols-5 gap-4">
                    {getPathStages().map((stage, index) => {
                      const Icon = stage.icon
                      const isCompleted = stage.status === 'completed'
                      const isCurrent = stage.status === 'current'
                      const isLocked = stage.status === 'locked'

                      return (
                        <div key={stage.id} className="text-center">
                          <div className="relative inline-block mb-4">
                            <div className={`
                              w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                              ${isCompleted ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110' : ''}
                              ${isCurrent ? 'bg-white border-4 border-purple-600 animate-pulse' : ''}
                              ${isLocked ? 'bg-gray-200' : ''}
                            `}>
                              {isCompleted ? (
                                <CheckCircle className="w-8 h-8 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-6 h-6 text-gray-400" />
                              ) : (
                                <Icon className={`w-8 h-8 ${isCurrent ? 'text-purple-600' : 'text-gray-400'}`} />
                              )}
                            </div>
                            {isCurrent && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <div className="w-3 h-3 bg-purple-600 rounded-full animate-ping" />
                              </div>
                            )}
                          </div>
                          
                          <h3 className={`font-semibold mb-1 ${
                            isCompleted ? 'text-purple-600' : isLocked ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {stage.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">{stage.description}</p>
                          
                          {!isLocked && stage.rewards.length > 0 && (
                            <div className="space-y-1">
                              {stage.rewards.map((reward, idx) => (
                                <div key={idx} className="text-xs text-gray-500">
                                  • {reward}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Statistiques de progression */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {getAchievementProgress().map((achievement, index) => {
                  const Icon = achievement.icon
                  const progress = Math.min((achievement.current / achievement.target) * 100, 100)
                  
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${achievement.color} bg-opacity-10 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${achievement.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {achievement.current}/{achievement.target}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">{achievement.label}</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${achievement.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Prochains objectifs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Jalons à atteindre */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Target className="w-6 h-6 text-purple-600 mr-2" />
                    Prochains jalons
                  </h3>
                  <div className="space-y-4">
                    {nextMilestones.slice(0, 3).map((milestone, index) => (
                      <div key={index} className="border-l-4 border-purple-200 pl-4">
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round(milestone.progress)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formations recommandées */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                    Formations recommandées
                  </h3>
                  <div className="space-y-4">
                    {upcomingFormations.map((formation) => (
                      <Link
                        key={formation.id}
                        href={`/formations/${formation.slug}`}
                        className="block group"
                      >
                        <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                {formation.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formation.short_description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{formation.duration_days} jours</span>
                                <span>+50 XP</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges récents */}
              {badges.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Badges disponibles</h3>
                    <Link
                      href="/mes-badges"
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Voir tous les badges →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {badges.slice(0, 6).map((badge) => {
                      const isEarned = badgeStats?.total_badges ? true : false // Simplifié pour l'exemple
                      return (
                        <div
                          key={badge.id}
                          className={`text-center p-4 rounded-lg transition-all ${
                            isEarned ? 'opacity-100' : 'opacity-50 grayscale'
                          }`}
                        >
                          <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
                            {badge.icon_url ? (
                              <img src={badge.icon_url} alt={badge.name} className="w-10 h-10" />
                            ) : (
                              <Trophy className="w-8 h-8 text-purple-600" />
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">{badge.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">+{badge.points} XP</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </>
  )
}