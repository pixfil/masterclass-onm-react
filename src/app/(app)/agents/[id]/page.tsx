'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { getAgentById } from '@/lib/supabase/agents'
import { AgentImmobilier } from '@/lib/supabase/types'
import Image from 'next/image'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = params.id as string
  const [agent, setAgent] = useState<AgentImmobilier | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (agentId) {
      fetchAgent()
    }
  }, [agentId])

  const fetchAgent = async () => {
    try {
      setLoading(true)
      const data = await getAgentById(agentId)
      if (data) {
        setAgent(data)
      } else {
        setNotFound(true)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'agent:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="flex items-center mb-8">
            <div className="h-6 w-6 bg-neutral-200 rounded mr-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-32"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto md:mx-0"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !agent) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <div className="text-neutral-400 mb-4">
            <UserIcon className="mx-auto h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Agent introuvable
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            L'agent que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link href="/agents">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour à l'équipe
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link 
          href="/agents" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'équipe
        </Link>
      </div>

      {/* Agent Details */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Photo */}
              <div className="relative w-32 h-32 flex-shrink-0">
                {agent.photo_url ? (
                  <Image
                    src={agent.photo_url}
                    alt={`${agent.prenom} ${agent.nom}`}
                    fill
                    className="rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-3xl font-bold text-blue-600">
                      {agent.prenom?.[0]}{agent.nom?.[0]}
                    </span>
                  </div>
                )}
                {agent.specialiste && (
                  <div className="absolute -top-2 -right-2">
                    <StarIcon className="h-8 w-8 text-yellow-400 fill-current" />
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="text-center md:text-left text-white flex-1">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                  {agent.prenom} {agent.nom}
                  {agent.certifie && (
                    <CheckBadgeIcon className="h-6 w-6 text-white" />
                  )}
                </h1>
                {agent.titre && (
                  <p className="text-xl text-blue-100 mb-4">{agent.titre}</p>
                )}
                {agent.specialites && (
                  <p className="text-blue-200 mb-6">{agent.specialites}</p>
                )}

                {/* Contact rapide */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      Contacter
                    </a>
                  )}
                  {agent.telephone && (
                    <a
                      href={`tel:${agent.telephone}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      Appeler
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations détaillées */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                  Informations de contact
                </h2>
                <div className="space-y-4">
                  {agent.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-4" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Email</p>
                        <a 
                          href={`mailto:${agent.email}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {agent.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {agent.telephone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-blue-600 mr-4" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Téléphone</p>
                        <a 
                          href={`tel:${agent.telephone}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {agent.telephone}
                        </a>
                      </div>
                    </div>
                  )}

                  {agent.secteur_geographical && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-blue-600 mr-4" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Secteur</p>
                        <p className="text-neutral-600 dark:text-neutral-400">{agent.secteur_geographical}</p>
                      </div>
                    </div>
                  )}

                  {agent.created_at && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-blue-600 mr-4" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Membre depuis</p>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {new Date(agent.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Biographie */}
              {agent.biographie && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                    À propos
                  </h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {agent.biographie}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Badges et certifications */}
            {(agent.specialiste || agent.certifie) && (
              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Certifications et spécialités
                </h3>
                <div className="flex flex-wrap gap-3">
                  {agent.specialiste && (
                    <span className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <StarIcon className="h-4 w-4 mr-2" />
                      Spécialiste
                    </span>
                  )}
                  {agent.certifie && (
                    <span className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      <CheckBadgeIcon className="h-4 w-4 mr-2" />
                      Certifié
                    </span>
                  )}
                  {agent.est_actif && (
                    <span className="inline-flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Disponible
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}