'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AgentForm } from '@/components/admin/AgentForm'

const NewAgentContent = () => {
  return (
    <AdminLayout currentPage="agents">
      <AgentForm />
    </AdminLayout>
  )
}

export default function NewAgentPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <NewAgentContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}