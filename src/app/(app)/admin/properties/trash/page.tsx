'use client'

import { useState, useEffect } from 'react'
import { getDeletedProperties, restoreProperty, permanentDeleteProperty, bulkPermanentDeleteProperties, bulkRestoreProperties } from '@/lib/supabase/properties'
import { Property } from '@/lib/supabase/types'
import { Button } from '@/shared/Button'
import { TrashIcon, ArrowUturnLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Heading } from '@/shared/Heading'
import { cleanImageUrl } from '@/utils/imageUtils'

const TrashContent = () => {
  const [deletedProperties, setDeletedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    loadDeletedProperties()
  }, [])

  const loadDeletedProperties = async () => {
    setLoading(true)
    try {
      const properties = await getDeletedProperties()
      setDeletedProperties(properties)
    } catch (error) {
      console.error('Error loading deleted properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    setActionLoading(id)
    try {
      await restoreProperty(id)
      setDeletedProperties(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error restoring property:', error)
      alert('Erreur lors de la restauration')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette propriété ? Cette action est irréversible.')) {
      return
    }

    setActionLoading(id)
    try {
      await permanentDeleteProperty(id)
      setDeletedProperties(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error permanently deleting property:', error)
      alert('Erreur lors de la suppression définitive')
    } finally {
      setActionLoading(null)
    }
  }

  // Gestion de la sélection
  const handleSelectAll = () => {
    if (selectedIds.length === deletedProperties.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(deletedProperties.map(p => p.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  // Actions bulk
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Restaurer ${selectedIds.length} propriété${selectedIds.length > 1 ? 's' : ''} ?`)) {
      return
    }

    setBulkActionLoading(true)
    try {
      await bulkRestoreProperties(selectedIds)
      setDeletedProperties(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
    } catch (error) {
      console.error('Error bulk restoring properties:', error)
      alert('Erreur lors de la restauration')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    const idsToDelete = selectedIds.length > 0 ? selectedIds : deletedProperties.map(p => p.id)
    const actionText = selectedIds.length > 0 
      ? `supprimer définitivement ${selectedIds.length} propriété${selectedIds.length > 1 ? 's' : ''} sélectionnée${selectedIds.length > 1 ? 's' : ''}`
      : `vider complètement la corbeille (${deletedProperties.length} propriété${deletedProperties.length > 1 ? 's' : ''})`

    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} ? Cette action est irréversible.`)) {
      return
    }

    setBulkActionLoading(true)
    try {
      await bulkPermanentDeleteProperties(idsToDelete)
      setDeletedProperties(prev => prev.filter(p => !idsToDelete.includes(p.id)))
      setSelectedIds([])
    } catch (error) {
      console.error('Error bulk deleting properties:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout currentPage="properties">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="properties">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Corbeille</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {deletedProperties.length} propriété{deletedProperties.length > 1 ? 's' : ''} supprimée{deletedProperties.length > 1 ? 's' : ''}
              {selectedIds.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {deletedProperties.length > 0 && (
              <>
                {selectedIds.length > 0 && (
                  <>
                    <Button
                      onClick={handleBulkRestore}
                      disabled={bulkActionLoading}
                      className="flex items-center gap-2"
                      color="success"
                    >
                      <ArrowUturnLeftIcon className="h-4 w-4" />
                      Restaurer la sélection
                    </Button>
                    <Button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="flex items-center gap-2"
                      color="danger"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Supprimer la sélection
                    </Button>
                  </>
                )}
                {selectedIds.length === 0 && (
                  <Button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-2"
                    color="danger"
                    outline
                  >
                    <TrashIcon className="h-4 w-4" />
                    Vider la corbeille
                  </Button>
                )}
              </>
            )}
            <Button href="/admin/properties" outline>
              Retour aux propriétés
            </Button>
          </div>
        </div>

        {deletedProperties.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl">
            <TrashIcon className="mx-auto h-12 w-12 text-neutral-400" />
            <h2 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
              Aucune propriété dans la corbeille
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Les propriétés supprimées apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 shadow rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider w-16">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === deletedProperties.length && deletedProperties.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Propriété
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Supprimé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {deletedProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(property.id)}
                        onChange={() => handleSelectItem(property.id)}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.featured_image && (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={cleanImageUrl(property.featured_image)}
                            alt={property.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {property.title}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {property.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-200">
                        {property.property_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {property.price.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                      {property.deleted_at && formatDate(property.deleted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleRestore(property.id)}
                        disabled={actionLoading === property.id}
                        className="inline-flex items-center px-3 py-1 text-xs"
                        color="success"
                      >
                        <ArrowUturnLeftIcon className="h-3 w-3 mr-1" />
                        Restaurer
                      </Button>
                      <Button
                        onClick={() => handlePermanentDelete(property.id)}
                        disabled={actionLoading === property.id}
                        className="inline-flex items-center px-3 py-1 text-xs"
                        color="danger"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function TrashPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TrashContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}