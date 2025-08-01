'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { EmailTemplatesService } from '@/lib/supabase/email-templates'
import { 
  EmailTemplate, 
  CreateEmailTemplateData, 
  EMAIL_TEMPLATE_TYPES_LABELS, 
  EmailTemplateType,
  PREDEFINED_VARIABLES 
} from '@/lib/supabase/email-templates-types'

const EmailTemplateEditorContent = () => {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const isNew = templateId === 'new'
  
  const [template, setTemplate] = useState<Partial<CreateEmailTemplateData>>({
    name: '',
    subject: '',
    content: '',
    type: 'order_confirmation_client',
    description: '',
    variables: [],
    is_active: true,
    is_html: true,
    auto_send: false,
    send_delay: 0
  })
  
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{ subject: string; content: string } | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!isNew && templateId) {
      loadTemplate()
    }
  }, [templateId, isNew])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const data = await EmailTemplatesService.getEmailTemplateById(templateId)
      if (data) {
        setTemplate({
          name: data.name,
          subject: data.subject,
          content: data.content,
          type: data.type,
          description: data.description,
          variables: data.variables,
          is_active: data.is_active,
          is_html: data.is_html,
          auto_send: data.auto_send,
          send_delay: data.send_delay
        })
      }
    } catch (error) {
      console.error('Erreur chargement template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!template.subject || !template.content) return
    
    try {
      // Variables d'exemple pour la prévisualisation
      const sampleVariables = {
        'user.first_name': 'Jean',
        'user.last_name': 'Dupont',
        'user.full_name': 'Jean Dupont',
        'user.email': 'jean.dupont@email.com',
        'formation.title': 'Formation ONM Niveau 1',
        'formation.description': 'Introduction à l\'orthodontie neuro-musculaire',
        'formation.price': 2500,
        'formation.instructor': 'Dr. Martin',
        'session.start_date': '15 mars 2025',
        'session.city': 'Paris',
        'session.venue': 'Centre de Formation ONM',
        'session.address': '123 Rue de la Formation, 75001 Paris',
        'order.id': 'ORD-2025-001',
        'order.total': 2500,
        'order.date': '1 février 2025',
        'site.name': 'Masterclass ONM',
        'site.url': 'https://masterclass-onm.com',
        'system.current_date': new Date().toLocaleDateString('fr-FR'),
        'system.current_year': new Date().getFullYear(),
        'site.support_email': 'support@masterclass-onm.com'
      }

      const processedSubject = EmailTemplatesService.processVariables(template.subject, sampleVariables)
      const processedContent = EmailTemplatesService.processVariables(template.content, sampleVariables)
      
      setPreviewData({
        subject: processedSubject,
        content: processedContent
      })
      setPreview(true)
    } catch (error) {
      console.error('Erreur prévisualisation:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setErrors([])

      const validation = EmailTemplatesService.validateTemplate(template)
      if (!validation.valid) {
        setErrors(validation.errors)
        return
      }

      if (isNew) {
        await EmailTemplatesService.createEmailTemplate(template as CreateEmailTemplateData)
      } else {
        await EmailTemplatesService.updateEmailTemplate(templateId, template)
      }

      router.push('/admin/email-templates')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setErrors(['Erreur lors de la sauvegarde'])
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = template.content || ''
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newContent = before + `{{${variableName}}}` + after
      
      setTemplate(prev => ({ ...prev, content: newContent }))
      
      // Remettre le curseur après la variable insérée
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4)
      }, 0)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="email-templates">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="email-templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <Heading as="h2">{isNew ? 'Nouveau modèle' : 'Modifier le modèle'}</Heading>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {isNew ? 'Créez un nouveau modèle d\'email' : 'Modifiez les paramètres du modèle'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handlePreview}
              className="flex items-center space-x-2"
              disabled={!template.subject || !template.content}
            >
              <EyeIcon className="h-4 w-4" />
              <span>Prévisualiser</span>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || !template.name || !template.subject || !template.content}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? 'Sauvegarde...' : (isNew ? 'Créer' : 'Sauvegarder')}
            </Button>
          </div>
        </div>

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreurs de validation</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nom du modèle *
                  </label>
                  <input
                    type="text"
                    value={template.name || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    placeholder="Ex: Confirmation de commande"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={template.type || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, type: e.target.value as EmailTemplateType }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  >
                    {Object.entries(EMAIL_TEMPLATE_TYPES_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={template.description || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  placeholder="Description du modèle"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Objet de l'email *
                </label>
                <input
                  type="text"
                  value={template.subject || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  placeholder="Ex: Confirmation de votre inscription - {{formation.title}}"
                />
              </div>
            </div>

            {/* Contenu */}
            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Contenu de l'email</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Contenu HTML *
                </label>
                <textarea
                  id="content-textarea"
                  value={template.content || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white font-mono text-sm"
                  placeholder="Contenu HTML de l'email..."
                />
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={template.is_active || false}
                      onChange={(e) => setTemplate(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                      Modèle actif
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto_send"
                      checked={template.auto_send || false}
                      onChange={(e) => setTemplate(prev => ({ ...prev, auto_send: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="auto_send" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                      Envoi automatique
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Délai d'envoi (minutes)
                  </label>
                  <input
                    type="number"
                    value={template.send_delay || 0}
                    onChange={(e) => setTemplate(prev => ({ ...prev, send_delay: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    min="0"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Délai avant envoi automatique (0 = immédiat)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Variables */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Variables disponibles</h3>
              
              {Object.entries(PREDEFINED_VARIABLES).map(([category, variables]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                    {category === 'user' ? 'Utilisateur' :
                     category === 'order' ? 'Commande' :
                     category === 'formation' ? 'Formation' :
                     category === 'session' ? 'Session' :
                     category === 'system' ? 'Système' : category}
                  </h4>
                  <div className="space-y-1">
                    {variables.map((variable) => (
                      <button
                        key={variable.id}
                        onClick={() => insertVariable(variable.name)}
                        className="block w-full text-left px-2 py-1 text-xs bg-neutral-100 hover:bg-blue-100 rounded border border-transparent hover:border-blue-200 dark:bg-neutral-700 dark:hover:bg-blue-900/20 dark:text-neutral-300"
                        title={variable.description}
                      >
                        {`{{${variable.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {preview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden dark:bg-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold">Prévisualisation</h3>
              <button
                onClick={() => setPreview(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Objet :
                </label>
                <div className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-lg">
                  {previewData.subject}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Contenu :
                </label>
                <div 
                  className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewData.content }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default function EmailTemplateEditorPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EmailTemplateEditorContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}