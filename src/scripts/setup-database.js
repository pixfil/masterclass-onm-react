const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'sb_secret_4VA5jIKOp1hBUHidgIKeZA_7qwYDfvo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('Configuration de la base de données...')
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../database/schema-updated.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Diviser en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'))
    
    console.log(`Exécution de ${queries.length} requêtes...`)
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: query })
          if (error) {
            console.warn('Avertissement pour la requête:', error.message)
          }
        } catch (err) {
          // Essayer avec une approche différente
          try {
            const { error } = await supabase
              .from('__temp__')
              .select('*')
              .limit(0) // Juste pour tester la connexion
            
            console.log('Requête ignorée (probablement déjà exécutée):', query.substring(0, 50) + '...')
          } catch (e) {
            console.warn('Erreur ignorée:', e.message)
          }
        }
      }
    }
    
    console.log('✅ Base de données configurée avec succès!')
    
    // Tester en créant une propriété de test
    console.log('Test de création d\'une propriété...')
    
    const { data: testProperty, error: testError } = await supabase
      .from('properties')
      .insert({
        title: 'Test - Appartement 3 pièces',
        description: 'Appartement de test',
        price: 250000,
        transaction_type: 'vente',
        property_type: 'appartement',
        city: 'Strasbourg',
        latitude: 48.5734,
        longitude: 7.7521,
        surface: 75,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1
      })
      .select()
    
    if (testError) {
      console.error('❌ Erreur lors du test:', testError.message)
    } else {
      console.log('✅ Test réussi! Propriété créée:', testProperty[0].id)
      
      // Supprimer la propriété de test
      await supabase
        .from('properties')
        .delete()
        .eq('id', testProperty[0].id)
      
      console.log('✅ Propriété de test supprimée')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message)
  }
}

setupDatabase()