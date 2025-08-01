"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import ResourceForm from '@/components/admin/ResourceForm'
import { ResourcesService } from '@/lib/supabase/resources'
import type { Resource } from '@/lib/supabase/types/resources-types'

export default function EditResourcePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResource()
  }, [params.id])

  const fetchResource = async () => {
    const { data } = await ResourcesService.getResourceById(params.id)
    if (data) {
      setResource(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!resource) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Ressource non trouvée</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Modifier la ressource</h1>
          <p className="text-gray-600 mt-2">Modifiez les informations de la ressource</p>
        </div>

        <ResourceForm 
          resource={resource}
          onSuccess={() => router.push('/admin/resources')}
          onCancel={() => router.push('/admin/resources')}
        />
      </div>
    </AdminLayout>
  )
}