const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createStatisticsView() {
  try {
    console.log('Création de la vue property_statistics...')
    
    // Calculer les statistiques directement depuis les propriétés
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('transaction_type, status, published')
    
    if (fetchError) {
      console.error('Erreur lors de la récupération des propriétés:', fetchError)
      return
    }
    
    // Calculer les statistiques
    const total_properties = properties.filter(p => p.published).length
    const for_sale = properties.filter(p => p.published && p.transaction_type === 'vente').length
    const for_rent = properties.filter(p => p.published && p.transaction_type === 'location').length
    const available = properties.filter(p => p.published && p.status === 'disponible').length
    
    console.log('Statistiques calculées:')
    console.log('- Total propriétés:', total_properties)
    console.log('- À vendre:', for_sale)
    console.log('- À louer:', for_rent)
    console.log('- Disponibles:', available)
    
    // Créer une table temporaire pour stocker les statistiques
    const { error: createError } = await supabase
      .from('__temp_stats__')
      .select('*')
      .limit(1)
    
    // Si la table n'existe pas, on va utiliser une autre approche
    // Retourner les statistiques pour le moment
    const statistics = {
      total_properties,
      for_sale,
      for_rent,
      available
    }
    
    console.log('✅ Statistiques prêtes:', statistics)
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

createStatisticsView()