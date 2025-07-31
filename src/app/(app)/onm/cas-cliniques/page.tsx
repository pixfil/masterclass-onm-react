'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ONMCasClinicquesPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/cas-cliniques')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirection vers Cas Cliniques...</p>
      </div>
    </div>
  )
}