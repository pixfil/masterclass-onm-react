'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Badge } from '@/shared/Badge'
import { MagnifyingGlassIcon, EyeIcon, CheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { getEstimations, getEstimationStats, updateEstimationStatus, type Estimation, type EstimationStats } from '@/lib/supabase/estimations'

export default function EstimationsPage() {
  const [estimations, setEstimations] = useState<Estimation[]>([])
  const [stats, setStats] = useState<EstimationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEstimation, setSelectedEstimation] = useState<Estimation | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [estimationsData, statsData] = await Promise.all([
        getEstimations(),
        getEstimationStats()
      ])
      
      setEstimations(estimationsData)
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

  const handleStatusChange = async (estimationId: string, newStatus: Estimation['status']) => {
    try {
      await updateEstimationStatus(estimationId, newStatus)
      await loadData() // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const filteredEstimations = estimations.filter(estimation => {
    const matchesStatus = filterStatus === 'all' || estimation.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      estimation.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.ville?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: Estimation['status']) => {
    const colors = {
      nouveau: 'blue',
      en_cours: 'yellow',
      estimé: 'green',
      archivé: 'gray'
    } as const
    
    return <Badge color={colors[status]} name={status.replace('_', ' ')} />
  }

  if (loading) {
    return (
      <AdminLayout currentPage="estimations">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="estimations">
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demandes d'estimation</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les demandes d'estimation immobilière
            </p>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total demandes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{stats.nouveau}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nouvelles</div>
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
                placeholder="Rechercher par nom, email, ville..."
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
            <option value="en_cours">En cours</option>
            <option value="estimé">Estimé</option>
            <option value="archivé">Archivé</option>
          </select>
        </div>

        {/* Liste des estimations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          {filteredEstimations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Aucune demande d'estimation trouvée</div>
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
                      Bien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de projet
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
                  {filteredEstimations.map((estimation) => (
                    <tr key={estimation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {estimation.prenom} {estimation.nom}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {estimation.email}
                          </div>
                          {estimation.telephone && (
                            <div className="text-xs text-gray-400">
                              {estimation.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {estimation.type_bien} - {estimation.surface_habitable}m²
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {estimation.ville} {estimation.code_postal}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {estimation.type_projet}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(estimation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(estimation.created_at).toLocaleDateString('fr-FR', {
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
                            onClick={() => setSelectedEstimation(estimation)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {estimation.status === 'nouveau' && (
                            <button
                              onClick={() => handleStatusChange(estimation.id, 'en_cours')}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                              title="Marquer en cours"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {estimation.status !== 'estimé' && (
                            <button
                              onClick={() => handleStatusChange(estimation.id, 'estimé')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400"
                              title="Marquer comme estimé"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {estimation.status !== 'archivé' && (
                            <button
                              onClick={() => handleStatusChange(estimation.id, 'archivé')}
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
        {selectedEstimation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Détail de la demande d'estimation
                  </h3>
                  <button
                    onClick={() => setSelectedEstimation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations contact */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Contact</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nom complet
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedEstimation.prenom} {selectedEstimation.nom}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedEstimation.email}
                      </div>
                    </div>
                    
                    {selectedEstimation.telephone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Téléphone
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {selectedEstimation.telephone}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type de projet
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedEstimation.type_projet}
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations bien */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Informations du bien</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type de bien
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedEstimation.type_bien}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Adresse
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedEstimation.adresse}<br />
                        {selectedEstimation.code_postal} {selectedEstimation.ville}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Surface habitable
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {selectedEstimation.surface_habitable} m²
                        </div>
                      </div>
                      
                      {selectedEstimation.surface_terrain && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Surface terrain
                          </label>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {selectedEstimation.surface_terrain} m²
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {selectedEstimation.nombre_pieces && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pièces
                          </label>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {selectedEstimation.nombre_pieces}
                          </div>
                        </div>
                      )}
                      
                      {selectedEstimation.nombre_chambres && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Chambres
                          </label>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {selectedEstimation.nombre_chambres}
                          </div>
                        </div>
                      )}
                      
                      {selectedEstimation.annee_construction && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Année
                          </label>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {selectedEstimation.annee_construction}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedEstimation.description && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description / Commentaires
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded border whitespace-pre-wrap">
                      {selectedEstimation.description}
                    </div>
                  </div>
                )}
                
                {/* Statut et dates */}
                <div className="flex gap-6 mt-6 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Statut
                    </label>
                    <div>{getStatusBadge(selectedEstimation.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date de demande
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedEstimation.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedEstimation(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <a
                    href={`mailto:${selectedEstimation.email}?subject=Estimation de votre bien immobilier`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Contacter par email
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