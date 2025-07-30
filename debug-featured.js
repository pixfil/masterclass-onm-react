const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase - remplacer par vos vraies valeurs
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTgwMzgsImV4cCI6MjA2OTE5NDAzOH0.M6A7gXxn3tq2Gc0CXWZ8shWhhzss0pIdMC22RAZZJCo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFeaturedProperties() {
  console.log('=== DEBUG FEATURED PROPERTIES ===')

  // 1. Vérifier les propriétés en vedette
  console.log('\n1. Propriétés marquées featured=true:')
  const { data: featured, error: featuredError } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)

  if (featuredError) {
    console.error('Erreur featured:', featuredError)
  } else {
    console.log(`Trouvé ${featured.length} propriétés en vedette:`)
    featured.forEach(p => {
      console.log(`- ${p.title} (ID: ${p.id}, published: ${p.published}, status: ${p.status}, deleted_at: ${p.deleted_at})`)
    })
  }

  // 2. Vérifier les propriétés publiées
  console.log('\n2. Propriétés publiées disponibles:')
  const { data: published, error: publishedError } = await supabase
    .from('properties')
    .select('*')
    .eq('published', true)
    .eq('status', 'disponible')
    .is('deleted_at', null)

  if (publishedError) {
    console.error('Erreur published:', publishedError)
  } else {
    console.log(`Trouvé ${published.length} propriétés publiées:`)
    published.slice(0, 5).forEach(p => {
      console.log(`- ${p.title} (ID: ${p.id}, featured: ${p.is_featured})`)
    })
  }

  // 3. Tester la fonction getFeaturedProperties
  console.log('\n3. Test de getFeaturedProperties:')
  const { data: getFeaturedResult, error: getFeaturedError } = await supabase
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

  if (getFeaturedError) {
    console.error('Erreur getFeatured:', getFeaturedError)
  } else {
    console.log(`getFeaturedProperties retourne ${getFeaturedResult.length} propriétés:`)
    getFeaturedResult.forEach(p => {
      console.log(`- ${p.title} (${p.property_images?.length || 0} images)`)
    })
  }

  process.exit(0)
}

debugFeaturedProperties()