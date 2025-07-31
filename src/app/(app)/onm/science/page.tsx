'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ONMSciencePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/science-recherche')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirection vers Science & Recherche...</p>
      </div>
    </div>
  )
}