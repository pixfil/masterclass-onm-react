const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Génère un slug SEO-optimisé pour une propriété
 */
function generatePropertySlug(property) {
  // Nettoyer et formater les éléments du slug
  const propertyType = property.property_type.toLowerCase()
    .replace('_', '-')
    .replace(/[^a-z0-9-]/g, '')
  
  const city = property.city.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Construire le slug avec informations clés
  let slug = `${propertyType}-${city}`
  
  // Ajouter la surface si disponible
  if (property.surface && property.surface > 0) {
    slug += `-${property.surface}m2`
  }
  
  // Ajouter le nombre de pièces si disponible
  if (property.rooms && property.rooms > 0) {
    slug += `-${property.rooms}pieces`
  }
  
  // Ajouter une indication de prix pour l'unicité
  const priceRange = Math.floor(property.price / 50000) * 50000
  slug += `-${priceRange}`
  
  return slug
}

async function updatePropertySlugs() {
  console.log('🔄 Mise à jour des slugs des propriétés...')
  
  try {
    // Récupérer toutes les propriétés
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, property_type, city, surface, rooms, price, slug')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    console.log(`📦 ${properties.length} propriétés trouvées`)
    
    let updated = 0
    let errors = 0
    
    for (const property of properties) {
      try {
        // Générer le nouveau slug
        const newSlug = generatePropertySlug(property)
        
        // Vérifier si le slug a changé
        if (property.slug !== newSlug) {
          console.log(`📝 Mise à jour: ${property.title}`)
          console.log(`   Ancien slug: ${property.slug || 'aucun'}`)
          console.log(`   Nouveau slug: ${newSlug}`)
          
          // Mettre à jour le slug
          const { error: updateError } = await supabase
            .from('properties')
            .update({ 
              slug: newSlug,
              updated_at: new Date().toISOString()
            })
            .eq('id', property.id)
          
          if (updateError) {
            console.error(`❌ Erreur pour ${property.title}:`, updateError.message)
            errors++
          } else {
            updated++
          }
        }
        
        // Petite pause pour éviter de surcharger la base
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`❌ Erreur pour la propriété ${property.id}:`, err.message)
        errors++
      }
    }
    
    console.log('\\n📊 Résultats:')
    console.log(`✅ ${updated} propriétés mises à jour`)
    console.log(`❌ ${errors} erreurs`)
    console.log(`📄 ${properties.length - updated - errors} propriétés inchangées`)
    
  } catch (error) {
    console.error('💥 Erreur générale:', error.message)
  }
}

// Lancer la mise à jour
updatePropertySlugs()