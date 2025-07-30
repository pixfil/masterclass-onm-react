import { supabase } from '@/lib/supabaseClient'

export interface PropertyLabel {
  id: string
  property_id: string
  label: string
  created_at: string
}

// Récupérer tous les labels d'une propriété
export async function getPropertyLabels(propertyId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('property_labels')
    .select('label')
    .eq('property_id', propertyId)
    .order('label')

  if (error) {
    console.error('Erreur lors de la récupération des labels:', error)
    return []
  }

  return data?.map(item => item.label) || []
}

// Mettre à jour les labels d'une propriété
export async function updatePropertyLabels(propertyId: string, labels: string[]): Promise<boolean> {
  try {
    // 1. Supprimer tous les labels existants
    const { error: deleteError } = await supabase
      .from('property_labels')
      .delete()
      .eq('property_id', propertyId)

    if (deleteError) throw deleteError

    // 2. Ajouter les nouveaux labels s'il y en a
    if (labels.length > 0) {
      const labelsToInsert = labels.map(label => ({
        property_id: propertyId,
        label: label
      }))

      const { error: insertError } = await supabase
        .from('property_labels')
        .insert(labelsToInsert)

      if (insertError) throw insertError
    }

    return true
  } catch (error) {
    console.error('Erreur lors de la mise à jour des labels:', error)
    return false
  }
}

// Récupérer tous les labels utilisés (pour les filtres)
export async function getAllUsedLabels(): Promise<string[]> {
  const { data, error } = await supabase
    .from('property_labels')
    .select('label')
    .order('label')

  if (error) {
    console.error('Erreur lors de la récupération des labels utilisés:', error)
    return []
  }

  // Retourner les labels uniques
  const uniqueLabels = [...new Set(data?.map(item => item.label) || [])]
  return uniqueLabels
}

// Récupérer les propriétés par label
export async function getPropertiesByLabel(label: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('property_labels')
    .select('property_id')
    .eq('label', label)

  if (error) {
    console.error('Erreur lors de la récupération des propriétés par label:', error)
    return []
  }

  return data?.map(item => item.property_id) || []
}