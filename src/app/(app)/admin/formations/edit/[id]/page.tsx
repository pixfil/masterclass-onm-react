'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Heading } from '@/shared/Heading'
import { FormationForm } from '@/components/formations/FormationForm'
import { FormationsService } from '@/lib/supabase/formations'
import { Formation } from '@/lib/supabase/formations-types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const EditFormationContent = () => {
  const params = useParams()
  const router = useRouter()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formationId = params.id as string

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        if (formationId === 'new') {
          setFormation(null)
          setLoading(false)
          return
        }

        const result = await FormationsService.getFormationById(formationId)
        if (!result.success || !result.data) {
          setError('Formation non trouvée')
          return
        }

        setFormation(result.data)
      } catch (err) {
        console.error('Erreur lors du chargement de la formation:', err)
        setError('Erreur lors du chargement de la formation')
      } finally {
        setLoading(false)
      }
    }

    fetchFormation()
  }, [formationId])

  const handleSaveSuccess = (savedFormation: Formation) => {
    if (formationId === 'new') {
      router.push(`/admin/formations/edit/${savedFormation.id}`)
    } else {
      setFormation(savedFormation)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="formations">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gradient-to-r from-blue-600 to-cyan-600 transition ease-in-out duration-150">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement de la formation...
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout currentPage="formations">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
                Erreur
              </h3>
              <p className="text-red-600 dark:text-red-300">
                {error}
              </p>
              <div className="mt-4">
                <Link
                  href="/admin/formations"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Retour aux formations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const isNewFormation = formationId === 'new'

  return (
    <AdminLayout currentPage="formations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/formations"
              className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour
            </Link>
            <div>
              <Heading as="h1" className="text-2xl">
                {isNewFormation ? 'Nouvelle formation' : `Éditer: ${formation?.title || 'Formation'}`}
              </Heading>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {isNewFormation 
                  ? 'Créer une nouvelle formation en orthodontie neuro-musculaire'
                  : 'Modifier les détails de cette formation'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg">
          <FormationForm 
            formation={formation}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export default function EditFormationPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EditFormationContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}