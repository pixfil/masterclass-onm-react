import { supabase } from '@/lib/supabaseClient'
import { PropertyImage, PropertyImageInsert } from './types'

// Récupérer toutes les images d'une propriété
export async function getPropertyImages(propertyId: string) {
  console.log('Fetching images for property:', propertyId)
  
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('image_order', { ascending: true })

  if (error) {
    console.error('Error fetching property images:', error)
    return []
  }

  console.log('Images fetched from DB:', data)
  return data as PropertyImage[]
}

// Ajouter une nouvelle image
export async function addPropertyImage(image: PropertyImageInsert) {
  console.log('Tentative d\'ajout image:', image)
  
  const { data, error } = await supabase
    .from('property_images')
    .insert(image)
    .select()
    .single()

  if (error) {
    console.error('Error adding property image:', error)
    console.error('Details:', JSON.stringify(error, null, 2))
    throw error
  }

  console.log('Image ajoutée avec succès:', data)
  return data as PropertyImage
}

// Mettre à jour l'ordre des images
export async function updateImageOrder(imageId: string, newOrder: number) {
  const { error } = await supabase
    .from('property_images')
    .update({ image_order: newOrder })
    .eq('id', imageId)

  if (error) {
    console.error('Error updating image order:', error)
    throw error
  }
}

// Supprimer une image
export async function deletePropertyImage(imageId: string) {
  const { error } = await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    console.error('Error deleting property image:', error)
    throw error
  }
}

// Mettre à jour l'image principale (featured)
export async function setFeaturedImage(propertyId: string, imageId: string) {
  // D'abord, retirer le statut featured de toutes les images
  await supabase
    .from('property_images')
    .update({ is_featured: false })
    .eq('property_id', propertyId)

  // Puis définir la nouvelle image comme featured
  const { error } = await supabase
    .from('property_images')
    .update({ is_featured: true })
    .eq('id', imageId)

  if (error) {
    console.error('Error setting featured image:', error)
    throw error
  }

  // Mettre à jour l'URL de l'image featured dans la table properties
  const { data: imageData } = await supabase
    .from('property_images')
    .select('image_url')
    .eq('id', imageId)
    .single()

  if (imageData) {
    await supabase
      .from('properties')
      .update({ featured_image: imageData.image_url })
      .eq('id', propertyId)
  }
}

// Réorganiser l'ordre de toutes les images d'une propriété
export async function reorderPropertyImages(propertyId: string, orderedImageIds: string[]) {
  const updates = orderedImageIds.map((imageId, index) => ({
    id: imageId,
    image_order: index
  }))

  for (const update of updates) {
    await updateImageOrder(update.id, update.image_order)
  }
}

// Ajouter plusieurs images en lot
export async function addMultiplePropertyImages(images: PropertyImageInsert[]) {
  const { data, error } = await supabase
    .from('property_images')
    .insert(images)
    .select()

  if (error) {
    console.error('Error adding multiple images:', error)
    throw error
  }

  return data as PropertyImage[]
}