import { Divider } from '@/shared/divider'
import { PropertyDetailMap } from '@/components/MapboxMap/PropertyDetailMap'
import { SectionHeading, SectionSubheading } from './SectionHeading'

interface Props {
  className?: string
  heading?: string
  subheading?: string
  latitude?: number
  longitude?: number
  address?: string
  title?: string
}

const SectionMap = ({ 
  className, 
  heading = "Localisation", 
  subheading,
  latitude = 48.8566,
  longitude = 2.3522,
  address = "Paris, France",
  title = "Propriété"
}: Props) => {
  return (
    <div className="listingSection__wrap">
      {/* HEADING */}
      <div>
        <SectionHeading>{heading}</SectionHeading>
        {subheading && <SectionSubheading>{subheading}</SectionSubheading>}
        {!subheading && <SectionSubheading>{address}</SectionSubheading>}
      </div>
      <Divider className="w-14!" />

      {/* MAP */}
      <div className="aspect-w-5 rounded-xl ring-1 ring-black/10 aspect-h-6 sm:aspect-h-3 lg:aspect-h-2">
        <PropertyDetailMap
          latitude={latitude}
          longitude={longitude}
          address={address}
          title={title}
          className="h-full w-full"
        />
      </div>
    </div>
  )
}

export default SectionMap
