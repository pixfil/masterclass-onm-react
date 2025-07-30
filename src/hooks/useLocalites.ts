'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export interface Localite {
  id: string
  name: string
  count?: number
}

export const useLocalites = (searchTerm?: string) => {
  const [localites, setLocalites] = useState<Localite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocalites = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('properties')
          .select('city')
          .not('city', 'is', null)
          .not('city', 'eq', '')

        if (searchTerm && searchTerm.length > 0) {
          query = query.ilike('city', `%${searchTerm}%`)
        }

        const { data, error } = await query
        
        if (error) {
          console.error('Erreur lors de la récupération des localités:', error)
          setError(error.message || 'Erreur inconnue')
          return
        }

        // Grouper et compter les localités
        const localiteCounts = data.reduce((acc: Record<string, number>, item: any) => {
          const city = item.city?.trim()
          if (city) {
            acc[city] = (acc[city] || 0) + 1
          }
          return acc
        }, {})

        // Convertir en tableau et trier par nombre de propriétés
        const localitesArray = Object.entries(localiteCounts)
          .map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            count: count as number
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10) // Limiter à 10 résultats

        setLocalites(localitesArray)
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur lors de la récupération des localités')
      } finally {
        setLoading(false)
      }
    }

    fetchLocalites()
  }, [searchTerm])

  return { localites, loading, error }
}