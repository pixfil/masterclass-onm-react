import { supabase } from '../supabaseClient'
import { 
  EmailTemplate, 
  EmailLog,
  CreateEmailTemplateData,
  EmailTemplateFilters,
  SendEmailData,
  EmailVariable,
  PREDEFINED_VARIABLES
} from './email-templates-types'

export class EmailTemplatesService {
  
  // Créer un nouveau template d'email
  static async createEmailTemplate(data: CreateEmailTemplateData): Promise<EmailTemplate> {
    const templateData = {
      ...data,
      variables: data.variables.map((variable, index) => ({
        ...variable,
        id: `var_${Date.now()}_${index}`
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from('email_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      console.error('Erreur création template email:', error)
      throw new Error('Erreur lors de la création du template email')
    }

    return result
  }

  // Récupérer tous les templates avec filtres
  static async getEmailTemplates(filters: EmailTemplateFilters = {}): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)
    }

    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur récupération templates:', error)
      throw new Error('Erreur lors de la récupération des templates')
    }

    return data || []
  }

  // Récupérer un template par ID
  static async getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erreur récupération template:', error)
      throw new Error('Erreur lors de la récupération du template')
    }

    return data
  }

  // Récupérer un template par type
  static async getEmailTemplateByType(type: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erreur récupération template par type:', error)
      return null
    }

    return data
  }

  // Mettre à jour un template
  static async updateEmailTemplate(id: string, updates: Partial<CreateEmailTemplateData>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour template:', error)
      throw new Error('Erreur lors de la mise à jour du template')
    }

    return data
  }

  // Supprimer un template
  static async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression template:', error)
      throw new Error('Erreur lors de la suppression du template')
    }
  }

  // Dupliquer un template
  static async duplicateEmailTemplate(id: string, newName: string): Promise<EmailTemplate> {
    const original = await this.getEmailTemplateById(id)
    
    if (!original) {
      throw new Error('Template original non trouvé')
    }

    const { id: originalId, created_at, updated_at, stats, ...duplicateData } = original

    return this.createEmailTemplate({
      ...duplicateData,
      name: newName,
      is_active: false // Nouveau template inactif par défaut
    })
  }

  // Prévisualiser un email avec des variables
  static async previewEmail(templateId: string, variablesData: Record<string, any>): Promise<{ subject: string; content: string }> {
    const template = await this.getEmailTemplateById(templateId)
    
    if (!template) {
      throw new Error('Template non trouvé')
    }

    const processedSubject = this.processVariables(template.subject, variablesData)
    const processedContent = this.processVariables(template.content, variablesData)

    return {
      subject: processedSubject,
      content: processedContent
    }
  }

  // Traiter les variables dans le contenu
  static processVariables(content: string, variables: Record<string, any>): string {
    let processedContent = content

    // Remplacer les variables au format {{variable.name}}
    const variableRegex = /\{\{([^}]+)\}\}/g
    
    processedContent = processedContent.replace(variableRegex, (match, variableName) => {
      const trimmedName = variableName.trim()
      
      // Supporter les chemins imbriqués comme user.first_name
      const value = this.getNestedValue(variables, trimmedName)
      
      if (value !== undefined && value !== null) {
        // Formatter selon le type
        if (value instanceof Date) {
          return value.toLocaleDateString('fr-FR')
        }
        if (typeof value === 'number') {
          return value.toLocaleString('fr-FR')
        }
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return String(value)
      }
      
      // Variable non trouvée, retourner la variable originale
      return match
    })

    // Traiter les conditions conditionnelles {{#if variable}}...{{/if}}
    const conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs
    
    processedContent = processedContent.replace(conditionalRegex, (match, condition, content) => {
      const value = this.getNestedValue(variables, condition.trim())
      
      if (value && value !== '' && value !== false) {
        return this.processVariables(content, variables)
      }
      
      return ''
    })

    // Traiter les boucles {{#each array}}...{{/each}}
    const loopRegex = /\{\{#each\s+([^}]+)\}\}(.*?)\{\{\/each\}\}/gs
    
    processedContent = processedContent.replace(loopRegex, (match, arrayName, loopContent) => {
      const array = this.getNestedValue(variables, arrayName.trim())
      
      if (Array.isArray(array)) {
        return array.map((item, index) => {
          const loopVariables = {
            ...variables,
            this: item,
            index: index,
            '@index': index,
            '@first': index === 0,
            '@last': index === array.length - 1
          }
          return this.processVariables(loopContent, loopVariables)
        }).join('')
      }
      
      return ''
    })

    return processedContent
  }

  // Récupérer une valeur imbriquée dans un objet
  private static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  // Envoyer un email
  static async sendEmail(data: SendEmailData): Promise<EmailLog> {
    try {
      const template = await this.getEmailTemplateById(data.template_id)
      
      if (!template || !template.is_active) {
        throw new Error('Template non trouvé ou inactif')
      }

      // Traiter les variables
      const processedSubject = this.processVariables(template.subject, data.variables_data)
      const processedContent = this.processVariables(template.content, data.variables_data)

      // Créer le log d'email
      const emailLogData = {
        template_id: data.template_id,
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name,
        subject: processedSubject,
        content: processedContent,
        status: 'queued' as const,
        user_id: data.user_id,
        order_id: data.order_id,
        formation_id: data.formation_id,
        session_id: data.session_id,
        variables_data: data.variables_data,
        created_at: new Date().toISOString()
      }

      const { data: emailLog, error } = await supabase
        .from('email_logs')
        .insert(emailLogData)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Ici, vous pourriez intégrer un service d'envoi d'email comme SendGrid, Mailgun, etc.
      // Pour l'instant, on simule l'envoi
      await this.simulateEmailSending(emailLog.id)

      return emailLog

    } catch (error) {
      console.error('Erreur envoi email:', error)
      throw new Error('Erreur lors de l\'envoi de l\'email')
    }
  }

  // Simuler l'envoi d'email (à remplacer par un vrai service)
  private static async simulateEmailSending(emailLogId: string): Promise<void> {
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mettre à jour le statut
    await supabase
      .from('email_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', emailLogId)
  }

  // Récupérer les logs d'emails
  static async getEmailLogs(filters: { 
    template_id?: string
    status?: string
    limit?: number
    offset?: number
  } = {}): Promise<EmailLog[]> {
    let query = supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.template_id) {
      query = query.eq('template_id', filters.template_id)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur récupération logs emails:', error)
      throw new Error('Erreur lors de la récupération des logs')
    }

    return data || []
  }

  // Récupérer les statistiques d'un template
  static async getTemplateStats(templateId: string): Promise<any> {
    const { data, error } = await supabase
      .from('email_logs')
      .select('status, created_at, opened_at, clicked_at')
      .eq('template_id', templateId)

    if (error) {
      console.error('Erreur récupération stats template:', error)
      return {
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
        bounce_rate: 0,
        open_rate: 0,
        click_rate: 0
      }
    }

    const totalSent = data?.filter(log => log.status === 'sent' || log.status === 'delivered').length || 0
    const totalOpened = data?.filter(log => log.opened_at).length || 0
    const totalClicked = data?.filter(log => log.clicked_at).length || 0
    const totalBounced = data?.filter(log => log.status === 'bounced').length || 0

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0

    return {
      total_sent: totalSent,
      total_opened: totalOpened,
      total_clicked: totalClicked,
      bounce_rate: Math.round(bounceRate * 100) / 100,
      open_rate: Math.round(openRate * 100) / 100,
      click_rate: Math.round(clickRate * 100) / 100
    }
  }

  // Récupérer les variables disponibles
  static getAvailableVariables(): Record<string, EmailVariable[]> {
    return PREDEFINED_VARIABLES
  }

  // Valider un template
  static validateTemplate(template: Partial<CreateEmailTemplateData>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!template.name?.trim()) {
      errors.push('Le nom est requis')
    }

    if (!template.subject?.trim()) {
      errors.push('Le sujet est requis')
    }

    if (!template.content?.trim()) {
      errors.push('Le contenu est requis')
    }

    if (!template.type) {
      errors.push('Le type est requis')
    }

    // Valider les variables dans le contenu
    if (template.content) {
      const variableMatches = template.content.match(/\{\{([^}]+)\}\}/g)
      if (variableMatches) {
        const availableVariables = Object.values(PREDEFINED_VARIABLES).flat()
        const customVariables = template.variables || []
        const allVariables = [...availableVariables, ...customVariables]

        for (const match of variableMatches) {
          const variableName = match.replace(/\{\{|\}\}/g, '').trim()
          const foundVariable = allVariables.find(v => v.name === variableName)
          
          if (!foundVariable && !variableName.startsWith('#') && variableName !== '/if' && variableName !== '/each') {
            errors.push(`Variable non définie: ${variableName}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Envoyer un email automatique basé sur un événement
  static async sendAutomaticEmail(
    templateType: string, 
    recipientEmail: string,
    variablesData: Record<string, any>,
    metadata?: {
      user_id?: string
      order_id?: string
      formation_id?: string
      session_id?: string
    }
  ): Promise<void> {
    try {
      const template = await this.getEmailTemplateByType(templateType)
      
      if (!template || !template.auto_send) {
        return // Pas de template ou envoi automatique désactivé
      }

      const sendData: SendEmailData = {
        template_id: template.id,
        recipient_email: recipientEmail,
        variables_data: variablesData,
        ...metadata
      }

      // Appliquer le délai si configuré
      if (template.send_delay && template.send_delay > 0) {
        // Ici vous pourriez implémenter une queue avec délai
        setTimeout(() => {
          this.sendEmail(sendData)
        }, template.send_delay * 60 * 1000) // Délai en minutes
      } else {
        await this.sendEmail(sendData)
      }

    } catch (error) {
      console.error('Erreur envoi email automatique:', error)
      // Ne pas lever d'erreur pour ne pas bloquer le processus principal
    }
  }
}