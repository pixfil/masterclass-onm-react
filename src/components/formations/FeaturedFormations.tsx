'use client'

import React, { useEffect, useState } from 'react'
import Heading from '@/shared/Heading'
import FormationCardFeatured from './FormationCardFeatured'
import { FormationsService } from '@/lib/supabase/formations'
import type { Formation } from '@/lib/supabase/formations-types'

const FeaturedFormations = () => {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedFormations()
  }, [])

  const loadFeaturedFormations = async () => {
    try {
      const result = await FormationsService.getFeaturedFormations(3)
      if (result.success && result.data) {
        setFormations(result.data)
      }
    } catch (error) {
      console.error('Erreur chargement formations populaires:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="nc-FeaturedFormations relative py-16">
        <div className="text-center">Chargement des formations populaires...</div>
      </div>
    )
  }

  return (
    <div className="nc-FeaturedFormations relative py-16">
      <Heading
        desc="Les formations les plus appréciées par nos participants"
        isCenter
      >
        Formations populaires
      </Heading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {formations.map((formation, index) => (
          <FormationCardFeatured 
            key={formation.id} 
            formation={formation}
            featured={index === 0}
          />
        ))}
      </div>
    </div>
  )
}

export default FeaturedFormations