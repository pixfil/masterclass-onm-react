'use client'

import { useState, useEffect } from 'react'
import { Heading } from '@/shared/Heading'
import { getActiveAgents } from '@/lib/supabase/agents'
import { AgentImmobilier } from '@/lib/supabase/types'
import Image from 'next/image'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline'

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentImmobilier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const data = await getActiveAgents()
      setAgents(data)
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Heading as="h1" className="mb-4">
          Notre équipe d'experts
        </Heading>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Découvrez les professionnels de l'immobilier qui vous accompagnent dans vos projets
        </p>
      </div>

      {/* Agents Grid */}
      {agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 dark:bg-neutral-800"
            >
              {/* Photo */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                {agent.photo_url ? (
                  <Image
                    src={agent.photo_url}
                    alt={`${agent.prenom} ${agent.nom}`}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary-600">
                      {agent.prenom?.[0]}{agent.nom?.[0]}
                    </span>
                  </div>
                )}
                {agent.specialiste && (
                  <div className="absolute -top-1 -right-1">
                    <StarIcon className="h-6 w-6 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
                  {agent.prenom} {agent.nom}
                  {agent.certifie && (
                    <CheckBadgeIcon className="h-5 w-5 text-primary-600" />
                  )}
                </h3>
                {agent.titre && (
                  <p className="text-primary-600 font-medium mt-1">{agent.titre}</p>
                )}
                {agent.specialites && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {agent.specialites}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-3 text-sm">
                {agent.email && (
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <EnvelopeIcon className="h-4 w-4 mr-3 text-primary-600" />
                    <a 
                      href={`mailto:${agent.email}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {agent.email}
                    </a>
                  </div>
                )}
                
                {agent.telephone && (
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <PhoneIcon className="h-4 w-4 mr-3 text-primary-600" />
                    <a 
                      href={`tel:${agent.telephone}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {agent.telephone}
                    </a>
                  </div>
                )}

                {agent.secteur_geographical && (
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <MapPinIcon className="h-4 w-4 mr-3 text-primary-600" />
                    <span>{agent.secteur_geographical}</span>
                  </div>
                )}
              </div>

              {/* Biographie courte */}
              {agent.biographie && (
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    {agent.biographie}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-neutral-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.12l-.075.082A5.967 5.967 0 0112 18c-1.657 0-3.157-.672-4.24-1.757a3 3 0 00-5.196 2.12V20h5" />
            </svg>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Aucun agent disponible pour le moment
          </p>
        </div>
      )}
    </div>
  )
}