'use client'

import React, { useEffect, useState } from 'react'
import Heading from '@/shared/Heading'
import FormationCardFeatured from './FormationCardFeatured'
import FormationCalendar from './FormationCalendar'
import { FormationsService } from '@/lib/supabase/formations'
import type { Formation } from '@/lib/supabase/formations-types'
import { CalendarIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Switch } from '@/shared/switch'

const FeaturedFormations = () => {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    loadFeaturedFormations()
  }, [])

  const loadFeaturedFormations = async () => {
    try {
      const result = await FormationsService.getFormations({ 
        limit: 9,
        sort_by: 'rating_desc'
      })
      if (result.success && result.data) {
        // Filtrer les formations qui ont des dates
        const formationsWithDates = result.data.filter(f => f.start_date || f.end_date)
        setFormations(formationsWithDates.length > 0 ? formationsWithDates : result.data)
      }
    } catch (error) {
      console.error('Erreur chargement formations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="nc-FeaturedFormations relative py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="nc-FeaturedFormations relative py-16">
      <div className="flex flex-wrap items-center justify-between mb-10">
        <Heading
          desc="Les formations les plus appréciées par nos participants"
        >
          Formations disponibles
        </Heading>

        {/* Toggle Vue */}
        <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-full px-6 py-3 shadow-lg border border-neutral-200 dark:border-neutral-700">
          <ListBulletIcon className={`w-5 h-5 transition-colors ${viewMode === 'list' ? 'text-blue-600' : 'text-neutral-400'}`} />
          <Switch
            checked={viewMode === 'calendar'}
            onChange={(checked) => setViewMode(checked ? 'calendar' : 'list')}
            color="blue"
          />
          <CalendarIcon className={`w-5 h-5 transition-colors ${viewMode === 'calendar' ? 'text-blue-600' : 'text-neutral-400'}`} />
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {formations.map((formation, index) => (
            <FormationCardFeatured 
              key={formation.id} 
              formation={formation}
              featured={index === 0}
            />
          ))}
        </div>
      ) : (
        <FormationCalendar formations={formations} />
      )}
    </div>
  )
}

export default FeaturedFormations