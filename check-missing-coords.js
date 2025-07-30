// Script pour vérifier les propriétés sans coordonnées
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTgwMzgsImV4cCI6MjA2OTE5NDAzOH0.M6A7gXxn3tq2Gc0CXWZ8shWhhzss0pIdMC22RAZZJCo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMissingCoordinates() {
  console.log('🔍 Vérification des coordonnées manquantes...')
  
  try {
    // Récupérer toutes les propriétés
    const { data: allProperties, error: allError } = await supabase
      .from('properties')
      .select('id, title, address, city, postal_code, latitude, longitude')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Erreur récupération:', allError)
      return
    }
    
    console.log(`📊 Total propriétés: ${allProperties.length}`)
    
    // Filtrer celles sans coordonnées
    const missingCoords = allProperties.filter(p => 
      !p.latitude || !p.longitude || p.latitude === 0 || p.longitude === 0
    )
    
    console.log(`🗺️ Propriétés sans coordonnées: ${missingCoords.length}`)
    
    if (missingCoords.length > 0) {
      console.log('\n📋 Liste des propriétés à géocoder:')
      missingCoords.forEach((prop, i) => {
        const address = [prop.address, prop.city, prop.postal_code].filter(Boolean).join(', ')
        console.log(`${i+1}. ${prop.title}`)
        console.log(`   Adresse: ${address || 'Adresse incomplète'}`)
        console.log(`   Coords: lat=${prop.latitude}, lng=${prop.longitude}`)
        console.log('')
      })
      
      // Vérifier les adresses complètes vs incomplètes
      const withAddress = missingCoords.filter(p => p.address && p.city)
      const withoutAddress = missingCoords.filter(p => !p.address || !p.city)
      
      console.log(`✅ Avec adresse exploitable: ${withAddress.length}`)
      console.log(`❌ Sans adresse exploitable: ${withoutAddress.length}`)
      
      if (withoutAddress.length > 0) {
        console.log('\n⚠️ Propriétés avec adresses incomplètes:')
        withoutAddress.forEach((prop, i) => {
          console.log(`${i+1}. ${prop.title} - ${prop.city || 'Ville manquante'}`)
        })
      }
    } else {
      console.log('✅ Toutes les propriétés ont des coordonnées !')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkMissingCoordinates()