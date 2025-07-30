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
  CogIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface EmailTemplate {
  id: string
  name: string
  type: 'contact' | 'estimation' | 'newsletter' | 'notification'
  recipient_type: 'client' | 'agent' | 'admin'
  subject: string
  html_content: string
  is_active: boolean
  variables: Record<string, string>
  created_at: string
  updated_at: string
}

const EmailTemplatesContent = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  // TODO: Remplacer par de vraies données depuis Supabase
  useEffect(() => {
    // Simulation de données
    setTimeout(() => {
      setTemplates([
        {
          id: '1',
          name: 'Contact - Notification Agent',
          type: 'contact',
          recipient_type: 'agent',
          subject: 'Nouvelle demande de contact - {{property_title}}',
          html_content: '<h2>Nouvelle demande de contact</h2><p>Bonjour {{agent_name}},</p><p>Vous avez reçu une nouvelle demande de contact...</p>',
          is_active: true,
          variables: {
            agent_name: 'Nom de l\'agent',
            property_title: 'Titre du bien',
            client_name: 'Nom du client'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Contact - Confirmation Client',
          type: 'contact',
          recipient_type: 'client',
          subject: 'Confirmation de votre demande de contact',
          html_content: '<h2>Confirmation de votre demande</h2><p>Bonjour {{client_name}},</p><p>Nous avons bien reçu votre demande...</p>',
          is_active: true,
          variables: {
            client_name: 'Nom du client',
            property_title: 'Titre du bien'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Estimation - Notification Agent',
          type: 'estimation',
          recipient_type: 'agent',
          subject: 'Nouvelle demande d\'estimation - {{city}}',
          html_content: '<h2>Nouvelle demande d\'estimation</h2><p>Bonjour {{agent_name}},</p><p>Vous avez reçu une nouvelle demande d\'estimation...</p>',
          is_active: true,
          variables: {
            agent_name: 'Nom de l\'agent',
            client_name: 'Nom du client',
            city: 'Ville'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: 'Estimation - Confirmation Client',
          type: 'estimation',
          recipient_type: 'client',
          subject: 'Confirmation de votre demande d\'estimation',
          html_content: '<h2>Confirmation de votre demande d\'estimation</h2><p>Bonjour {{client_name}},</p><p>Nous avons bien reçu votre demande...</p>',
          is_active: true,
          variables: {
            client_name: 'Nom du client',
            city: 'Ville'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeBadge = (type: string) => {
    const styles = {
      contact: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      estimation: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      newsletter: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      notification: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    }
    
    const labels = {
      contact: 'Contact',
      estimation: 'Estimation',
      newsletter: 'Newsletter',
      notification: 'Notification'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    )
  }

  const getRecipientIcon = (recipient_type: string) => {
    if (recipient_type === 'client') {
      return <UserIcon className="h-4 w-4 text-blue-500" title="Client" />
    } else if (recipient_type === 'agent') {
      return <CogIcon className="h-4 w-4 text-green-500" title="Agent" />
    } else {
      return <CogIcon className="h-4 w-4 text-purple-500" title="Admin" />
    }
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
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Nouveau modèle
          </Button>
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
              onClick={() => setFilter('contact')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'contact' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Contact ({templates.filter(t => t.type === 'contact').length})
            </button>
            <button
              onClick={() => setFilter('estimation')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'estimation' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Estimation ({templates.filter(t => t.type === 'estimation').length})
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
                      <DocumentTextIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeBadge(template.type)}
                        {getRecipientIcon(template.recipient_type)}
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

                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Variables disponibles :
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(template.variables).map((variable) => (
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
                    <button
                      className="text-primary-600 hover:text-primary-900 p-1 rounded"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
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
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Créer le premier modèle
            </Button>
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