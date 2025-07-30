const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Fonction pour géocoder une adresse avec Nominatim
async function geocodeAddress(address, city, postalCode) {
  const fullAddress = `${address}, ${city}, ${postalCode}, France`
  const encodedAddress = encodeURIComponent(fullAddress)
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Initiative-Immobilier-Geocoding/1.0 (contact@initiative-immo.fr)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const location = data[0]
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        display_name: location.display_name
      }
    }
    
    return null
  } catch (error) {
    console.error(`Erreur géocodage pour "${fullAddress}":`, error.message)
    return null
  }
}

async function fixGeocodingIssues() {
  console.log('🔧 Correction des problèmes de géocodage...\n')

  try {
    // Récupérer les propriétés avec coordonnées à zéro ou nulles
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, address, city, postal_code, latitude, longitude')
      .or('latitude.eq.0,longitude.eq.0,latitude.is.null,longitude.is.null')
      .limit(50)

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error)
      return
    }

    console.log(`📊 ${properties.length} propriétés à géocoder\n`)

    let successCount = 0
    let failureCount = 0

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      console.log(`[${i + 1}/${properties.length}] ${property.title}`)
      console.log(`📍 Adresse: ${property.address}, ${property.city}, ${property.postal_code}`)

      // Géocoder l'adresse
      const result = await geocodeAddress(property.address, property.city, property.postal_code)
      
      if (result) {
        console.log(`✅ Trouvé: ${result.latitude}, ${result.longitude}`)
        console.log(`📍 ${result.display_name}`)
        
        // Mettre à jour dans la base
        const { error: updateError } = await supabase
          .from('properties')
          .update({
            latitude: result.latitude,
            longitude: result.longitude
          })
          .eq('id', property.id)
        
        if (updateError) {
          console.error(`❌ Erreur mise à jour: ${updateError.message}`)
          failureCount++
        } else {
          console.log(`✅ Coordonnées mises à jour dans la base`)
          successCount++
        }
      } else {
        console.log(`❌ Adresse non trouvée`)
        failureCount++
      }
      
      console.log('')
      
      // Pause d'1 seconde entre les requêtes pour respecter les limites de l'API
      if (i < properties.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`📊 Résultats:`)
    console.log(`✅ Succès: ${successCount}`)
    console.log(`❌ Échecs: ${failureCount}`)
    console.log(`📋 Total traité: ${properties.length}`)

    console.log(`\n🏁 Géocodage de correction terminé!`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

fixGeocodingIssues()