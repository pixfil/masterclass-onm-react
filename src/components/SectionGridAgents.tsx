import { AgentImmobilier } from '@/lib/supabase/types'
import { FC } from 'react'
import Image from 'next/image'
import { StarIcon, CheckBadgeIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid'

interface Props {
  className?: string
  agents: AgentImmobilier[]
  gridClassName?: string
}

const AgentCard: FC<{ agent: AgentImmobilier }> = ({ agent }) => {
  return (
    <div className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
      {/* Photo de profil */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image
          src={agent.photo_agent || '/default-avatar.png'}
          alt={`${agent.prenom} ${agent.nom}`}
          fill
          className="object-cover rounded-full"
          sizes="96px"
        />
        {agent.est_verifie && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
            <CheckBadgeIcon className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Informations de base */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
            {agent.prenom} {agent.nom}
          </h3>
          {agent.est_super_agent && (
            <StarIcon className="h-5 w-5 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center justify-center gap-1 mb-2">
          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {agent.note_moyenne.toFixed(1)}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            ({agent.nombre_avis_agent} avis)
          </span>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {agent.annees_experience} ans d'expérience
        </p>

        {/* Description courte */}
        {agent.description_agent && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
            {agent.description_agent}
          </p>
        )}
      </div>

      {/* Spécialités */}
      {agent.specialites && agent.specialites.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {agent.specialites.slice(0, 2).map((specialite, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
              >
                {specialite}
              </span>
            ))}
            {agent.specialites.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                +{agent.specialites.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        <div className="text-center">
          <div className="font-semibold text-neutral-900 dark:text-white">
            {agent.nombre_proprietes_gerees}
          </div>
          <div>Propriétés</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-neutral-900 dark:text-white">
            {agent.taux_reponse}%
          </div>
          <div>Réponse</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-neutral-900 dark:text-white text-xs">
            {agent.temps_reponse_moyen}
          </div>
          <div>Délai</div>
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <div className="flex gap-2 justify-center">
          {agent.telephone && (
            <a
              href={`tel:${agent.telephone}`}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              title="Appeler"
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Appeler</span>
            </a>
          )}
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              title="Email"
            >
              <EnvelopeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const SectionGridAgents: FC<Props> = ({
  className = '',
  agents,
  gridClassName = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3',
}) => {
  // Filtrer les agents actifs et en prendre maximum 9
  const activeAgents = agents.filter(agent => agent.est_actif).slice(0, 9)

  return (
    <div className={`relative ${className}`}>
      <div className={`grid gap-6 md:gap-8 ${gridClassName}`}>
        {activeAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
      
      {activeAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">
            Aucun agent disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  )
}

export default SectionGridAgents