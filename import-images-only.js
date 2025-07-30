/**
 * Script pour importer seulement les images des propriétés existantes
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY est requis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Fonction pour télécharger une image et la stocker dans Supabase
async function downloadAndStoreImage(imageUrl, fileName) {
  try {
    console.log(`   📸 Téléchargement de ${imageUrl.substring(0, 60)}...`)
    
    const fetch = (await import('node-fetch')).default
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`     ❌ Erreur téléchargement: ${response.statusText}`)
      return null
    }

    const buffer = await response.buffer()
    
    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, buffer, {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`     ❌ Erreur upload:`, error)
      return null
    }

    // Retourner l'URL publique
    const { data: publicData } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName)

    // S'assurer que l'URL est correcte
    const correctUrl = publicData.publicUrl.replace(
      '/storage/v1/object/public/property-images/',
      '/storage/v1/object/public/property-images/'
    )
    
    console.log('URL générée:', correctUrl)
    return correctUrl
  } catch (error) {
    console.error(`     ❌ Erreur:`, error)
    return null
  }
}

async function importImagesOnly() {
  try {
    // Lire le fichier JSON
    const jsonPath = path.join(__dirname, 'annonces_completes_claude.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    // Récupérer toutes les propriétés existantes
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, reference_interne')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Erreur récupération propriétés:', error)
      return
    }
    
    console.log(`🚀 Import des images pour ${properties.length} propriétés...`)
    
    for (let i = 0; i < Math.min(properties.length, jsonData.length); i++) {
      const property = properties[i]
      const jsonProperty = jsonData[i]
      
      console.log(`\n[${i + 1}] ${property.title}`)
      
      // Vérifier si des images existent déjà
      const { data: existingImages } = await supabase
        .from('property_images')
        .select('id')
        .eq('property_id', property.id)
      
      if (existingImages && existingImages.length > 0) {
        console.log(`   ⚠️  ${existingImages.length} images déjà présentes, skip`)
        continue
      }
      
      // Traiter les photos
      const photos = jsonProperty.Photos ? jsonProperty.Photos.split(', ').filter(url => url.trim()) : []
      
      if (photos.length === 0) {
        console.log('   ❌ Aucune photo trouvée')
        continue
      }
      
      console.log(`   📸 Import de ${photos.length} images...`)
      
      for (let j = 0; j < photos.length; j++) {
        const imageUrl = photos[j]
        const fileName = `property_${property.id}_image_${j + 1}.jpg`
        
        const storedUrl = await downloadAndStoreImage(imageUrl, fileName)
        
        if (storedUrl) {
          // Insérer l'image en base
          const { error: imageError } = await supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              image_url: storedUrl,
              image_order: j + 1,
              is_featured: j === 0
            })
          
          if (imageError) {
            console.error(`     ❌ Erreur insertion image ${j + 1}:`, imageError)
          } else {
            console.log(`     ✅ Image ${j + 1} ajoutée`)
          }
        }
      }
      
      // Mettre à jour l'image featured de la propriété
      if (photos.length > 0) {
        const firstImageFileName = `property_${property.id}_image_1.jpg`
        const { data: publicData } = supabase.storage
          .from('property-images')
          .getPublicUrl(firstImageFileName)
        
        await supabase
          .from('properties')
          .update({ featured_image: publicData.publicUrl })
          .eq('id', property.id)
        
        console.log(`     ✅ Image featured mise à jour`)
      }
    }
    
    console.log('\n🎉 Import des images terminé !')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

importImagesOnly().then(() => {
  console.log('Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('Erreur fatale:', error)
  process.exit(1)
})