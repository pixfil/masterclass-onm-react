const { createClient } = require('@supabase/supabase-js')

// Configuration avec la clé service pour avoir tous les droits
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  try {
    console.log('Création des tables...')
    
    // Test de connexion
    const { data: testConnection, error: connectionError } = await supabase
      .from('_test')
      .select('*')
      .limit(1)
    
    console.log('Connexion testée')
    
    // Vérifier si la table properties existe
    const { data: existingTables, error: tablesError } = await supabase
      .rpc('get_tables')
    
    console.log('Tables existantes vérifiées')
    
    // Utiliser l'API REST pour créer la table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS properties (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        title text NOT NULL,
        description text,
        price integer NOT NULL,
        transaction_type text NOT NULL,
        property_type text NOT NULL,
        status text DEFAULT 'disponible',
        city text NOT NULL,
        address text,
        postal_code text,
        latitude numeric DEFAULT 0,
        longitude numeric DEFAULT 0,
        surface numeric,
        rooms integer,
        bedrooms integer,
        bathrooms integer,
        floor integer,
        parking integer,
        construction_year integer,
        balcony boolean DEFAULT false,
        terrace boolean DEFAULT false,
        garden boolean DEFAULT false,
        elevator boolean DEFAULT false,
        furnished boolean DEFAULT false,
        energy_class text,
        heating_type text,
        charges numeric,
        tax_fonciere numeric,
        images text[] DEFAULT '{}',
        features text[] DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        published boolean DEFAULT true,
        views_count integer DEFAULT 0,
        slug text
      );
    `
    
    // Essayer de créer la table via une requête HTTP directe
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    })
    
    if (response.ok) {
      console.log('✅ Table properties créée via API REST')
    } else {
      console.log('❌ Erreur API REST:', await response.text())
    }
    
    // Test simple : insérer directement une propriété
    console.log('Test d\'insertion directe...')
    
    const { data: insertTest, error: insertError } = await supabase
      .from('properties')
      .insert([
        {
          title: 'Test Direct',
          price: 150000,
          transaction_type: 'vente',
          property_type: 'appartement',
          city: 'Strasbourg'
        }
      ])
      .select()
    
    if (insertError) {
      console.error('❌ Erreur insertion:', insertError)
    } else {
      console.log('✅ Propriété test créée:', insertTest)
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

createTables()