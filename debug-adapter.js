const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTgwMzgsImV4cCI6MjA2OTE5NDAzOH0.M6A7gXxn3tq2Gc0CXWZ8shWhhzss0pIdMC22RAZZJCo'

const supabase = createClient(supabaseUrl, supabaseKey)

// Simuler l'adaptateur
function adaptPropertyToListing(property) {
  console.log(`Adapting property: ${property.title}`)
  console.log(`  - Images: ${property.property_images?.length || 0}`)
  console.log(`  - Gallery images: ${property.gallery_images?.length || 0}`)
  console.log(`  - Featured image: ${property.featured_image || 'none'}`)
  
  const galleryImages = property.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || []
  const featuredImage = property.featured_image || galleryImages[0] || ''
  
  return {
    id: `property://${property.id}`,
    title: property.title,
    featuredImage,
    galleryImgs: galleryImages,
    address: property.address || property.city,
    price: property.transaction_type === 'vente' 
      ? `€${new Intl.NumberFormat('fr-FR').format(property.price)}`
      : `€${property.price}/mois`,
  }
}

async function debugAdapter() {
  console.log('=== DEBUG ADAPTER ===')

  // Récupérer les propriétés en vedette avec le même query que la fonction
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        image_order,
        alt_text,
        is_featured
      )
    `)
    .eq('is_featured', true)
    .eq('published', true)
    .eq('status', 'disponible')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Erreur:', error)
    return
  }

  console.log(`\nPropriétés récupérées: ${properties.length}`)
  
  // Transformer chaque propriété
  const listings = []
  for (const property of properties) {
    // Ajouter gallery_images comme le fait le getFeaturedProperties
    property.gallery_images = property.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || []
    
    const listing = adaptPropertyToListing(property)
    listings.push(listing)
    console.log(`Résultat: ${listing.title} - Featured: ${listing.featuredImage ? 'OUI' : 'NON'}`)
  }

  console.log(`\n=== RÉSULTAT FINAL ===`)
  console.log(`${listings.length} listings créés`)
  listings.forEach((listing, index) => {
    console.log(`${index + 1}. ${listing.title}`)
    console.log(`   Image: ${listing.featuredImage ? 'Présente' : 'MANQUANTE'}`)
    console.log(`   Galerie: ${listing.galleryImgs.length} images`)
  })

  process.exit(0)
}

debugAdapter()