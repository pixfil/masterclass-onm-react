/**
 * Script d'import des propriétés depuis le fichier JSON
 * Télécharge automatiquement les images et les stocke dans Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface JsonProperty {
  Titre: string
  Référence: string
  Surface: string
  Prix: string
  Type: string
  Ville: string
  'Code postal': string
  Adresse: string
  Latitude: string
  Longitude: string
  DPE: string
  GES: string
  Photos: string[]
  Description: string
  Pièces: string
  Chambres: string
  'Salle de bain': string
  'Surface Séjour': string
  Véranda: string
  'Énergie dépenses min': string
  'Énergie dépenses max': string
  'DPE Date': string
  [key: string]: any
}

// Fonction pour télécharger une image et la stocker dans Supabase
async function downloadAndStoreImage(imageUrl: string, fileName: string): Promise<string | null> {
  try {
    console.log(`Téléchargement de ${imageUrl}...`)
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Erreur lors du téléchargement de ${imageUrl}: ${response.statusText}`)
      return null
    }

    const buffer = await response.buffer()
    
    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, buffer, {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`Erreur lors de l'upload de ${fileName}:`, error)
      return null
    }

    // Retourner l'URL publique
    const { data: publicData } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName)

    return publicData.publicUrl
  } catch (error) {
    console.error(`Erreur lors du traitement de ${imageUrl}:`, error)
    return null
  }
}

// Fonction pour nettoyer et convertir les valeurs
function parseNumber(value: string): number | null {
  if (!value || value === '' || value === 'Non spécifié') return null
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseInteger(value: string): number | null {
  if (!value || value === '' || value === 'Non spécifié') return null
  const cleaned = value.replace(/[^0-9]/g, '')
  const parsed = parseInt(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseBoolean(value: string): boolean {
  return value === 'Oui' || value === 'oui' || value === 'true' || value === '1'
}

function parseDate(value: string): string | null {
  if (!value || value === '' || value === 'Non spécifié') return null
  
  // Essayer de parser différents formats de date
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    // Essayer format DD/MM/YYYY
    const parts = value.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1 // Mois 0-indexé
      const year = parseInt(parts[2])
      const parsedDate = new Date(year, month, day)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0]
      }
    }
    return null
  }
  
  return date.toISOString().split('T')[0]
}

// Fonction principale d'import
async function importProperties() {
  try {
    // Lire le fichier JSON
    const jsonPath = path.join(process.cwd(), 'annonces_completes_claude.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    console.log(`Début de l'import de ${jsonData.length} propriétés...`)
    
    // Récupérer l'agent par défaut (Julien LINDENAU)
    const { data: agents } = await supabase
      .from('agents_immobiliers')
      .select('id')
      .eq('nom', 'LINDENAU')
      .eq('prenom', 'Julien')
      .single()
    
    const defaultAgentId = agents?.id || null
    
    for (let i = 0; i < jsonData.length; i++) {
      const property: JsonProperty = jsonData[i]
      console.log(`\nTraitement de la propriété ${i + 1}/${jsonData.length}: ${property.Titre}`)
      
      try {
        // 1. Créer la propriété dans la base
        const propertyData = {
          title: property.Titre,
          description: property.Description || '',
          property_type: property.Type?.toLowerCase() === 'maison' ? 'maison' : 'appartement',
          transaction_type: 'vente',
          status: 'disponible',
          agent_id: defaultAgentId,
          
          // Prix
          price: parseInteger(property.Prix),
          reference_interne: property.Référence,
          
          // Localisation
          adresse_complete: property.Adresse,
          city: property.Ville,
          postal_code: property['Code postal'],
          latitude: parseNumber(property.Latitude),
          longitude: parseNumber(property.Longitude),
          
          // Surfaces
          surface_habitable: parseNumber(property.Surface),
          surface_sejour: parseNumber(property['Surface Séjour']),
          rooms: parseInteger(property.Pièces),
          bedrooms: parseInteger(property.Chambres),
          bathrooms: parseInteger(property['Salle de bain']),
          
          // Énergie
          dpe_valeur: parseInteger(property.DPE),
          ges_valeur: parseInteger(property.GES),
          energie_depenses_min: parseInteger(property['Énergie dépenses min']),
          energie_depenses_max: parseInteger(property['Énergie dépenses max']),
          dpe_date: parseDate(property['DPE Date']),
          
          // Équipements
          veranda: parseBoolean(property.Véranda),
          
          published: true
        }
        
        const { data: insertedProperty, error: propertyError } = await supabase
          .from('properties')
          .insert(propertyData)
          .select('id')
          .single()
        
        if (propertyError) {
          console.error(`Erreur lors de l'insertion de ${property.Titre}:`, propertyError)
          continue
        }
        
        const propertyId = insertedProperty.id
        console.log(`Propriété créée avec l'ID: ${propertyId}`)
        
        // 2. Télécharger et stocker les images
        if (property.Photos && property.Photos.length > 0) {
          console.log(`Traitement de ${property.Photos.length} images...`)
          
          for (let j = 0; j < property.Photos.length; j++) {
            const imageUrl = property.Photos[j]
            const fileName = `property_${propertyId}_image_${j + 1}.jpg`
            
            const storedUrl = await downloadAndStoreImage(imageUrl, fileName)
            
            if (storedUrl) {
              // Insérer l'image en base
              const { error: imageError } = await supabase
                .from('property_images')
                .insert({
                  property_id: propertyId,
                  image_url: storedUrl,
                  display_order: j + 1,
                  is_featured: j === 0 // La première image est featured
                })
              
              if (imageError) {
                console.error(`Erreur lors de l'insertion de l'image ${j + 1}:`, imageError)
              } else {
                console.log(`Image ${j + 1} ajoutée avec succès`)
              }
            }
          }
          
          // Mettre à jour l'image featured de la propriété
          if (property.Photos.length > 0) {
            const firstImageFileName = `property_${propertyId}_image_1.jpg`
            const { data: publicData } = supabase.storage
              .from('property-images')
              .getPublicUrl(firstImageFileName)
            
            await supabase
              .from('properties')
              .update({ featured_image: publicData.publicUrl })
              .eq('id', propertyId)
          }
        }
        
        console.log(`✅ Propriété ${property.Titre} importée avec succès`)
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'import de ${property.Titre}:`, error)
      }
    }
    
    console.log('\n🎉 Import terminé !')
    
  } catch (error) {
    console.error('❌ Erreur générale lors de l\'import:', error)
  }
}

// Exporter la fonction pour l'utiliser comme script
if (require.main === module) {
  importProperties()
}

export { importProperties }