'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ONMPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/innovation-onm')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirection vers l'Innovation ONM...</p>
      </div>
    </div>
  )
}