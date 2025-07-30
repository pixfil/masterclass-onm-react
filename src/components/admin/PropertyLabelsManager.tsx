'use client'

import { useState } from 'react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { PROPERTY_LABEL_OPTIONS } from '@/components/PropertyLabel'

interface PropertyLabelsManagerProps {
  labels: string[]
  onChange: (labels: string[]) => void
}

export function PropertyLabelsManager({ labels, onChange }: PropertyLabelsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')

  const availableLabels = PROPERTY_LABEL_OPTIONS.filter(
    label => !labels.includes(label)
  )

  const handleAddLabel = () => {
    if (selectedLabel && !labels.includes(selectedLabel)) {
      onChange([...labels, selectedLabel])
      setSelectedLabel('')
      setIsAdding(false)
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    onChange(labels.filter(label => label !== labelToRemove))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Labels de la propriété
      </label>
      
      {/* Labels actuels */}
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 && !isAdding && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Aucun label sélectionné
          </span>
        )}
        
        {labels.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100"
          >
            {label}
            <button
              type="button"
              onClick={() => handleRemoveLabel(label)}
              className="ml-1 hover:text-primary-600 dark:hover:text-primary-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>

      {/* Formulaire d'ajout */}
      {isAdding ? (
        <div className="flex gap-2">
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          >
            <option value="">Sélectionner un label</option>
            {availableLabels.map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddLabel}
            disabled={!selectedLabel}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false)
              setSelectedLabel('')
            }}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          >
            Annuler
          </button>
        </div>
      ) : (
        availableLabels.length > 0 && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
          >
            <PlusIcon className="h-4 w-4" />
            Ajouter un label
          </button>
        )
      )}
      
      {availableLabels.length === 0 && !isAdding && labels.length > 0 && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Tous les labels disponibles ont été ajoutés
        </p>
      )}
    </div>
  )
}