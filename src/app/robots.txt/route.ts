import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /

# Pages importantes
Allow: /real-estate-categories/
Allow: /real-estate-listings/
Allow: /estimation
Allow: /contact

# Pages admin interdites
Disallow: /admin/
Disallow: /api/

# Fichiers spéciaux
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*_next/

# Sitemap
Sitemap: https://initiative-immobilier.fr/sitemap.xml

# Délai entre les requêtes (optionnel)
Crawl-delay: 1`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache 24h
    }
  })
}