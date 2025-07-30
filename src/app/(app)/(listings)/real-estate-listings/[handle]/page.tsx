import {
  Bathtub02Icon,
  BodySoapIcon,
  CableCarIcon,
  CctvCameraIcon,
  HairDryerIcon,
  MeetingRoomIcon,
  ShampooIcon,
  Speaker01Icon,
  TvSmartIcon,
  VirtualRealityVr01Icon,
  WaterEnergyIcon,
  WaterPoloIcon,
  Wifi01Icon,
} from '@/components/Icons'
import StartRating from '@/components/StartRating'
import { getListingReviews } from '@/data/data'
import { getPropertyBySlug } from '@/lib/supabase/properties'
import { adaptPropertyToListing } from '@/lib/adapters/property-adapter'
import { Button } from '@/shared/Button'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import { Link } from '@/shared/link'
import { UsersIcon } from '@heroicons/react/24/outline'
import {
  Award04Icon,
  CropIcon,
  Flag03Icon,
  Mail01Icon,
  Medal01Icon,
  Navigation03Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Fragment } from 'react'
import HeaderGallery from '../../components/HeaderGallery'
import HostAvatar from '../../components/HostAvatar'
import SectionHeader from '../../components/SectionHeader'
import { SectionHeading, SectionSubheading } from '../../components/SectionHeading'
import SectionHost from '../../components/SectionHost'
import SectionListingReviews from '../../components/SectionListingReviews'
import SectionMap from '../../components/SectionMap'
import { PropertyViewTracker } from '@/components/PropertyViewTracker'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const property = await getPropertyBySlug(handle)
  const listing = property ? adaptPropertyToListing(property) : null

  if (!listing) {
    return {
      title: 'Bien immobilier non trouvé | Initiative Immobilier',
      description: 'Le bien immobilier que vous recherchez n\'existe pas ou n\'est plus disponible.',
    }
  }

  // Construction du titre optimisé SEO
  const transactionType = property.transaction_type === 'location' ? 'Location' : 'Vente'
  const propertyTypeMap: Record<string, string> = {
    'appartement': 'Appartement',
    'maison': 'Maison',
    'terrain': 'Terrain',
    'local_commercial': 'Local commercial',
    'parking': 'Parking',
    'autre': 'Bien immobilier'
  }
  const propertyTypeName = propertyTypeMap[property.property_type] || 'Bien immobilier'
  
  const seoTitle = `${transactionType} ${propertyTypeName} ${property.city} - ${new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(property.price)} | Initiative Immobilier`

  // Construction de la description optimisée
  const features = []
  if (property.surface) features.push(`${property.surface} m²`)
  if (property.rooms) features.push(`${property.rooms} pièces`)
  if (property.bedrooms) features.push(`${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`)
  if (property.bathrooms) features.push(`${property.bathrooms} salle${property.bathrooms > 1 ? 's' : ''} de bain`)
  
  const featuresText = features.length > 0 ? features.join(', ') + '. ' : ''
  const locationText = property.address ? `${property.address}, ${property.city}` : property.city
  
  const seoDescription = `${transactionType} ${propertyTypeName.toLowerCase()} à ${property.city}. ${featuresText}${property.description ? property.description.substring(0, 100) + '...' : `Découvrez ce bien d'exception situé ${locationText}.`} Initiative Immobilier vous accompagne.`

  // Mots-clés pertinents
  const keywords = [
    transactionType.toLowerCase(),
    propertyTypeName.toLowerCase(),
    property.city.toLowerCase(),
    'immobilier',
    'initiative immobilier',
    'agent immobilier'
  ]
  
  if (property.surface) keywords.push(`${property.surface}m2`)
  if (property.rooms) keywords.push(`${property.rooms} pieces`)
  
  // Images pour Open Graph
  const images = property.gallery_images && property.gallery_images.length > 0 
    ? [property.gallery_images[0]] 
    : property.featured_image 
    ? [property.featured_image]
    : []

  return {
    title: seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle,
    description: seoDescription.length > 160 ? seoDescription.substring(0, 157) + '...' : seoDescription,
    keywords: keywords.join(', '),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      url: `https://initiative-immobilier.fr/real-estate-listings/${handle}`,
      images: images.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${propertyTypeName} ${property.city} - Initiative Immobilier`
      })),
      siteName: 'Initiative Immobilier',
      locale: 'fr_FR'
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: images
    },
    robots: {
      index: property.published !== false,
      follow: true,
      googleBot: {
        index: property.published !== false,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    alternates: {
      canonical: `https://initiative-immobilier.fr/real-estate-listings/${handle}`
    }
  }
}

