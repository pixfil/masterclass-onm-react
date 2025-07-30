'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import AvatarDropdown from './AvatarDropdown'
import { Button } from '@/shared/Button'

interface Props {
  className?: string
}

export default function AuthButton({ className }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
      </div>
    )
  }

  if (user) {
    // Utilisateur connecté - afficher le dropdown avatar
    return <AvatarDropdown className={className} user={user} />
  }

  // Utilisateur non connecté - afficher le bouton de connexion
  return (
    <div className={className}>
      <Link href="/connexion">
        <Button size="sm" className="h-8">
          Se connecter
        </Button>
      </Link>
    </div>
  )
}