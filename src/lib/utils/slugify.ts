/**
 * Convertit une chaîne en slug compatible URL
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .replace(/[^a-z0-9]+/g, '-') // Remplace tout caractère non alphanumérique par un tiret
    .replace(/^-+|-+$/g, '') // Supprime les tirets en début et fin
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
}

/**
 * Génère un slug unique pour une propriété
 */
export function generatePropertySlug(title: string, id?: string): string {
  const baseSlug = slugify(title)
  
  // Si on a un ID, on peut l'ajouter pour garantir l'unicité
  if (id) {
    const shortId = id.split('-')[0] // Prendre les 8 premiers caractères de l'UUID
    return `${baseSlug}-${shortId}`
  }
  
  return baseSlug
}

/**
 * Génère un slug avec un suffixe numérique si nécessaire
 */
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let baseSlug = slugify(title)
  let finalSlug = baseSlug
  let counter = 1
  
  // Tant que le slug existe déjà, ajouter un numéro
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`
    counter++
  }
  
  return finalSlug
}