import PropertyCardH from '@/components/PropertyCardH'
import { getRealEstateCategoryByHandle } from '@/data/categories'
import { getRealEstateListingFilterOptions, getRealEstateListings } from '@/data/listings'
import { getRealEstateListingsFromSupabase } from '@/lib/supabase/listings'
import { Button } from '@/shared/Button'
import { Divider } from '@/shared/divider'
import Pagination from '@/shared/Pagination'
import { MapsLocation01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

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

  console.log('Page real-estate-categories - Paramètres de recherche:', search)
  console.log('Page real-estate-categories - Filtres traités:', filters)
  
  const listings = await getRealEstateListingsFromSupabase(filters)
  console.log('Page real-estate-categories - Nombre de listings reçus:', listings.length)

  if (!category?.id) {
    return redirect('/real-estate-categories/all')
  }

  return (
    <div className="pb-28">
      {/* Content */}
      <div className="relative container pt-14 lg:pt-24">
        {/* start heading */}
        <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-5">
          <h2 id="heading" className="scroll-mt-20 text-lg font-semibold text-pretty sm:text-xl">
            {listings.length} bien{listings.length > 1 ? 's' : ''} trouvé{listings.length > 1 ? 's' : ''}
            {filters.location ? ` à ${filters.location}` : ''}
            {filters.type ? ` - ${filters.type}` : ''}
            {filters.transaction ? ` en ${filters.transaction}` : ''}
          </h2>
          <Button color="primary" className="ms-auto" href={'/real-estate-categories-map/' + category.handle}>
            <span className="me-1">Voir la carte</span>
            <HugeiconsIcon icon={MapsLocation01Icon} size={20} color="currentColor" strokeWidth={1.5} />
          </Button>
        </div>
        <Divider className="my-8 md:mb-12" />
        {/* end heading */}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {listings.map((listing) => (
            <PropertyCardH key={listing.id} data={listing} />
          ))}
        </div>
        {listings.length > 0 && (
          <div className="mt-20 flex items-center justify-center">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {filters.page || 1} - {listings.length} résultat{listings.length > 1 ? 's' : ''} affiché{listings.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
