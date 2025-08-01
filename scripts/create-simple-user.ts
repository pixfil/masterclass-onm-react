import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  console.log('🚀 Création d\'un utilisateur simple...')

  try {
    // 1. Créer l'utilisateur dans Auth uniquement
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'philippeheit@gmail.com',
      password: 'Masterclass2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Philippe Hiet'
      }
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  L\'utilisateur existe déjà')
        
        // Essayer de récupérer l'utilisateur existant
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (!listError && users) {
          const existingUser = users.find(u => u.email === 'philippeheit@gmail.com')
          if (existingUser) {
            console.log('✅ Utilisateur existant trouvé:', existingUser.id)
            console.log('📧 Email:', 'philippeheit@gmail.com')
            console.log('🔑 Utilisez "Mot de passe oublié" pour réinitialiser le mot de passe')
            return
          }
        }
      } else {
        console.error('❌ Erreur création utilisateur:', authError)
      }
      return
    }

    console.log('✅ Utilisateur créé avec succès !')
    console.log('📧 Email:', 'philippeheit@gmail.com')
    console.log('🔑 Mot de passe:', 'Masterclass2024!')
    console.log('🆔 ID:', authData.user.id)
    console.log('\n⚠️  Demandez à l\'utilisateur de changer son mot de passe lors de la première connexion')

    // 2. Créer un profil minimal
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: 'philippeheit@gmail.com',
        first_name: 'Philippe',
        last_name: 'Hiet',
        role: 'user'
      })

    if (profileError) {
      console.log('⚠️  Profil non créé (peut-être créé automatiquement via trigger)')
    } else {
      console.log('✅ Profil utilisateur créé')
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
createUser()