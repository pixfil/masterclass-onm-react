import { supabase } from '@/lib/supabaseClient'
import { NewsletterSubscription, NewsletterSubscriptionInsert } from './types'

// Ajouter un abonnement à la newsletter
export async function subscribeToNewsletter(data: {
  email: string
  prenom?: string
  source?: string
}) {
  const { data: subscription, error } = await supabase
    .from('newsletter_subscriptions')
    .insert({
      email: data.email.toLowerCase().trim(),
      prenom: data.prenom?.trim() || null,
      source: data.source || 'website',
      is_active: true
    })
    .select()
    .single()

  if (error) {
    // Si l'email existe déjà, réactiver l'abonnement
    if (error.code === '23505') {
      const { data: updated, error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          is_active: true,
          unsubscribed_at: null,
          prenom: data.prenom?.trim() || null
        })
        .eq('email', data.email.toLowerCase().trim())
        .select()
        .single()

      if (updateError) {
        console.error('Error reactivating newsletter subscription:', updateError)
        throw updateError
      }
      return updated
    }
    
    console.error('Error creating newsletter subscription:', error)
    throw error
  }

  return subscription
}

// Désabonner de la newsletter
export async function unsubscribeFromNewsletter(email: string) {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .update({ 
      is_active: false,
      unsubscribed_at: new Date().toISOString()
    })
    .eq('email', email.toLowerCase().trim())
    .select()
    .single()

  if (error) {
    console.error('Error unsubscribing from newsletter:', error)
    throw error
  }

  return data
}

// Récupérer tous les abonnements (admin)
export async function getAllNewsletterSubscriptions(filters?: {
  is_active?: boolean
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(`email.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching newsletter subscriptions:', error)
      // Si la table n'existe pas encore, retourner un tableau vide
      return []
    }

    return data as NewsletterSubscription[]
  } catch (error) {
    console.error('Newsletter table might not exist yet:', error)
    return []
  }
}

// Compter les abonnements
export async function getNewsletterStats() {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('is_active')

    if (error) {
      console.error('Error fetching newsletter stats:', error)
      return { total: 0, active: 0, inactive: 0 }
    }

    const total = data.length
    const active = data.filter(sub => sub.is_active).length
    const inactive = total - active

    return { total, active, inactive }
  } catch (error) {
    console.error('Newsletter table might not exist yet:', error)
    return { total: 0, active: 0, inactive: 0 }
  }
}

// Vérifier si un email est abonné
export async function checkEmailSubscription(email: string) {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucun enregistrement trouvé
      return null
    }
    console.error('Error checking email subscription:', error)
    throw error
  }

  return data as NewsletterSubscription
}