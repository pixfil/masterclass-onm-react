import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useAdminRole() {
  const { user } = useAuth()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkAdminRole()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkAdminRole = async () => {
    try {
      setLoading(true)
      
      // Liste des super admins
      const superAdminEmails = [
        'philippe@initiative-immo.fr',
        'admin@initiative-immo.fr',
        'coual.philippe@gmail.com',
        'philippe@gclicke.com'
      ]
      
      // Vérification directe par email (plus fiable)
      const isAdmin = superAdminEmails.includes(user?.email || '')
      setIsSuperAdmin(isAdmin)
      
      // Optionnel: essayer l'API si elle fonctionne
      if (user?.email) {
        try {
          const response = await fetch('/api/admin/check-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: user.email })
          })
          
          if (response.ok) {
            const { isSuperAdmin: apiResult } = await response.json()
            // Utiliser le résultat de l'API si disponible
            setIsSuperAdmin(apiResult)
          }
        } catch (apiError) {
          console.log('API indisponible, utilisation de la vérification locale')
          // Garder la vérification locale en cas d'erreur API
        }
      }
    } catch (error) {
      console.error('Erreur vérification rôle admin:', error)
      // Fallback: vérifier par email
      const superAdminEmails = [
        'philippe@initiative-immo.fr',
        'admin@initiative-immo.fr',
        'coual.philippe@gmail.com',
        'philippe@gclicke.com'
      ]
      setIsSuperAdmin(superAdminEmails.includes(user?.email || ''))
    } finally {
      setLoading(false)
    }
  }

  return {
    isSuperAdmin,
    loading,
    refreshRole: checkAdminRole
  }
}