interface PropertyLabelProps {
  label: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const PropertyLabel = ({ label, size = 'md', className = '' }: PropertyLabelProps) => {
  // Configuration des couleurs et styles pour chaque label
  const getLabelStyle = (labelText: string) => {
    const styles = {
      'RÉSERVÉ': {
        bg: 'bg-orange-500',
        text: 'text-white',
        border: 'border-orange-600'
      },
      'DÉJÀ LOUÉ !': {
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-600'
      },
      'DERNIERS LOTS !': {
        bg: 'bg-purple-500',
        text: 'text-white',
        border: 'border-purple-600'
      },
      'NOUVEAUTÉ': {
        bg: 'bg-green-500',
        text: 'text-white',
        border: 'border-green-600'
      },
      'SOUS COMPROMIS': {
        bg: 'bg-yellow-500',
        text: 'text-black',
        border: 'border-yellow-600'
      },
      'SOUS OFFRE !': {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-600'
      },
      'VENDU': {
        bg: 'bg-gray-500',
        text: 'text-white',
        border: 'border-gray-600'
      }
    }
    
    return styles[labelText as keyof typeof styles] || {
      bg: 'bg-neutral-500',
      text: 'text-white',
      border: 'border-neutral-600'
    }
  }

  // Tailles
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const style = getLabelStyle(label)
  const sizeClasses = sizes[size]

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${style.bg} ${style.text} ${style.border}
        ${sizeClasses}
        font-bold uppercase tracking-wide
        rounded-md border-2 shadow-sm
        transform -rotate-2 hover:rotate-0 transition-transform duration-200
        ${className}
      `}
    >
      {label}
    </span>
  )
}

// Constantes pour les options de labels
export const PROPERTY_LABEL_OPTIONS = [
  'RÉSERVÉ',
  'DÉJÀ LOUÉ !',
  'DERNIERS LOTS !',
  'NOUVEAUTÉ',
  'SOUS COMPROMIS',
  'SOUS OFFRE !',
  'VENDU'
] as const

export type PropertyLabelType = typeof PROPERTY_LABEL_OPTIONS[number]