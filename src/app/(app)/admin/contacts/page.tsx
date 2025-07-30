'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Badge } from '@/shared/Badge'
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, CheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { getContacts, getContactStats, updateContactStatus, type Contact, type ContactStats } from '@/lib/supabase/contacts'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [contactsData, statsData] = await Promise.all([
        getContacts(),
        getContactStats()
      ])
      
      setContacts(contactsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (contactId: string, newStatus: Contact['status']) => {
    try {
      await updateContactStatus(contactId, newStatus)
      await loadData() // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.objet?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: Contact['status']) => {
    const colors = {
      nouveau: 'blue',
      lu: 'yellow',
      traité: 'green',
      archivé: 'zinc'
    } as const
    
    return <Badge color={colors[status]}>{status}</Badge>
  }

  if (loading) {
    return (
      <AdminLayout currentPage="contacts">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="contacts">
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les demandes de contact et suivez les interactions clients
            </p>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total contacts</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{stats.nouveau}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nouveaux</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aujourd'hui</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{stats.this_week}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cette semaine</div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, objet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="nouveau">Nouveau</option>
            <option value="lu">Lu</option>
            <option value="traité">Traité</option>
            <option value="archivé">Archivé</option>
          </select>
        </div>

        {/* Liste des contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Aucun contact trouvé</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bien concerné
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contact.prenom} {contact.nom}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.email}
                          </div>
                          {contact.telephone && (
                            <div className="text-xs text-gray-400">
                              {contact.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {contact.objet || 'Demande générale'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.property_title ? (
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">{contact.property_title}</div>
                            {contact.property_reference && (
                              <div className="text-xs text-gray-500">Ref: {contact.property_reference}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contact.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(contact.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            title="Voir le message"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {contact.status === 'nouveau' && (
                            <button
                              onClick={() => handleStatusChange(contact.id, 'lu')}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                              title="Marquer comme lu"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {contact.status !== 'traité' && (
                            <button
                              onClick={() => handleStatusChange(contact.id, 'traité')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400"
                              title="Marquer comme traité"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {contact.status !== 'archivé' && (
                            <button
                              onClick={() => handleStatusChange(contact.id, 'archivé')}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                              title="Archiver"
                            >
                              <ArchiveBoxIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de détail */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Détail du contact
                  </h3>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nom
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedContact.prenom} {selectedContact.nom}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedContact.email}
                      </div>
                    </div>
                  </div>
                  
                  {selectedContact.telephone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Téléphone
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedContact.telephone}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Objet
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {selectedContact.objet || 'Demande générale'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded border whitespace-pre-wrap">
                      {selectedContact.message}
                    </div>
                  </div>
                  
                  {selectedContact.property_title && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bien concerné
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedContact.property_title}
                        {selectedContact.property_reference && (
                          <span className="text-gray-500 ml-2">
                            (Ref: {selectedContact.property_reference})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Statut
                      </label>
                      <div>{getStatusBadge(selectedContact.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date de création
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedContact.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Répondre par email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}