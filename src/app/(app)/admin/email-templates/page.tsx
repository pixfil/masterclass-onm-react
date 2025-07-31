'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  UserIcon,
  CogIcon,
  EnvelopeIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { EmailTemplatesService } from '@/lib/supabase/email-templates'
import { EmailTemplate, EMAIL_TEMPLATE_TYPES_LABELS, EmailTemplateType } from '@/lib/supabase/email-templates-types'

const EmailTemplatesContent = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<EmailTemplateType | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = filter ? { type: filter as EmailTemplateType } : {}
        const data = await EmailTemplatesService.getEmailTemplates(filters)
        setTemplates(data)
      } catch (err) {
        console.error('Erreur chargement templates:', err)
        setError('Erreur lors du chargement des modèles d\'emails')
        // En cas d'erreur, afficher des templates par défaut pour ONM formations
        setTemplates([
          {
            id: '1',
            name: 'Confirmation de commande - Client',
            type: 'order_confirmation_client',
            subject: 'Confirmation de votre inscription - {{formation.title}}',
            content: '<h2>Merci pour votre inscription !</h2><p>Bonjour {{user.first_name}},</p><p>Nous confirmons votre inscription à la formation "<strong>{{formation.title}}</strong>".</p><p><strong>Détails de la session :</strong></p><ul><li>Date : {{session.start_date}}</li><li>Lieu : {{session.city}} - {{session.venue}}</li><li>Adresse : {{session.address}}</li></ul><p>Montant total : {{order.total}} €</p><p>À bientôt pour cette formation !</p>',
            description: 'Email envoyé au client après validation de sa commande',
            variables: [],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: 'system',
            is_html: true,
            auto_send: true
          },
          {
            id: '2', 
            name: 'Rappel de formation',
            type: 'formation_reminder',
            subject: 'Rappel : Formation {{formation.title}} dans 7 jours',
            content: '<h2>Rappel de formation</h2><p>Bonjour {{user.first_name}},</p><p>Nous vous rappelons que vous êtes inscrit(e) à la formation "<strong>{{formation.title}}</strong>" qui aura lieu dans 7 jours.</p><p><strong>Informations pratiques :</strong></p><ul><li>Date : {{session.start_date}}</li><li>Horaire : 9h00 - 17h30</li><li>Lieu : {{session.city}} - {{session.venue}}</li><li>Adresse : {{session.address}}</li></ul><p>N\'oubliez pas d\'apporter votre matériel et de vous présenter 15 minutes avant le début.</p><p>À très bientôt !</p>',
            description: 'Rappel automatique envoyé 7 jours avant la formation',
            variables: [],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: 'system',
            is_html: true,
            auto_send: true,
            send_delay: 10080 // 7 jours en minutes
          },
          {
            id: '3',
            name: 'Enquête de satisfaction',
            type: 'satisfaction_survey',
            subject: 'Votre avis sur la formation {{formation.title}}',
            content: '<h2>Votre avis nous intéresse</h2><p>Bonjour {{user.first_name}},</p><p>Vous venez de terminer la formation "<strong>{{formation.title}}</strong>" et nous espérons qu\'elle vous a plu !</p><p>Pour nous aider à améliorer nos formations, pourriez-vous prendre quelques minutes pour répondre à notre enquête de satisfaction ?</p><p><a href="{{site.url}}/satisfaction/{{order.id}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">Donner mon avis</a></p><p>Merci pour votre participation et à bientôt pour de nouvelles formations !</p>',
            description: 'Enquête de satisfaction envoyée après la formation',
            variables: [],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: 'system',
            is_html: true,
            auto_send: true,
            send_delay: 1440 // 1 jour après la formation
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [filter])

  const getTypeBadge = (type: EmailTemplateType) => {
    const styles: Record<EmailTemplateType, string> = {
      order_confirmation_client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      order_confirmation_admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      formation_schedule: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      pre_questionnaire: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      formation_reminder: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      formation_completion: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      satisfaction_survey: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      certificate_delivery: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      payment_confirmation: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
      payment_failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refund_notification: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      welcome: 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400',
      password_reset: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400',
      account_activation: 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-400',
      newsletter: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400',
      promotion: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
        {EMAIL_TEMPLATE_TYPES_LABELS[type]}
      </span>
    )
  }

  const getTypeIcon = (type: EmailTemplateType) => {
    const iconMap: Record<EmailTemplateType, any> = {
      order_confirmation_client: CheckCircleIcon,
      order_confirmation_admin: DocumentTextIcon,
      formation_schedule: CalendarIcon,
      pre_questionnaire: DocumentTextIcon,
      formation_reminder: CalendarIcon,
      formation_completion: AcademicCapIcon,
      satisfaction_survey: DocumentTextIcon,
      certificate_delivery: AcademicCapIcon,
      payment_confirmation: CheckCircleIcon,
      payment_failed: XCircleIcon,
      refund_notification: DocumentTextIcon,
      welcome: UserIcon,
      password_reset: CogIcon,
      account_activation: CheckCircleIcon,
      newsletter: EnvelopeIcon,
      promotion: EnvelopeIcon,
      custom: DocumentTextIcon
    }
    
    const IconComponent = iconMap[type] || DocumentTextIcon
    return <IconComponent className="h-5 w-5 text-primary-600 dark:text-primary-400" />
  }

  const filteredTemplates = templates.filter(template => 
    !filter || template.type === filter
  )

  return (
    <AdminLayout currentPage="email-templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Modèles d'emails</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez les modèles d'emails envoyés automatiquement
            </p>
          </div>
          <Link href="/admin/email-templates/edit/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Nouveau modèle
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === '' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Tous ({templates.length})
            </button>
            <button
              onClick={() => setFilter('order_confirmation_client')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'order_confirmation_client' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Commandes ({templates.filter(t => t.type.includes('order_confirmation')).length})
            </button>
            <button
              onClick={() => setFilter('formation_reminder')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'formation_reminder' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Formations ({templates.filter(t => t.type.includes('formation')).length})
            </button>
            <button
              onClick={() => setFilter('satisfaction_survey')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'satisfaction_survey' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Satisfaction ({templates.filter(t => t.type === 'satisfaction_survey').length})
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mr-3">
                      {getTypeIcon(template.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeBadge(template.type)}
                        {template.auto_send && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Auto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Objet :
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                    {template.subject}
                  </p>
                </div>

                {template.description && (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg italic">
                      {template.description}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Variables disponibles :
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['user.first_name', 'formation.title', 'session.start_date', 'order.total'].map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded dark:bg-neutral-700 dark:text-neutral-300"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Modifié le {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      className="text-neutral-600 hover:text-neutral-900 p-1 rounded"
                      title="Prévisualiser"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/admin/email-templates/edit/${template.id}`}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredTemplates.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center dark:bg-neutral-800">
            <div className="text-neutral-400 mb-4">
              <DocumentTextIcon className="mx-auto h-12 w-12" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {filter ? `Aucun modèle de type "${filter}" trouvé` : 'Aucun modèle d\'email trouvé'}
            </p>
            <Link href="/admin/email-templates/edit/new">
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Créer le premier modèle
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminEmailTemplatesPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EmailTemplatesContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}