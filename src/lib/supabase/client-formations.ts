// Service pour gérer les formations des clients
import { supabase } from '@/lib/supabaseClient'
import { Order, FormationSession } from './formations-types'
import { getClientFormationsWithStatus, FormationWithStatus } from '@/lib/utils/formation-status'

export interface ClientFormationData {
  upcoming_formations: FormationWithStatus[]
  completed_formations: FormationWithStatus[]
  in_progress_formations: FormationWithStatus[]
  total_formations: number
  has_orthodontist_badge: boolean
}

/**
 * Récupère toutes les formations d'un client avec leur statut
 */
export async function getClientFormations(clientId: string): Promise<ClientFormationData | null> {
  try {
    // Récupérer toutes les commandes payées du client avec les détails des sessions
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          session:formation_sessions(
            *,
            formation:formations(*)
          )
        )
      `)
      .eq('user_id', clientId)
      .in('status', ['confirmed', 'completed'])
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!orders) return null

    // Obtenir toutes les formations avec leur statut
    const allFormations = getClientFormationsWithStatus(orders)
    
    // Séparer par statut
    const upcoming = allFormations.filter(f => f.status === 'upcoming')
    const completed = allFormations.filter(f => f.status === 'completed')
    const inProgress = allFormations.filter(f => f.status === 'in_progress')
    
    // Vérifier si le client doit avoir le badge orthodontiste
    const hasOrthodontistBadge = completed.some(f => 
      f.formationTitle.toLowerCase().includes('niveau 1') ||
      f.formationTitle.toLowerCase().includes('level 1')
    )

    return {
      upcoming_formations: upcoming,
      completed_formations: completed,
      in_progress_formations: inProgress,
      total_formations: allFormations.length,
      has_orthodontist_badge: hasOrthodontistBadge
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des formations du client:', error)
    return null
  }
}

/**
 * Met à jour automatiquement le statut des commandes basé sur les dates de formation
 */
export async function updateOrderStatusesBasedOnDates(): Promise<void> {
  try {
    // Récupérer toutes les commandes confirmées avec leurs sessions
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          session:formation_sessions(*)
        )
      `)
      .eq('status', 'confirmed')
      .eq('payment_status', 'paid')

    if (error) throw error
    if (!orders) return

    // Pour chaque commande, vérifier si toutes les formations sont passées
    for (const order of orders) {
      if (!order.items || order.items.length === 0) continue

      const allSessionsPassed = order.items.every(item => {
        if (!item.session) return false
        const sessionDate = new Date(item.session.start_date)
        return sessionDate < new Date()
      })

      // Si toutes les sessions sont passées, marquer la commande comme terminée
      if (allSessionsPassed) {
        await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            completed_date: new Date().toISOString()
          })
          .eq('id', order.id)
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts de commande:', error)
  }
}

/**
 * Récupère les clients avec des formations à venir dans les X prochains jours
 */
export async function getClientsWithUpcomingFormations(daysAhead: number = 7): Promise<any[]> {
  try {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysAhead)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        user_id,
        user:user_profiles(*),
        items:order_items(
          session:formation_sessions(
            *,
            formation:formations(*)
          )
        )
      `)
      .in('status', ['confirmed', 'completed'])
      .eq('payment_status', 'paid')

    if (error) throw error
    if (!data) return []

    // Filtrer pour ne garder que les clients avec des formations dans les X prochains jours
    const clientsWithUpcoming = data.filter(order => {
      return order.items?.some(item => {
        if (!item.session) return false
        const sessionDate = new Date(item.session.start_date)
        const today = new Date()
        return sessionDate > today && sessionDate <= targetDate
      })
    })

    // Dédupliquer par user_id
    const uniqueClients = new Map()
    clientsWithUpcoming.forEach(order => {
      if (!uniqueClients.has(order.user_id)) {
        uniqueClients.set(order.user_id, {
          ...order.user,
          upcoming_sessions: []
        })
      }
      
      // Ajouter les sessions à venir
      order.items?.forEach(item => {
        if (item.session) {
          const sessionDate = new Date(item.session.start_date)
          const today = new Date()
          if (sessionDate > today && sessionDate <= targetDate) {
            uniqueClients.get(order.user_id).upcoming_sessions.push(item.session)
          }
        }
      })
    })

    return Array.from(uniqueClients.values())
  } catch (error) {
    console.error('Erreur lors de la récupération des clients avec formations à venir:', error)
    return []
  }
}