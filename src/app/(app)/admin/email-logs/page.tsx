'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface EmailLog {
  id: string
  recipient_email: string
  recipient_name?: string
  sender_email: string
  sender_name?: string
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'bounced'
  error_message?: string
  sent_at?: string
  created_at: string
  retry_count: number
  template_name?: string
}

const EmailLogsContent = () => {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [retryLoading, setRetryLoading] = useState<string | null>(null)

  // TODO: Remplacer par de vraies données depuis Supabase
  useEffect(() => {
    // Simulation de données
    setTimeout(() => {
      setLogs([
        {
          id: '1',
          recipient_email: 'client@example.com',
          recipient_name: 'Jean Dupont',
          sender_email: 'noreply@initiative-immobilier.fr',
          sender_name: 'Initiative Immobilier',
          subject: 'Confirmation de votre demande de contact - Appartement Strasbourg',
          status: 'sent',
          sent_at: '2024-01-20T14:30:00Z',
          created_at: '2024-01-20T14:29:00Z',
          retry_count: 0,
          template_name: 'Contact - Confirmation Client'
        },
        {
          id: '2',
          recipient_email: 'agent@initiative-immobilier.fr',
          recipient_name: 'Marie Martin',
          sender_email: 'noreply@initiative-immobilier.fr',
          sender_name: 'Initiative Immobilier',
          subject: 'Nouvelle demande de contact - Appartement Strasbourg',
          status: 'sent',
          sent_at: '2024-01-20T14:30:00Z',
          created_at: '2024-01-20T14:29:00Z',
          retry_count: 0,
          template_name: 'Contact - Notification Agent'
        },
        {
          id: '3',
          recipient_email: 'client.erreur@example.com',
          recipient_name: 'Pierre Durand',
          sender_email: 'noreply@initiative-immobilier.fr',
          sender_name: 'Initiative Immobilier',
          subject: 'Confirmation de votre demande d\'estimation',
          status: 'failed',
          error_message: 'Adresse email invalide',
          created_at: '2024-01-20T12:15:00Z',
          retry_count: 2,
          template_name: 'Estimation - Confirmation Client'
        },
        {
          id: '4',
          recipient_email: 'bounce@example.com',
          recipient_name: 'Test User',
          sender_email: 'noreply@initiative-immobilier.fr',
          sender_name: 'Initiative Immobilier',
          subject: 'Newsletter Initiative Immobilier',
          status: 'bounced',
          error_message: 'Boîte email pleine',
          created_at: '2024-01-20T10:00:00Z',
          retry_count: 1,
          template_name: 'Newsletter'
        },
        {
          id: '5',
          recipient_email: 'pending@example.com',
          recipient_name: 'User Pending',
          sender_email: 'noreply@initiative-immobilier.fr',
          sender_name: 'Initiative Immobilier',
          subject: 'Email en cours d\'envoi',
          status: 'pending',
          created_at: '2024-01-20T15:45:00Z',
          retry_count: 0,
          template_name: 'Contact - Confirmation Client'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string, errorMessage?: string) => {
    const config = {
      sent: {
        icon: CheckCircleIcon,
        class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        label: 'Envoyé'
      },
      pending: {
        icon: ClockIcon,
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        label: 'En attente'
      },
      failed: {
        icon: XCircleIcon,
        class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        label: 'Échec'
      },
      bounced: {
        icon: ExclamationTriangleIcon,
        class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        label: 'Rejeté'
      }
    }

    const statusConfig = config[status as keyof typeof config]
    const Icon = statusConfig.icon

    return (
      <div className="flex items-center">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig.class}`}>
          <Icon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </span>
        {errorMessage && (
          <span className="ml-2 text-xs text-red-600 dark:text-red-400" title={errorMessage}>
            {errorMessage.length > 30 ? errorMessage.substring(0, 30) + '...' : errorMessage}
          </span>
        )}
      </div>
    )
  }

  const handleRetry = async (logId: string) => {
    setRetryLoading(logId)
    // TODO: Implémenter la logique de renvoi
    setTimeout(() => {
      setRetryLoading(null)
      // Simuler le succès du renvoi
      setLogs(prev => prev.map(log => 
        log.id === logId 
          ? { ...log, status: 'sent' as const, sent_at: new Date().toISOString(), retry_count: log.retry_count + 1 }
          : log
      ))
    }, 2000)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = !statusFilter || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout currentPage="email-logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Logs des emails</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Suivi et historique de tous les emails envoyés
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par email, objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="sent">Envoyés</option>
              <option value="pending">En attente</option>
              <option value="failed">Échecs</option>
              <option value="bounced">Rejetés</option>
            </select>

            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              Total: {filteredLogs.length} email(s)
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Destinataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Objet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {log.recipient_name || 'N/A'}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {log.recipient_email}
                          </div>
                          {log.template_name && (
                            <div className="text-xs text-neutral-400 dark:text-neutral-500">
                              {log.template_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 dark:text-white max-w-xs truncate">
                          {log.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status, log.error_message)}
                        {log.retry_count > 0 && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {log.retry_count} tentative(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        <div>
                          {log.sent_at ? (
                            <>
                              <div>Envoyé le</div>
                              <div>{new Date(log.sent_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</div>
                            </>
                          ) : (
                            <>
                              <div>Créé le</div>
                              <div>{new Date(log.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-neutral-600 hover:text-neutral-900 p-1 rounded"
                            title="Voir le contenu"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {(log.status === 'failed' || log.status === 'bounced') && (
                            <button
                              onClick={() => handleRetry(log.id)}
                              disabled={retryLoading === log.id}
                              className="text-primary-600 hover:text-primary-900 p-1 rounded disabled:opacity-50"
                              title="Renvoyer"
                            >
                              {retryLoading === log.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <ArrowPathIcon className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <div className="text-neutral-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {searchTerm || statusFilter
                      ? 'Aucun email ne correspond aux critères de recherche'
                      : 'Aucun log d\'email trouvé'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminEmailLogsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EmailLogsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}