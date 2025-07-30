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
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .replace(/[^a-z0-9]+/g, '-') // Remplace tout caractère non alphanumérique par un tiret
    .replace(/^-+|-+$/g, '') // Supprime les tirets en début et fin
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
}

function generatePropertySlug(title, id) {
  const baseSlug = slugify(title)
  const shortId = id.split('-')[0] // Prendre les 8 premiers caractères de l'UUID
  return `${baseSlug}-${shortId}`
}

async function updateSlugs() {
  try {
    console.log('Mise à jour des slugs pour les propriétés existantes...')
    
    // Récupérer toutes les propriétés sans slug
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, slug')
    
    if (fetchError) {
      console.error('Erreur lors de la récupération:', fetchError)
      return
    }
    
    console.log(`Trouvé ${properties.length} propriétés`)
    
    // Mettre à jour chaque propriété sans slug
    let updated = 0
    for (const property of properties) {
      if (!property.slug) {
        const newSlug = generatePropertySlug(property.title, property.id)
        
        const { error: updateError } = await supabase
          .from('properties')
          .update({ slug: newSlug })
          .eq('id', property.id)
        
        if (updateError) {
          console.error(`Erreur pour ${property.title}:`, updateError)
        } else {
          console.log(`✅ ${property.title} -> ${newSlug}`)
          updated++
        }
      } else {
        console.log(`⏭️  ${property.title} (slug déjà présent: ${property.slug})`)
      }
    }
    
    console.log(`\n✅ ${updated} propriétés mises à jour avec succès!`)
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

updateSlugs()