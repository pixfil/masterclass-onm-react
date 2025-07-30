'use client'

import T from '@/utils/getT'
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Building03Icon, House04Icon, KeyIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const solutions = [
  {
    name: 'Louer une maison',
    description: 'Trouvez une maison à louer',
    href: '/real-estate-categories-map/all?type=maison&transaction=location',
    icon: House04Icon,
  },
  {
    name: 'Louer un appartement',
    description: 'Découvrez nos appartements en location',
    href: '/real-estate-categories-map/all?type=appartement&transaction=location',
    icon: Building03Icon,
  },
  {
    name: 'Acheter une maison',
    description: 'Maisons à vendre dans la région',
    href: '/real-estate-categories-map/all?type=maison&transaction=vente',
    icon: KeyIcon,
  },
  {
    name: 'Acheter un appartement',
    description: 'Appartements à vendre',
    href: '/real-estate-categories-map/all?type=appartement&transaction=vente',
    icon: ShoppingCart01Icon,
  },
]

export default function DropdownTravelers() {
  const pathName = usePathname()

  return (
    <Popover className="group">
      <PopoverButton className="-m-2.5 flex items-center p-2.5 text-sm font-medium text-neutral-700 group-hover:text-neutral-950 focus:outline-hidden dark:text-neutral-300 dark:group-hover:text-neutral-100">
        J'aimerais...
        <ChevronDownIcon className="ms-1 size-4 group-data-open:rotate-180" aria-hidden="true" />
      </PopoverButton>
      <PopoverPanel
        anchor={{
          to: 'bottom start',
          gap: 16,
        }}
        transition
        className="z-40 w-80 rounded-3xl shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 sm:px-0 dark:ring-white/10"
      >
        <div>
          <div className="relative grid grid-cols-1 gap-7 bg-white p-7 dark:bg-neutral-800">
            {solutions.map((item, index) => {
              const isActive = pathName === item.href
              return (
                <CloseButton
                  as={Link}
                  key={index}
                  href={item.href}
                  className={`focus-visible:ring-opacity-50 -m-3 flex items-center rounded-lg p-2 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 ${
                    isActive ? 'bg-neutral-50 dark:bg-neutral-700' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-md bg-neutral-50 text-primary-500 sm:h-12 sm:w-12 dark:bg-neutral-700 dark:text-primary-200">
                    <HugeiconsIcon icon={item.icon} size={28} color="currentColor" strokeWidth={1.5} />
                  </div>
                  <div className="ms-4 space-y-0.5">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-300">{item.description}</p>
                  </div>
                </CloseButton>
              )
            })}
          </div>
          {/* FOOTER */}
          <div className="bg-neutral-50 p-4 dark:bg-neutral-700">
            <Link
              href="/estimer-mon-bien"
              className="focus-visible:ring-opacity-50 flow-root space-y-0.5 rounded-md px-2 py-2 focus:outline-none focus-visible:ring focus-visible:ring-orange-500"
            >
              <span className="flex items-center">
                <span className="text-sm font-medium">Estimer mon bien</span>
              </span>
              <span className="line-clamp-1 text-sm text-gray-500 dark:text-neutral-400">
                Obtenez une estimation gratuite de votre propriété
              </span>
            </Link>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
