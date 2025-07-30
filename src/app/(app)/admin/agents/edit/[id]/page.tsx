'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AgentForm } from '@/components/admin/AgentForm'
import { getAgentById } from '@/lib/supabase/agents'
import { AgentImmobilier } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const EditAgentContent = () => {
  const params = useParams()
  const [agent, setAgent] = useState<AgentImmobilier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchAgent(params.id as string)
    }
  }, [params.id])

  const fetchAgent = async (id: string) => {
    try {
      setLoading(true)
      const agentData = await getAgentById(id)
      if (agentData) {
        setAgent(agentData)
      } else {
        setError('Agent non trouvé')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'agent:', error)
      setError('Erreur lors du chargement de l\'agent')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="agents">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement de l'agent...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !agent) {
    return (
      <AdminLayout currentPage="agents">
        <div className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Agent non trouvé'}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="agents">
      <AgentForm agent={agent} isEdit />
    </AdminLayout>
  )
}

export default function EditAgentPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EditAgentContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}