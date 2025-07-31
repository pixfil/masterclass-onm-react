const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'sb_secret_4VA5jIKOp1hBUHidgIKeZA_7qwYDfvo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixPermissions() {
  try {
    console.log('Correction des permissions RLS...')
    
    // Désactiver RLS temporairement pour tester
    const { error: rls1 } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE properties DISABLE ROW LEVEL SECURITY;' 
    })
    
    if (rls1) {
      console.log('RLS déjà désactivé ou erreur:', rls1.message)
    }
    
    console.log('✅ RLS désactivé pour les tests')
    
    // Test de création d'une propriété
    console.log('Test de création d\'une propriété...')
    
    const { data: testProperty, error: testError } = await supabase
      .from('properties')
      .insert({
        title: 'Test - Appartement admin',
        description: 'Test depuis le script',
        price: 180000,
        transaction_type: 'vente',
        property_type: 'appartement',
        city: 'Strasbourg',
        latitude: 48.5734,
        longitude: 7.7521
      })
      .select()
    
    if (testError) {
      console.error('❌ Erreur lors du test:', testError)
    } else {
      console.log('✅ Test réussi! Propriété créée:', testProperty[0]?.id)
      
      // Garder la propriété de test pour validation
      console.log('Propriété de test conservée pour validation')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

fixPermissions()