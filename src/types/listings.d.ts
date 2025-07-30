import { TRealEstateListing as BaseRealEstateListing } from '@/data/listings'

// Extension du type TRealEstateListing pour inclure property_labels
declare module '@/data/listings' {
  interface TRealEstateListing extends BaseRealEstateListing {
    property_labels?: string[]
  }
}