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

// Conversion des données du template vers l'immobilier Strasbourg
const templateProperties = [
  {
    id: 'stay-listing://1',
    title: 'Best Western Cedars Hotel',
    handle: 'best-western-cedars-hotel',
    description: 'Magnifique propriété dans le quartier de la Petite France, Strasbourg. Ancien hôtel transformé en résidence de prestige avec vue sur les canaux.',
    featuredImage: 'https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
      'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '15 Rue du Bain aux Plantes, Petite France',
    reviewStart: 4.8,
    reviewCount: 28,
    price: 850000,
    maxGuests: 6,
    bedrooms: 10,
    bathrooms: 3,
    saleOff: '-10% négociation possible',
    map: { lat: 48.5796, lng: 7.7389 },
    acreage: 250,
    surface: 300
  },
  {
    id: 'stay-listing://2',
    title: 'Belle Propriété Greene King',
    handle: 'belle-propriete-greene-king',
    description: 'Superbe maison bourgeoise dans le quartier de Neudorf, proche du centre-ville et des transports.',
    featuredImage: 'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/2861361/pexels-photo-2861361.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/2677398/pexels-photo-2677398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '22 Avenue du Rhin, Neudorf',
    reviewStart: 4.4,
    reviewCount: 198,
    price: 650000,
    maxGuests: 10,
    bedrooms: 6,
    bathrooms: 7,
    saleOff: '-5% négociation possible',
    map: { lat: 48.5692, lng: 7.7561 },
    acreage: 180,
    surface: 220
  },
  {
    id: 'stay-listing://3',
    title: 'Villa Half Moon Sherborne',
    handle: 'villa-half-moon-sherborne',
    description: 'Villa exceptionnelle dans le quartier résidentiel de la Robertsau avec piscine et grand jardin.',
    featuredImage: 'https://images.pexels.com/photos/2861361/pexels-photo-2861361.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/2861361/pexels-photo-2861361.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/2677398/pexels-photo-2677398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '18 Route de la Wantzenau, Robertsau',
    reviewStart: 3.6,
    reviewCount: 16,
    price: 950000,
    maxGuests: 9,
    bedrooms: 9,
    bathrooms: 8,
    saleOff: null,
    map: { lat: 48.5978, lng: 7.7700 },
    acreage: 800,
    surface: 280
  },
  {
    id: 'stay-listing://4',
    title: 'Hôtel Particulier White Horse',
    handle: 'hotel-particulier-white-horse',
    description: 'Hôtel particulier d\'exception dans le centre historique de Strasbourg, proche de la cathédrale.',
    featuredImage: 'https://images.pexels.com/photos/2677398/pexels-photo-2677398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/2677398/pexels-photo-2677398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/2677398/pexels-photo-2677398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '5 Place de la Cathédrale',
    reviewStart: 4.8,
    reviewCount: 34,
    price: 1200000,
    maxGuests: 6,
    bedrooms: 7,
    bathrooms: 5,
    saleOff: null,
    map: { lat: 48.5839, lng: 7.7455 },
    acreage: 120,
    surface: 350
  },
  {
    id: 'stay-listing://5',
    title: 'Résidence Ship and Castle',
    handle: 'residence-ship-and-castle',
    description: 'Appartement de standing dans résidence moderne avec services, quartier Esplanade.',
    featuredImage: 'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '12 Boulevard de la Victoire, Esplanade',
    reviewStart: 3.4,
    reviewCount: 340,
    price: 385000,
    maxGuests: 8,
    bedrooms: 3,
    bathrooms: 2,
    saleOff: null,
    map: { lat: 48.5811, lng: 7.7644 },
    acreage: 0,
    surface: 95
  },
  {
    id: 'stay-listing://6',
    title: 'Villa Windmill Familiale',
    handle: 'villa-windmill-familiale',
    description: 'Grande villa familiale avec jardin et piscine dans le quartier résidentiel de Cronenbourg.',
    featuredImage: 'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
      'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '45 Avenue de Colmar, Cronenbourg',
    reviewStart: 3.8,
    reviewCount: 508,
    price: 720000,
    maxGuests: 8,
    bedrooms: 7,
    bathrooms: 7,
    saleOff: null,
    map: { lat: 48.5833, lng: 7.7333 },
    acreage: 600,
    surface: 200
  },
  {
    id: 'stay-listing://7',
    title: 'Appartement Unicorn Gunthorpe',
    handle: 'appartement-unicorn-gunthorpe',
    description: 'Appartement moderne avec terrasse dans nouvelle résidence, quartier Hautepierre.',
    featuredImage: 'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/261394/pexels-photo-261394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '8 Rue de Hautepierre',
    reviewStart: 4.2,
    reviewCount: 74,
    price: 275000,
    maxGuests: 4,
    bedrooms: 4,
    bathrooms: 3,
    saleOff: null,
    map: { lat: 48.6000, lng: 7.7100 },
    acreage: 0,
    surface: 85
  },
  {
    id: 'stay-listing://8',
    title: 'Penthouse Holiday Inn Express',
    handle: 'penthouse-holiday-inn-express',
    description: 'Penthouse exceptionnel avec vue panoramique sur Strasbourg et terrasse de 50m².',
    featuredImage: 'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    galleryImgs: [
      'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    address: '25 Rue du Faubourg National',
    reviewStart: 4.9,
    reviewCount: 125,
    price: 580000,
    maxGuests: 6,
    bedrooms: 5,
    bathrooms: 4,
    saleOff: '-3% négociation possible',
    map: { lat: 48.5856, lng: 7.7500 },
    acreage: 0,
    surface: 140
  }
]

