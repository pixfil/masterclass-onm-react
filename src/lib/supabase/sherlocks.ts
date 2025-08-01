import { supabase } from '../supabaseClient'

export interface SherlocksSettings {
  id?: string
  merchant_id: string
  merchant_country?: string
  currency_code?: string
  environment: 'TEST' | 'PRODUCTION'
  pathfile_content?: string
  parmcom_content?: string
  certificate_content?: string
  secret_key?: string
  key_version?: string
  normal_return_url?: string
  cancel_return_url?: string
  automatic_response_url?: string
  card_list?: string
  language?: string
  payment_means?: string
  capture_mode?: string
  capture_day?: number
  header_flag?: boolean
  enable_3ds?: boolean
  enable_3ds2?: boolean
  challenge_3ds2?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export class SherlocksService {
  /**
   * Récupère les paramètres Sherlock's actifs
   */
  static async getActiveSettings() {
    const { data, error } = await supabase
      .from('sherlocks_settings')
      .select('*')
      .eq('active', true)
      .single()

    if (error) {
      console.error('Erreur récupération paramètres Sherlock\'s:', error)
      return null
    }

    return data as SherlocksSettings
  }

  /**
   * Récupère tous les paramètres Sherlock's (admin)
   */
  static async getAllSettings() {
    const { data, error } = await supabase
      .from('sherlocks_settings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération paramètres Sherlock\'s:', error)
      return []
    }

    return data as SherlocksSettings[]
  }

  /**
   * Crée ou met à jour les paramètres Sherlock's
   */
  static async upsertSettings(settings: Partial<SherlocksSettings>) {
    // Si on active ces paramètres, désactiver les autres
    if (settings.active) {
      await supabase
        .from('sherlocks_settings')
        .update({ active: false })
        .neq('id', settings.id || '')
    }

    const { data, error } = await supabase
      .from('sherlocks_settings')
      .upsert(settings)
      .select()
      .single()

    if (error) {
      console.error('Erreur sauvegarde paramètres Sherlock\'s:', error)
      throw error
    }

    return data as SherlocksSettings
  }

  /**
   * Supprime des paramètres Sherlock's
   */
  static async deleteSettings(id: string) {
    const { error } = await supabase
      .from('sherlocks_settings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression paramètres Sherlock\'s:', error)
      throw error
    }

