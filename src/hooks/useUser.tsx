'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useSupabase } from '@/contexts/SupabaseProvider'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return user
}