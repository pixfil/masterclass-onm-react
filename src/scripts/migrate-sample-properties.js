const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

// Données d'exemple transformées pour l'immobilier strasbourgeois
const sampleProperties = [
  {
    title: 'Appartement moderne Petite France',
    description: 'Magnifique appartement rénové dans le quartier historique de la Petite France avec vue sur les canaux.',
    price: 325000,
    transaction_type: 'vente',
    property_type: 'appartement',
    city: 'Strasbourg',
    address: '12 Rue du Bain aux Plantes',
    postal_code: '67000',
    latitude: 48.5796,
    longitude: 7.7389,
    surface: 75,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    balcony: true,
    elevator: true,
    furnished: false,
    energy_class: 'C',
    heating_type: 'Gaz',
    images: [
      'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1604145195376-e2c8195adf29?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    ]
  },
  {
    title: 'Maison familiale Cronenbourg',
    description: 'Belle maison familiale avec jardin dans le quartier résidentiel de Cronenbourg, proche des écoles et commerces.',
    price: 485000,
    transaction_type: 'vente',
    property_type: 'maison',
    city: 'Strasbourg',
    address: '25 Avenue de Colmar',
    postal_code: '67100',
    latitude: 48.5833,
    longitude: 7.7333,
    surface: 120,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    garden: true,
    parking: 2,
    energy_class: 'D',
    heating_type: 'Gaz',
    construction_year: 1985,
    images: [
      'https://images.unsplash.com/photo-1498503403619-e39e4ff390fe?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
      'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    ]
  },
  {
    title: 'Studio centre-ville Kléber',
    description: 'Studio lumineux en plein centre-ville, à deux pas de la place Kléber et des transports.',
    price: 850,
    transaction_type: 'location',
    property_type: 'appartement',
    city: 'Strasbourg',
    address: '8 Rue des Grandes Arcades',
    postal_code: '67000',
    latitude: 48.5839,
    longitude: 7.7455,
    surface: 25,
    rooms: 1,
    bedrooms: 0,
    bathrooms: 1,
    floor: 3,
    elevator: false,
    furnished: true,
    energy_class: 'E',
    heating_type: 'Électrique',
    charges: 120,
    images: [
      'https://images.pexels.com/photos/6438752/pexels-photo-6438752.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    ]
  },
  {
    title: 'Appartement neuf Neudorf',
    description: 'Appartement neuf dans une résidence moderne avec terrasse et parking, quartier Neudorf.',
    price: 298000,
    transaction_type: 'vente',
    property_type: 'appartement',
    city: 'Strasbourg',
    address: '14 Avenue du Rhin',
    postal_code: '67100',
    latitude: 48.5692,
    longitude: 7.7561,
    surface: 68,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 1,
    terrace: true,
    parking: 1,
    elevator: true,
    energy_class: 'A',
    heating_type: 'Gaz',
    construction_year: 2022,
    charges: 180,
    images: [
      'https://images.unsplash.com/photo-1571509706433-a89eecf63dc8?q=80&w=3858&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    ]
  },
  {
    title: 'Local commercial Krutenau',
    description: 'Local commercial idéalement situé dans le quartier animé de Krutenau, parfait pour commerce de proximité.',
    price: 2200,
    transaction_type: 'location',
    property_type: 'locaux_commerciaux',
    city: 'Strasbourg',
    address: '33 Rue de Zurich',
    postal_code: '67000',
    latitude: 48.5756,
    longitude: 7.7511,
    surface: 45,
    rooms: 2,
    bathrooms: 1,
    energy_class: 'D',
    heating_type: 'Gaz',
    charges: 350,
    images: [
      'https://images.unsplash.com/photo-1535205148555-bcbbc2a78913?q=80&w=3948&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ]
  },
  {
    title: 'Villa avec piscine Robertsau',
    description: 'Magnifique villa contemporaine avec piscine et grand jardin dans le prestigieux quartier de la Robertsau.',
    price: 750000,
    transaction_type: 'vente',
    property_type: 'maison',
    city: 'Strasbourg',
    address: '18 Rue de la Robertsau',
    postal_code: '67000',
    latitude: 48.5978,
    longitude: 7.7700,
    surface: 180,
    rooms: 7,
    bedrooms: 5,
    bathrooms: 3,
    garden: true,
    parking: 3,
    energy_class: 'B',
    heating_type: 'Pompe à chaleur',
    construction_year: 2010,
    tax_fonciere: 2400,
    images: [
      'https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    ]
  },
  {
    title: 'Parking souterrain Gare',
    description: 'Place de parking sécurisée dans parking souterrain proche de la gare centrale.',
    price: 18000,
    transaction_type: 'vente',
    property_type: 'parking',
    city: 'Strasbourg',
    address: '2 Place de la Gare',
    postal_code: '67000',
    latitude: 48.5847,
    longitude: 7.7339,
    surface: 12,
    rooms: 1,
    images: []
  },
  {
    title: 'Duplex Esplanade',
    description: 'Superbe duplex avec caractère dans une ancienne bâtisse rénovée, quartier Esplanade.',
    price: 1250,
    transaction_type: 'location',
    property_type: 'appartement',
    city: 'Strasbourg',
    address: '45 Boulevard de la Victoire',
    postal_code: '67000',
    latitude: 48.5811,
    longitude: 7.7644,
    surface: 85,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 2,
    floor: 4,
    balcony: true,
    furnished: false,
    energy_class: 'D',
    heating_type: 'Gaz',
    charges: 200,
    images: [
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ]
  }
]

async function migrateProperties() {
  try {
    console.log('Migration des propriétés d\'exemple vers Supabase...')
    
    // Supprimer les anciennes propriétés d'exemple
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .neq('id', 'xxx') // Supprimer toutes les propriétés
    
    if (deleteError) {
      console.warn('Erreur lors de la suppression:', deleteError.message)
    } else {
      console.log('✅ Anciennes propriétés supprimées')
    }
    
    let inserted = 0
    
    for (const property of sampleProperties) {
      try {
        const slug = slugify(property.title)
        
        const { data, error } = await supabase
          .from('properties')
          .insert({
            ...property,
            slug,
            status: 'disponible',
            published: true,
            views_count: Math.floor(Math.random() * 100) + 10
          })
          .select()
        
        if (error) {
          console.error(`❌ Erreur pour "${property.title}":`, error.message)
        } else {
          console.log(`✅ ${property.title} - ${property.city}`)
          inserted++
        }
      } catch (err) {
        console.error(`❌ Erreur pour "${property.title}":`, err.message)
      }
    }
    
    console.log(`\n🎉 Migration terminée: ${inserted}/${sampleProperties.length} propriétés importées!`)
    
    // Afficher les statistiques
    const { data: stats } = await supabase
      .from('properties')
      .select('transaction_type, property_type')
    
    if (stats) {
      const ventes = stats.filter(p => p.transaction_type === 'vente').length
      const locations = stats.filter(p => p.transaction_type === 'location').length
      const appartements = stats.filter(p => p.property_type === 'appartement').length
      const maisons = stats.filter(p => p.property_type === 'maison').length
      
      console.log('\n📊 Statistiques:')
      console.log(`- À vendre: ${ventes}`)
      console.log(`- À louer: ${locations}`)
      console.log(`- Appartements: ${appartements}`)
      console.log(`- Maisons: ${maisons}`)
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

migrateProperties()