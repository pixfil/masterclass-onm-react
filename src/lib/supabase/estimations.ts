import { supabase } from '@/lib/supabaseClient'

// Types locaux en attendant la génération depuis la base
export interface EstimationRequest {
  id: string
  // Informations client
  nom: string
  prenom: string
  email: string
  telephone: string
  // Informations sur le bien
  type_bien: 'appartement' | 'maison' | 'terrain' | 'locaux_commerciaux' | 'parking' | 'autres'
  adresse: string
  ville: string
  code_postal?: string
  surface_habitable?: number
  surface_terrain?: number
  nombre_pieces?: number
  nombre_chambres?: number
  nombre_salles_bain?: number
  annee_construction?: number
  // Détails supplémentaires
  description_travaux?: string
  delai_vente?: 'immédiat' | '3 mois' | '6 mois' | '1 an' | 'plus'
  raison_vente?: string
  estimation_prix?: number
  // État et suivi
  status: 'nouveau' | 'contacté' | 'visite_planifiée' | 'estimé' | 'archivé'
  agent_assigned_id?: string
  agent_assigned_name?: string
  notes_internes?: string
  estimation_finale?: number
  date_visite?: string
  // Métadonnées
  source?: 'site_web' | 'telephone' | 'email' | 'agence'
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
  contacted_at?: string
  estimated_at?: string
}

export interface EstimationRequestInsert {
  nom: string
  prenom: string
  email: string
  telephone: string
  type_bien: 'appartement' | 'maison' | 'terrain' | 'locaux_commerciaux' | 'parking' | 'autres'
  adresse: string
  ville: string
  code_postal?: string
  surface_habitable?: number
  surface_terrain?: number
  nombre_pieces?: number
  nombre_chambres?: number
  nombre_salles_bain?: number
  annee_construction?: number
  description_travaux?: string
  delai_vente?: 'immédiat' | '3 mois' | '6 mois' | '1 an' | 'plus'
  raison_vente?: string
  estimation_prix?: number
  source?: 'site_web' | 'telephone' | 'email' | 'agence'
  ip_address?: string
  user_agent?: string
}

export interface EstimationStats {
  total: number
  nouveau: number
  contacte: number
  visite_planifiee: number
  estime: number
  archive: number
  today: number
  this_week: number
  this_month: number
  moyenne_delai_contact: number
  moyenne_delai_estimation: number
}

// Récupérer toutes les demandes d'estimation
export async function getEstimationRequests(filters?: {
  status?: string
  search?: string
  ville?: string
  type_bien?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('property_estimations')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'tous') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(
      `nom.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%,email.ilike.%${filters.search}%,adresse.ilike.%${filters.search}%,ville.ilike.%${filters.search}%`
    )
  }

  if (filters?.ville) {
    query = query.eq('ville', filters.ville)
  }

  if (filters?.type_bien) {
    query = query.eq('type_bien', filters.type_bien)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erreur lors de la récupération des demandes:', error)
    return []
  }

  return data as EstimationRequest[]
}

// Récupérer une demande par ID
export async function getEstimationRequestById(id: string) {
  const { data, error } = await supabase
    .from('property_estimations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération de la demande:', error)
    return null
  }

  return data as EstimationRequest
}

// Créer une nouvelle demande
export async function createEstimationRequest(request: EstimationRequestInsert) {
  const { data, error } = await supabase
    .from('property_estimations')
    .insert([request])
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création de la demande:', error)
    throw error
  }

  return data as EstimationRequest
}

// Mettre à jour le statut d'une demande
export async function updateEstimationStatus(
  id: string, 
  status: EstimationRequest['status'],
  additionalData?: {
    agent_assigned_id?: string
    agent_assigned_name?: string
    date_visite?: string
    estimation_finale?: number
    notes_internes?: string
  }
) {
  const updateData: any = { status, ...additionalData }
  
  if (status === 'contacté' && !updateData.contacted_at) {
    updateData.contacted_at = new Date().toISOString()
  }
  
  if (status === 'estimé' && !updateData.estimated_at) {
    updateData.estimated_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('property_estimations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    throw error
  }

  return data as EstimationRequest
}

// Mettre à jour une demande
export async function updateEstimationRequest(id: string, updates: Partial<EstimationRequest>) {
  const { data, error } = await supabase
    .from('property_estimations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la mise à jour de la demande:', error)
    throw error
  }

  return data as EstimationRequest
}

// Supprimer une demande
export async function deleteEstimationRequest(id: string) {
  const { error } = await supabase
    .from('property_estimations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erreur lors de la suppression de la demande:', error)
    throw error
  }
}

