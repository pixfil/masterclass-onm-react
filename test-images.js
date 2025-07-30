const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImages() {
  // 1. Récupérer une propriété récente
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, title')
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (propError) {
    console.error('Erreur propriétés:', propError)
    return
  }
  
  console.log('\n=== PROPRIÉTÉS RÉCENTES ===')
  for (const prop of properties) {
    console.log(`\nPropriété: ${prop.title}`)
    console.log(`ID: ${prop.id}`)
    
    // 2. Récupérer les images de cette propriété
    const { data: images, error: imgError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', prop.id)
      .order('image_order')
    
    if (imgError) {
      console.error('Erreur images:', imgError)
    } else {
      console.log(`Nombre d'images: ${images?.length || 0}`)
      if (images && images.length > 0) {
        console.log('Première image:', images[0].image_url.substring(0, 100) + '...')
      }
    }
  }
  
  // 3. Vérifier le nombre total d'images dans la base
  const { count } = await supabase
    .from('property_images')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n=== TOTAL IMAGES DANS LA BASE: ${count} ===`)
}

testImages()