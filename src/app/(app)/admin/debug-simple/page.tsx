'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'

const DebugSimpleContent = () => {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [adminCheck, setAdminCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    try {
      // D'abord récupérer l'utilisateur côté client avec Supabase
      const supabaseResponse = await fetch('/api/auth/me')
      let currentUser = null
      
      if (supabaseResponse.ok) {
        currentUser = await supabaseResponse.json()
      }

      // Si on a un utilisateur, vérifier son statut super admin
      let adminCheckResult = null
      if (currentUser?.email) {
        const adminResponse = await fetch('/api/admin/check-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: currentUser.email })
        })
        
        if (adminResponse.ok) {
          adminCheckResult = await adminResponse.json()
        }
      } else {
        // Fallback: vérifier avec GET
        const getResponse = await fetch('/api/admin/check-role')
        adminCheckResult = await getResponse.json()
      }

      setAdminCheck(adminCheckResult)

      // Récupérer les infos depuis localStorage s'il y en a
      const savedSettings = localStorage.getItem('adminSettings')
      
      setUserInfo({
        currentUser,
        response: adminCheckResult,
        localStorage: savedSettings ? JSON.parse(savedSettings) : null,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erreur:', error)
      setUserInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="debug">
        <div className="p-6">
          <Heading as="h1">Debug Simple - Chargement...</Heading>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p>Vérification de votre statut d'authentification...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="debug">
      <div className="space-y-6">
        <Heading as="h1">Debug Simple - État brut</Heading>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Réponse API /api/admin/check-role</h3>
          
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded p-4">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(adminCheck, null, 2)}
            </pre>
          </div>
          
          {adminCheck?.isSuperAdmin ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-4">
              <p className="text-green-800 dark:text-green-300 font-medium">
                ✅ Vous êtes reconnu comme Super Admin !
              </p>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-4">
              <p className="text-red-800 dark:text-red-300 font-medium">
                ❌ Vous n'êtes PAS reconnu comme Super Admin
              </p>
              <p className="text-sm mt-2">
                Email détecté: {adminCheck?.userEmail || 'Non détecté'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Informations complètes</h3>
          
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded p-4">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Test manuel</h3>
          
          <button 
            onClick={checkCurrentUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recharger les informations
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function DebugSimplePage() {
  return <DebugSimpleContent />
}