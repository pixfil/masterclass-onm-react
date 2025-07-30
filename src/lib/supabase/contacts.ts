import { supabase } from '@/lib/supabaseClient'

// Types locaux en attendant la génération depuis la base
export interface Contact {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  objet?: string
  message: string
  property_id?: string
  property_title?: string
  property_reference?: string
  agent_id?: string
  agent_name?: string
  status: 'nouveau' | 'lu' | 'traité' | 'archivé'
  read_at?: string
  replied_at?: string
  created_at: string
  updated_at: string
}

export interface ContactInsert {
  nom: string
  prenom: string
  email: string
  telephone?: string
  objet?: string
  message: string
  property_id?: string
  property_title?: string
  property_reference?: string
  agent_id?: string
  agent_name?: string
  status?: 'nouveau' | 'lu' | 'traité' | 'archivé'
}

export interface ContactStats {
  total: number
  nouveau: number
  lu: number
  traite: number
  archive: number
  today: number
  this_week: number
  this_month: number
}

// Récupérer tous les contacts
export async function getContacts(filters?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'tous') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(
      `nom.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%,email.ilike.%${filters.search}%,objet.ilike.%${filters.search}%`
    )
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erreur lors de la récupération des contacts:', error)
    return []
  }

  return data as Contact[]
}

// Récupérer un contact par ID
export async function getContactById(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération du contact:', error)
    return null
  }

  return data as Contact
}

// Créer un nouveau contact
export async function createContact(contact: ContactInsert) {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création du contact:', error)
    throw error
  }

  return data as Contact
}

// Mettre à jour le statut d'un contact
export async function updateContactStatus(
  id: string, 
  status: 'nouveau' | 'lu' | 'traité' | 'archivé'
) {
  const updateData: any = { status }
  
  if (status === 'lu' && !updateData.read_at) {
    updateData.read_at = new Date().toISOString()
  }
  
  if (status === 'traité' && !updateData.replied_at) {
    updateData.replied_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    throw error
  }

  return data as Contact
}

// Supprimer un contact
export async function deleteContact(id: string) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erreur lors de la suppression du contact:', error)
    throw error
  }
}

// Obtenir les statistiques des contacts
export async function getContactStats(): Promise<ContactStats> {
  try {
    // Statistiques par statut
    const { data: statusStats } = await supabase
      .from('contacts')
      .select('status')

    const stats: ContactStats = {
      total: statusStats?.length || 0,
      nouveau: 0,
      lu: 0,
      traite: 0,
      archive: 0,
      today: 0,
      this_week: 0,
      this_month: 0
    }

    // Compter par statut
    statusStats?.forEach(contact => {
      switch (contact.status) {
        case 'nouveau':
          stats.nouveau++
          break
        case 'lu':
          stats.lu++
          break
        case 'traité':
          stats.traite++
          break
        case 'archivé':
          stats.archive++
          break
      }
    })

    // Contacts d'aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todayContacts } = await supabase
      .from('contacts')
      .select('id')
      .gte('created_at', today.toISOString())
    
    stats.today = todayContacts?.length || 0

    // Contacts de cette semaine
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const { data: weekContacts } = await supabase
      .from('contacts')
      .select('id')
      .gte('created_at', weekStart.toISOString())
    
    stats.this_week = weekContacts?.length || 0

    // Contacts de ce mois
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const { data: monthContacts } = await supabase
      .from('contacts')
      .select('id')
      .gte('created_at', monthStart.toISOString())
    
    stats.this_month = monthContacts?.length || 0

    return stats
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    return {
      total: 0,
      nouveau: 0,
      lu: 0,
      traite: 0,
      archive: 0,
      today: 0,
      this_week: 0,
      this_month: 0
    }
  }
}

// Marquer plusieurs contacts comme lus
export async function markContactsAsRead(ids: string[]) {
  const { error } = await supabase
    .from('contacts')
    .update({ 
      status: 'lu',
      read_at: new Date().toISOString()
    })
    .in('id', ids)
    .eq('status', 'nouveau')

  if (error) {
    console.error('Erreur lors du marquage comme lu:', error)
    throw error
  }
}

// Archiver plusieurs contacts
export async function archiveContacts(ids: string[]) {
  const { error } = await supabase
    .from('contacts')
    .update({ status: 'archivé' })
    .in('id', ids)

  if (error) {
    console.error('Erreur lors de l\'archivage:', error)
    throw error
  }
}

// Supprimer plusieurs contacts
export async function deleteContacts(ids: string[]) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Erreur lors de la suppression multiple:', error)
    throw error
  }
}