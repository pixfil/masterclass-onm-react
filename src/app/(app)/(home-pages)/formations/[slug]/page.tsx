import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FormationsService } from '@/lib/supabase/formations'
import FormationDetailPage from './FormationDetailPage'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: formation } = await FormationsService.getFormationBySlug(slug)
  
  if (!formation) {
    return {
      title: 'Formation non trouvée | Masterclass ONM',
      description: 'Cette formation n\'existe pas ou n\'est plus disponible.'
    }
  }

  return {
    title: formation.seo_title || `${formation.title} | Masterclass ONM`,
    description: formation.seo_description || formation.short_description || formation.description,
    keywords: formation.seo_keywords?.join(', '),
    openGraph: {
      title: formation.title,
      description: formation.short_description || formation.description,
      images: formation.featured_image ? [formation.featured_image] : [],
      type: 'article',
    },
    alternates: {
      canonical: `https://masterclass-onm.com/formations/${formation.slug}`,
    },
  }
}

export default async function FormationPage({ params }: Props) {
  const { slug } = await params
  const { data: formation } = await FormationsService.getFormationBySlug(slug)
  
  if (!formation) {
    notFound()
  }

  return <FormationDetailPage formation={formation} />
}