'use client'

import { PriceRangeSlider } from '@/components/PriceRangeSlider'
import { usePrixRange } from '@/hooks/usePrixRange'
import convertNumbThousand from '@/utils/convertNumbThousand'
import T from '@/utils/getT'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { CurrencyEuroIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import { ClearDataButton } from './ClearDataButton'

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
    base: 'absolute top-full z-10 mt-3 w-96 transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 end-0 overflow-hidden rounded-3xl bg-white p-7 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800',
    default: '',
    small: '',
  },
}

interface Props {
  className?: string
  fieldStyle: 'default' | 'small'
  panelClassName?: string
  clearDataButtonClassName?: string
  min?: number
  max?: number
  priceRange?: { min: number; max: number }
  transactionType?: 'vente' | 'location'
  isLoading?: boolean
}

export const PriceRangeInputField: FC<Props> = ({
  className = 'flex-1',
  fieldStyle = 'default',
  panelClassName,
  clearDataButtonClassName,
  min = 0,
  max = 1000000,
  priceRange,
  transactionType = 'vente',
  isLoading = false,
}) => {
  const { prixRange, loading } = usePrixRange()
  
  // Utiliser les valeurs passées en props ou fallback sur le hook
  const currentRange = priceRange || prixRange
  const showLoading = priceRange ? isLoading : loading
  
  const [rangePrices, setRangePrices] = useState([currentRange.min, currentRange.max])

  // Mettre à jour les prix quand les données changent
  useEffect(() => {
    if (!showLoading && currentRange.min !== 0 && currentRange.max !== 0) {
      setRangePrices([currentRange.min, currentRange.max])
    }
  }, [currentRange, showLoading])

  // Utiliser les valeurs actuelles ou les valeurs par défaut
  const minPrice = currentRange.min || min
  const maxPrice = currentRange.max || max

  // Fonction pour formater le prix en euros selon le type de transaction
  const formatPrixEuros = (prix: number): string => {
    const suffix = transactionType === 'location' ? '€/mois' : '€'
    
    if (prix >= 1000000) {
      return `${(prix / 1000000).toFixed(1)}M${suffix}`
    } else if (prix >= 1000) {
      return `${Math.round(prix / 1000)}k${suffix}`
    } else {
      return `${prix}${suffix}`
    }
  }

  return (
    <>
      <Popover className={`group relative z-10 flex ${className}`}>
        {({ open: showPopover }) => (
          <>
            <PopoverButton
              className={clsx(styles.button.base, styles.button[fieldStyle], showPopover && styles.button.focused)}
            >
              {fieldStyle === 'default' && (
                <CurrencyEuroIcon className="size-5 text-neutral-300 lg:size-7 dark:text-neutral-400" />
              )}

              <div className="flex-1 text-start">
                <span className={clsx('block font-semibold', styles.mainText[fieldStyle])}>
                  {showLoading ? 'Chargement...' : `${formatPrixEuros(rangePrices[0])} ~ ${formatPrixEuros(rangePrices[1])}`}
                </span>
                <span className="mt-1 block text-sm leading-none font-light text-neutral-400">
                  {transactionType === 'location' ? 'Fourchette de loyer' : 'Fourchette de prix'}
                </span>
              </div>
            </PopoverButton>

            <ClearDataButton
              className={clsx(rangePrices[0] === minPrice && rangePrices[1] === maxPrice && 'sr-only', clearDataButtonClassName)}
              onClick={() => setRangePrices([minPrice, maxPrice])}
            />

            <PopoverPanel transition className={clsx(panelClassName, styles.panel.base, styles.panel[fieldStyle])}>
              <PriceRangeSlider
                name={T['HeroSearchForm']['Price range']}
                min={minPrice}
                max={maxPrice}
                defaultValue={rangePrices}
                onChange={(value) => {
                  setRangePrices(value)
                }}
              />
            </PopoverPanel>
          </>
        )}
      </Popover>

      <input type="hidden" name="price_min" value={rangePrices[0]} />
      <input type="hidden" name="price_max" value={rangePrices[1]} />
    </>
  )
}
