"use client"

import React, { useState, useEffect } from 'react'
import { Trophy, Star, Award, Download, Share2, Lock, CheckCircle, TrendingUp, Target, Zap, Calendar } from 'lucide-react'
import { BadgesService } from '@/lib/supabase/badges'
import type { Badge, UserBadge, BadgeStats } from '@/lib/supabase/types/badge-types'
import ModernHeader from '@/components/Header/ModernHeader'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function MesBadgesPage() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [stats, setStats] = useState<BadgeStats | null>(null)
  const [nextBadges, setNextBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBadges()
    }
  }, [user, selectedCategory])

  const fetchBadges = async () => {
    setLoading(true)
    const [allBadgesRes, userBadgesRes, statsRes, nextRes] = await Promise.all([
      BadgesService.getAllBadges(),
      BadgesService.getUserBadges(),
      BadgesService.getBadgeStats(),
      BadgesService.getNextBadges()
    ])

    if (allBadgesRes.data) setBadges(allBadgesRes.data)
    if (userBadgesRes.data) setUserBadges(userBadgesRes.data)
    if (statsRes.data) setStats(statsRes.data)
    if (nextRes.data) setNextBadges(nextRes.data)
    setLoading(false)
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'completion': CheckCircle,
      'excellence': Star,
      'milestone': Target,
      'social': Share2,
      'special': Zap
    }
    return icons[category] || Trophy
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'completion': 'bg-green-100 text-green-600',
      'excellence': 'bg-yellow-100 text-yellow-600',
      'milestone': 'bg-blue-100 text-blue-600',
      'social': 'bg-purple-100 text-purple-600',
      'special': 'bg-red-100 text-red-600'
    }
    return colors[category] || 'bg-gray-100 text-gray-600'
  }

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      'common': 'border-gray-300',
      'rare': 'border-blue-500',
      'epic': 'border-purple-500',
      'legendary': 'border-yellow-500'
    }
    return colors[rarity] || 'border-gray-300'
  }

  const getRarityGradient = (rarity: string) => {
    const gradients: { [key: string]: string } = {
      'common': 'from-gray-100 to-gray-200',
      'rare': 'from-blue-100 to-blue-200',
      'epic': 'from-purple-100 to-purple-200',
      'legendary': 'from-yellow-100 to-yellow-200'
    }
    return gradients[rarity] || 'from-gray-100 to-gray-200'
  }

  const exportBadgeAsImage = async (badge: UserBadge) => {
    setExportLoading(true)
    try {
      const element = document.getElementById(`badge-${badge.id}`)
      if (!element) return

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      })

      // Télécharger comme image
      const link = document.createElement('a')
      link.download = `badge-${badge.badge?.name?.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    }
    setExportLoading(false)
  }

  const exportAllBadgesAsPDF = async () => {
    setExportLoading(true)
    try {
      const pdf = new jsPDF()
      const pageHeight = pdf.internal.pageSize.height
      let yPosition = 20

      // Titre
      pdf.setFontSize(24)
      pdf.setTextColor(59, 130, 246)
      pdf.text('Mes Badges ONM', 105, yPosition, { align: 'center' })
      yPosition += 20

      // Statistiques
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Total: ${stats?.total_badges || 0} badges`, 20, yPosition)
      yPosition += 10
      pdf.text(`Points: ${stats?.total_points || 0}`, 20, yPosition)
      yPosition += 20

      // Badges
      for (const userBadge of userBadges) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }

        // Badge info
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(userBadge.badge?.name || '', 20, yPosition)
        yPosition += 8

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.text(userBadge.badge?.description || '', 20, yPosition)
        yPosition += 8

        pdf.text(`Obtenu le: ${new Date(userBadge.earned_at).toLocaleDateString('fr-FR')}`, 20, yPosition)
        yPosition += 15
      }

      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, pageHeight - 10, { align: 'center' })

      pdf.save('mes-badges-onm.pdf')
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
    }
    setExportLoading(false)
  }

  const shareOnLinkedIn = (badge: UserBadge) => {
    const text = `Je viens d'obtenir le badge "${badge.badge?.name}" sur Masterclass ONM! ${badge.badge?.description}`
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (!user) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour voir vos badges</h2>
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mes Badges
            </h1>
            <p className="text-xl opacity-90">
              Collectionnez des badges et célébrez vos accomplissements en orthodontie neuro-musculaire
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
                    <p className="text-sm text-gray-600">Total badges</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_badges}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points totaux</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_points}</p>
                  </div>
                  <Star className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Badges rares</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.rare_badges}</p>
                  </div>
                  <Award className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ce mois-ci</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.badges_this_month}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                {['completion', 'excellence', 'milestone', 'social', 'special'].map(cat => {
                  const Icon = getCategoryIcon(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{cat}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportAllBadgesAsPDF}
                  disabled={exportLoading || userBadges.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter PDF
                </button>
              </div>
            </div>
          </div>

          {/* Badges obtenus */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges obtenus</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : userBadges.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Vous n'avez pas encore de badges</p>
                <p className="text-gray-400 text-sm">Complétez des formations et des défis pour en gagner!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBadges
                  .filter(ub => !selectedCategory || ub.badge?.category === selectedCategory)
                  .map((userBadge) => {
                    const badge = userBadge.badge
                    if (!badge) return null
                    
                    const Icon = getCategoryIcon(badge.category)
                    const categoryColor = getCategoryColor(badge.category)
                    const rarityColor = getRarityColor(badge.rarity)
                    const rarityGradient = getRarityGradient(badge.rarity)

                    return (
                      <div
                        key={userBadge.id}
                        id={`badge-${userBadge.id}`}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${rarityColor} hover:shadow-lg transition-shadow`}
                      >
                        <div className={`h-32 bg-gradient-to-br ${rarityGradient} flex items-center justify-center relative`}>
                          {badge.icon_url ? (
                            <img src={badge.icon_url} alt={badge.name} className="w-20 h-20" />
                          ) : (
                            <Icon className="w-20 h-20 text-gray-700 opacity-50" />
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                              {badge.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Points</span>
                              <span className="font-medium text-gray-900">{badge.points}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Rareté</span>
                              <span className="font-medium text-gray-900 capitalize">{badge.rarity}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Obtenu le</span>
                              <span className="font-medium text-gray-900">
                                {new Date(userBadge.earned_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => exportBadgeAsImage(userBadge)}
                              disabled={exportLoading}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Image
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBadge(userBadge)
                                setShowShareModal(true)
                              }}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center justify-center gap-1"
                            >
                              <Share2 className="w-4 h-4" />
                              Partager
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Prochains badges à obtenir */}
          {nextBadges.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prochains badges à débloquer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nextBadges.map((item, index) => {
                  const Icon = getCategoryIcon(item.badge.category)
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 opacity-75">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.badge.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{item.badge.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Progression</span>
                              <span className="font-medium text-gray-900">
                                {item.progress.current}/{item.progress.required}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(item.progress.current / item.progress.required) * 100}%` }}
                              />
                            </div>
                          </div>
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

      {/* Modal de partage */}
      {showShareModal && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Partager votre badge</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => shareOnLinkedIn(selectedBadge)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Partager sur LinkedIn
              </button>
              
              <button
                onClick={() => exportBadgeAsImage(selectedBadge)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger l'image
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}