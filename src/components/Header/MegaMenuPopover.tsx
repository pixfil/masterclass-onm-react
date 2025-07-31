import { TCategory } from '@/data/categories'
import { TNavigationItem } from '@/data/navigation'
import { Link } from '@/shared/link'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import FormationCard from '../FormationCard'

export default function MegaMenuPopover({
  megamenu,
  featuredCategory,
}: {
  megamenu: TNavigationItem | null
  featuredCategory: TCategory | null
}) {
  if (!megamenu || megamenu.type !== 'mega-menu') {
    return null
  }

  const renderNavlink = (item: TNavigationItem) => {
    return (
      <li key={item.id} className={`${item.isNew ? 'menuIsNew' : ''}`}>
        <Link
          className="font-normal text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          href={item.href || '#'}
        >
          {item.name}
        </Link>
      </li>
    )
  }

  return (
    <div className="hidden lg:block">
      <Popover className="group">
        {({ open }) => (
          <>
            <PopoverButton className="-m-2.5 flex items-center p-2.5 text-sm font-medium text-neutral-700 group-hover:text-neutral-950 focus:outline-hidden dark:text-neutral-300 dark:group-hover:text-neutral-100 relative">
              {megamenu.name}
              <ChevronDownIcon className={`ms-1 size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
              
              {/* Zone invisible pour maintenir le survol entre le bouton et le menu */}
              {open && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 w-full h-4 bg-transparent pointer-events-auto"
                  style={{ zIndex: 35 }}
                />
              )}
            </PopoverButton>

            <PopoverPanel
              transition
              className="header-popover-full-panel absolute z-40 w-screen max-w-7xl transition duration-300 ease-out data-closed:translate-y-2 data-closed:opacity-0 data-enter:translate-y-0 data-enter:opacity-100"
              style={{
                // Centrer par rapport au viewport entier
                left: '50%',
                transform: 'translateX(-50%)',
                top: 'calc(100% + 1rem)'
              }}
            >
              {/* Zone de bridge invisible étendue pour plus de stabilité */}
              <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
              
              <div className="bg-white shadow-lg dark:bg-neutral-900 mx-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="px-6 lg:px-8">
                  <div className="flex py-12 text-sm">
                    <div className="grid flex-1 grid-cols-4 gap-6 pr-6 xl:gap-8 xl:pr-20">
                      {megamenu.children?.map((menuChild, index) => (
                        <div key={index}>
                          <p className="font-medium text-neutral-900 dark:text-neutral-200">{menuChild.name}</p>
                          <ul className="mt-4 grid space-y-4">{menuChild.children?.map(renderNavlink)}</ul>
                        </div>
                      ))}
                    </div>
                    <div className="w-2/5 xl:w-5/14">
                      <FormationCard />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  )
}
