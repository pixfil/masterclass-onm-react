import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updateUserToCertified() {
  console.log('🚀 Mise à jour de l\'utilisateur pour le certifier...')

  try {
    // 1. Récupérer l'utilisateur
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError || !users) {
      console.error('❌ Erreur récupération utilisateurs:', listError)
      return
    }

    const user = users.find(u => u.email === 'philippeheit@gmail.com')
    if (!user) {
      console.error('❌ Utilisateur non trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:', user.id)

    // 2. Vérifier les colonnes disponibles dans user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('⚠️  Profil non trouvé, création...')
      
      // Créer le profil s'il n'existe pas
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: 'philippeheit@gmail.com',
          first_name: 'Philippe',
          last_name: 'Hiet',
          role: 'user'
        })

      if (createError) {
        console.error('❌ Erreur création profil:', createError)
      } else {
        console.log('✅ Profil créé')
      }
    } else {
      console.log('✅ Profil existant trouvé')
    }

    // 3. Essayer d'ajouter la certification
    console.log('\n🏆 Ajout de la certification...')
    
    // D'abord, lister les colonnes pour voir ce qui est disponible
    const { data: tableInfo, error: infoError } = await supabase
      .from('user_profiles')
      .select()
      .eq('id', user.id)
      .limit(1)

    if (tableInfo && tableInfo.length > 0) {
      console.log('📋 Colonnes disponibles:', Object.keys(tableInfo[0]))
      
      // Mettre à jour avec les colonnes qui existent
      const updateData: any = {}
      const columns = Object.keys(tableInfo[0])
      
      if (columns.includes('is_certified')) {
        updateData.is_certified = true
      }
      if (columns.includes('certification_date')) {
        updateData.certification_date = new Date().toISOString()
      }
      if (columns.includes('phone')) {
        updateData.phone = '+33 6 12 34 56 78'
      }
      if (columns.includes('location')) {
        updateData.location = 'Paris, France'
      }
      if (columns.includes('website')) {
        updateData.website = 'https://dr-hiet.fr'
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', user.id)

        if (updateError) {
          console.error('❌ Erreur mise à jour:', updateError)
        } else {
          console.log('✅ Profil mis à jour avec:', Object.keys(updateData).join(', '))
        }
      }
    }

    // 4. Réinitialiser le mot de passe
    const { data: resetData, error: resetError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: 'Masterclass2024!' }
    )

    if (resetError) {
      console.error('❌ Erreur réinitialisation mot de passe:', resetError)
    } else {
      console.log('✅ Mot de passe réinitialisé')
    }

    console.log('\n🎉 Utilisateur mis à jour avec succès !')
    console.log('📧 Email:', 'philippeheit@gmail.com')
    console.log('🔑 Mot de passe:', 'Masterclass2024!')
    console.log('🆔 ID:', user.id)
    console.log('🏆 Certifié:', updateData.is_certified ? 'Oui' : 'Non (colonne manquante)')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
updateUserToCertified()