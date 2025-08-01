"use client"

import React, { useState, useEffect } from 'react'
import { UserPlus, Gift, TrendingUp, Mail, Check, Clock, X, Send, Trophy, Target } from 'lucide-react'
import { ReferralsService } from '@/lib/supabase/referrals'
import type { Referral, ReferralStats } from '@/lib/supabase/types/referral-types'
import ModernHeader from '@/components/Header/ModernHeader'
import { useAuth } from '@/contexts/AuthContext'

export default function ParrainagePage() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteData, setInviteData] = useState({
    referee_email: '',
    referee_name: '',
    personal_message: '',
    formation_id: ''
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReferrals()
      fetchStats()
    }
  }, [user])

  const fetchReferrals = async () => {
    const { data } = await ReferralsService.getUserReferrals()
    if (data) setReferrals(data)
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data } = await ReferralsService.getUserReferralStats()
    if (data) setStats(data)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSending(true)
    const { success, message } = await ReferralsService.createReferral(inviteData)
    
    if (success) {
      setInviteData({ referee_email: '', referee_name: '', personal_message: '', formation_id: '' })
      setShowInviteForm(false)
      fetchReferrals()
      fetchStats()
    } else {
      alert(message || 'Erreur lors de l\'envoi de l\'invitation')
    }
    setSending(false)
  }

  const statusConfig = {
    pending: { label: 'En attente', color: 'text-gray-600 bg-gray-100', icon: Clock },
    clicked: { label: 'Cliqué', color: 'text-blue-600 bg-blue-100', icon: Mail },
    registered: { label: 'Inscrit', color: 'text-purple-600 bg-purple-100', icon: UserPlus },
    converted: { label: 'Converti', color: 'text-green-600 bg-green-100', icon: Check },
    expired: { label: 'Expiré', color: 'text-red-600 bg-red-100', icon: X }
  }

  if (!user) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour accéder au parrainage</h2>
            <a href="/connexion" className="text-blue-600 hover:text-blue-700">Se connecter</a>
          </div>
        </div>
        </>
    )
  }

  return (
    <>
      <ModernHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Parrainez et soyez récompensé
            </h1>
            <p className="text-xl opacity-90">
              Partagez votre passion pour l'orthodontie neuro-musculaire et gagnez des récompenses exclusives
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
                    <p className="text-sm text-gray-600">Invitations envoyées</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_sent}</p>
                  </div>
                  <Send className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clics sur vos liens</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_clicked}</p>
                  </div>
                  <Mail className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_converted}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.conversion_rate.toFixed(1)}% de taux
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Récompenses</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_rewards_earned}</p>
                  </div>
                  <Gift className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Comment ça marche */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Comment ça marche ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Invitez</h3>
                <p className="text-gray-600">Envoyez une invitation personnalisée à vos collègues orthodontistes</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Ils s'inscrivent</h3>
                <p className="text-gray-600">Vos filleuls s'inscrivent et participent à une formation ONM</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Gagnez</h3>
                <p className="text-gray-600">Recevez des badges exclusifs et des réductions sur vos prochaines formations</p>
              </div>
            </div>
          </div>

          {/* Bouton d'invitation */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Inviter un praticien
            </button>
          </div>

          {/* Formulaire d'invitation */}
          {showInviteForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Inviter un praticien</h3>
                
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email du praticien *
                    </label>
                    <input
                      type="email"
                      required
                      value={inviteData.referee_email}
                      onChange={(e) => setInviteData({ ...inviteData, referee_email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du praticien
                    </label>
                    <input
                      type="text"
                      value={inviteData.referee_name}
                      onChange={(e) => setInviteData({ ...inviteData, referee_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message personnel
                    </label>
                    <textarea
                      rows={3}
                      value={inviteData.personal_message}
                      onChange={(e) => setInviteData({ ...inviteData, personal_message: e.target.value })}
                      placeholder="Ajoutez un message personnel pour votre collègue..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? 'Envoi...' : 'Envoyer l\'invitation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Liste des parrainages */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Vos parrainages</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Vous n'avez pas encore envoyé d'invitation</p>
                <p className="text-gray-400 text-sm mt-2">Commencez à parrainer des praticiens pour gagner des récompenses</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Praticien invité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'envoi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Récompenses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map((referral) => {
                      const StatusIcon = statusConfig[referral.status].icon
                      return (
                        <tr key={referral.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {referral.referee_name || referral.referee_email}
                              </div>
                              {referral.referee_name && (
                                <div className="text-sm text-gray-500">{referral.referee_email}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[referral.status].color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[referral.status].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {referral.status === 'converted' && referral.rewards && (
                              <div className="flex space-x-2">
                                {referral.rewards.badge_earned && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Badge
                                  </span>
                                )}
                                {referral.rewards.discount_amount && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                    -{referral.rewards.discount_amount}%
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Récompenses */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Vos récompenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Badge Ambassadeur</h3>
                    <p className="text-sm text-gray-600">Après 3 parrainages réussis</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min((stats?.total_converted || 0) / 3 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats?.total_converted || 0} / 3 parrainages
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Réductions cumulées</h3>
                    <p className="text-sm text-gray-600">Sur vos prochaines formations</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {(stats?.total_converted || 0) * 10}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  de réduction totale gagnée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}