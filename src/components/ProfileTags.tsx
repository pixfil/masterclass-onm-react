"use client"

import React, { useState, useEffect } from 'react'
import { Award, TrendingUp, Users, BookOpen, Star, Shield, Zap } from 'lucide-react'
import { ProfileTagsService } from '@/lib/supabase/profile-tags'
import type { ProfileTag, UserProfileTags } from '@/lib/supabase/profile-tags'

interface ProfileTagsProps {
  userId: string
  showAll?: boolean
  maxTags?: number
  showStats?: boolean
  className?: string
}

export default function ProfileTags({ 
  userId, 
  showAll = false, 
  maxTags = 5,
  showStats = false,
  className = ''
}: ProfileTagsProps) {
  const [userTags, setUserTags] = useState<UserProfileTags | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllTags, setShowAllTags] = useState(showAll)

  useEffect(() => {
    fetchUserTags()
  }, [userId])

  const fetchUserTags = async () => {
    setLoading(true)
    try {
      // Essayer d'abord depuis le cache
      let tags = await ProfileTagsService.getUserTagsFromCache(userId)
      
      if (!tags) {
        // Si pas de cache, calculer les tags
        tags = await ProfileTagsService.calculateUserTags(userId)
        // Mettre en cache pour les prochaines fois
        ProfileTagsService.updateUserTagsCache(userId).catch(console.error)
      }
      
      setUserTags(tags)
    } catch (error) {
      console.error('Erreur chargement tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTagIcon = (tag: ProfileTag) => {
    // Utiliser l'emoji s'il existe
    if (tag.icon) return <span className="text-lg">{tag.icon}</span>
    
    // Sinon utiliser une icône selon la catégorie
    switch (tag.category) {
      case 'expertise':
        return <BookOpen className="w-4 h-4" />
      case 'achievement':
        return <Award className="w-4 h-4" />
      case 'activity':
        return <Zap className="w-4 h-4" />
      case 'community':
        return <Users className="w-4 h-4" />
      case 'certification':
        return <Shield className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getExpertiseLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'text-purple-600 bg-purple-100'
      case 'Avancé':
        return 'text-blue-600 bg-blue-100'
      case 'Intermédiaire':
        return 'text-green-600 bg-green-100'
      case 'Praticien':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!userTags || userTags.tags.length === 0) {
    return null
  }

  const displayedTags = showAllTags ? userTags.tags : userTags.tags.slice(0, maxTags)
  const hasMoreTags = !showAllTags && userTags.tags.length > maxTags

  return (
    <div className={className}>
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Niveau d'expertise */}
        {userTags.expertise_level && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExpertiseLevelColor(userTags.expertise_level)}`}>
            <Star className="w-4 h-4 mr-1" />
            {userTags.expertise_level} ONM
          </div>
        )}

        {/* Tags dynamiques */}
        {displayedTags.map((tag) => (
          <div
            key={tag.id}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tag.color} transition-all hover:scale-105`}
            title={tag.metadata ? JSON.stringify(tag.metadata, null, 2) : tag.name}
          >
            <span className="mr-1.5">{getTagIcon(tag)}</span>
            {tag.name}
          </div>
        ))}

        {/* Bouton voir plus */}
        {hasMoreTags && (
          <button
            onClick={() => setShowAllTags(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            +{userTags.tags.length - maxTags} autres
          </button>
        )}
      </div>

      {/* Statistiques optionnelles */}
      {showStats && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {userTags.activity_score}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Score d'activité
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {userTags.community_impact}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-center mt-1">
              <Users className="w-3 h-3 mr-1" />
              Impact communautaire
            </div>
          </div>
          
          <div className="text-center sm:col-span-1 col-span-2">
            <div className="text-2xl font-bold text-gray-900">
              {userTags.tags.length}
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-center mt-1">
              <Award className="w-3 h-3 mr-1" />
              Distinctions
            </div>
          </div>
        </div>
      )}

      {/* Mise à jour */}
      {userTags.last_updated && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Mis à jour {new Date(userTags.last_updated).toLocaleDateString('fr-FR')}
        </div>
      )}
    </div>
  )
}