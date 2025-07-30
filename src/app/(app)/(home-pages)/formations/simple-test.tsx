'use client'

import React, { useEffect, useState } from 'react'
import { FormationsService } from '@/lib/supabase/formations'

export default function SimpleFormationsTest() {
  const [formations, setFormations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFormations() {
      try {
        console.log('Début chargement formations...')
        const result = await FormationsService.getFormations()
        console.log('Résultat formations:', result)
        
        if (result.success && result.data) {
          setFormations(result.data)
        } else {
          setError('Erreur lors du chargement des formations')
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur de connexion')
      } finally {
        setLoading(false)
      }
    }

    loadFormations()
  }, [])

  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error}</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Formations</h1>
      <div className="grid gap-4">
        {formations.map((formation) => (
          <div key={formation.id} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">{formation.title}</h3>
            <p className="text-gray-600">{formation.description}</p>
            <p className="font-bold text-primary-600">{formation.price}€</p>
          </div>
        ))}
      </div>
    </div>
  )
}