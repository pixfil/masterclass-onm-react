// Script de géocodage automatique des propriétés
const { createClient } = require('@supabase/supabase-js')
const https = require('https')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTgwMzgsImV4cCI6MjA2OTE5NDAzOH0.M6A7gXxn3tq2Gc0CXWZ8shWhhzss0pIdMC22RAZZJCo'

const supabase = createClient(supabaseUrl, supabaseKey)

// Fonction pour attendre (délai entre les requêtes API)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Fonction de géocodage avec Nominatim
async function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    // Encoder l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr`
    
    https.get(url, { 
      headers: { 
        'User-Agent': 'Initiative-Immobilier-Geocoder/1.0 (contact@initiative-immobilier.fr)' 
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const results = JSON.parse(data)
          if (results && results.length > 0) {
            const result = results[0]
            resolve({
              latitude: parseFloat(result.lat),
              longitude: parseFloat(result.lon),
              display_name: result.display_name
            })
          } else {
            resolve(null)
          }
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

// Fonction pour construire l'adresse complète
function buildFullAddress(property) {
  const parts = []
  
  if (property.address && property.address.trim()) {
    parts.push(property.address.trim())
  }
  
  if (property.city && property.city.trim()) {
    parts.push(property.city.trim())
  }
  
  if (property.postal_code && property.postal_code.trim()) {
    parts.push(property.postal_code.trim())
  }
  
  // Ajouter "France" pour améliorer la précision
  parts.push('France')
  
  return parts.join(', ')
}

async function geocodeProperties() {
  console.log('🚀 Démarrage du géocodage automatique...')
  
  try {
    // Récupérer les propriétés sans coordonnées
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, address, city, postal_code, latitude, longitude')
      .or('latitude.is.null,longitude.is.null,latitude.eq.0,longitude.eq.0')
      .not('city', 'is', null)
      .not('city', 'eq', '')
      .limit(50) // Commencer par 50 propriétés pour tester
    
    if (error) {
      console.error('❌ Erreur récupération:', error)
      return
    }
    
    console.log(`📊 ${properties.length} propriétés à géocoder`)
    
    let successCount = 0
    let errorCount = 0
    let notFoundCount = 0
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      const fullAddress = buildFullAddress(property)
      
      console.log(`\n[${i+1}/${properties.length}] ${property.title}`)
      console.log(`📍 Adresse: ${fullAddress}`)
      
      try {
        // Géocoder l'adresse
        const result = await geocodeAddress(fullAddress)
        
        if (result) {
          console.log(`✅ Trouvé: ${result.latitude}, ${result.longitude}`)
          console.log(`📍 ${result.display_name}`)
          
          // Mettre à jour en base
          const { error: updateError } = await supabase
            .from('properties')
            .update({
              latitude: result.latitude,
              longitude: result.longitude
            })
            .eq('id', property.id)
          
          if (updateError) {
            console.error(`❌ Erreur mise à jour:`, updateError)
            errorCount++
          } else {
            successCount++
          }
        } else {
          console.log(`❌ Adresse non trouvée`)
          notFoundCount++
        }
        
        // Attendre 1 seconde entre chaque requête (politique Nominatim)
        await delay(1000)
        
      } catch (error) {
        console.error(`❌ Erreur géocodage:`, error.message)
        errorCount++
        await delay(2000) // Attendre plus longtemps en cas d'erreur
      }
    }
    
    console.log(`\n📊 Résultats:`)
    console.log(`✅ Succès: ${successCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log(`🔍 Non trouvées: ${notFoundCount}`)
    console.log(`📋 Total traité: ${successCount + errorCount + notFoundCount}`)
    
  } catch (error) {
    console.error('❌ Erreur globale:', error)
  }
}

// Démarrer le géocodage
geocodeProperties().then(() => {
  console.log('\n🏁 Géocodage terminé!')
  process.exit(0)
})