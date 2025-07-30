import { supabase } from '@/lib/supabaseClient'
import { 
  PointFortPropriete, 
  PointFortProprieteInsert, 
  EquipementPropriete, 
  EquipementProprieteInsert,
  TypeEquipement
} from './types'

// =============== POINTS FORTS ===============

// Récupérer les points forts d'une propriété
export async function getPropertyHighlights(propertyId: string): Promise<PointFortPropriete[]> {
  const { data, error } = await supabase
    .from('points_forts_propriete')
    .select('*')
    .eq('property_id', propertyId)
    .order('ordre_affichage', { ascending: true })

  if (error) {
    console.error('Error fetching property highlights:', error)
    return []
  }

  return data as PointFortPropriete[]
}

// Créer un point fort
export async function createPropertyHighlight(highlight: PointFortProprieteInsert): Promise<PointFortPropriete> {
  const { data, error } = await supabase
    .from('points_forts_propriete')
    .insert(highlight)
    .select()
    .single()

  if (error) {
    console.error('Error creating property highlight:', error)
    throw error
  }

  return data as PointFortPropriete
}

// Mettre à jour un point fort
export async function updatePropertyHighlight(id: string, updates: Partial<PointFortProprieteInsert>): Promise<PointFortPropriete> {
  const { data, error } = await supabase
    .from('points_forts_propriete')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating property highlight:', error)
    throw error
  }

  return data as PointFortPropriete
}

// Supprimer un point fort
export async function deletePropertyHighlight(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('points_forts_propriete')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting property highlight:', error)
    throw error
  }

  return true
}

// Créer plusieurs points forts en une fois
export async function createMultipleHighlights(highlights: PointFortProprieteInsert[]): Promise<PointFortPropriete[]> {
  const { data, error } = await supabase
    .from('points_forts_propriete')
    .insert(highlights)
    .select()

  if (error) {
    console.error('Error creating multiple highlights:', error)
    throw error
  }

  return data as PointFortPropriete[]
}

// =============== ÉQUIPEMENTS ===============

// Récupérer les équipements d'une propriété
export async function getPropertyEquipments(propertyId: string): Promise<EquipementPropriete[]> {
  const { data, error } = await supabase
    .from('equipements_propriete')
    .select('*')
    .eq('property_id', propertyId)
    .eq('est_disponible', true)
    .order('nom_equipement', { ascending: true })

  if (error) {
    console.error('Error fetching property equipments:', error)
    return []
  }

  return data as EquipementPropriete[]
}

// Créer un équipement
export async function createPropertyEquipment(equipment: EquipementProprieteInsert): Promise<EquipementPropriete> {
  const { data, error } = await supabase
    .from('equipements_propriete')
    .insert(equipment)
    .select()
    .single()

  if (error) {
    console.error('Error creating property equipment:', error)
    throw error
  }

  return data as EquipementPropriete
}

// Supprimer un équipement
export async function deletePropertyEquipment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('equipements_propriete')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting property equipment:', error)
    throw error
  }

  return true
}

// Supprimer tous les équipements d'une propriété
export async function deleteAllPropertyEquipments(propertyId: string): Promise<boolean> {
  const { error } = await supabase
    .from('equipements_propriete')
    .delete()
    .eq('property_id', propertyId)

  if (error) {
    console.error('Error deleting all property equipments:', error)
    throw error
  }

  return true
}

// Créer plusieurs équipements en une fois
export async function createMultipleEquipments(equipments: EquipementProprieteInsert[]): Promise<EquipementPropriete[]> {
  const { data, error } = await supabase
    .from('equipements_propriete')
    .insert(equipments)
    .select()

  if (error) {
    console.error('Error creating multiple equipments:', error)
    throw error
  }

  return data as EquipementPropriete[]
}

// =============== TYPES D'ÉQUIPEMENTS ===============

// Récupérer tous les types d'équipements disponibles
export async function getEquipmentTypes(): Promise<TypeEquipement[]> {
  const { data, error } = await supabase
    .from('types_equipements')
    .select('*')
    .order('categorie', { ascending: true })
    .order('nom', { ascending: true })

  if (error) {
    console.error('Error fetching equipment types:', error)
    return []
  }

  return data as TypeEquipement[]
}

// Récupérer les types d'équipements par catégorie
export async function getEquipmentTypesByCategory(): Promise<Record<string, TypeEquipement[]>> {
  const types = await getEquipmentTypes()
  
  return types.reduce((acc, type) => {
    const category = type.categorie || 'autres'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(type)
    return acc
  }, {} as Record<string, TypeEquipement[]>)
}

// =============== HELPERS ===============

// Synchroniser les équipements d'une propriété
export async function syncPropertyEquipments(propertyId: string, selectedEquipmentIds: string[]): Promise<boolean> {
  try {
    // Supprimer tous les équipements existants
    await deleteAllPropertyEquipments(propertyId)

    if (selectedEquipmentIds.length === 0) {
      return true
    }

    // Récupérer les informations des types d'équipements sélectionnés
    const { data: equipmentTypes, error } = await supabase
      .from('types_equipements')
      .select('*')
      .in('id', selectedEquipmentIds)

    if (error) {
      console.error('Error fetching equipment types for sync:', error)
      throw error
    }

    // Créer les nouveaux équipements
    const equipmentsToCreate: EquipementProprieteInsert[] = equipmentTypes.map(type => ({
      property_id: propertyId,
      nom_equipement: type.nom,
      icone_nom: type.icone_nom,
      quantite: 1,
      est_disponible: true
    }))

    await createMultipleEquipments(equipmentsToCreate)
    return true

  } catch (error) {
    console.error('Error syncing property equipments:', error)
    throw error
  }
}