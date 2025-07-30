const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugImport() {
  try {
    console.log('🔍 Debug de l\'import WordPress...\n');
    
    // Lire le JSON
    const jsonData = fs.readFileSync('wp_posts_initiative.json', 'utf8');
    const data = JSON.parse(jsonData);
    const tableData = data.find(item => item.type === 'table');
    const wpProperties = tableData.data;
    
    console.log(`📦 Total propriétés JSON: ${wpProperties.length}`);
    
    // Compter combien existent déjà en base
    let existingCount = 0;
    let errorCount = 0;
    let successCount = 0;
    
    for (let i = 0; i < wpProperties.length; i++) {
      const wpProperty = wpProperties[i];
      
      try {
        // Vérifier si existe déjà
        const { data: existing, error: checkError } = await supabase
          .from('properties')
          .select('id')
          .eq('handle', wpProperty.slug)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`❌ Erreur vérification propriété ${i + 1} (${wpProperty.post_title}):`, checkError.message);
          errorCount++;
          continue;
        }
        
        if (existing) {
          existingCount++;
        } else {
          console.log(`✅ Nouvelle propriété trouvée [${i + 1}]: ${wpProperty.post_title}`);
          successCount++;
        }
        
        // Pause pour éviter de surcharger Supabase
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Erreur traitement propriété ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résultats debug:`);
    console.log(`✅ Déjà importées: ${existingCount}`);
    console.log(`🆕 À importer: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📊 Total: ${existingCount + successCount + errorCount}/${wpProperties.length}`);
    
    // Vérifier le nombre actuel en base
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🗄️ Propriétés actuelles en base: ${count}`);
    
  } catch (error) {
    console.error('❌ Erreur fatale debug:', error);
  }
}

debugImport();