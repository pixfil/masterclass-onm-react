'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { PropertyFormFrench } from '@/components/admin/PropertyFormFrench'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const NewPropertyContent = () => {
  return (
    <AdminLayout currentPage="properties">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/properties"
            className="flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </Link>
          <div>
            <Heading as="h2">Ajouter un bien</Heading>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              Créer une nouvelle propriété dans votre portefeuille
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800">
          <PropertyFormFrench />
        </div>
      </div>
    </AdminLayout>
  )
}

export default function NewPropertyPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <NewPropertyContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}