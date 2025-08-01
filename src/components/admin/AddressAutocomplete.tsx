'use client'

import { useState, useEffect, useRef } from 'react'
import Input from '@/shared/Input'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface Address {
  label: string
  city: string
  postcode: string
  coordinates: [number, number]
  context: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onAddressSelect?: (addressData: {
    address: string
    city: string
    postalCode: string
    latitude: number
    longitude: number
  }) => void
  label?: string
  placeholder?: string
  className?: string
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onAddressSelect,
  label = "Adresse complète",
  placeholder = "Tapez l'adresse...",
  className = ""
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      
      if (!data.features || !Array.isArray(data.features)) {
        console.warn('API Adresse : format de réponse inattendu', data)
        setSuggestions([])
        setShowSuggestions(false)
        return
      }
      
      const formattedSuggestions: Address[] = data.features.map((feature: any) => ({
        label: feature.properties?.label || '',
        city: feature.properties?.city || '',
        postcode: feature.properties?.postcode || '',
        coordinates: feature.geometry?.coordinates || [0, 0],
        context: feature.properties?.context || ''
      }))

      setSuggestions(formattedSuggestions)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    searchAddresses(newValue)
  }

  const handleSuggestionClick = (suggestion: Address) => {
    onChange(suggestion.label)
    setShowSuggestions(false)
    setSuggestions([])
    
    // Appeler le callback avec toutes les données
    onAddressSelect?.({
      address: suggestion.label,
      city: suggestion.city,
      postalCode: suggestion.postcode,
      latitude: suggestion.coordinates[1], // Lat/Lng inversés dans l'API
      longitude: suggestion.coordinates[0]
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleBlur = () => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }, 150)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {label}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => value.length >= 3 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-6">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          ) : (
            <MapPinIcon className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-neutral-800 dark:border-neutral-700"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <div className="font-medium text-neutral-900 dark:text-white">
                {suggestion.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {suggestion.context}
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 text-sm text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
          Aucune adresse trouvée
        </div>
      )}
    </div>
  )
}