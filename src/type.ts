export interface GuestsObject {
  guestAdults?: number
  guestChildren?: number
  guestInfants?: number
}

export type ListingType = 'RealEstates'

export interface PropertyType {
  name: string
  description: string
  value: string
}

export type PropertyCategory = 'maison' | 'appartement' | 'locaux_commerciaux' | 'parking' | 'terrain' | 'autres'
export type TransactionType = 'vente' | 'location'

export interface ClassOfProperties extends PropertyType {}

export type DateRage = [Date | null, Date | null]
