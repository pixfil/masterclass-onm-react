'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AccountPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers mon-profil qui est la vraie page de profil
    router.replace('/mon-profil')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}