// Équipements et caractéristiques pour chaque propriété
const propertyAmenities = {
  'stay-listing://1': ['WiFi haut débit', 'Climatisation', 'Chauffage central', 'Parking privé', 'Jardin', 'Sécurité 24h/24'],
  'stay-listing://2': ['Piscine', 'Garage double', 'Cuisine équipée', 'Cheminée', 'Dressing', 'Terrasse'],
  'stay-listing://3': ['Piscine chauffée', 'Tennis privé', 'Spa', 'Bibliothèque', 'Cave à vin', 'Système domotique'],
  'stay-listing://4': ['Ascenseur privé', 'Cave voûtée', 'Cheminées d\'époque', 'Parquet ancien', 'Moulures', 'Cour d\'honneur'],
  'stay-listing://5': ['Conciergerie', 'Salle de sport', 'Piscine commune', 'Parking souterrain', 'Balcon', 'Cuisine ouverte'],
  'stay-listing://6': ['Piscine', 'Pool house', 'Garage triple', 'Système d\'alarme', 'Arrosage automatique', 'Barbecue'],
  'stay-listing://7': ['Terrasse 20m²', 'Parking', 'Rangements', 'Exposition sud', 'Proche transports', 'Neuf'],
  'stay-listing://8': ['Terrasse 50m²', 'Vue panoramique', 'Ascenseur', 'Parking double', 'Climatisation', 'Haut standing']
}

// Avis pour chaque propriété
const propertyReviews = {
  'stay-listing://1': [
    { name: 'Marie Dubois', rating: 5, comment: 'Propriété exceptionnelle, très bien située dans la Petite France.' },
    { name: 'Jean Martin', rating: 4, comment: 'Magnifique vue sur les canaux, cachet historique préservé.' }
  ],
  'stay-listing://2': [
    { name: 'Sophie Laurent', rating: 5, comment: 'Maison familiale idéale, quartier calme et proche du centre.' },
    { name: 'Pierre Muller', rating: 4, comment: 'Belle propriété avec un beau jardin.' }
  ],
  'stay-listing://3': [
    { name: 'Catherine Schneider', rating: 4, comment: 'Villa de prestige dans un quartier résidentiel huppé.' }
  ],
  'stay-listing://4': [
    { name: 'Thomas Wagner', rating: 5, comment: 'Hôtel particulier d\'exception, proche de tout.' },
    { name: 'Anne Klein', rating: 5, comment: 'Architecture remarquable au cœur de Strasbourg.' }
  ],
  'stay-listing://5': [
    { name: 'Michel Roth', rating: 3, comment: 'Appartement correct mais un peu bruyant.' },
    { name: 'Sylvie Bernard', rating: 4, comment: 'Bien situé, résidence avec services.' }
  ],
  'stay-listing://6': [
    { name: 'François Weber', rating: 4, comment: 'Grande villa parfaite pour une famille nombreuse.' },
    { name: 'Isabelle Hoffmann', rating: 4, comment: 'Piscine et jardin très appréciables.' }
  ],
  'stay-listing://7': [
    { name: 'Nicolas Fischer', rating: 4, comment: 'Appartement neuf avec une belle terrasse.' }
  ],
  'stay-listing://8': [
    { name: 'Valérie Zimmermann', rating: 5, comment: 'Vue imprenable sur toute la ville!' },
    { name: 'Laurent Schmitt', rating: 5, comment: 'Penthouse d\'exception, prestations haut de gamme.' }
  ]
}

