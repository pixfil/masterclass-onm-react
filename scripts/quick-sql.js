// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function quickSQL(query) {
  try {
    console.log('🔄 Exécution de la requête...')
    console.log('📝 Requête:', query)
    
    // Essayer différentes méthodes selon le type de requête
    let result
    
    if (query.toUpperCase().includes('SELECT')) {
      // Pour les SELECT, utiliser la méthode standard
      const tableName = query.match(/FROM\s+(\w+)/i)?.[1]
      if (tableName) {
        const { data, error } = await supabase.from(tableName).select('*').limit(10)
        result = { data, error }
      }
    } else {
      // Pour les autres requêtes, essayer rpc
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: query })
      result = { data, error }
    }
    
    if (result.error) {
      console.error('❌ Erreur:', result.error.message)
      console.log('💡 Copiez cette requête dans votre dashboard Supabase')
      return
    }
    
    console.log('✅ Succès!')
    if (result.data) {
      console.log('📊 Résultat:', JSON.stringify(result.data, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

const query = process.argv[2]
if (!query) {
  console.log('📚 Usage: node scripts/quick-sql.js "SELECT * FROM table_name"')
  process.exit(1)
}

quickSQL(query)