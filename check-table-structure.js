const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Vérification de la structure de la table properties...\n')

  try {
    // Récupérer une propriété pour voir la structure
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erreur:', error)
      return
    }

    if (properties && properties.length > 0) {
      console.log('📋 Colonnes disponibles dans la table properties:')
      const columns = Object.keys(properties[0])
      columns.forEach((column, index) => {
        console.log(`${index + 1}. ${column}`)
      })

      console.log('\n📊 Exemple de données:')
      const prop = properties[0]
      console.log(`ID: ${prop.id}`)
      console.log(`Titre: ${prop.title}`)
      console.log(`Ville: ${prop.city}`)
      console.log(`Latitude: ${prop.latitude}`)
      console.log(`Longitude: ${prop.longitude}`)
    } else {
      console.log('❌ Aucune propriété trouvée')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkTableStructure()