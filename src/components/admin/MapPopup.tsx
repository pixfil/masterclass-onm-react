'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

// Import dynamique de la map pour éviter les erreurs SSR
const DynamicMapbox = dynamic(
  () => import('@/components/MapboxMap/SimpleMapboxMap').then(mod => ({ default: mod.SimpleMapboxMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
)

interface MapPopupProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  propertyTitle: string
  propertyAddress: string
  price?: number
  rooms?: number
  surface?: number
  transactionType?: 'vente' | 'location'
}

export const MapPopup = ({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  propertyTitle,
  propertyAddress,
  price = 0,
  rooms = 0,
  surface = 0,
  transactionType = 'vente'
}: MapPopupProps) => {
  const [showPinPopup, setShowPinPopup] = useState(false)
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay avec backdrop blur élégant */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full opacity-0"
                enterTo="translate-x-0 opacity-100"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="translate-x-full opacity-0"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col bg-white/95 backdrop-blur-md shadow-2xl border-l border-neutral-200/50 dark:bg-neutral-800/95 dark:border-neutral-700/50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/50 backdrop-blur-sm bg-white/50 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-neutral-900 dark:text-white">
                          Localisation de la propriété
                        </Dialog.Title>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {propertyTitle}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          {propertyAddress}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-md bg-white text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-400"
                        onClick={onClose}
                      >
                        <span className="sr-only">Fermer</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Map Content */}
                    <div className="flex-1 relative">
                      <div className="absolute inset-0">
                        <DynamicMapbox
                          properties={[{
                            id: 'current',
                            coordinates: {
                              lat: latitude,
                              lng: longitude
                            },
                            title: propertyTitle,
                            address: propertyAddress,
                            price: price || 100000,
                            transaction_type: transactionType,
                            property_type: 'appartement',
                            status: 'disponible',
                            city: propertyAddress.split(',')[0] || '',
                            rooms: rooms,
                            surface: surface,
                            featured_image: null,
                            gallery_images: [],
                            handle: 'current-property'
                          }]}
                          className="w-full h-full"
                          selectedPropertyId="current"
                        />
                        {/* Pin de secours si le marker Mapbox n'est pas visible */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none">
                          <div className="relative">
                            {/* Pin principal de secours */}
                            <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            {/* Ombre du pin */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black/20 rounded-full blur-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer info */}
                    <div className="px-6 py-4 bg-neutral-50/80 backdrop-blur-sm border-t border-neutral-200/50 dark:bg-neutral-900/80 dark:border-neutral-700/50">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center justify-between">
                          <span>Coordonnées:</span>
                          <span className="font-mono text-xs">
                            {latitude.toFixed(6)}, {longitude.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span>Zoom:</span>
                          <span className="text-xs">Niveau 16 (quartier)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}