"use client"

import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import ResourceForm from '@/components/admin/ResourceForm'

export default function NewResourcePage() {
  const router = useRouter()

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle ressource</h1>
          <p className="text-gray-600 mt-2">Ajoutez une nouvelle ressource pédagogique</p>
        </div>

        <ResourceForm 
          onSuccess={() => router.push('/admin/resources')}
          onCancel={() => router.push('/admin/resources')}
        />
      </div>
    </AdminLayout>
  )
}