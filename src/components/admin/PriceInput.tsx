'use client'

import { useState, useEffect, ChangeEvent, FocusEvent } from 'react'
import Input from '@/shared/Input'

interface PriceInputProps {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export const PriceInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Prix en euros",
  required = false,
  className = ""
}: PriceInputProps) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Fonction pour formater le prix avec espaces pour les milliers
  const formatPrice = (val: string): string => {
    if (!val) return ''
    
    // Enlever tous les caractères non numériques
    const numericValue = val.replace(/[^\d]/g, '')
    if (!numericValue) return ''
    
    // Ajouter les espaces pour les milliers
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    
    return isFocused ? formatted : `${formatted} €`
  }

  // Fonction pour obtenir la valeur numérique pure
  const getNumericValue = (val: string): string => {
    return val.replace(/[^\d]/g, '')
  }

  // Effet pour mettre à jour l'affichage quand la valeur externe change
  useEffect(() => {
    setDisplayValue(formatPrice(value))
  }, [value, isFocused])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = getNumericValue(inputValue)
    
    // Mettre à jour l'affichage
    setDisplayValue(formatPrice(numericValue))
    
    // Créer un nouvel événement avec la valeur numérique pure
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: numericValue
      }
    } as ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Afficher seulement les chiffres avec espaces quand focus
    const numericValue = getNumericValue(e.target.value)
    setDisplayValue(formatPrice(numericValue))
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    // Afficher avec le symbole € quand pas focus
    const numericValue = getNumericValue(e.target.value)
    setDisplayValue(formatPrice(numericValue))
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
        />
        {isFocused && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
            €
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Format automatique avec séparateurs de milliers
      </p>
    </div>
  )
}