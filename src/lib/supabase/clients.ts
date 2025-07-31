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
    // Retourner des données de test si erreur de connexion
    return getFakeClients()
  }

  // Si aucune donnée en base, retourner des données de test
  if (!data || data.length === 0) {
    return getFakeClients()
  }

  return data as Client[]
}

// Données de test pour les clients
function getFakeClients(): Client[] {
  return [
    {
      id: 'client-1',
      email: 'marie.dubois@orthodontie-paris.fr',
      first_name: 'Marie',
      last_name: 'Dubois',
      phone: '01 42 33 44 55',
      address: '25 Avenue des Champs-Élysées',
      city: 'Paris',
      postal_code: '75008',
      country: 'France',
      birth_date: '1985-03-15',
      newsletter_consent: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T15:45:00Z',
      last_login: '2024-01-25T09:15:00Z',
      is_active: true,
      preferences: { notifications: true, theme: 'light' }
    },
    {
      id: 'client-2',
      email: 'pierre.martin@cabinet-martin.fr',
      first_name: 'Pierre',
      last_name: 'Martin',
      phone: '04 91 22 33 44',
      address: '12 Rue de la République',
      city: 'Marseille',
      postal_code: '13001',
      country: 'France',
      birth_date: '1978-11-22',
      newsletter_consent: true,
      created_at: '2024-01-10T14:20:00Z',
      updated_at: '2024-01-18T11:30:00Z',
      last_login: '2024-01-24T16:20:00Z',
      is_active: true,
      preferences: { notifications: false, theme: 'dark' }
    },
    {
      id: 'client-3',
      email: 'sophie.laurent@dentaire-lyon.fr',
      first_name: 'Sophie',
      last_name: 'Laurent',
      phone: '04 78 55 66 77',
      address: '8 Place Bellecour',
      city: 'Lyon',
      postal_code: '69002',
      country: 'France',
      birth_date: '1990-07-08',
      newsletter_consent: true,
      created_at: '2024-02-01T09:45:00Z',
      updated_at: '2024-02-15T14:20:00Z',
      last_login: '2024-02-20T10:30:00Z',
      is_active: true,
      preferences: { notifications: true, theme: 'light' }
    },
    {
      id: 'client-4',
      email: 'jean.dupont@orthodontiste-toulouse.fr',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '05 61 88 99 00',
      address: '15 Rue du Capitole',
      city: 'Toulouse',
      postal_code: '31000',
      country: 'France',
      birth_date: '1982-12-03',
      newsletter_consent: false,
      created_at: '2024-01-08T16:15:00Z',
      updated_at: '2024-01-22T13:45:00Z',
      last_login: '2024-01-26T08:20:00Z',
      is_active: true,
      preferences: { notifications: true, theme: 'light' }
    },
    {
      id: 'client-5',
      email: 'christine.moreau@cabinet-bordeaux.fr',
      first_name: 'Christine',
      last_name: 'Moreau',
      phone: '05 56 77 88 99',
      address: '22 Cours de l\'Intendance',
      city: 'Bordeaux',
      postal_code: '33000',
      country: 'France',
      birth_date: '1987-05-20',
      newsletter_consent: true,
      created_at: '2024-02-05T11:20:00Z',
      updated_at: '2024-02-18T09:15:00Z',
      last_login: '2024-02-22T15:30:00Z',
      is_active: true,
      preferences: { notifications: false, theme: 'dark' }
    },
    {
      id: 'client-6',
      email: 'francois.bernard@ortho-nice.fr',
      first_name: 'François',
      last_name: 'Bernard',
      phone: '04 93 44 55 66',
      address: '7 Promenade des Anglais',
      city: 'Nice',
      postal_code: '06000',
      country: 'France',
      birth_date: '1975-09-12',
      newsletter_consent: true,
      created_at: '2024-01-12T12:30:00Z',
      updated_at: '2024-01-28T10:45:00Z',
      last_login: '2024-02-01T14:20:00Z',
      is_active: true,
      preferences: { notifications: true, theme: 'light' }
    },
    {
      id: 'client-7',
      email: 'isabelle.rousseau@cabinet-lille.fr',
      first_name: 'Isabelle',
      last_name: 'Rousseau',
      phone: '03 20 11 22 33',
      address: '18 Grand Place',
      city: 'Lille',
      postal_code: '59000',
      country: 'France',
      birth_date: '1992-02-28',
      newsletter_consent: true,
      created_at: '2024-02-10T08:15:00Z',
      updated_at: '2024-02-25T16:30:00Z',
      last_login: '2024-02-28T11:45:00Z',
      is_active: true,
      preferences: { notifications: true, theme: 'light' }
    },
    {
      id: 'client-8',
      email: 'antoine.leroy@orthodontie-nantes.fr',
      first_name: 'Antoine',
      last_name: 'Leroy',
      phone: '02 40 66 77 88',
      address: '5 Place Royale',
      city: 'Nantes',
      postal_code: '44000',
      country: 'France',
      birth_date: '1980-06-14',
      newsletter_consent: false,
      created_at: '2024-01-20T13:40:00Z',
      updated_at: '2024-02-05T12:20:00Z',
      last_login: '2024-02-10T09:30:00Z',
      is_active: true,
      preferences: { notifications: false, theme: 'dark' }
    },
    {
      id: 'client-9',
      email: 'valerie.petit@cabinet-strasbourg.fr',
      first_name: 'Valérie',
      last_name: 'Petit',
      phone: '03 88 99 00 11',
      address: '14 Place Kléber',
      city: 'Strasbourg',
      postal_code: '67000',
      country: 'France',
      birth_date: '1988-10-05',
      newsletter_consent: true,
      created_at: '2024-02-08T15:25:00Z',
      updated_at: '2024-02-20T14:10:00Z',
      last_login: '2024-02-25T10:15:00Z',
      is_active: true,
      preferences: { notifications: true, theme: 'light' }
    },
    {
      id: 'client-10',
      email: 'mathieu.garcia@orthodontiste-montpellier.fr',
      first_name: 'Mathieu',
      last_name: 'Garcia',
      phone: '04 67 22 33 44',
      address: '9 Place de la Comédie',
      city: 'Montpellier',
      postal_code: '34000',
      country: 'France',
      birth_date: '1984-01-18',
      newsletter_consent: true,
      created_at: '2024-01-25T17:30:00Z',
      updated_at: '2024-02-12T11:45:00Z',
      last_login: '2024-02-18T13:20:00Z',
      is_active: true,
      preferences: { notifications: false, theme: 'light' }
    },
    {
      id: 'client-11',
      email: 'camille.henry@cabinet-rennes.fr',
      first_name: 'Camille',
      last_name: 'Henry',
      phone: '02 99 55 66 77',
      address: '11 Place des Lices',
      city: 'Rennes',
      postal_code: '35000',
      country: 'France',
      birth_date: '1991-04-22',
      newsletter_consent: true,
      created_at: '2024-02-03T10:20:00Z',
      updated_at: '2024-02-17T15:30:00Z',
      last_login: '2024-02-22T08:45:00Z',
      is_active: false,
      preferences: { notifications: true, theme: 'dark' }
    },
    {
      id: 'client-12',
      email: 'olivier.simon@orthodontie-reims.fr',
      first_name: 'Olivier',
      last_name: 'Simon',
      phone: '03 26 88 99 00',
      address: '6 Place Drouet d\'Erlon',
      city: 'Reims',
      postal_code: '51100',
      country: 'France',
      birth_date: '1976-08-30',
      newsletter_consent: false,
      created_at: '2024-01-30T14:45:00Z',
      updated_at: '2024-02-14T12:30:00Z',
      last_login: '2024-02-19T16:10:00Z',
      is_active: true,
      preferences: { notifications: false, theme: 'light' }
    }
  ]
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