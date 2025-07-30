// Debug script pour tester le frontend
const { getFeaturedProperties } = require('./src/lib/supabase/properties.ts')
const { adaptPropertiesToListings } = require('./src/lib/adapters/property-adapter.ts')

async function debugFrontend() {
  console.log('=== DEBUG FRONTEND ===\n')
  
  try {
    console.log('1. Test getFeaturedProperties...')
    const properties = await getFeaturedProperties(6)
    console.log(`✓ getFeaturedProperties returned ${properties.length} properties\n`)
    
    console.log('2. Test adaptPropertiesToListings...')
    const listings = adaptPropertiesToListings(properties)
    console.log(`✓ adaptPropertiesToListings returned ${listings.length} listings\n`)
    
    console.log('3. Sample listing data:')
    if (listings.length > 0) {
      const sample = listings[0]
      console.log(`- ID: ${sample.id}`)
      console.log(`- Title: ${sample.title}`)
      console.log(`- Address: ${sample.address}`)
      console.log(`- Price: ${sample.price}`)
      console.log(`- Featured Image: ${sample.featuredImage}`)
      console.log(`- Gallery Images: ${sample.galleryImgs?.length || 0} images`)
      console.log(`- First Gallery Image: ${sample.galleryImgs?.[0] || 'None'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugFrontend()