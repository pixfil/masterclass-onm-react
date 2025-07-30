'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, onAuthStateChange } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Récupérer l'utilisateur au chargement
    getCurrentUser().then(user => {
      setUser(user)
      checkSuperAdmin(user)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      checkSuperAdmin(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSuperAdmin = async (user: AuthUser | null) => {
    if (!user) {
      setIsSuperAdmin(false)
      return
    }

    try {
      const response = await fetch('/api/admin/check-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email
        })
      })
      
      if (response.ok) {
        const { isSuperAdmin } = await response.json()
        setIsSuperAdmin(isSuperAdmin)
      } else {
        // Fallback: vérifier par email
        const superAdminEmails = [
          'philippe@initiative-immo.fr',
          'admin@initiative-immo.fr',
          'coual.philippe@gmail.com',
          'philippe@gclicke.com',
        ]
        setIsSuperAdmin(superAdminEmails.includes(user.email || ''))
      }
    } catch (error) {
      console.error('Erreur vérification super admin:', error)
      // Fallback: vérifier par email
      const superAdminEmails = [
        'philippe@initiative-immo.fr',
        'admin@initiative-immo.fr',
        'coual.philippe@gmail.com',
        'philippe@gclicke.com',
      ]
      setIsSuperAdmin(superAdminEmails.includes(user.email || ''))
    }
  }

  const isAdmin = user?.role === 'admin' || user?.email === 'philippe@gclicke.com' || isSuperAdmin

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}