// Obtenir les statistiques
export async function getEstimationStats(): Promise<EstimationStats> {
  try {
    // Récupérer toutes les demandes pour les statistiques
    const { data: allRequests } = await supabase
      .from('property_estimations')
      .select('*')

    const stats: EstimationStats = {
      total: allRequests?.length || 0,
      nouveau: 0,
      contacte: 0,
      visite_planifiee: 0,
      estime: 0,
      archive: 0,
      today: 0,
      this_week: 0,
      this_month: 0,
      moyenne_delai_contact: 0,
      moyenne_delai_estimation: 0
    }

    if (!allRequests || allRequests.length === 0) {
      return stats
    }

    // Compter par statut
    allRequests.forEach(request => {
      switch (request.status) {
        case 'nouveau':
          stats.nouveau++
          break
        case 'contacté':
          stats.contacte++
          break
        case 'visite_planifiée':
          stats.visite_planifiee++
          break
        case 'estimé':
          stats.estime++
          break
        case 'archivé':
          stats.archive++
          break
      }
    })

    // Demandes d'aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    stats.today = allRequests.filter(r => new Date(r.created_at) >= today).length

    // Demandes de cette semaine
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    stats.this_week = allRequests.filter(r => new Date(r.created_at) >= weekStart).length

    // Demandes de ce mois
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    stats.this_month = allRequests.filter(r => new Date(r.created_at) >= monthStart).length

    // Calculer les délais moyens
    const delaisContact: number[] = []
    const delaisEstimation: number[] = []

    allRequests.forEach(request => {
      if (request.contacted_at) {
        const delai = new Date(request.contacted_at).getTime() - new Date(request.created_at).getTime()
        delaisContact.push(delai / (1000 * 60 * 60 * 24)) // En jours
      }
      if (request.estimated_at) {
        const delai = new Date(request.estimated_at).getTime() - new Date(request.created_at).getTime()
        delaisEstimation.push(delai / (1000 * 60 * 60 * 24)) // En jours
      }
    })

    if (delaisContact.length > 0) {
      stats.moyenne_delai_contact = Math.round(
        delaisContact.reduce((a, b) => a + b, 0) / delaisContact.length
      )
    }

    if (delaisEstimation.length > 0) {
      stats.moyenne_delai_estimation = Math.round(
        delaisEstimation.reduce((a, b) => a + b, 0) / delaisEstimation.length
      )
    }

    return stats
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    return {
      total: 0,
      nouveau: 0,
      contacte: 0,
      visite_planifiee: 0,
      estime: 0,
      archive: 0,
      today: 0,
      this_week: 0,
      this_month: 0,
      moyenne_delai_contact: 0,
      moyenne_delai_estimation: 0
    }
  }
}

// Obtenir les villes distinctes
export async function getDistinctCities() {
  const { data, error } = await supabase
    .from('property_estimations')
    .select('ville')
    .not('ville', 'is', null)

  if (error) {
    console.error('Erreur lors de la récupération des villes:', error)
    return []
  }

  const cities = [...new Set(data.map(item => item.ville))].filter(Boolean)
  return cities.sort()
}

// Assigner un agent à une demande
export async function assignAgentToEstimation(
  id: string,
  agentId: string,
  agentName: string
) {
  return updateEstimationStatus(id, 'contacté', {
    agent_assigned_id: agentId,
    agent_assigned_name: agentName
  })
}

// Planifier une visite
export async function scheduleVisit(
  id: string,
  dateVisite: string,
  notes?: string
) {
  return updateEstimationStatus(id, 'visite_planifiée', {
    date_visite: dateVisite,
    notes_internes: notes
  })
}

// Finaliser l'estimation
export async function finalizeEstimation(
  id: string,
  estimationFinale: number,
  notes?: string
) {
  return updateEstimationStatus(id, 'estimé', {
    estimation_finale: estimationFinale,
    notes_internes: notes
  })
}

// Archiver plusieurs demandes
export async function archiveEstimations(ids: string[]) {
  const { error } = await supabase
    .from('property_estimations')
    .update({ status: 'archivé' })
    .in('id', ids)

  if (error) {
    console.error('Erreur lors de l\'archivage:', error)
    throw error
  }
}

// Supprimer plusieurs demandes
export async function deleteEstimations(ids: string[]) {
  const { error } = await supabase
    .from('property_estimations')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Erreur lors de la suppression multiple:', error)
    throw error
  }
}

// Alias pour compatibilité
export const getEstimations = getEstimationRequests
export type Estimation = EstimationRequest