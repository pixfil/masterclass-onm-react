'use client'

import T from '@/utils/getT'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import {
  ButtonSubmit,
  LocationInputField,
  PriceRangeInputField,
  PropertyTypeSelectField,
  VerticalDividerLine,
} from './ui'
import { supabase } from '@/lib/supabaseClient'

type Tab = 'vente' | 'location'

interface Props {
  className?: string
  formStyle: 'default' | 'small'
}

interface FilterOptions {
  locations: Array<{ value: string; label: string; count: number }>
  types: Array<{ value: string; label: string; count: number }>
  priceRange: { min: number; max: number }
}

const tabs = [
  { value: 'vente', label: T['HeroSearchForm']['Buy'] },
  { value: 'location', label: T['HeroSearchForm']['Rent'] },
] as const

export const RealEstateHeroSearchForm: FC<Props> = ({ className, formStyle = 'default' }) => {
  const [tabType, setTabType] = useState<Tab>(tabs[0].value)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    types: [],
    priceRange: { min: 0, max: 2000000 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Prefetch the stay categories page to improve performance
  useEffect(() => {
    router.prefetch('/real-estate-categories/all')
  }, [router])

  // Charger les options de filtres depuis Supabase
  useEffect(() => {
    loadFilterOptions(tabType)
  }, [tabType])

  const loadFilterOptions = async (transactionType: Tab) => {
    setIsLoading(true)
    try {
      const [locationsResult, typesResult, pricesResult] = await Promise.all([
        // Localités pour ce type de transaction
        supabase
          .from('properties')
          .select('city')
          .eq('transaction_type', transactionType)
          .eq('published', true)
          .not('city', 'is', null),
        
        // Types de biens pour ce type de transaction
        supabase
          .from('properties')
          .select('property_type')
          .eq('transaction_type', transactionType)
          .eq('published', true)
          .not('property_type', 'is', null),
        
        // Prix pour calculer les plages
        supabase
          .from('properties')
          .select('price')
          .eq('transaction_type', transactionType)
          .eq('published', true)
          .gt('price', 0)
      ])

      // Traiter les localités
      const locationCounts: Record<string, number> = {}
      locationsResult.data?.forEach(item => {
        const city = item.city?.trim()
        if (city) {
          locationCounts[city] = (locationCounts[city] || 0) + 1
        }
      })
      
      const locations = Object.entries(locationCounts)
        .map(([value, count]) => ({
          value,
          label: `${value} (${count} bien${count > 1 ? 's' : ''})`,
          count
        }))
        .sort((a, b) => b.count - a.count)

      // Traiter les types
      const typeCounts: Record<string, number> = {}
      typesResult.data?.forEach(item => {
        const type = item.property_type?.trim()
        if (type) {
          typeCounts[type] = (typeCounts[type] || 0) + 1
        }
      })
      
      const types = Object.entries(typeCounts)
        .map(([value, count]) => ({
          value,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count
        }))
        .sort((a, b) => b.count - a.count)

      // Calculer les prix min/max
      const prices = pricesResult.data?.map(item => item.price) || []
      const priceRange = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices)
      } : { min: 0, max: 2000000 }

      setFilterOptions({
        locations,
        types,
        priceRange
      })
    } catch (error) {
      console.error('Erreur lors du chargement des options de filtre:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (formData: FormData) => {
    const formDataEntries = Object.fromEntries(formData.entries())
    console.log('Form submitted', formDataEntries)
    
    // Construire l'URL avec tous les paramètres de recherche
    const params = new URLSearchParams()
    
    // Type de transaction (achat/location)
    params.set('transaction', tabType)
    
    // Localisation
    const location = formDataEntries['location'] as string
    if (location && location.trim()) {
      params.set('location', location.trim())
    }
    
    // Type de propriété
    const propertyType = formDataEntries['property_type'] as string
    if (propertyType && propertyType.trim()) {
      params.set('type', propertyType.trim())
    }
    
    // Prix minimum et maximum
    const priceMin = formDataEntries['price_min'] as string
    const priceMax = formDataEntries['price_max'] as string
    if (priceMin) params.set('price_min', priceMin)
    if (priceMax) params.set('price_max', priceMax)
    
    // Redirection vers la page de listing avec filtres
    const url = `/real-estate-categories/all?${params.toString()}`
    router.push(url)
  }

  return (
    <Form
      action={handleFormSubmit}
      className={clsx(
        'relative z-10 w-full bg-white [--form-bg:var(--color-white)] dark:bg-neutral-800 dark:[--form-bg:var(--color-neutral-800)]',
        className,
        formStyle === 'small' && 'rounded-t-2xl rounded-b-4xl custom-shadow-1',
        formStyle === 'default' &&
          'rounded-t-2xl rounded-b-[40px] shadow-xl xl:rounded-t-3xl xl:rounded-b-[48px] dark:shadow-2xl'
      )}
    >
      {/* RADIO */}
      <Headless.RadioGroup
        value={tabType}
        onChange={setTabType}
        aria-label="Real Estate Tab Type"
        name="real_estate_tab_type"
        className={clsx(
          'flex flex-wrap items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-700',
          formStyle === 'small' && 'px-7 py-4 xl:px-8',
          formStyle === 'default' && 'px-7 py-4 xl:px-8 xl:py-6'
        )}
      >
        {tabs.map((tab) => (
          <Headless.Field key={tab.value}>
            <Headless.Radio
              value={tab.value}
              className={`flex cursor-pointer items-center rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium data-checked:bg-black data-checked:text-white data-checked:shadow-lg data-checked:shadow-black/10 dark:border-neutral-700 dark:data-checked:bg-neutral-200 dark:data-checked:text-neutral-900`}
            >
              {tab.label}
            </Headless.Radio>
          </Headless.Field>
        ))}
      </Headless.RadioGroup>

      {/*  */}
      <div className="relative flex">
        <LocationInputField
          className="hero-search-form__field-after flex-1"
          fieldStyle={formStyle}
          locations={filterOptions.locations}
          isLoading={isLoading}
        />
        <VerticalDividerLine />
        <PropertyTypeSelectField
          fieldStyle={formStyle}
          className="hero-search-form__field-before hero-search-form__field-after flex-1"
          propertyTypes={filterOptions.types}
          isLoading={isLoading}
        />
        <VerticalDividerLine />
        <PriceRangeInputField
          fieldStyle={formStyle}
          className="hero-search-form__field-before flex-1"
          clearDataButtonClassName={clsx(formStyle === 'small' && 'sm:end-18', formStyle === 'default' && 'sm:end-22')}
          priceRange={filterOptions.priceRange}
          transactionType={tabType}
          isLoading={isLoading}
        />

        <ButtonSubmit fieldStyle={formStyle} />
      </div>
    </Form>
  )
}
