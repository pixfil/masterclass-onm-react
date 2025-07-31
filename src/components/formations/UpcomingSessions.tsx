'use client'

import React, { useEffect, useState } from 'react'
import Heading from '@/shared/Heading'
import FormationCardSimple from './FormationCardSimple'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { FormationsService } from '@/lib/supabase/formations'
import type { Formation } from '@/lib/supabase/formations-types'

const UpcomingSessions = () => {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpcomingFormations()
  }, [])

  const loadUpcomingFormations = async () => {
    try {
      // Récupérer les formations actives
      const result = await FormationsService.getFormations({ limit: 6 })
      console.log('Formations récupérées:', result)
      
      if (result.success && result.data) {
        // Afficher toutes les formations actives, même sans dates
        setFormations(result.data)
      }
    } catch (error) {
      console.error('Erreur chargement formations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="nc-UpcomingSessions relative py-16">
        <div className="text-center">Chargement des prochaines formations...</div>
      </div>
    )
  }

  if (formations.length === 0) {
    return (
      <div className="nc-UpcomingSessions relative py-16">
        <Heading
          desc="Inscrivez-vous dès maintenant aux prochaines formations"
          isCenter
        >
          Prochaines formations disponibles
        </Heading>
        <div className="text-center mt-8 text-neutral-600 dark:text-neutral-400">
          Aucune formation disponible pour le moment. Revenez bientôt !
        </div>
      </div>
    )
  }

  return (
    <div className="nc-UpcomingSessions relative py-16">
      <Heading
        desc="Inscrivez-vous dès maintenant aux prochaines formations"
        isCenter
      >
        Prochaines formations disponibles
      </Heading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8 lg:mt-10">
        {formations.map((formation) => (
          <FormationCardSimple key={formation.id} formation={formation} />
        ))}
      </div>

      <div className="flex mt-12 justify-center">
        <ButtonSecondary href="/formations/catalogue">
          Voir toutes les formations
        </ButtonSecondary>
      </div>
    </div>
  )
}

export default UpcomingSessions