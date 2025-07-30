import { supabase } from '@/lib/supabaseClient'
import { AgentImmobilier, AgentImmobilierInsert, AgentImmobilierUpdate } from './types'

// Récupérer tous les agents
export async function getAllAgents(): Promise<AgentImmobilier[]> {
  const { data, error } = await supabase
    .from('agents_immobiliers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching agents:', error)
    return []
  }

  return data as AgentImmobilier[]
}

// Récupérer tous les agents actifs
export async function getActiveAgents(): Promise<AgentImmobilier[]> {
  const { data, error } = await supabase
    .from('agents_immobiliers')
    .select('*')
    .eq('est_actif', true)
    .order('nom', { ascending: true })

  if (error) {
    console.error('Error fetching active agents:', error)
    return []
  }

  return data as AgentImmobilier[]
}

// Récupérer un agent par son ID
export async function getAgentById(id: string): Promise<AgentImmobilier | null> {
  const { data, error } = await supabase
    .from('agents_immobiliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching agent:', error)
    return null
  }

  return data as AgentImmobilier
}

// Créer un agent
export async function createAgent(agent: AgentImmobilierInsert): Promise<AgentImmobilier> {
  const { data, error } = await supabase
    .from('agents_immobiliers')
    .insert(agent)
    .select()
    .single()

  if (error) {
    console.error('Error creating agent:', error)
    throw error
  }

  return data as AgentImmobilier
}

// Mettre à jour un agent
export async function updateAgent(id: string, updates: AgentImmobilierUpdate): Promise<AgentImmobilier> {
  const { data, error } = await supabase
    .from('agents_immobiliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating agent:', error)
    throw error
  }

  return data as AgentImmobilier
}

// Supprimer un agent
export async function deleteAgent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('agents_immobiliers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting agent:', error)
    throw error
  }

  return true
}

// Obtenir les statistiques d'un agent
export async function getAgentStatistics(agentId: string) {
  try {
    // Compter les propriétés gérées par l'agent
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, transaction_type, status')
      .eq('agent_id', agentId)

    if (propError) {
      console.error('Error fetching agent properties:', propError)
      return null
    }

    const stats = {
      total_properties: properties.length,
      properties_for_sale: properties.filter(p => p.transaction_type === 'vente').length,
      properties_for_rent: properties.filter(p => p.transaction_type === 'location').length,
      available_properties: properties.filter(p => p.status === 'disponible').length,
      sold_properties: properties.filter(p => p.status === 'vendu').length
    }

    return stats
  } catch (error) {
    console.error('Error calculating agent statistics:', error)
    return null
  }
}

// Mettre à jour le nombre de propriétés gérées par un agent
export async function updateAgentPropertyCount(agentId: string) {
  try {
    // Compter les propriétés de l'agent
    const { count, error } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)

    if (error) {
      console.error('Error counting agent properties:', error)
      return
    }

    // Mettre à jour le nombre dans la table agents
    await supabase
      .from('agents_immobiliers')
      .update({ nombre_proprietes_gerees: count || 0 })
      .eq('id', agentId)

  } catch (error) {
    console.error('Error updating agent property count:', error)
  }
}