'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ONMMethodePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/la-methode')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirection vers La Méthode ONM...</p>
      </div>
    </div>
  )
}