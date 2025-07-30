import { supabase } from '@/lib/supabaseClient'

export interface AdminAccount {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
  last_login?: string
  created_by?: string
}

export async function getAllAdminAccounts(): Promise<AdminAccount[]> {
  try {
    const { data, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors du chargement des comptes admin:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erreur getAllAdminAccounts:', error)
    throw error
  }
}

export async function createAdminAccount(account: {
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  status?: 'active' | 'inactive' | 'suspended'
}): Promise<AdminAccount> {
  try {
    const { data, error } = await supabase
      .from('admin_accounts')
      .insert([{
        email: account.email,
        name: account.name,
        role: account.role,
        status: account.status || 'active'
      }])
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du compte admin:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur createAdminAccount:', error)
    throw error
  }
}

export async function updateAdminAccount(id: string, updates: {
  name?: string
  role?: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  status?: 'active' | 'inactive' | 'suspended'
}): Promise<AdminAccount> {
  try {
    const { data, error } = await supabase
      .from('admin_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du compte admin:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur updateAdminAccount:', error)
    throw error
  }
}

export async function deleteAdminAccount(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression du compte admin:', error)
      throw error
    }
  } catch (error) {
    console.error('Erreur deleteAdminAccount:', error)
    throw error
  }
}

export async function updateLastLogin(email: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email)

    if (error) {
      console.error('Erreur lors de la mise à jour de last_login:', error)
      throw error
    }
  } catch (error) {
    console.error('Erreur updateLastLogin:', error)
    throw error
  }
}