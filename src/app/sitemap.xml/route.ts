import { getAllProperties } from '@/lib/supabase/properties'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Récupérer toutes les propriétés publiées
    const properties = await getAllProperties({ 
      published: true,
      limit: 1000 // Limite raisonnable
    })

    const baseUrl = 'https://initiative-immobilier.fr'
    
    // Pages statiques
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/real-estate-categories/all`,
        lastModified: new Date().toISOString(), 
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/real-estate-categories/appartement`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly', 
        priority: 0.8
      },
      {
        url: `${baseUrl}/real-estate-categories/maison`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/real-estate-categories/terrain`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.6
      },
      {
        url: `${baseUrl}/estimation`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly', 
        priority: 0.8
      }
    ]

    // Pages des propriétés
    const propertyPages = properties.map(property => ({
      url: `${baseUrl}/real-estate-listings/${property.slug || property.id}`,
      lastModified: property.updated_at || property.created_at,
      changeFrequency: 'weekly' as const,
      priority: property.is_featured ? 0.9 : 0.7
    }))

    // Générer le XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...propertyPages].map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache 1 heure
      }
    })

  } catch (error) {
    console.error('Erreur génération sitemap:', error)
    return new NextResponse('Erreur lors de la génération du sitemap', { 
      status: 500 
    })
  }
}