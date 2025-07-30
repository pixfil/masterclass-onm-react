import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { propertyData } = await request.json()

    if (!propertyData) {
      return NextResponse.json({ error: 'Données de propriété manquantes' }, { status: 400 })
    }

    // Construire le prompt pour l'IA
    const prompt = `Génère 4-6 points forts attractifs pour cette propriété immobilière en français. Chaque point fort doit avoir un titre court et accrocheur (max 4 mots) et une description détaillée (1-2 phrases).

Détails de la propriété :
- Type : ${propertyData.type || 'Non spécifié'}
- Transaction : ${propertyData.transactionType || 'Non spécifié'}
- Prix : ${propertyData.price ? `${propertyData.price}€` : 'Non spécifié'}
- Surface : ${propertyData.surface ? `${propertyData.surface}m²` : 'Non spécifié'}
- Pièces : ${propertyData.rooms || 'Non spécifié'}
- Chambres : ${propertyData.bedrooms || 'Non spécifié'}
- Ville : ${propertyData.city || 'Non spécifié'}
- Étage : ${propertyData.etage || 'Non spécifié'}
- Ascenseur : ${propertyData.ascenseur ? 'Oui' : 'Non'}
- Chauffage : ${propertyData.chauffage || 'Non spécifié'}
- DPE : ${propertyData.dpe || 'Non spécifié'}
- Année construction : ${propertyData.constructionYear || 'Non spécifié'}
- Description existante : ${propertyData.description || 'Aucune'}

Réponds UNIQUEMENT avec un JSON valide dans ce format :
{
  "highlights": [
    {
      "titre": "Emplacement privilégié",
      "description": "Situé dans un quartier recherché avec toutes les commodités à proximité et des transports en commun facilement accessibles."
    }
  ]
}

Règles importantes :
- Titre max 4 mots, accrocheur et spécifique
- Description 1-2 phrases, concrète et attractive
- Focus sur les vrais avantages de cette propriété
- Évite les généralités
- Sois créatif mais réaliste
- 4-6 points forts maximum`

    // Pour le moment, simuler une réponse IA (à remplacer par un vrai appel à l'IA)
    const highlights = [
      {
        titre: "Emplacement privilégié",
        description: `Idéalement situé ${propertyData.city ? `à ${propertyData.city}` : ''} dans un quartier recherché avec commerces, écoles et transports à proximité immédiate.`
      },
      {
        titre: "Luminosité exceptionnelle", 
        description: "Exposition optimale garantissant une luminosité naturelle tout au long de la journée grâce à de grandes ouvertures."
      },
      {
        titre: "Espace optimisé",
        description: `Surface de ${propertyData.surface || 'XX'}m² parfaitement agencée avec ${propertyData.rooms || 'X'} pièces offrant un maximum de confort et de fonctionnalité.`
      }
    ]

    // Ajouter des points forts spécifiques selon les caractéristiques
    if (propertyData.ascenseur && propertyData.etage > 1) {
      highlights.push({
        titre: "Confort d'accès",
        description: `Étage élevé avec ascenseur garantissant un accès facile et une vue dégagée depuis le ${propertyData.etage}ème étage.`
      })
    }

    if (propertyData.dpe && ['A', 'B', 'C'].includes(propertyData.dpe)) {
      highlights.push({
        titre: "Performance énergétique",
        description: `Excellent classement énergétique (${propertyData.dpe}) garantissant des charges réduites et un confort thermique optimal.`
      })
    }

    if (propertyData.constructionYear && parseInt(propertyData.constructionYear) > 2010) {
      highlights.push({
        titre: "Construction récente",
        description: `Bâtiment de ${propertyData.constructionYear} aux normes actuelles avec matériaux modernes et équipements contemporains.`
      })
    }

    return NextResponse.json({ 
      highlights: highlights.slice(0, 6),
      message: 'Points forts générés avec succès'
    })

  } catch (error) {
    console.error('Erreur génération points forts IA:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}