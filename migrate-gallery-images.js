// Migration des images gallery_images vers property_images table
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateGalleryImages() {
  try {
    console.log('🔄 Récupération des propriétés avec gallery_images...')
    
    // Récupérer toutes les propriétés qui ont des gallery_images
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, gallery_images')
      .not('gallery_images', 'is', null)
      .neq('gallery_images', '[]')

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError)
      return
    }

    console.log(`📊 ${properties.length} propriétés trouvées avec des gallery_images`)

    for (const property of properties) {
      console.log(`\n🏠 Migration de: ${property.title}`)
      
      let galleryImages = []
      try {
        galleryImages = typeof property.gallery_images === 'string' 
          ? JSON.parse(property.gallery_images) 
          : property.gallery_images
      } catch (e) {
        console.log(`⚠️  Impossible de parser gallery_images pour ${property.title}`)
        continue
      }

      if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
        console.log(`⚠️  Pas d'images valides pour ${property.title}`)
        continue
      }

      console.log(`📸 ${galleryImages.length} images à migrer`)

      // Vérifier si des images existent déjà dans property_images
      const { data: existingImages } = await supabase
        .from('property_images')
        .select('id')
        .eq('property_id', property.id)

      if (existingImages && existingImages.length > 0) {
        console.log(`⚠️  ${existingImages.length} images existent déjà, on passe`)
        continue
      }

      // Créer les entrées dans property_images
      const imageInserts = galleryImages.map((imageUrl, index) => ({
        property_id: property.id,
        image_url: imageUrl,
        image_order: index,
        alt_text: `Image ${index + 1} - ${property.title}`,
        is_featured: index === 0 // Première image = featured
      }))

      const { data: insertedImages, error: insertError } = await supabase
        .from('property_images')
        .insert(imageInserts)
        .select()

      if (insertError) {
        console.error(`❌ Erreur lors de l'insertion pour ${property.title}:`, insertError)
        continue
      }

      console.log(`✅ ${insertedImages.length} images migrées avec succès`)

      // Mettre à jour featured_image si nécessaire
      if (galleryImages.length > 0) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ featured_image: galleryImages[0] })
          .eq('id', property.id)

        if (updateError) {
          console.error(`⚠️  Erreur mise à jour featured_image:`, updateError)
        }
      }
    }

    console.log('\n🎉 Migration terminée!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

migrateGalleryImages()