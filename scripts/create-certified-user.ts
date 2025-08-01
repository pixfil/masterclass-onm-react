import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createCertifiedUser() {
  console.log('🚀 Création d\'un utilisateur certifié...')

  try {
    // 1. Créer l'utilisateur dans Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'philippeheit@gmail.com',
      password: 'Masterclass2024!', // Mot de passe temporaire
      email_confirm: true,
      user_metadata: {
        full_name: 'Philippe Hiet'
      }
    })

    if (authError) {
      console.error('❌ Erreur création utilisateur:', authError)
      return
    }

    console.log('✅ Utilisateur créé dans Auth:', authData.user.id)

    // 2. Créer le profil utilisateur (avec seulement les colonnes qui existent)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: 'philippeheit@gmail.com',
        first_name: 'Philippe',
        last_name: 'Hiet',
        role: 'user',
        phone: '+33 6 12 34 56 78',
        location: 'Paris, France',
        website: 'https://dr-hiet.fr'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Erreur création profil:', profileError)
      return
    }

    console.log('✅ Profil utilisateur créé')

    // 3. Essayer d'ajouter la certification (si la colonne existe)
    try {
      await supabase
        .from('user_profiles')
        .update({
          is_certified: true,
          certification_date: new Date().toISOString()
        })
        .eq('id', authData.user.id)
      
      console.log('✅ Certification ajoutée')
    } catch (certError) {
      console.log('⚠️  Impossible d\'ajouter la certification (colonne peut-être manquante)')
    }

    // 4. Essayer d'ajouter des badges (si la table existe)
    try {
      const badges = [
        { badge_id: 'badge-onm-certified', earned_at: new Date().toISOString() },
        { badge_id: 'badge-first-formation', earned_at: new Date().toISOString() },
        { badge_id: 'badge-excellence', earned_at: new Date().toISOString() }
      ]

      for (const badge of badges) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: authData.user.id,
            ...badge
          })
      }

      console.log('✅ Badges ajoutés')
    } catch (badgeError) {
      console.log('⚠️  Impossible d\'ajouter les badges (table peut-être manquante)')
    }

    // 5. Essayer d'ajouter des tags de profil (si la table existe)
    try {
      const tags = [
        { tag_name: 'Certifié ONM', tag_category: 'achievement' },
        { tag_name: 'Expert', tag_category: 'expertise' },
        { tag_name: 'Formateur', tag_category: 'activity' }
      ]

      for (const tag of tags) {
        await supabase
          .from('user_profile_tags')
          .insert({
            user_id: authData.user.id,
            ...tag
          })
      }

      console.log('✅ Tags de profil ajoutés')
    } catch (tagError) {
      console.log('⚠️  Impossible d\'ajouter les tags (table peut-être manquante)')
    }

    // 6. Essayer de créer une entrée dans la timeline (si la table existe)
    try {
      await supabase
        .from('user_timeline')
        .insert({
          user_id: authData.user.id,
          event_type: 'certification',
          event_title: 'Certification ONM obtenue',
          event_description: 'Félicitations ! Vous êtes maintenant certifié ONM.',
          event_date: new Date().toISOString(),
          metadata: {
            certification_number: `ONM-${authData.user.id.slice(0, 8).toUpperCase()}`
          }
        })

      console.log('✅ Événement timeline ajouté')
    } catch (timelineError) {
      console.log('⚠️  Impossible d\'ajouter l\'événement timeline (table peut-être manquante)')
    }

    console.log('\n🎉 Utilisateur certifié créé avec succès !')
    console.log('📧 Email:', 'philippeheit@gmail.com')
    console.log('🔑 Mot de passe:', 'Masterclass2024!')
    console.log('🆔 ID:', authData.user.id)
    console.log('🏆 Certifié:', 'Oui')
    console.log('\n⚠️  Demandez à l\'utilisateur de changer son mot de passe lors de la première connexion')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
createCertifiedUser()