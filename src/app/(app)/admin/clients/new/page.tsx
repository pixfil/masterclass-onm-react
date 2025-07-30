'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClientForm } from '@/components/admin/ClientForm'

const NewClientContent = () => {
  return (
    <AdminLayout currentPage="clients">
      <ClientForm />
    </AdminLayout>
  )
}

export default function NewClientPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <NewClientContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}