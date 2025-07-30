const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vxqxkezrgadseavfzjwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXhrZXpyZ2Fkc2VhdmZ6andwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxODAzOCwiZXhwIjoyMDY5MTk0MDM4fQ.1XPEiFEcRUlzkJEPs82J8aiHxlKdRB4kjEZgIgSxGqs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addPropertyTypes() {
  console.log('🏢 Ajout de nouveaux types de biens...')
  
  // Créons quelques variations avec appartement et maison en attendant
  const newProperties = [
    {
      title: 'Studio moderne - Centre ville',
      property_type: 'appartement',
      price: 180000,
      city: 'Strasbourg',
      address: 'Rue de la Mésange',
      surface: 35,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Studio moderne idéalement situé en centre ville',
      transaction_type: 'vente',
      status: 'disponible',
      published: true,
      slug: 'studio-moderne-centre-strasbourg'
    },
    {
      title: 'Appartement T3 - Quartier européen',
      property_type: 'appartement',
      price: 350000,
      city: 'Strasbourg',
      address: 'Avenue de l\'Europe',
      surface: 75,
      bedrooms: 2,
      bathrooms: 1,
      description: 'Bel appartement T3 dans le quartier européen',
      transaction_type: 'vente',
      status: 'disponible',
      published: true,
      slug: 'appartement-t3-quartier-europeen'
    },
    {
      title: 'Villa contemporaine - Robertsau',
      property_type: 'maison',
      price: 850000,
      city: 'Strasbourg',
      address: 'Quartier de la Robertsau',
      surface: 200,
      bedrooms: 4,
      bathrooms: 2,
      description: 'Magnifique villa contemporaine avec jardin',
      transaction_type: 'vente',
      status: 'disponible',
      published: true,
      slug: 'villa-contemporaine-robertsau'
    },
    {
      title: 'Appartement T2 - Location Neudorf',
      property_type: 'appartement',
      price: 950,
      city: 'Strasbourg',
      address: 'Quartier Neudorf',
      surface: 50,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Appartement T2 lumineux à louer',
      transaction_type: 'location',
      status: 'disponible',
      published: true,
      slug: 'appartement-t2-location-neudorf'
    },
    {
      title: 'Maison familiale - Location Cronenbourg',
      property_type: 'maison',
      price: 1800,
      city: 'Strasbourg',
      address: 'Quartier Cronenbourg',
      surface: 120,
      bedrooms: 3,
      bathrooms: 2,
      description: 'Belle maison familiale avec jardin à louer',
      transaction_type: 'location',
      status: 'disponible',
      published: true,
      slug: 'maison-familiale-location-cronenbourg'
    }
  ]

  for (const property of newProperties) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()

      if (error) {
        console.error(`❌ Erreur pour ${property.title}:`, error)
      } else {
        console.log(`✅ Ajouté: ${property.title} (${property.property_type})`)
      }
    } catch (err) {
      console.error(`❌ Erreur générale pour ${property.title}:`, err)
    }
  }

  console.log('\n🎉 Terminé ! Nouveaux types de biens ajoutés.')
}

addPropertyTypes()