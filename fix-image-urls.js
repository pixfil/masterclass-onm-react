const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixImageUrls() {
  console.log('🔧 Correction des URLs des images...')
  
  // Récupérer toutes les images
  const { data: images, error } = await supabase
    .from('property_images')
    .select('*')
  
  if (error) {
    console.error('Erreur:', error)
    return
  }
  
  console.log(`📸 ${images.length} images trouvées`)
  
  let fixed = 0
  
  for (const image of images) {
    // Vérifier si l'URL est incorrecte
    if (image.image_url && !image.image_url.includes('/storage/v1/object/public/property-images/')) {
      // L'URL est probablement juste le nom du fichier
      // Extraire le nom du fichier de l'URL actuelle
      const fileName = image.image_url.split('/').pop()
      
      // Construire la bonne URL
      const correctUrl = `https://vxqxkezrgadseavfzjwp.supabase.co/storage/v1/object/public/property-images/${fileName}`
      
      console.log(`Correction: ${image.image_url.substring(0, 50)}... -> ${correctUrl.substring(0, 80)}...`)
      
      // Mettre à jour dans la base
      const { error: updateError } = await supabase
        .from('property_images')
        .update({ image_url: correctUrl })
        .eq('id', image.id)
      
      if (updateError) {
        console.error(`❌ Erreur mise à jour image ${image.id}:`, updateError)
      } else {
        fixed++
      }
    }
  }
  
  console.log(`\n✅ ${fixed} URLs corrigées !`)
  
  // Mettre à jour aussi les featured_image dans properties
  console.log('\n🔧 Correction des images featured...')
  
  const { data: properties } = await supabase
    .from('properties')
    .select('id, featured_image')
    .not('featured_image', 'is', null)
  
  let fixedFeatured = 0
  
  for (const prop of properties) {
    if (prop.featured_image && !prop.featured_image.includes('/storage/v1/object/public/property-images/')) {
      const fileName = prop.featured_image.split('/').pop()
      const correctUrl = `https://vxqxkezrgadseavfzjwp.supabase.co/storage/v1/object/public/property-images/${fileName}`
      
      const { error: updateError } = await supabase
        .from('properties')
        .update({ featured_image: correctUrl })
        .eq('id', prop.id)
      
      if (!updateError) {
        fixedFeatured++
      }
    }
  }
  
  console.log(`✅ ${fixedFeatured} images featured corrigées !`)
}

fixImageUrls()