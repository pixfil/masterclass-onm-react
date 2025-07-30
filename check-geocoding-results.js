const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGeocodingResults() {
  console.log('🔍 Vérification des résultats de géocodage...\n')

  try {
    // Récupérer toutes les propriétés avec leurs coordonnées
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, address, city, zipcode, latitude, longitude')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error)
      return
    }

    console.log(`📊 Vérification de ${properties.length} propriétés récentes:\n`)

    let withCoords = 0
    let withoutCoords = 0
    let withZeroCoords = 0

    properties.forEach((property, index) => {
      const hasLat = property.latitude && property.latitude !== 0
      const hasLng = property.longitude && property.longitude !== 0
      const hasCoords = hasLat && hasLng
      
      if (hasCoords) {
        withCoords++
        console.log(`✅ [${index + 1}] ${property.title}`)
        console.log(`   📍 ${property.address}, ${property.city}, ${property.zipcode}`)
        console.log(`   🗺️  Coords: ${property.latitude}, ${property.longitude}\n`)
      } else if (property.latitude === 0 || property.longitude === 0) {
        withZeroCoords++
        console.log(`❌ [${index + 1}] ${property.title}`)
        console.log(`   📍 ${property.address}, ${property.city}, ${property.zipcode}`)
        console.log(`   🗺️  Coords: ${property.latitude || 'null'}, ${property.longitude || 'null'} (ZÉRO!)\n`)
      } else {
        withoutCoords++
        console.log(`⚠️  [${index + 1}] ${property.title}`)
        console.log(`   📍 ${property.address}, ${property.city}, ${property.zipcode}`)
        console.log(`   🗺️  Coords: ${property.latitude || 'null'}, ${property.longitude || 'null'} (MANQUANT)\n`)
      }
    })

    console.log('📈 Résumé:')
    console.log(`✅ Avec coordonnées: ${withCoords}`)
    console.log(`❌ Coordonnées à zéro: ${withZeroCoords}`)
    console.log(`⚠️  Sans coordonnées: ${withoutCoords}`)

    // Vérifier quelques propriétés spécifiques pour diagnostic
    console.log('\n🔍 Diagnostic détaillé pour quelques propriétés:')
    
    const { data: sampleProps, error: sampleError } = await supabase
      .from('properties')
      .select('id, title, address, city, zipcode, latitude, longitude')
      .in('city', ['Strasbourg', 'Gambsheim', 'Bischheim'])
      .limit(5)

    if (sampleError) {
      console.error('❌ Erreur échantillon:', sampleError)
      return
    }

    sampleProps.forEach(prop => {
      console.log(`\n🏠 ${prop.title}`)
      console.log(`   Ville: ${prop.city}`)
      console.log(`   Code postal: ${prop.zipcode}`)
      console.log(`   Adresse: ${prop.address}`)
      console.log(`   Latitude: ${prop.latitude}`)
      console.log(`   Longitude: ${prop.longitude}`)
      
      if (prop.latitude === 0 && prop.longitude === 0) {
        console.log(`   ⚠️  PROBLÈME: Coordonnées à zéro!`)
      } else if (!prop.latitude || !prop.longitude) {
        console.log(`   ⚠️  PROBLÈME: Coordonnées manquantes!`)
      }
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkGeocodingResults()