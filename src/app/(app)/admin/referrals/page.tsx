"use client"

import React, { useState, useEffect } from 'react'
import { Users, UserPlus, TrendingUp, Gift, Mail, CheckCircle, Clock, XCircle } from 'lucide-react'
import { ReferralsService } from '@/lib/supabase/referrals'
import type { Referral, ReferralStats } from '@/lib/supabase/types/referral-types'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<Referral['status'] | ''>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchReferrals()
    fetchStats()
  }, [currentPage, statusFilter])

  const fetchReferrals = async () => {
    setLoading(true)
    const { data, pagination } = await ReferralsService.getUserReferrals({
      status: statusFilter as any || undefined,
      page: currentPage,
      limit: 20
    })
    
    if (data) {
      setReferrals(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data } = await ReferralsService.getGlobalReferralStats()
    if (data) setStats(data)
  }

  const statusConfig = {
    pending: { label: 'En attente', color: 'text-gray-600 bg-gray-100', icon: Clock },
    clicked: { label: 'Cliqué', color: 'text-blue-600 bg-blue-100', icon: Mail },
    registered: { label: 'Inscrit', color: 'text-blue-600 bg-blue-100', icon: UserPlus },
    converted: { label: 'Converti', color: 'text-green-600 bg-green-100', icon: CheckCircle },
    expired: { label: 'Expiré', color: 'text-red-600 bg-red-100', icon: XCircle }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <AdminLayout currentPage="referrals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Système de Parrainage</h1>
          <p className="text-gray-600 mt-2">Gérez et suivez les parrainages des praticiens</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total envoyés</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_sent}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clics</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_clicked}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total_sent > 0 ? 
                      `${((stats.total_clicked / stats.total_sent) * 100).toFixed(1)}% de taux` 
                      : '0%'}
                  </p>
                </div>
                <Mail className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Récompenses</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_rewards_earned}</p>
                  <p className="text-xs text-gray-500 mt-1">attribuées</p>
                </div>
                <Gift className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Top parrains */}
        {stats && stats.top_referrers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Parrains</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.top_referrers.slice(0, 3).map((referrer, index) => (
                <div key={referrer.user_id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{referrer.user_name}</p>
                    <p className="text-sm text-gray-500">
                      {referrer.referral_count} parrainages • {referrer.conversion_count} conversions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des parrainages */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun parrainage trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parrain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filleul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
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
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {referral.referrer_id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{referral.referee_email}</div>
                          {referral.referee_name && (
                            <div className="text-sm text-gray-500">{referral.referee_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {referral.formation ? (
                            <div className="text-sm text-gray-900">{referral.formation.title}</div>
                          ) : (
                            <span className="text-sm text-gray-500">Toutes formations</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[referral.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[referral.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Créé: {formatDate(referral.created_at)}</div>
                          {referral.clicked_at && (
                            <div>Cliqué: {formatDate(referral.clicked_at)}</div>
                          )}
                          {referral.converted_at && (
                            <div>Converti: {formatDate(referral.converted_at)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {referral.rewards?.badge_earned && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                              Badge
                            </span>
                          )}
                          {referral.rewards?.discount_amount && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 ml-1">
                              -{referral.rewards.discount_amount}%
                            </span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 py-2">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}