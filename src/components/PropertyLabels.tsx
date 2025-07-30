import { PropertyLabel } from './PropertyLabel'

interface PropertyLabelsProps {
  labels: Array<string | {id: string, label: string}>
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number // Nombre maximum de labels à afficher
  className?: string
}

export const PropertyLabels = ({ 
  labels, 
  size = 'sm', 
  maxDisplay = 2,
  className = '' 
}: PropertyLabelsProps) => {
  if (!labels || labels.length === 0) {
    return null
  }

  const visibleLabels = labels.slice(0, maxDisplay)
  const remainingCount = labels.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleLabels.map((label, index) => {
        const labelText = typeof label === 'string' ? label : label.label
        const labelKey = typeof label === 'string' ? label : label.id
        
        return (
          <PropertyLabel 
            key={labelKey} 
            label={labelText} 
            size={size}
            className={index === 0 ? '' : 'ml-1'}
          />
        )
      })}
      
      {remainingCount > 0 && (
        <span className={`
          inline-flex items-center justify-center
          px-2 py-1 text-xs font-medium
          bg-neutral-200 text-neutral-700 
          dark:bg-neutral-700 dark:text-neutral-300
          rounded-md
        `}>
          +{remainingCount}
        </span>
      )}
    </div>
  )
}