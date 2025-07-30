import { getRealEstateCategoryByHandle } from '@/data/categories'
import { getRealEstateListingFilterOptions, getRealEstateListings } from '@/data/listings'
import { getRealEstateListingsFromSupabase } from '@/lib/supabase/listings'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import SectionGridHasMap from './SectionGridHasMap'

export async function generateMetadata({ params }: { params: Promise<{ handle?: string[] }> }): Promise<Metadata> {
  const { handle } = await params
  const category = await getRealEstateCategoryByHandle(handle?.[0])
  if (!category) {
    return {
      title: 'Collection not found',
      description: 'The collection you are looking for does not exist.',
    }
  }
  const { name, description } = category
  return { title: name, description }
}

const Page = async ({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ handle?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) => {
  const { handle } = await params
  const search = await searchParams

  const category = await getRealEstateCategoryByHandle(handle?.[0])
  
  // Récupérer les filtres depuis les paramètres de recherche
  const filters = {
    transaction: search.transaction as 'vente' | 'location',
    location: search.location as string,
    type: search.type as string,
    price_min: search.price_min ? parseInt(search.price_min as string) : undefined,
    price_max: search.price_max ? parseInt(search.price_max as string) : undefined,
    page: search.page ? parseInt(search.page as string) : 1
  }

  console.log('Page real-estate-categories-map - Paramètres de recherche:', search)
  console.log('Page real-estate-categories-map - Filtres traités:', filters)
  
  const listings = await getRealEstateListingsFromSupabase(filters)
  console.log('Page real-estate-categories-map - Nombre de listings reçus:', listings.length)

  if (!category?.id) {
    return redirect('/real-estate-categories/all')
  }

  return (
    <div className="container xl:max-w-none xl:pe-0 2xl:ps-10">
      <SectionGridHasMap 
        listings={listings} 
        category={category} 
        searchParams={search}
      />
    </div>
  )
}

export default Page
