import { supabase } from '@/lib/supabaseClient'

export interface ActionNotification {
  id: string
  type: 'property_published' | 'agent_created' | 'estimation_received' | 'contact_received' | 'user_registered' | 'property_sold' | 'property_rented'
  title: string
  description?: string
  icon?: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  user_id?: string
  user_name?: string
  entity_type?: string
  entity_id?: string
  entity_name?: string
  metadata?: Record<string, any>
  is_read: boolean
  created_at: string
}

export async function getRecentNotifications(limit: number = 10): Promise<ActionNotification[]> {
  try {
    const { data, error } = await supabase
      .from('action_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erreur lors du chargement des notifications:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erreur getRecentNotifications:', error)
    return []
  }
}

export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('action_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error)
      throw error
    }

    return count || 0
  } catch (error) {
    console.error('Erreur getUnreadNotificationsCount:', error)
    return 0
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('action_notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('Erreur lors du marquage comme lu:', error)
      throw error
    }
  } catch (error) {
    console.error('Erreur markNotificationAsRead:', error)
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const { error } = await supabase
      .from('action_notifications')
      .update({ is_read: true })
      .eq('is_read', false)

    if (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error)
      throw error
    }
  } catch (error) {
    console.error('Erreur markAllNotificationsAsRead:', error)
  }
}

// Fonction pour générer le lien de la notification
export function getNotificationLink(notification: ActionNotification): string | null {
  switch (notification.type) {
    case 'property_published':
    case 'property_sold':
    case 'property_rented':
      if (notification.entity_id) {
        return `/real-estate-listings/${notification.entity_id}`
      }
      break
    
    case 'agent_created':
      if (notification.entity_id) {
        return `/agents/${notification.entity_id}`
      }
      break
    
    case 'contact_received':
      return '/admin/contacts'
    
    case 'estimation_received':
      return '/admin/estimations'
    
    case 'user_registered':
      return '/admin/clients'
    
    default:
      return null
  }
  return null
}

export async function createNotification(notification: {
  type: ActionNotification['type']
  title: string
  description?: string
  color?: ActionNotification['color']
  user_id?: string
  user_name?: string
  entity_type?: string
  entity_id?: string
  entity_name?: string
  metadata?: Record<string, any>
}): Promise<ActionNotification | null> {
  try {
    const { data, error } = await supabase
      .from('action_notifications')
      .insert([{
        type: notification.type,
        title: notification.title,
        description: notification.description,
        color: notification.color || 'blue',
        user_id: notification.user_id,
        user_name: notification.user_name,
        entity_type: notification.entity_type,
        entity_id: notification.entity_id,
        entity_name: notification.entity_name,
        metadata: notification.metadata || {},
        is_read: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la notification:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur createNotification:', error)
    return null
  }
}