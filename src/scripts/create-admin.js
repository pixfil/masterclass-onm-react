const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'sb_secret_4VA5jIKOp1hBUHidgIKeZA_7qwYDfvo' // Clé service (pas publique)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Création de l\'utilisateur admin...')
    
    // Créer l'utilisateur avec la clé service
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'philippe@gclicke.com',
      password: 'Initiative2024!',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })

    if (error) {
      console.error('Erreur:', error.message)
      return
    }

    console.log('✅ Utilisateur admin créé avec succès!')
    console.log('Email:', data.user.email)
    console.log('ID:', data.user.id)
    console.log('Rôle:', data.user.user_metadata.role)
    
  } catch (error) {
    console.error('Erreur lors de la création:', error.message)
  }
}

createAdminUser()