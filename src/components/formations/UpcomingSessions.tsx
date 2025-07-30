'use client'

import React, { useEffect, useState } from 'react'
import Heading from '@/shared/Heading'
import FormationCard from './FormationCard'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { SessionsService } from '@/lib/supabase/sessions'
import type { FormationSession } from '@/lib/supabase/formations-types'

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState<FormationSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpcomingSessions()
  }, [])

  const loadUpcomingSessions = async () => {
    try {
      const result = await SessionsService.getUpcomingSessions(6)
      if (result.success && result.data) {
        setSessions(result.data)
      }
    } catch (error) {
      console.error('Erreur chargement sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="nc-UpcomingSessions relative py-16">
        <div className="text-center">Chargement des prochaines sessions...</div>
      </div>
    )
  }

  return (
    <div className="nc-UpcomingSessions relative py-16">
      <Heading
        desc="Inscrivez-vous dès maintenant aux prochaines sessions"
        isCenter
      >
        Prochaines sessions disponibles
      </Heading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8 lg:mt-10">
        {sessions.map((session) => (
          <FormationCard key={session.id} session={session} />
        ))}
      </div>

      <div className="flex mt-12 justify-center">
        <ButtonSecondary href="/formations/sessions">
          Voir toutes les sessions
        </ButtonSecondary>
      </div>
    </div>
  )
}

export default UpcomingSessions