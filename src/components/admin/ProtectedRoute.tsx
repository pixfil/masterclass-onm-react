'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/admin/login')
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push('/admin/login')
      return
    }
  }, [user, loading, isAdmin, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}