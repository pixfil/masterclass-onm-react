// Utilitaires pour gérer les statuts de formation basés sur les dates
import { Order, Registration, FormationSession } from '@/lib/supabase/formations-types'

export type FormationStatus = 'upcoming' | 'completed' | 'in_progress' | 'cancelled'

export interface FormationWithStatus {
  formationTitle: string
  sessionDate: string
  sessionCity: string
  status: FormationStatus
  daysUntil?: number // Nombre de jours avant la formation (négatif si passée)
}

/**
 * Détermine le statut d'une formation basé sur la date de session
 */
export function getFormationStatus(sessionDate: string): { status: FormationStatus; daysUntil: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const formationDate = new Date(sessionDate)
  formationDate.setHours(0, 0, 0, 0)
  
  // Calculer la différence en jours
  const diffTime = formationDate.getTime() - today.getTime()
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let status: FormationStatus
  
  if (daysUntil > 0) {
    status = 'upcoming'
  } else if (daysUntil === 0) {
    status = 'in_progress'
  } else {
    status = 'completed'
  }
  
  return { status, daysUntil }
}

/**
 * Obtient toutes les formations d'un client avec leur statut
 */
export function getClientFormationsWithStatus(
  orders: Order[], 
  registrations?: Registration[]
): FormationWithStatus[] {
  const formations: FormationWithStatus[] = []
  
  // Parcourir toutes les commandes confirmées ou terminées
  const validOrders = orders.filter(order => 
    ['confirmed', 'completed'].includes(order.status) && 
    order.payment_status === 'paid'
  )
  
  for (const order of validOrders) {
    if (order.items) {
      for (const item of order.items) {
        if (item.session) {
          const { status, daysUntil } = getFormationStatus(item.session.start_date)
          
          formations.push({
            formationTitle: item.session.formation?.title || item.formation_title,
            sessionDate: item.session.start_date,
            sessionCity: item.session.city,
            status,
            daysUntil
          })
        }
      }
    }
  }
  
  // Trier par date (plus proche en premier)
  formations.sort((a, b) => {
    return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  })
  
  return formations
}

/**
 * Vérifie si un client peut recevoir un email selon les conditions temporelles
 */
export function canSendEmail(
  formationDate: string,
  condition: 'before' | 'after',
  days: number
): boolean {
  const { daysUntil } = getFormationStatus(formationDate)
  
  if (condition === 'before') {
    // Envoyer X jours avant la formation
    return daysUntil > 0 && daysUntil <= days
  } else {
    // Envoyer X jours après la formation
    return daysUntil < 0 && Math.abs(daysUntil) >= days
  }
}

/**
 * Détermine si un client doit avoir le badge orthodontiste
 * basé sur ses formations terminées
 */
export function shouldHaveOrthodontistBadge(formations: FormationWithStatus[]): boolean {
  // Vérifier si au moins une formation de niveau 1 est terminée
  const hasCompletedLevel1 = formations.some(f => 
    f.status === 'completed' && 
    (f.formationTitle.toLowerCase().includes('niveau 1') || 
     f.formationTitle.toLowerCase().includes('level 1'))
  )
  
  return hasCompletedLevel1
}

/**
 * Obtient un badge de statut formaté pour l'affichage
 */
export function getFormationStatusBadge(status: FormationStatus, daysUntil?: number): {
  color: string
  text: string
  icon?: string
} {
  switch (status) {
    case 'upcoming':
      const daysText = daysUntil === 1 ? 'Demain' : `Dans ${daysUntil} jours`
      return {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        text: daysText,
        icon: 'clock'
      }
    
    case 'in_progress':
      return {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        text: "Aujourd'hui",
        icon: 'play'
      }
    
    case 'completed':
      return {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        text: 'Terminée',
        icon: 'check'
      }
    
    case 'cancelled':
      return {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        text: 'Annulée',
        icon: 'x'
      }
    
    default:
      return {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        text: 'Inconnu'
      }
  }
}