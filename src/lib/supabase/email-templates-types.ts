export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: EmailTemplateType
  description?: string
  variables: EmailVariable[]
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  
  // Configuration d'envoi
  sender_name?: string
  sender_email?: string
  reply_to?: string
  
  // Options avancées
  is_html: boolean
  auto_send: boolean
  send_delay?: number // en minutes
  
  // Conditions d'envoi
  conditions?: EmailCondition[]
  
  // Statistiques
  stats?: {
    total_sent: number
    total_opened: number
    total_clicked: number
    bounce_rate: number
    open_rate: number
    click_rate: number
  }
}

export type EmailTemplateType = 
  | 'order_confirmation_client'
  | 'order_confirmation_admin' 
  | 'formation_schedule'
  | 'pre_questionnaire'
  | 'formation_reminder'
  | 'formation_completion'
  | 'satisfaction_survey'
  | 'certificate_delivery'
  | 'payment_confirmation'
  | 'payment_failed'
  | 'refund_notification'
  | 'welcome'
  | 'password_reset'
  | 'account_activation'
  | 'newsletter'
  | 'promotion'
  | 'custom'

export interface EmailVariable {
  id: string
  name: string
  description: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object'
  default_value?: any
  required: boolean
  category: 'user' | 'order' | 'formation' | 'session' | 'system' | 'custom'
}

export interface EmailCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  logic?: 'and' | 'or'
}

export interface EmailLog {
  id: string
  template_id: string
  recipient_email: string
  recipient_name?: string
  subject: string
  content: string
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  error_message?: string
  
  // Métadonnées
  user_id?: string
  order_id?: string
  formation_id?: string
  session_id?: string
  variables_data?: Record<string, any>
  
  created_at: string
}

export interface CreateEmailTemplateData {
  name: string
  subject: string
  content: string
  type: EmailTemplateType
  description?: string
  variables: Omit<EmailVariable, 'id'>[]
  is_active: boolean
  sender_name?: string
  sender_email?: string
  reply_to?: string
  is_html: boolean
  auto_send: boolean
  send_delay?: number
  conditions?: EmailCondition[]
}

export interface EmailTemplateFilters {
  type?: EmailTemplateType
  is_active?: boolean
  search?: string
  created_by?: string
  limit?: number
  offset?: number
}

export interface SendEmailData {
  template_id: string
  recipient_email: string
  recipient_name?: string
  variables_data: Record<string, any>
  
  // Options de priorité
  priority?: 'low' | 'normal' | 'high'
  schedule_at?: string
  
  // Métadonnées pour le tracking
  user_id?: string
  order_id?: string
  formation_id?: string
  session_id?: string
}

// Variables prédéfinies disponibles
export const PREDEFINED_VARIABLES: Record<string, EmailVariable[]> = {
  user: [
    {
      id: 'user_first_name',
      name: 'user.first_name',
      description: 'Prénom de l\'utilisateur',
      type: 'text',
      required: false,
      category: 'user'
    },
    {
      id: 'user_last_name',
      name: 'user.last_name',
      description: 'Nom de famille de l\'utilisateur',
      type: 'text',
      required: false,
      category: 'user'
    },
    {
      id: 'user_email',
      name: 'user.email',
      description: 'Email de l\'utilisateur',
      type: 'text',
      required: false,
      category: 'user'
    },
    {
      id: 'user_full_name',
      name: 'user.full_name',
      description: 'Nom complet de l\'utilisateur',
      type: 'text',
      required: false,
      category: 'user'
    }
  ],
  order: [
    {
      id: 'order_id',
      name: 'order.id',
      description: 'Numéro de commande',
      type: 'text',
      required: false,
      category: 'order'
    },
    {
      id: 'order_total',
      name: 'order.total',
      description: 'Montant total de la commande',
      type: 'number',
      required: false,
      category: 'order'
    },
    {
      id: 'order_date',
      name: 'order.date',
      description: 'Date de la commande',
      type: 'date',
      required: false,
      category: 'order'
    },
    {
      id: 'order_items',
      name: 'order.items',
      description: 'Liste des formations commandées',
      type: 'array',
      required: false,
      category: 'order'
    }
  ],
  formation: [
    {
      id: 'formation_title',
      name: 'formation.title',
      description: 'Titre de la formation',
      type: 'text',
      required: false,
      category: 'formation'
    },
    {
      id: 'formation_description',
      name: 'formation.description',
      description: 'Description de la formation',
      type: 'text',
      required: false,
      category: 'formation'
    },
    {
      id: 'formation_duration',
      name: 'formation.duration',
      description: 'Durée de la formation',
      type: 'text',
      required: false,
      category: 'formation'
    },
    {
      id: 'formation_price',
      name: 'formation.price',
      description: 'Prix de la formation',
      type: 'number',
      required: false,
      category: 'formation'
    },
    {
      id: 'formation_instructor',
      name: 'formation.instructor',
      description: 'Nom du formateur',
      type: 'text',
      required: false,
      category: 'formation'
    }
  ],
  session: [
    {
      id: 'session_start_date',
      name: 'session.start_date',
      description: 'Date de début de la session',
      type: 'date',
      required: false,
      category: 'session'
    },
    {
      id: 'session_end_date',
      name: 'session.end_date',
      description: 'Date de fin de la session',
      type: 'date',
      required: false,
      category: 'session'
    },
    {
      id: 'session_city',
      name: 'session.city',
      description: 'Ville de la session',
      type: 'text',
      required: false,
      category: 'session'
    },
    {
      id: 'session_venue',
      name: 'session.venue',
      description: 'Lieu de la session',
      type: 'text',
      required: false,
      category: 'session'
    },
    {
      id: 'session_address',
      name: 'session.address',
      description: 'Adresse complète de la session',
      type: 'text',
      required: false,
      category: 'session'
    }
  ],
  system: [
    {
      id: 'site_name',
      name: 'site.name',
      description: 'Nom du site (Masterclass ONM)',
      type: 'text',
      default_value: 'Masterclass ONM',
      required: false,
      category: 'system'
    },
    {
      id: 'site_url',
      name: 'site.url',
      description: 'URL du site',
      type: 'text',
      required: false,
      category: 'system'
    },
    {
      id: 'current_date',
      name: 'system.current_date',
      description: 'Date actuelle',
      type: 'date',
      required: false,
      category: 'system'
    },
    {
      id: 'current_year',
      name: 'system.current_year',
      description: 'Année actuelle',
      type: 'number',
      required: false,
      category: 'system'
    },
    {
      id: 'support_email',
      name: 'site.support_email',
      description: 'Email de support',
      type: 'text',
      default_value: 'support@masterclass-onm.com',
      required: false,
      category: 'system'
    }
  ]
}

export const EMAIL_TEMPLATE_TYPES_LABELS: Record<EmailTemplateType, string> = {
  order_confirmation_client: 'Confirmation de commande (Client)',
  order_confirmation_admin: 'Confirmation de commande (Admin)',
  formation_schedule: 'Planning de formation',
  pre_questionnaire: 'Pré-questionnaire',
  formation_reminder: 'Rappel de formation',
  formation_completion: 'Fin de formation',
  satisfaction_survey: 'Enquête de satisfaction',
  certificate_delivery: 'Livraison certificat',
  payment_confirmation: 'Confirmation de paiement',
  payment_failed: 'Échec de paiement',
  refund_notification: 'Notification de remboursement',
  welcome: 'Email de bienvenue',
  password_reset: 'Réinitialisation mot de passe',
  account_activation: 'Activation de compte',
  newsletter: 'Newsletter',
  promotion: 'Email promotionnel',
  custom: 'Email personnalisé'
}