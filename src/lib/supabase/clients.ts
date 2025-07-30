import { supabase } from '@/lib/supabaseClient'

// Types pour les clients
export interface Client {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  birth_date?: string
  preferences?: any // JSONB
  newsletter_consent: boolean
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
}

export interface ClientInsert {
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  birth_date?: string
  preferences?: any
  newsletter_consent?: boolean
  is_active?: boolean
}

export interface ClientUpdate extends Partial<ClientInsert> {
  updated_at?: string
  last_login?: string
}

// Types pour la wishlist
export interface ClientWishlist {
  id: string
  client_id: string
  property_id: string
  created_at: string
  notes?: string
}

export interface ClientWishlistInsert {
  client_id: string
  property_id: string
  notes?: string
}

// Récupérer tous les clients
export async function getAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data as Client[]
}

// Récupérer tous les clients actifs
export async function getActiveClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching active clients:', error)
    return []
  }

  return data as Client[]
}

// Récupérer un client par son ID
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  return data as Client
}

// Récupérer un client par email
export async function getClientByEmail(email: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas de résultat trouvé
      return null
    }
    console.error('Error fetching client by email:', error)
    return null
  }

  return data as Client
}

// Créer un client
export async function createClient(client: ClientInsert): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    throw error
  }

  return data as Client
}

// Mettre à jour un client
export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    throw error
  }

  return data as Client
}

// Supprimer un client (soft delete)
export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('clients')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    throw error
  }

  return true
}

// Mettre à jour la date de dernière connexion
export async function updateClientLastLogin(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .update({ 
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating client last login:', error)
  }
}

// Obtenir les statistiques d'un client
export async function getClientStatistics(clientId: string) {
  try {
    // Compter les éléments de la wishlist
    const { count: wishlistCount, error: wishlistError } = await supabase
      .from('client_wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    if (wishlistError) {
      console.error('Error fetching client wishlist count:', wishlistError)
      return null
    }

    // Autres statistiques peuvent être ajoutées ici
    const stats = {
      wishlist_count: wishlistCount || 0,
      // Ajouter d'autres métriques selon les besoins
    }

    return stats
  } catch (error) {
    console.error('Error calculating client statistics:', error)
    return null
  }
}

// === FONCTIONS WISHLIST ===

// Récupérer la wishlist d'un client
export async function getClientWishlist(clientId: string) {
  const { data, error } = await supabase
    .from('client_wishlist')
    .select(`
      *,
      properties (
        id,
        title,
        price,
        property_type,
        transaction_type,
        address,
        city,
        featured_image,
        status
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client wishlist:', error)
    return []
  }

  return data
}

// Ajouter une propriété à la wishlist
export async function addToWishlist(clientId: string, propertyId: string, notes?: string): Promise<ClientWishlist> {
  // Vérifier si la propriété n'est pas déjà dans la wishlist
  const { data: existing } = await supabase
    .from('client_wishlist')
    .select('id')
    .eq('client_id', clientId)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    throw new Error('Cette propriété est déjà dans votre liste de souhaits')
  }

  const { data, error } = await supabase
    .from('client_wishlist')
    .insert({
      client_id: clientId,
      property_id: propertyId,
      notes: notes || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding to wishlist:', error)
    throw error
  }

  return data as ClientWishlist
}

// Supprimer une propriété de la wishlist
export async function removeFromWishlist(clientId: string, propertyId: string): Promise<boolean> {
  const { error } = await supabase
    .from('client_wishlist')
    .delete()
    .eq('client_id', clientId)
    .eq('property_id', propertyId)

  if (error) {
    console.error('Error removing from wishlist:', error)
    throw error
  }

  return true
}

// Vérifier si une propriété est dans la wishlist
export async function isInWishlist(clientId: string, propertyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('client_wishlist')
    .select('id')
    .eq('client_id', clientId)
    .eq('property_id', propertyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas de résultat trouvé
      return false
    }
    console.error('Error checking wishlist:', error)
    return false
  }

  return !!data
}