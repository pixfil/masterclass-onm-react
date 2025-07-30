// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local')
  process.exit(1)
}

// Créer le client Supabase avec les droits admin
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQLFile(filename) {
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(filename)) {
      console.error(`❌ Fichier non trouvé: ${filename}`)
      process.exit(1)
    }

    // Lire le contenu du fichier SQL
    const sqlContent = fs.readFileSync(filename, 'utf8')
    console.log(`📁 Lecture du fichier: ${filename}`)
    console.log(`📝 Contenu SQL:`)
    console.log('─'.repeat(50))
    console.log(sqlContent)
    console.log('─'.repeat(50))

    // Diviser le contenu en requêtes individuelles (séparées par ;)
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'))

    console.log(`🔄 Exécution de ${queries.length} requête(s)...`)

    // Exécuter chaque requête
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      console.log(`\n⏳ Requête ${i + 1}/${queries.length}:`)
      console.log(query.substring(0, 100) + (query.length > 100 ? '...' : ''))

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: query })
      
      if (error) {
        // Essayer avec la méthode alternative si rpc ne fonctionne pas
        console.log('⚠️  RPC non disponible, tentative d\'exécution directe...')
        
        // Pour les requêtes simples, essayer d'autres méthodes
        if (query.toUpperCase().includes('CREATE TABLE')) {
          console.log('❌ Impossible d\'exécuter CREATE TABLE via l\'API. Utilisez le dashboard Supabase.')
        } else if (query.toUpperCase().includes('INSERT')) {
          console.log('❌ Impossible d\'exécuter INSERT complexe via l\'API. Utilisez le dashboard Supabase.')
        } else {
          console.error('❌ Erreur:', error.message)
        }
        
        console.log('💡 Copiez-collez cette requête dans votre dashboard Supabase (SQL Editor)')
        continue
      }

      console.log('✅ Requête exécutée avec succès')
      if (data) {
        console.log('📊 Résultat:', data)
      }
    }

    console.log('\n🎉 Toutes les requêtes ont été traitées !')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error.message)
    console.log('\n💡 Solutions possibles:')
    console.log('1. Vérifiez vos variables d\'environnement dans .env.local')
    console.log('2. Assurez-vous que la clé de service a les bonnes permissions')
    console.log('3. Exécutez manuellement dans le dashboard Supabase')
    process.exit(1)
  }
}

// Vérifier les arguments de ligne de commande
const filename = process.argv[2]

if (!filename) {
  console.log('📚 Usage: node scripts/run-sql.js <fichier.sql>')
  console.log('📚 Exemple: node scripts/run-sql.js create-user-profiles-table.sql')
  process.exit(1)
}

// Résoudre le chemin du fichier (chercher dans le répertoire racine)
const fullPath = path.resolve(filename)

runSQLFile(fullPath)