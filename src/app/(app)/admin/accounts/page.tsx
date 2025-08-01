'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getAllAdminAccounts, AdminAccount } from '@/lib/supabase/admin-accounts'

const AccountsContent = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      
      // Essayer d'abord la base de données
      try {
        const data = await getAllAdminAccounts()
        setAccounts(data)
      } catch (dbError) {
        console.log('Base de données non disponible, utilisation des comptes locaux')
        
        // Fallback: créer des comptes depuis la liste des super admins
        const superAdminEmails = [
          { email: 'philippe@gclicke.com', name: 'Philippe G.' },
          { email: 'philippe@initiative-immo.fr', name: 'Philippe Initiative' },
          { email: 'admin@initiative-immo.fr', name: 'Admin Initiative' },
          { email: 'coual.philippe@gmail.com', name: 'Philippe Coual' }
        ]
        
        const fallbackAccounts: AdminAccount[] = superAdminEmails.map((admin, index) => ({
          id: `temp-${index}`,
          email: admin.email,
          name: admin.name,
          role: 'super_admin' as const,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }))
        
        setAccounts(fallbackAccounts)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      moderator: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      moderator: 'Modérateur',
      viewer: 'Lecteur'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <AdminLayout currentPage="accounts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Gestion des comptes</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez les comptes administrateurs de la plateforme
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Ajouter un compte
          </Button>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des comptes...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {accounts.length} compte(s) administrateur(s)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                {account.name}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {account.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(account.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(account.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {account.last_login ? (
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {new Date(account.last_login).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            'Jamais connecté'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {accounts.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-neutral-400 mb-4">
                      <UserIcon className="mx-auto h-12 w-12" />
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Aucun compte administrateur trouvé
                    </p>
                    <Button className="mt-4">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Ajouter le premier compte
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminAccountsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <AccountsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}