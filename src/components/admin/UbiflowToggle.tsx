'use client'

import { useState } from 'react'
import { updateProperty } from '@/lib/supabase/properties'

interface UbiflowToggleProps {
  propertyId: string
  initialValue: boolean
  onToggle?: (value: boolean) => void
  disabled?: boolean
  showTooltip?: boolean
}

export const UbiflowToggle = ({ 
  propertyId, 
  initialValue, 
  onToggle, 
  disabled = false,
  showTooltip = true 
}: UbiflowToggleProps) => {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const newValue = !enabled
    setLoading(true)
    try {
      await updateProperty(propertyId, { ubiflow_active: newValue })
      setEnabled(newValue)
      onToggle?.(newValue)
    } catch (error) {
      console.error('Erreur lors de la mise à jour Ubiflow:', error)
      // Ne pas changer l'état en cas d'erreur
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`${
          enabled ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={showTooltip ? "Mettre en ligne via Ubiflow" : undefined}
      >
        <span className="sr-only">Activer Ubiflow</span>
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
          </div>
        )}
      </button>
    </div>
  )
}