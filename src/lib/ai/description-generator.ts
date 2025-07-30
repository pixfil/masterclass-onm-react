import { Property } from '@/types/property'

export interface AIConfig {
  provider: 'openai' | 'anthropic'
  apiKey: string
  model?: string
}

export class PropertyDescriptionGenerator {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  async generateDescription(property: Partial<Property>): Promise<string> {
    const prompt = this.buildPrompt(property)
    
    if (this.config.provider === 'openai') {
      return this.generateWithOpenAI(prompt)
    } else if (this.config.provider === 'anthropic') {
      return this.generateWithAnthropic(prompt)
    }
    
    throw new Error('Provider non supporté')
  }

  private buildPrompt(property: Partial<Property>): string {
    const features = []
    
    if (property.rooms) features.push(`${property.rooms} pièces`)
    if (property.bedrooms) features.push(`${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`)
    if (property.bathrooms) features.push(`${property.bathrooms} salle${property.bathrooms > 1 ? 's' : ''} de bain`)
    if (property.surface) features.push(`${property.surface} m²`)
    if (property.balcony) features.push('balcon')
    if (property.terrace) features.push('terrasse')
    if (property.garden) features.push('jardin')
    if (property.parking && property.parking > 0) features.push(`${property.parking} place${property.parking > 1 ? 's' : ''} de parking`)
    if (property.elevator) features.push('ascenseur')
    if (property.furnished) features.push('meublé')

    return `
Génère une description immobilière attractive et professionnelle pour cette propriété :

Type : ${property.property_type || 'Bien immobilier'}
Ville : ${property.city || 'Non spécifié'}
Adresse : ${property.address || 'Non spécifié'}
Prix : ${property.price ? property.price + ' €' : 'Prix sur demande'}
Transaction : ${property.transaction_type === 'rent' ? 'Location' : 'Vente'}

Caractéristiques principales :
${features.join(', ')}

Instructions :
- Écris une description en français de 150-200 mots
- Sois enthousiaste mais professionnel
- Mets en avant les points forts de la propriété
- Utilise un langage immobilier approprié
- Évite les clichés et sois spécifique
- Mentionne le potentiel du bien si pertinent
- Ne répète pas les informations déjà listées (prix, surface, etc.)
- Termine par une phrase d'appel à l'action subtile

Description :`
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    try {
      console.log('=== DÉBUT DEBUG OPENAI ===')
      console.log('Provider:', this.config.provider)
      console.log('Model configuré:', this.config.model)
      console.log('Clé API (premiers caractères):', this.config.apiKey?.substring(0, 20) + '...')
      console.log('Clé API type:', typeof this.config.apiKey)
      console.log('Clé API length:', this.config.apiKey?.length)
      
      const requestBody = {
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en rédaction immobilière. Tu écris des descriptions attractives et professionnelles pour des biens immobiliers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      }
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Texte d\'erreur brut:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = null
        }
        
        const errorMessage = errorData?.error?.message || errorText || response.statusText
        console.error('Erreur OpenAI parsée:', errorData)
        throw new Error(`Erreur OpenAI: ${errorMessage}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      console.log('=== FIN DEBUG OPENAI ===')
      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('=== ERREUR COMPLÈTE ===')
      console.error('Type d\'erreur:', error.constructor.name)
      console.error('Message d\'erreur:', error.message)
      console.error('Stack trace:', error.stack)
      console.error('=== FIN ERREUR ===')
      throw error
    }
  }

  private async generateWithAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur Anthropic: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content[0].text.trim()
  }
}

// Fonction utilitaire pour l'utilisation côté client
export async function generatePropertyDescription(
  property: Partial<Property>,
  apiKey: string,
  provider: 'openai' | 'anthropic' = 'openai',
  model?: string
): Promise<string> {
  const generator = new PropertyDescriptionGenerator({
    provider,
    apiKey,
    model
  })
  
  return generator.generateDescription(property)
}