async function migrateTemplateProperties() {
  try {
    console.log('🏡 Migration des propriétés du template vers la structure enrichie...')
    
    // Supprimer les anciennes données
    await supabase.from('property_reviews').delete().neq('id', 'xxx')
    await supabase.from('property_amenities').delete().neq('id', 'xxx')  
    await supabase.from('property_images').delete().neq('id', 'xxx')
    await supabase.from('properties').delete().neq('id', 'xxx')
    
    console.log('✅ Anciennes données supprimées')
    
    let inserted = 0
    
    for (const property of templateProperties) {
      try {
        const slug = slugify(property.title)
        
        // Déterminer le type de propriété
        let propertyType = 'maison'
        if (property.title.toLowerCase().includes('appartement') || property.title.toLowerCase().includes('studio') || property.title.toLowerCase().includes('penthouse')) {
          propertyType = 'appartement'
        } else if (property.title.toLowerCase().includes('villa') || property.title.toLowerCase().includes('maison')) {
          propertyType = 'maison'
        }
        
        // Insérer la propriété principale
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .insert({
            title: property.title,
            description: property.description,
            handle: property.handle,
            slug: slug,
            price: property.price,
            transaction_type: 'vente',
            property_type: propertyType,
            status: 'disponible',
            address: property.address,
            city: 'Strasbourg',
            postal_code: property.address?.includes('67000') ? '67000' : '67100',
            latitude: property.map.lat,
            longitude: property.map.lng,
            surface: property.surface,
            acreage: property.acreage,
            rooms: property.bedrooms + 2, // bedrooms + salon + cuisine
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            max_guests: property.maxGuests,
            featured_image: property.featuredImage,
            review_rating: property.reviewStart,
            review_count: property.reviewCount,
            sale_off: property.saleOff,
            published: true,
            views_count: Math.floor(Math.random() * 200) + 50,
            like_count: Math.floor(Math.random() * 20) + 5,
            energy_class: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            heating_type: ['Gaz', 'Électrique', 'Pompe à chaleur'][Math.floor(Math.random() * 3)],
            construction_year: 1990 + Math.floor(Math.random() * 30),
            parking: Math.floor(Math.random() * 3) + 1,
            balcony: Math.random() > 0.5,
            terrace: Math.random() > 0.7,
            garden: property.acreage > 0,
            elevator: propertyType === 'appartement' && Math.random() > 0.3
          })
          .select()
        
        if (propertyError) {
          console.error(`❌ Erreur propriété "${property.title}":`, propertyError.message)
          continue
        }
        
        const propertyId = propertyData[0].id
        
        // Insérer les images
        for (let i = 0; i < property.galleryImgs.length; i++) {
          await supabase.from('property_images').insert({
            property_id: propertyId,
            image_url: property.galleryImgs[i],
            image_order: i,
            alt_text: `${property.title} - Image ${i + 1}`,
            is_featured: i === 0
          })
        }
        
        // Insérer les équipements
        const amenities = propertyAmenities[property.id] || []
        for (const amenity of amenities) {
          await supabase.from('property_amenities').insert({
            property_id: propertyId,
            amenity_type: 'feature',
            amenity_name: amenity
          })
        }
        
        // Insérer les avis
        const reviews = propertyReviews[property.id] || []
        for (const review of reviews) {
          await supabase.from('property_reviews').insert({
            property_id: propertyId,
            reviewer_name: review.name,
            rating: review.rating,
            comment: review.comment,
            verified: true,
            published: true
          })
        }
        
        console.log(`✅ ${property.title} - ${property.address}`)
        inserted++
        
      } catch (err) {
        console.error(`❌ Erreur pour "${property.title}":`, err.message)
      }
    }
    
    console.log(`\n🎉 Migration terminée: ${inserted}/${templateProperties.length} propriétés importées!`)
    
    // Afficher les statistiques finales
    const { data: stats } = await supabase
      .from('properties')
      .select('transaction_type, property_type, review_rating')
    
    if (stats) {
      const avgRating = stats.reduce((sum, p) => sum + (p.review_rating || 0), 0) / stats.length
      const appartements = stats.filter(p => p.property_type === 'appartement').length
      const maisons = stats.filter(p => p.property_type === 'maison').length
      
      console.log('\n📊 Statistiques finales:')
      console.log(`- Total propriétés: ${stats.length}`)
      console.log(`- Appartements: ${appartements}`)
      console.log(`- Maisons: ${maisons}`)
      console.log(`- Note moyenne: ${avgRating.toFixed(1)}/5`)
      
      // Statistiques des images
      const { data: imageStats } = await supabase
        .from('property_images')
        .select('property_id')
      
      console.log(`- Total images: ${imageStats?.length || 0}`)
      
      // Statistiques des équipements
      const { data: amenityStats } = await supabase
        .from('property_amenities')
        .select('property_id')
      
      console.log(`- Total équipements: ${amenityStats?.length || 0}`)
      
      // Statistiques des avis
      const { data: reviewStats } = await supabase
        .from('property_reviews')
        .select('property_id')
      
      console.log(`- Total avis: ${reviewStats?.length || 0}`)
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécution du script
migrateTemplateProperties()