import { supabase } from '../supabaseClient'
import { 
  PromoCode, 
  PromoCodeUsage, 
  PromoCodeValidation, 
  CreatePromoCodeData,
  PromoCodeFilters 
} from './promo-codes-types'

export class PromoCodesService {
  
  // Créer un nouveau code promo
  static async createPromoCode(data: CreatePromoCodeData): Promise<PromoCode> {
    const { data: result, error } = await supabase
      .from('promo_codes')
      .insert({
        ...data,
        current_usage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création code promo:', error)
      throw new Error('Erreur lors de la création du code promo')
    }

    return result
  }

  // Récupérer tous les codes promo avec filtres
  static async getPromoCodes(filters: PromoCodeFilters = {}): Promise<PromoCode[]> {
    let query = supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.discount_type) {
      query = query.eq('discount_type', filters.discount_type)
    }

    if (filters.search) {
      query = query.or(`code.ilike.%${filters.search}%,name.ilike.%${filters.search}%`)
    }

    if (filters.valid_only) {
      const now = new Date().toISOString()
      query = query
        .eq('status', 'active')
        .lte('valid_from', now)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur récupération codes promo:', error)
      throw new Error('Erreur lors de la récupération des codes promo')
    }

    return data || []
  }

  // Récupérer un code promo par son code
  static async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      console.error('Erreur récupération code promo:', error)
      throw new Error('Erreur lors de la récupération du code promo')
    }

    return data
  }

  // Récupérer un code promo par ID
  static async getPromoCodeById(id: string): Promise<PromoCode | null> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erreur récupération code promo:', error)
      throw new Error('Erreur lors de la récupération du code promo')
    }

    return data
  }

  // Mettre à jour un code promo
  static async updatePromoCode(id: string, updates: Partial<CreatePromoCodeData>): Promise<PromoCode> {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour code promo:', error)
      throw new Error('Erreur lors de la mise à jour du code promo')
    }

    return data
  }

  // Supprimer un code promo
  static async deletePromoCode(id: string): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression code promo:', error)
      throw new Error('Erreur lors de la suppression du code promo')
    }
  }

  // Valider un code promo pour une commande
  static async validatePromoCode(
    code: string, 
    userId: string, 
    cartItems: any[], 
    subtotal: number,
    userCountry?: string
  ): Promise<PromoCodeValidation> {
    try {
      // Récupérer le code promo
      const promoCode = await this.getPromoCodeByCode(code)
      
      if (!promoCode) {
        return { valid: false, error: 'Code promo non trouvé' }
      }

      // Vérifier le statut
      if (promoCode.status !== 'active') {
        return { valid: false, error: 'Code promo inactif' }
      }

      // Vérifier les dates
      const now = new Date()
      const validFrom = new Date(promoCode.valid_from)
      
      if (now < validFrom) {
        return { valid: false, error: 'Code promo pas encore valide' }
      }

      if (promoCode.valid_until) {
        const validUntil = new Date(promoCode.valid_until)
        if (now > validUntil) {
          return { valid: false, error: 'Code promo expiré' }
        }
      }

      // Vérifier les limites d'utilisation globales
      if (promoCode.usage_limit && promoCode.current_usage >= promoCode.usage_limit) {
        return { valid: false, error: 'Limite d\'utilisation atteinte' }
      }

      // Vérifier les limites par utilisateur
      if (promoCode.usage_limit_per_user) {
        const userUsage = await this.getUserPromoCodeUsage(promoCode.id, userId)
        if (userUsage >= promoCode.usage_limit_per_user) {
          return { valid: false, error: 'Limite d\'utilisation par utilisateur atteinte' }
        }
      }

      // Vérifier le montant minimum
      if (promoCode.minimum_order_amount && subtotal < promoCode.minimum_order_amount) {
        return { 
          valid: false, 
          error: `Commande minimum de ${promoCode.minimum_order_amount}€ requise` 
        }
      }

      // Vérifier les restrictions géographiques
      if (userCountry) {
        if (promoCode.applicable_countries?.length && 
            !promoCode.applicable_countries.includes(userCountry)) {
          return { valid: false, error: 'Code promo non valide dans votre pays' }
        }
        
        if (promoCode.excluded_countries?.includes(userCountry)) {
          return { valid: false, error: 'Code promo non valide dans votre pays' }
        }
      }

      // Vérifier les restrictions produits
      if (promoCode.applicable_formations?.length) {
        const hasApplicableFormation = cartItems.some(item => 
          promoCode.applicable_formations!.includes(item.formation_id)
        )
        if (!hasApplicableFormation) {
          return { valid: false, error: 'Code promo non applicable aux formations sélectionnées' }
        }
      }

      if (promoCode.excluded_formations?.length) {
        const hasExcludedFormation = cartItems.some(item => 
          promoCode.excluded_formations!.includes(item.formation_id)
        )
        if (hasExcludedFormation) {
          return { valid: false, error: 'Code promo non applicable aux formations sélectionnées' }
        }
      }

      // Calculer la remise
      const discountAmount = this.calculateDiscount(promoCode, subtotal)
      const finalTotal = Math.max(0, subtotal - discountAmount)

      return {
        valid: true,
        discount_amount: discountAmount,
        final_total: finalTotal,
        applied_code: promoCode
      }

    } catch (error) {
      console.error('Erreur validation code promo:', error)
      return { valid: false, error: 'Erreur lors de la validation' }
    }
  }

  // Calculer la remise
  private static calculateDiscount(promoCode: PromoCode, subtotal: number): number {
    let discount = 0

    switch (promoCode.discount_type) {
      case 'percentage':
        discount = (subtotal * promoCode.discount_value) / 100
        break
      case 'fixed_amount':
        discount = promoCode.discount_value
        break
      case 'free_shipping':
        // Pour l'instant, retourner 0 car les formations n'ont pas de frais de port
        discount = 0
        break
    }

    // Appliquer la limite de remise maximale
    if (promoCode.maximum_discount_amount) {
      discount = Math.min(discount, promoCode.maximum_discount_amount)
    }

    // S'assurer que la remise ne dépasse pas le total
    discount = Math.min(discount, subtotal)

    return Math.round(discount * 100) / 100 // Arrondir à 2 décimales
  }

  // Enregistrer l'utilisation d'un code promo
  static async recordPromoCodeUsage(
    promoCodeId: string, 
    userId: string, 
    orderId: string, 
    discountApplied: number
  ): Promise<void> {
    try {
      // Enregistrer l'utilisation
      const { error: usageError } = await supabase
        .from('promo_code_usage')
        .insert({
          promo_code_id: promoCodeId,
          user_id: userId,
          order_id: orderId,
          discount_applied: discountApplied,
          used_at: new Date().toISOString()
        })

      if (usageError) {
        console.error('Erreur enregistrement utilisation:', usageError)
        throw new Error('Erreur lors de l\'enregistrement de l\'utilisation')
      }

      // Incrémenter le compteur d'utilisation
      const { error: updateError } = await supabase
        .from('promo_codes')
        .update({ 
          current_usage: supabase.raw('current_usage + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', promoCodeId)

      if (updateError) {
        console.error('Erreur mise à jour compteur:', updateError)
        throw new Error('Erreur lors de la mise à jour du compteur')
      }

    } catch (error) {
      console.error('Erreur recordPromoCodeUsage:', error)
      throw error
    }
  }

  // Récupérer l'utilisation d'un code promo par un utilisateur
  static async getUserPromoCodeUsage(promoCodeId: string, userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('promo_code_usage')
      .select('id')
      .eq('promo_code_id', promoCodeId)
      .eq('user_id', userId)

    if (error) {
      console.error('Erreur récupération utilisation utilisateur:', error)
      return 0
    }

    return data?.length || 0
  }

  // Récupérer les statistiques d'un code promo
  static async getPromoCodeStats(promoCodeId: string): Promise<any> {
    const { data, error } = await supabase
      .from('promo_code_usage')
      .select(`
        discount_applied,
        used_at,
        orders:order_id (
          total_amount
        )
      `)
      .eq('promo_code_id', promoCodeId)

    if (error) {
      console.error('Erreur récupération stats:', error)
      return {
        total_usage: 0,
        total_discount_given: 0,
        avg_order_value: 0,
        conversion_rate: 0
      }
    }

    const totalUsage = data?.length || 0
    const totalDiscountGiven = data?.reduce((sum, usage) => sum + usage.discount_applied, 0) || 0
    const avgOrderValue = data?.length ? 
      data.reduce((sum, usage) => sum + (usage.orders?.total_amount || 0), 0) / data.length : 0

    return {
      total_usage: totalUsage,
      total_discount_given: totalDiscountGiven,
      avg_order_value: avgOrderValue,
      conversion_rate: 0 // À calculer selon la logique métier
    }
  }

  // Récupérer les codes promo auto-applicables pour un utilisateur
  static async getAutoApplicableCodes(
    userId: string, 
    cartItems: any[], 
    subtotal: number,
    userCountry?: string
  ): Promise<PromoCode[]> {
    try {
      const { data: codes, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('status', 'active')
        .eq('auto_apply', true)
        .lte('valid_from', new Date().toISOString())
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)

      if (error) {
        console.error('Erreur récupération codes auto-applicables:', error)
        return []
      }

      // Valider chaque code
      const validCodes: PromoCode[] = []
      
      for (const code of codes || []) {
        const validation = await this.validatePromoCode(
          code.code, 
          userId, 
          cartItems, 
          subtotal, 
          userCountry
        )
        
        if (validation.valid) {
          validCodes.push(code)
        }
      }

      // Trier par valeur de remise décroissante
      return validCodes.sort((a, b) => {
        const discountA = this.calculateDiscount(a, subtotal)
        const discountB = this.calculateDiscount(b, subtotal)
        return discountB - discountA
      })

    } catch (error) {
      console.error('Erreur getAutoApplicableCodes:', error)
      return []
    }
  }

  // Dupliquer un code promo
  static async duplicatePromoCode(id: string, newCode: string): Promise<PromoCode> {
    const original = await this.getPromoCodeById(id)
    
    if (!original) {
      throw new Error('Code promo original non trouvé')
    }

    const { id: originalId, created_at, updated_at, current_usage, analytics, ...duplicateData } = original

    return this.createPromoCode({
      ...duplicateData,
      code: newCode,
      name: `${original.name} (Copie)`,
      current_usage: 0
    })
  }
}