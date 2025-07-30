'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export interface TypeBien {
  name: string
  value: string
  description: string
  count?: number
}

export const useTypesBiens = () => {
  const [typesBiens, setTypesBiens] = useState<TypeBien[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTypesBiens = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('property_type')
          .not('property_type', 'is', null)
          .not('property_type', 'eq', '')

        if (error) {
          console.error('Erreur lors de la récupération des types de biens:', error)
          setError(error.message)
          return
        }

        // Grouper et compter les types de biens
        const typeCounts = data.reduce((acc: Record<string, number>, item: any) => {
          const type = item.property_type?.trim()
          if (type) {
            acc[type] = (acc[type] || 0) + 1
          }
          return acc
        }, {})

        // Convertir en tableau avec descriptions personnalisées
        const getDescription = (typeBien: string): string => {
          switch (typeBien.toLowerCase()) {
            case 'maison':
              return 'Maisons individuelles et familiales'
            case 'appartement':
              return 'Appartements et studios'
            case 'terrain':
              return 'Terrains constructibles et agricoles'
            case 'local commercial':
              return 'Locaux commerciaux et bureaux'
            case 'immeuble':
              return 'Immeubles et copropriétés'
            case 'parking':
              return 'Places de parking et garages'
            default:
              return `${typeBien}s disponibles`
          }
        }

        const typesArray = Object.entries(typeCounts)
          .map(([name, count]) => ({
            name,
            value: name.toLowerCase().replace(/\s+/g, '_'),
            description: getDescription(name),
            count: count as number
          }))
          .sort((a, b) => b.count - a.count)

        setTypesBiens(typesArray)
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur lors de la récupération des types de biens')
      } finally {
        setLoading(false)
      }
    }

    fetchTypesBiens()
  }, [])

  return { typesBiens, loading, error }
}