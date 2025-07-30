'use client'

import { useTypesBiens } from '@/hooks/useTypesBiens'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/shared/Checkbox'
import { Description, Label } from '@/shared/fieldset'
import T from '@/utils/getT'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { HomeIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC, useState } from 'react'

const styles = {
  button: {
    base: 'relative z-10 shrink-0 w-full cursor-pointer flex items-center gap-x-3 focus:outline-hidden text-start',
    focused: 'rounded-full bg-transparent focus-visible:outline-hidden dark:bg-white/5 custom-shadow-1',
    default: 'px-7 py-4 xl:px-8 xl:py-6',
    small: 'py-3 px-7 xl:px-8',
  },
  mainText: {
    default: 'text-base xl:text-lg',
    small: 'text-base',
  },
  panel: {
    base: 'absolute top-full z-10 mt-3 w-96 transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 start-1/2 -translate-x-1/2 overflow-hidden rounded-3xl bg-white p-7 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800',
    default: '',
    small: '',
  },
}

interface PropertyType {
  name: string
  description: string
  value: string
}

const defaultPropertyTypes: PropertyType[] = [
  {
    name: 'Duplex House',
    value: 'duplex_house',
    description: 'Have a place to yourself',
  },
  {
    name: 'Ferme House',
    value: 'ferme_house',
    description: 'Have your own room and share some common spaces',
  },
  {
    name: 'Chalet House',
    value: 'chalet_house',
    description: 'Have a private or shared room in a boutique hotel, hostel.',
  },
  {
    name: 'Maison House',
    value: 'maison_house',
    description: 'Stay in a shared space, like a common room',
  },
]

interface Props {
  className?: string
  fieldStyle: 'default' | 'small'
  propertyTypes?: Array<{ value: string; label: string; count: number }>
  description?: string
  placeholder?: string
  isLoading?: boolean
}

export const PropertyTypeSelectField: FC<Props> = ({
  className = 'flex-1',
  fieldStyle = 'default',
  propertyTypes = [],
  description = T['HeroSearchForm']['Property type'],
  placeholder = T['HeroSearchForm']['Type'],
  isLoading = false,
}) => {
  const { typesBiens, loading } = useTypesBiens()
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  
  // Utiliser les types passés en props ou fallback sur le hook
  const typesToUse = propertyTypes.length > 0 
    ? propertyTypes.map(type => ({
        name: type.label,
        value: type.value,
        description: '',
        count: type.count
      }))
    : typesBiens.length > 0 
      ? typesBiens 
      : defaultPropertyTypes.map(type => ({ ...type, count: 0 }))
  
  const showLoading = propertyTypes.length > 0 ? isLoading : loading
  let typeStringConverted = selectedTypes.length > 0 ? selectedTypes.join(', ') : placeholder
  return (
    <Popover className={`group relative z-10 flex ${className}`}>
      {({ open: showPopover }) => (
        <>
          <PopoverButton
            className={clsx(styles.button.base, styles.button[fieldStyle], showPopover && styles.button.focused)}
          >
            {fieldStyle === 'default' && (
              <HomeIcon className="size-5 text-neutral-300 lg:size-7 dark:text-neutral-400" />
            )}

            <div className="flex-1">
              <span className={clsx('block font-semibold', styles.mainText[fieldStyle])}>
                <span className="line-clamp-1">{typeStringConverted || placeholder}</span>
              </span>
              <span className="mt-1 block text-sm leading-none font-light text-neutral-400">{description}</span>
            </div>
          </PopoverButton>

          <PopoverPanel unmount={false} transition className={clsx(styles.panel.base, styles.panel[fieldStyle])}>
            {showLoading ? (
              <div className="text-center py-4 text-neutral-500">
                Chargement des types de biens...
              </div>
            ) : (
              <CheckboxGroup>
                {typesToUse.map((item) => (
                  <CheckboxField key={item.value}>
                    <Checkbox
                      name="property_type"
                      value={item.value}
                      checked={selectedTypes.includes(item.name)}
                      onChange={(e) => {
                        const newState = e
                          ? [...selectedTypes, item.name]
                          : selectedTypes.filter((type) => type !== item.name)
                        setSelectedTypes(newState)
                      }}
                    />
                    <Label>
                      {item.name} 
                      {item.count && ` (${item.count})`}
                    </Label>
                    <Description>{item.description}</Description>
                  </CheckboxField>
                ))}
              </CheckboxGroup>
            )}
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}