const Page = async ({ params }: { params: Promise<{ handle: string }> }) => {
  const { handle } = await params

  const property = await getPropertyBySlug(handle)

  if (!property) {
    return redirect('/real-estate-categories/all')
  }
  
  const listing = adaptPropertyToListing(property)
  const {
    address,
    bathrooms,
    bedrooms,
    date,
    description,
    featuredImage,
    galleryImgs,
    isAds,
    like,
    listingCategory,
    map,
    maxGuests,
    price,
    reviewCount,
    reviewStart,
    saleOff,
    title,
    acreage,
  } = listing
  const host = (listing as any).host || null
  const reviews = (await getListingReviews(handle)).slice(0, 3) // Fetching only the first 3 reviews for display

  //

  const renderSectionHeader = () => {
    return (
      <SectionHeader
        address={address}
        host={host}
        listingCategory={listingCategory}
        reviewCount={reviewCount}
        reviewStart={reviewStart}
        title={title}
        propertyLabels={property.property_labels?.map(label => label.label) || []}
      >
        {maxGuests > 0 && (
          <div className="flex items-center gap-x-3">
            <UsersIcon className="mb-0.5 size-6" />
            <span>{maxGuests} personnes</span>
          </div>
        )}
        {acreage > 0 && (
          <div className="flex items-center gap-x-3">
            <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} />
            <span>{acreage} m²</span>
          </div>
        )}
        {bathrooms > 0 && (
          <div className="flex items-center gap-x-3">
            <Bathtub02Icon className="mb-0.5 size-6" />
            <span>{bathrooms} salle{bathrooms > 1 ? 's' : ''} de bain</span>
          </div>
        )}
        {bedrooms > 0 && (
          <div className="flex items-center gap-x-3">
            <MeetingRoomIcon className="mb-0.5 size-6" />
            <span>{bedrooms} chambre{bedrooms > 1 ? 's' : ''}</span>
          </div>
        )}
      </SectionHeader>
    )
  }

  const renderSectionInfo = () => {
    // Génération dynamique des points forts basés sur les données de la propriété
    const highlights = []
    
    // Ajout conditionnel des highlights basés sur les données
    if (property.property_type === 'appartement' && property.elevator) {
      highlights.push({
        title: 'Avec ascenseur',
        description: 'Appartement accessible par ascenseur pour votre confort quotidien.'
      })
    }
    
    if (property.parking && property.parking > 0) {
      highlights.push({
        title: `${property.parking} place${property.parking > 1 ? 's' : ''} de parking`,
        description: 'Stationnement sécurisé inclus avec le bien.'
      })
    }
    
    if (property.balcony || property.terrace) {
      const type = property.balcony && property.terrace ? 'balcon et terrasse' : 
                   property.balcony ? 'balcon' : 'terrasse'
      highlights.push({
        title: `Avec ${type}`,
        description: `Profitez d'un espace extérieur ${type} pour vos moments de détente.`
      })
    }
    
    if (property.garden) {
      highlights.push({
        title: 'Avec jardin',
        description: 'Espace vert privé pour profiter de l\'extérieur.'
      })
    }
    
    if (property.furnished) {
      highlights.push({
        title: 'Meublé',
        description: 'Bien entièrement meublé, prêt à vivre.'
      })
    }
    
    if (property.energy_class && ['A', 'B', 'C'].includes(property.energy_class)) {
      highlights.push({
        title: `Bon DPE (classe ${property.energy_class})`,
        description: 'Performance énergétique optimale pour réduire vos charges.'
      })
    }
    
    // Si pas assez de highlights spécifiques, on ajoute des génériques
    if (highlights.length === 0) {
      highlights.push(
        {
          title: 'Emplacement privilégié',
          description: `Situé à ${property.city}, ce bien bénéficie d'un environnement agréable.`
        },
        {
          title: 'Prestations de qualité',
          description: 'Bien immobilier aux finitions soignées et aux prestations de qualité.'
        }
      )
    }
    return (
      <div className="listingSection__wrap">
        <SectionHeading>Informations sur le bien</SectionHeading>
        <div className="leading-relaxed text-neutral-700 dark:text-neutral-300">
          {description ? (
            <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
          ) : (
            <span>
              Ce bien immobilier vous séduira par son emplacement et ses prestations. 
              N'hésitez pas à nous contacter pour plus d'informations.
            </span>
          )}
        </div>

        <Divider />

        <SectionHeading>Points forts du bien</SectionHeading>
        <DescriptionList>
          {highlights.map((item, index) => (
            <Fragment key={index}>
              <DescriptionTerm>{item.title}</DescriptionTerm>
              <DescriptionDetails>{item.description}</DescriptionDetails>
            </Fragment>
          ))}
        </DescriptionList>
      </div>
    )
  }

  const renderSectionAmenities = () => {
    // Génération dynamique des équipements basés sur les données de la propriété
    const features = []
    
    // Équipements de base issus des champs boolean de la base
    if (property.elevator) {
      features.push({ name: 'Ascenseur', icon: MeetingRoomIcon })
    }
    
    if (property.balcony) {
      features.push({ name: 'Balcon', icon: () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} /> })
    }
    
    if (property.terrace) {
      features.push({ name: 'Terrasse', icon: () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} /> })
    }
    
    if (property.garden) {
      features.push({ name: 'Jardin', icon: () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} /> })
    }
    
    if (property.parking && property.parking > 0) {
      features.push({ name: `${property.parking} place${property.parking > 1 ? 's' : ''} de parking`, icon: () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} /> })
    }
    
    if (property.furnished) {
      features.push({ name: 'Meublé', icon: TvSmartIcon })
    }
    
    if (property.cave) {
      features.push({ name: 'Cave', icon: MeetingRoomIcon })
    }
    
    if (property.cellier) {
      features.push({ name: 'Cellier', icon: MeetingRoomIcon })
    }
    
    if (property.grenier) {
      features.push({ name: 'Grenier', icon: MeetingRoomIcon })
    }
    
    if (property.garage) {
      features.push({ name: 'Garage', icon: () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} /> })
    }
    
    if (property.climatisation) {
      features.push({ name: 'Climatisation', icon: WaterEnergyIcon })
    }
    
    if (property.cuisine_equipee) {
      features.push({ name: 'Cuisine équipée', icon: TvSmartIcon })
    }
    
    if (property.cuisine_americaine) {
      features.push({ name: 'Cuisine américaine', icon: TvSmartIcon })
    }
    
    if (property.interphone) {
      features.push({ name: 'Interphone', icon: CctvCameraIcon })
    }
    
    if (property.gardien) {
      features.push({ name: 'Gardien', icon: CctvCameraIcon })
    }
    
    if (property.piscine) {
      features.push({ name: 'Piscine', icon: WaterPoloIcon })
    }
    
    if (property.veranda) {
      features.push({ name: 'Véranda', icon: () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} /> })
    }
    
    // Chauffage
    if (property.chauffage_type) {
      features.push({ name: `Chauffage ${property.chauffage_type}`, icon: WaterEnergyIcon })
    }
    
    // Ajout des amenities personnalisées de la table property_amenities
    if (property.property_amenities && property.property_amenities.length > 0) {
      property.property_amenities.forEach(amenity => {
        const amenityName = amenity.amenity_value 
          ? `${amenity.amenity_name} (${amenity.amenity_value})`
          : amenity.amenity_name
        
        // Choisir l'icône en fonction du type d'amenity
        let icon = Wifi01Icon // icône par défaut
        
        if (amenity.amenity_type.toLowerCase().includes('cuisine')) {
          icon = TvSmartIcon
        } else if (amenity.amenity_type.toLowerCase().includes('sanitaire') || amenity.amenity_type.toLowerCase().includes('eau')) {
          icon = Bathtub02Icon
        } else if (amenity.amenity_type.toLowerCase().includes('chauffage') || amenity.amenity_type.toLowerCase().includes('énergie')) {
          icon = WaterEnergyIcon
        } else if (amenity.amenity_type.toLowerCase().includes('sécurité')) {
          icon = CctvCameraIcon
        } else if (amenity.amenity_type.toLowerCase().includes('extérieur') || amenity.amenity_type.toLowerCase().includes('jardin')) {
          icon = () => <HugeiconsIcon icon={CropIcon} size={24} strokeWidth={1.5} />
        } else if (amenity.amenity_type.toLowerCase().includes('confort')) {
          icon = Speaker01Icon
        }
        
        features.push({ 
          name: amenityName,
          icon: typeof icon === 'function' ? icon : icon
        })
      })
    }
    
    // Équipements par défaut si aucun spécifique
    if (features.length === 0) {
      features.push(
        { name: 'Électricité aux normes', icon: WaterEnergyIcon },
        { name: 'Eau courante', icon: WaterEnergyIcon },
        { name: 'Tout à l\'égout', icon: Bathtub02Icon }
      )
    }

    return (
      <div className="listingSection__wrap">
        <div>
          <SectionHeading>Équipements du bien</SectionHeading>
          <SectionSubheading>Détail des équipements et services inclus</SectionSubheading>
        </div>
        <Divider className="w-14!" />

        <div className="grid grid-cols-1 gap-6 text-sm text-neutral-700 xl:grid-cols-3 dark:text-neutral-300">
          {features.filter((_, i) => i < 12).map((item, index) => (
            <div key={index} className="flex items-center gap-x-3">
              {item.icon && (typeof item.icon === 'function' ? item.icon() : <item.icon className="h-6 w-6" />)}
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        {features.length > 12 && (
          <>
            <div className="w-14 border-b border-neutral-200"></div>
            <div>
              <ButtonSecondary>
                Voir {features.length - 12} équipement{features.length - 12 > 1 ? 's' : ''} de plus
              </ButtonSecondary>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderSidebarPriceAndForm = () => {
    return (
      <div className="listingSection__wrap sm:shadow-xl">
        {/* PRICE */}
        <div>
          <p className="text-base font-normal text-neutral-500 dark:text-neutral-400">Prix </p>
          <div className="mt-1.5 flex items-end text-2xl font-semibold sm:text-3xl">
            <span className="text-neutral-300 line-through">$350</span>
            <span className="mx-2">{price}</span>
          </div>
        </div>

        <Divider />

        {/* host */}
        <div className="flex items-center gap-x-4">
          <HostAvatar avatarUrl={host.avatarUrl} />
          <div>
            <SectionHeading>
              <Link href={'/authors/' + host.handle}>{host.displayName}</Link>
            </SectionHeading>
            <div className="mt-1.5 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
              <StartRating point={host.rating} reviewCount={host.reviewsCount} />
              <span className="mx-2">·</span>
              <span>{host.listingsCount} biens</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-x-1.5">
            <HugeiconsIcon icon={Medal01Icon} size={20} color="currentColor" strokeWidth={1.5} />
            Agent expert
          </div>
          <div className="w-px bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="flex items-center gap-x-1.5">
            <HugeiconsIcon icon={Award04Icon} size={20} color="currentColor" strokeWidth={1.5} />
            2+ années
          </div>
        </div>

        {/* info */}
        <div className="flex flex-col gap-y-2.5 text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-x-3">
            <HugeiconsIcon icon={Mail01Icon} size={24} />
            <span>{host.email}</span>
          </div>
          <div className="flex items-center gap-x-3">
            <HugeiconsIcon icon={SmartPhone01Icon} size={24} />
            <span>{host.phone}</span>
          </div>
        </div>

        {/* == */}
        <div className="flex gap-2">
          <Button href={'/authors/' + handle}>Contacter</Button>
          <ButtonSecondary outline>
            Envoyer un email
            <HugeiconsIcon icon={Navigation03Icon} size={20} color="currentColor" strokeWidth={1.5} className="mb-px" />
          </ButtonSecondary>
        </div>
        <Divider />

        <div className="flex items-center gap-x-2 text-sm text-neutral-700 dark:text-neutral-300">
          <HugeiconsIcon icon={Flag03Icon} size={16} color="currentColor" strokeWidth={1.5} />
          <span>Signaler cet agent</span>
        </div>
      </div>
    )
  }

  // Schema.org JSON-LD pour le SEO
  const propertySchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description || `${property.property_type} à ${property.city}`,
    "url": `https://initiative-immobilier.fr/real-estate-listings/${property.slug || property.id}`,
    "image": property.gallery_images && property.gallery_images.length > 0 
      ? property.gallery_images 
      : property.featured_image 
      ? [property.featured_image]
      : [],
    "price": {
      "@type": "MonetaryAmount",
      "value": property.price,
      "currency": "EUR"
    },
    "priceCurrency": "EUR",
    "availabilityStarts": property.listing_date || property.created_at,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.city,
      "postalCode": property.postal_code,
      "addressCountry": "FR"
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    } : undefined,
    "floorSize": property.surface ? {
      "@type": "QuantitativeValue",
      "value": property.surface,
      "unitCode": "MTK"
    } : undefined,
    "numberOfRooms": property.rooms,
    "numberOfBedrooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "yearBuilt": property.construction_year,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "EUR",
      "availability": property.status === 'disponible' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "validFrom": property.listing_date || property.created_at,
      "seller": {
        "@type": "RealEstateAgent",
        "name": "Initiative Immobilier",
        "url": "https://initiative-immobilier.fr"
      }
    },
    "additionalProperty": [
      property.parking && property.parking > 0 ? {
        "@type": "PropertyValue",
        "name": "Parking",
        "value": property.parking
      } : null,
      property.energy_class ? {
        "@type": "PropertyValue", 
        "name": "Classe énergétique",
        "value": property.energy_class
      } : null,
      property.elevator ? {
        "@type": "PropertyValue",
        "name": "Ascenseur", 
        "value": "Oui"
      } : null,
      property.balcony ? {
        "@type": "PropertyValue",
        "name": "Balcon",
        "value": "Oui" 
      } : null,
      property.terrace ? {
        "@type": "PropertyValue",
        "name": "Terrasse",
        "value": "Oui"
      } : null,
      property.garden ? {
        "@type": "PropertyValue", 
        "name": "Jardin",
        "value": "Oui"
      } : null
    ].filter(Boolean)
  }

  return (
    <div>
      {/* Tracker de vues de propriété */}
      <PropertyViewTracker propertyId={property.id} />
      
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(propertySchema, null, 2)
        }}
      />

      {/*  HEADER */}
      <HeaderGallery gridType="grid2" images={galleryImgs} />

      {/* MAIN */}
      <main className="relative z-[1] mt-10 flex flex-col gap-8 lg:flex-row xl:gap-10">
        {/* CONTENT */}
        <div className="flex w-full flex-col gap-y-8 lg:w-3/5 xl:w-[64%] xl:gap-y-10">
          {renderSectionHeader()}
          {renderSectionInfo()}
          {renderSectionAmenities()}
        </div>

        {/* SIDEBAR */}
        <div className="grow">
          <div className="sticky top-5">{renderSidebarPriceAndForm()}</div>
        </div>
      </main>

      <Divider className="my-16" />

      <div className="flex flex-col gap-y-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="w-full lg:w-4/9 xl:w-1/3">
            <SectionHost {...host} />
          </div>
          <div className="w-full lg:w-2/3">
            <SectionListingReviews reviewCount={reviewCount} reviewStart={reviewStart} reviews={reviews} />
          </div>
        </div>

        <SectionMap 
          latitude={map.lat}
          longitude={map.lng}
          address={address}
          title={title}
        />
      </div>
    </div>
  )
}

export default Page
