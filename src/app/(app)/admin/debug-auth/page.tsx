'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { supabase } from '@/lib/supabaseClient'

const DebugAuthContent = () => {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('philippe@gclicke.com')

  useEffect(() => {
    checkSupabaseAuth()
  }, [])

  const checkSupabaseAuth = async () => {
    try {
      // Vérifier l'utilisateur Supabase directement côté client
      const { data: { user }, error } = await supabase.auth.getUser()
      
      // Vérifier la session
      const { data: { session } } = await supabase.auth.getSession()
      
      setAuthState({
        user,
        session,
        error,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erreur Supabase:', error)
      setAuthState({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const testSuperAdminCheck = async () => {
    if (!testEmail) return
    
    try {
      const response = await fetch('/api/admin/check-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: testEmail })
      })
      
      const result = await response.json()
      alert(`Test pour ${testEmail}:\n${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="debug">
        <div className="p-6">
          <Heading as="h1">Debug Auth - Chargement...</Heading>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="debug">
      <div className="space-y-6">
        <Heading as="h1">Debug Auth - État Supabase</Heading>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">État d'authentification Supabase (côté client)</h3>
          
          {authState?.user ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-4">
              <p className="text-green-800 dark:text-green-300 font-medium">
                ✅ Utilisateur connecté !
              </p>
              <p className="text-sm mt-2">
                <strong>Email:</strong> {authState.user.email}
              </p>
              <p className="text-sm">
                <strong>ID:</strong> {authState.user.id}
              </p>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-4">
              <p className="text-red-800 dark:text-red-300 font-medium">
                ❌ Aucun utilisateur connecté
              </p>
            </div>
          )}
          
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded p-4">
            <h4 className="font-medium mb-2">Détails bruts:</h4>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Test Super Admin</h3>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email à tester
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
            <button
              onClick={testSuperAdminCheck}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Tester
            </button>
          </div>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Testez différents emails pour voir si la vérification super admin fonctionne
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Actions</h3>
          
          <div className="flex gap-4">
            <button
              onClick={checkSupabaseAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recharger l'état auth
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Aller à la connexion
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function DebugAuthPage() {
  return <DebugAuthContent />
}