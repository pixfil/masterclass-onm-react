'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { PropertyFormFrench } from '@/components/admin/PropertyFormFrench'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getPropertyByIdAdmin } from '@/lib/supabase/properties'
import { Property } from '@/lib/supabase/types'

const EditPropertyContent = () => {
  const params = useParams()
  const propertyId = params.id as string
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const foundProperty = await getPropertyByIdAdmin(propertyId)
        
        if (!foundProperty) {
          setError('Propriété non trouvée')
          return
        }
        
        setProperty(foundProperty)
      } catch (error) {
        console.error('Erreur lors du chargement de la propriété:', error)
        setError('Erreur lors du chargement de la propriété')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  if (loading) {
    return (
      <AdminLayout currentPage="properties">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement de la propriété...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !property) {
    return (
      <AdminLayout currentPage="properties">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error || 'Propriété non trouvée'}</div>
          <Link
            href="/admin/properties"
            className="text-primary-600 hover:text-primary-700"
          >
            Retour à la liste des propriétés
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="properties">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Modifier le bien</Heading>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {property.title}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 border-black rounded-full px-4 py-2 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800">
          <PropertyFormFrench property={property} isEdit={true} />
        </div>
      </div>
    </AdminLayout>
  )
}

export default function EditPropertyPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EditPropertyContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}