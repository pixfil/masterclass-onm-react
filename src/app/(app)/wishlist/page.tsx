'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getClientWishlist } from '@/lib/supabase/clients'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { WishlistButton } from '@/components/WishlistButton'
import { HeartIcon, HomeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { cleanImageUrl } from '@/utils/imageUtils'

interface WishlistProperty {
  id: string
  client_id: string
  property_id: string
  created_at: string
  notes?: string
  properties: {
    id: string
    title: string
    price: number
    property_type: string
    transaction_type: string
    address: string
    city: string
    featured_image: string
    status: string
  }
}

const WishlistPage = () => {
  const { user } = useAuth()
  const [wishlistProperties, setWishlistProperties] = useState<WishlistProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const fetchWishlist = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await getClientWishlist(user.id)
      setWishlistProperties(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error)
      setError('Impossible de charger votre liste de souhaits')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'maison': 'Maison',
      'appartement': 'Appartement',
      'locaux_commerciaux': 'Local commercial',
      'parking': 'Parking',
      'terrain': 'Terrain',
      'autres': 'Autres'
    }
    return types[type] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    return type === 'vente' ? 'Vente' : 'Location'
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <HeartIcon className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <Heading level={2} className="mb-4">
            Connectez-vous pour voir vos favoris
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Créez un compte pour sauvegarder vos propriétés préférées et y accéder à tout moment.
          </p>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">
                Se connecter
              </Button>
            </Link>
            <Link href="/signup">
              <Button color="light" className="w-full">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Chargement
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Chargement de votre liste de souhaits...
          </p>
        </div>
      </div>
    )
  }

  // Erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">⚠️</div>
          <Heading level={2} className="mb-4 text-red-600">
            Erreur
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error}
          </p>
          <Button onClick={fetchWishlist}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HeartIcon className="h-8 w-8 text-primary-600" />
          <Heading level={1}>
            Ma liste de souhaits
          </Heading>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          {wishlistProperties.length === 0 
            ? 'Votre liste de souhaits est vide'
            : `${wishlistProperties.length} propriété${wishlistProperties.length > 1 ? 's' : ''} sauvegardée${wishlistProperties.length > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Liste vide */}
      {wishlistProperties.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
          <Heading level={3} className="mb-4">
            Aucune propriété sauvegardée
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            Parcourez nos annonces et cliquez sur le cœur pour ajouter vos propriétés préférées à cette liste.
          </p>
          <Link href="/real-estate">
            <Button className="inline-flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Découvrir nos propriétés
            </Button>
          </Link>
        </div>
      ) : (
        /* Grille des propriétés */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProperties.map((item) => {
            const property = item.properties
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <Link href={`/real-estate-listings/${property.id}`}>
                    <Image
                      src={cleanImageUrl(property.featured_image) || '/placeholder-property.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>
                  
                  {/* Bouton wishlist */}
                  <div className="absolute top-3 right-3">
                    <WishlistButton 
                      propertyId={property.id}
                      size="md"
                    />
                  </div>

                  {/* Badge statut */}
                  <div className="absolute top-3 left-3">
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-md
                      ${property.status === 'disponible' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }
                    `}>
                      {property.status === 'disponible' ? 'Disponible' : 'Non disponible'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  {/* Prix et type */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-primary-600">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {getTransactionTypeLabel(property.transaction_type)}
                    </div>
                  </div>

                  {/* Titre */}
                  <Link href={`/real-estate-listings/${property.id}`}>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                      {property.title}
                    </h3>
                  </Link>

                  {/* Type de propriété */}
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {getPropertyTypeLabel(property.property_type)}
                  </div>

                  {/* Adresse */}
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {property.address && property.address !== property.city 
                        ? `${property.address}, ${property.city}`
                        : property.city
                      }
                    </span>
                  </div>

                  {/* Date d'ajout */}
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-3">
                    Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WishlistPage