'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClientForm } from '@/components/admin/ClientForm'
import { getClientById } from '@/lib/supabase/clients'
import { Client } from '@/lib/supabase/clients'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const EditClientContent = () => {
  const params = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchClient(params.id as string)
    }
  }, [params.id])

  const fetchClient = async (id: string) => {
    try {
      setLoading(true)
      const clientData = await getClientById(id)
      if (clientData) {
        setClient(clientData)
      } else {
        setError('Client non trouvé')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du client:', error)
      setError('Erreur lors du chargement du client')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="clients">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement du client...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !client) {
    return (
      <AdminLayout currentPage="clients">
        <div className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Client non trouvé'}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="clients">
      <ClientForm client={client} isEdit />
    </AdminLayout>
  )
}

export default function EditClientPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EditClientContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}