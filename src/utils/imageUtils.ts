/**
 * Nettoie une URL d'image en supprimant les paramètres de requête problématiques
 * Particulièrement utile pour les URLs Supabase qui contiennent des paramètres
 * qui ne sont pas compatibles avec Next.js Image
 */
export const cleanImageUrl = (url: string): string => {
  if (!url) return ''
  
  // Nettoyer les paramètres de requête pour les URLs Supabase
  if (url.includes('supabase.co') && url.includes('?')) {
    return url.split('?')[0]
  }
  
  // Pour les autres URLs, les garder telles quelles
  return url
}

/**
 * Extrait l'URL d'une image à partir de différents formats
 * et la nettoie pour Next.js Image
 */
export const getCleanImageSrc = (image: any): string => {
  if (!image) return ''
  
  let url = ''
  if (typeof image === 'string') {
    url = image
  } else if (typeof image === 'object' && image.src) {
    url = image.src
  } else {
    return ''
  }
  
  return cleanImageUrl(url)
}