    return true
  }

  /**
   * Génère les paramètres pour l'API Sherlock's
   */
  static generateRequestParams(
    amount: number,
    orderId: string,
    settings: SherlocksSettings,
    customerData?: {
      email?: string
      firstName?: string
      lastName?: string
      phone?: string
      address?: string
      zipCode?: string
      city?: string
    }
  ) {
    const params: Record<string, string> = {
      merchant_id: settings.merchant_id,
      merchant_country: settings.merchant_country || 'fr',
      amount: amount.toString(), // En centimes
      currency_code: settings.currency_code || '978',
      transaction_id: orderId.substring(0, 6), // Max 6 caractères
      order_id: orderId,
      language: settings.language || 'fr',
      payment_means: settings.payment_means || settings.card_list || 'CB,VISA,MASTERCARD',
      capture_mode: settings.capture_mode || 'AUTHOR_CAPTURE',
      capture_day: (settings.capture_day || 0).toString(),
      data: `order_id=${orderId}`,
    }

    // URLs de retour
    if (settings.normal_return_url) {
      params.normal_return_url = settings.normal_return_url.replace('{ORDER_ID}', orderId)
    }
    if (settings.cancel_return_url) {
      params.cancel_return_url = settings.cancel_return_url.replace('{ORDER_ID}', orderId)
    }
    if (settings.automatic_response_url) {
      params.automatic_response_url = settings.automatic_response_url.replace('{ORDER_ID}', orderId)
    }

    // Données client si disponibles
    if (customerData) {
      if (customerData.email) params.customer_email = customerData.email
      if (customerData.firstName) params.customer_firstname = customerData.firstName
      if (customerData.lastName) params.customer_name = customerData.lastName
      if (customerData.phone) params.customer_phone = customerData.phone
      if (customerData.address) params.home_street = customerData.address
      if (customerData.zipCode) params.home_zipcode = customerData.zipCode
      if (customerData.city) params.home_city = customerData.city
    }

    // 3D Secure
    if (settings.enable_3ds2) {
      params.threeDSRequestorChallengeIndicator = settings.challenge_3ds2 || 'AUTHENTICATION_REQUESTED'
    }

    return params
  }

  /**
   * Valide la signature de la réponse Sherlock's
   */
  static validateResponseSignature(
    responseData: string,
    signature: string,
    secretKey: string
  ): boolean {
    // Cette fonction devrait implémenter la vérification de signature
    // selon la documentation Sherlock's
    // Pour l'instant, retourne true en dev
    if (process.env.NODE_ENV === 'development') {
      return true
    }

    // TODO: Implémenter la vérification réelle
    console.warn('Vérification de signature Sherlock\'s non implémentée')
    return false
  }

  /**
   * Parse la réponse Sherlock's
   */
  static parseResponse(responseString: string) {
    const fields = responseString.split('!')
    const response: Record<string, string> = {}

    // Mapping des champs selon la documentation Sherlock's
    const fieldMapping: Record<number, string> = {
      0: 'protocol_version',
      1: 'code',
      2: 'error',
      3: 'merchant_id',
      4: 'merchant_country',
      5: 'amount',
      6: 'currency_code',
      7: 'payment_means',
      8: 'transmission_date',
      9: 'payment_time',
      10: 'payment_date',
      11: 'response_code',
      12: 'payment_certificate',
      13: 'authorisation_id',
      14: 'transaction_id',
      15: 'card_number',
      16: 'cvv_flag',
      17: 'cvv_response_code',
      18: 'bank_response_code',
      19: 'complementary_code',
      20: 'complementary_info',
      21: 'return_context',
      22: 'caddie',
      23: 'receipt_complement',
      24: 'merchant_language',
      25: 'language',
      26: 'customer_id',
      27: 'order_id',
      28: 'customer_email',
      29: 'customer_ip_address',
      30: 'capture_day',
      31: 'capture_mode',
      32: 'data',
      33: 'order_validity',
      34: 'transaction_condition',
      35: 'statement_reference',
      36: 'card_validity',
      37: 'score_value',
      38: 'score_color',
      39: 'score_info',
      40: 'score_threshold',
      41: 'score_profile',
      42: 'threed_ls_code',
      43: 'threed_relegation_code'
    }

    fields.forEach((value, index) => {
      if (fieldMapping[index]) {
        response[fieldMapping[index]] = value
      }
    })

    return response
  }

  /**
   * Vérifie si le paiement est réussi
   */
  static isPaymentSuccessful(responseCode: string): boolean {
    // Code 00 = Transaction approuvée
    return responseCode === '00'
  }

  /**
   * Récupère le message d'erreur correspondant au code de réponse
   */
  static getResponseMessage(responseCode: string): string {
    const messages: Record<string, string> = {
      '00': 'Transaction approuvée',
      '02': 'Demander autorisation par téléphone',
      '03': 'Contrat commerçant invalide',
      '05': 'Refus',
      '12': 'Transaction invalide',
      '14': 'Numéro de carte invalide',
      '17': 'Annulation du client',
      '19': 'Répéter la transaction ultérieurement',
      '30': 'Erreur de format',
      '34': 'Suspicion de fraude',
      '41': 'Carte perdue',
      '43': 'Carte volée',
      '51': 'Provision insuffisante',
      '54': 'Date de validité dépassée',
      '56': 'Carte absente du fichier',
      '57': 'Transaction non permise',
      '58': 'Transaction interdite',
      '59': 'Suspicion de fraude',
      '60': 'L\'accepteur doit contacter l\'acquéreur',
      '61': 'Dépassement du plafond de retrait',
      '63': 'Règles de sécurité non respectées',
      '68': 'Réponse non parvenue ou reçue trop tard',
      '75': 'Nombre d\'essais code confidentiel dépassé',
      '76': 'Porteur déjà en opposition',
      '90': 'Arrêt momentané du système',
      '91': 'Émetteur inaccessible',
      '94': 'Transaction dupliquée',
      '96': 'Mauvais fonctionnement du système',
      '97': 'Échéance de la temporisation',
      '98': 'Serveur indisponible',
      '99': 'Incident domaine initiateur'
    }

    return messages[responseCode] || 'Erreur inconnue'
  }
}