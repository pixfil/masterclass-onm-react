"use client"

import React, { useState, useEffect } from 'react'
import { History, Filter, Calendar, User, FileText, Download, Search, Activity, Shield, Clock, AlertCircle } from 'lucide-react'
import { ActivityLogsService } from '@/lib/supabase/activity-logs'
import type { AdminActivityLog } from '@/lib/supabase/types/activity-types'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabaseClient'

export default function AdminHistoriquePage() {
  const [activities, setActivities] = useState<AdminActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    admin_id: '',
    action_type: '',
    affected_user_id: '',
    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0]
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [admins, setAdmins] = useState<any[]>([])
  const [actionTypes, setActionTypes] = useState<string[]>([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [filters, currentPage])

  const fetchInitialData = async () => {
    // Récupérer la liste des admins
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'admin')

    if (adminProfiles) setAdmins(adminProfiles)

    // Définir les types d'actions possibles
    setActionTypes([
      'create_formation',
      'update_formation',
      'delete_formation',
      'create_session',
      'update_session',
      'cancel_session',
      'create_resource',
      'update_resource',
      'delete_resource',
      'create_podcast',
      'update_podcast',
      'delete_podcast',
      'create_article',
      'update_article',
      'delete_article',
      'approve_comment',
      'reject_comment',
      'create_badge',
      'award_badge',
      'send_email',
      'update_user',
      'ban_user',
      'unban_user',
      'process_refund',
      'generate_report'
    ])
  }

  const fetchActivities = async () => {
    setLoading(true)
    
    const cleanFilters: any = {}
    if (filters.admin_id) cleanFilters.admin_id = filters.admin_id
    if (filters.action_type) cleanFilters.action_type = filters.action_type
    if (filters.affected_user_id) cleanFilters.affected_user_id = filters.affected_user_id
    if (filters.date_from) cleanFilters.date_from = filters.date_from + 'T00:00:00.000Z'
    if (filters.date_to) cleanFilters.date_to = filters.date_to + 'T23:59:59.999Z'

    const { data, pagination } = await ActivityLogsService.getAdminActivityHistory(
      cleanFilters,
      currentPage,
      50
    )

    if (data) {
      setActivities(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('create')) return '+'
    if (actionType.includes('update')) return '✎'
    if (actionType.includes('delete')) return '🗑'
    if (actionType.includes('approve')) return '✓'
    if (actionType.includes('reject')) return '✗'
    if (actionType.includes('send')) return '✉'
    return '•'
  }

  const getActionColor = (actionType: string) => {
    if (actionType.includes('create')) return 'text-green-600 bg-green-100'
    if (actionType.includes('update')) return 'text-blue-600 bg-blue-100'
    if (actionType.includes('delete')) return 'text-red-600 bg-red-100'
    if (actionType.includes('approve')) return 'text-green-600 bg-green-100'
    if (actionType.includes('reject')) return 'text-red-600 bg-red-100'
    if (actionType.includes('ban')) return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Admin', 'Action', 'Entité affectée', 'Détails']
    const rows = activities.map(activity => [
      formatDate(activity.created_at),
      activity.admin?.email || activity.admin_id,
      formatActionType(activity.action_type),
      activity.affected_entity_type && activity.affected_entity_id
        ? `${activity.affected_entity_type} #${activity.affected_entity_id}`
        : '-',
      JSON.stringify(activity.action_details || {})
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `historique-admin-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="w-6 h-6 mr-2" />
              Historique des activités admin
            </h1>
            <p className="text-gray-600 mt-1">
              Consultez l'historique complet des actions administratives
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrateur
              </label>
              <select
                value={filters.admin_id}
                onChange={(e) => setFilters({ ...filters, admin_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les admins</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.first_name} {admin.last_name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'action
              </label>
              <select
                value={filters.action_type}
                onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les actions</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>
                    {formatActionType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    admin_id: '',
                    action_type: '',
                    affected_user_id: '',
                    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    date_to: new Date().toISOString().split('T')[0]
                  })
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des activités */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune activité trouvée pour cette période</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Administrateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entité affectée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Détails
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(activity.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {activity.admin?.first_name} {activity.admin?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.admin?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action_type)}`}>
                          <span className="mr-1">{getActionIcon(activity.action_type)}</span>
                          {formatActionType(activity.action_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.affected_entity_type && activity.affected_entity_id ? (
                          <div>
                            <div className="font-medium">
                              {activity.affected_entity_type}
                            </div>
                            <div className="text-xs">
                              ID: {activity.affected_entity_id}
                            </div>
                            {activity.affected_user_id && (
                              <div className="text-xs">
                                User: {activity.affected_user_id}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.action_details && Object.keys(activity.action_details).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-700">
                              Voir les détails
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(activity.action_details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Précédent
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avertissement */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Informations importantes :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>L'historique est conservé pendant 90 jours</li>
                <li>Toutes les actions administratives sont enregistrées automatiquement</li>
                <li>Les données sensibles sont masquées dans les détails</li>
                <li>Pour des raisons de sécurité, certaines actions nécessitent une double authentification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}