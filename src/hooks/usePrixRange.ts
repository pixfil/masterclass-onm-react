'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export interface PrixRange {
  min: number
  max: number
  mediane: number
}

export const usePrixRange = () => {
  const [prixRange, setPrixRange] = useState<PrixRange>({ min: 0, max: 1000000, mediane: 300000 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrixRange = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('price')
          .not('price', 'is', null)
          .gt('price', 0)

        if (error) {
          console.error('Erreur lors de la récupération des prix:', error)
          setError(error.message)
          return
        }

        if (data && data.length > 0) {
          const prix = data.map(item => item.price).sort((a, b) => a - b)
          const min = prix[0]
          const max = prix[prix.length - 1]
          const mediane = prix[Math.floor(prix.length / 2)]

          setPrixRange({
            min: Math.floor(min),
            max: Math.ceil(max),
            mediane: Math.floor(mediane)
          })
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur lors de la récupération des prix')
      } finally {
        setLoading(false)
      }
    }

    fetchPrixRange()
  }, [])

  return { prixRange, loading, error }
}