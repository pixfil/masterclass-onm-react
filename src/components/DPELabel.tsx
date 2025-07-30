interface DPELabelProps {
  value: number
  type: 'dpe' | 'ges'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export const DPELabel = ({ value, type, size = 'md', showValue = true }: DPELabelProps) => {
  // Fonction pour déterminer la classe énergétique
  const getEnergyClass = (val: number, energyType: 'dpe' | 'ges') => {
    if (energyType === 'dpe') {
      if (val <= 50) return 'A'
      if (val <= 90) return 'B'
      if (val <= 150) return 'C'
      if (val <= 230) return 'D'
      if (val <= 330) return 'E'
      if (val <= 450) return 'F'
      return 'G'
    } else { // GES
      if (val <= 5) return 'A'
      if (val <= 10) return 'B'
      if (val <= 20) return 'C'
      if (val <= 35) return 'D'
      if (val <= 55) return 'E'
      if (val <= 80) return 'F'
      return 'G'
    }
  }

  // Couleurs pour chaque classe
  const getClassColor = (energyClass: string) => {
    const colors = {
      A: '#00A651',
      B: '#4CB748', 
      C: '#7EC842',
      D: '#FEE600',
      E: '#FEAA00',
      F: '#EE7100',
      G: '#E2001A'
    }
    return colors[energyClass as keyof typeof colors]
  }

  const energyClass = getEnergyClass(value, type)
  const color = getClassColor(energyClass)

  // Tailles des composants
  const sizes = {
    sm: {
      container: 'w-16 h-8',
      text: 'text-xs',
      value: 'text-xs'
    },
    md: {
      container: 'w-20 h-10',
      text: 'text-sm',
      value: 'text-xs'
    },
    lg: {
      container: 'w-24 h-12',
      text: 'text-base',
      value: 'text-sm'
    }
  }

  const sizeClasses = sizes[size]

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div 
        className={`${sizeClasses.container} rounded flex items-center justify-center font-bold text-white relative overflow-hidden`}
        style={{ backgroundColor: color }}
      >
        {/* Flèche caractéristique du DPE */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-0 h-0"
          style={{
            borderLeft: '8px solid rgba(255,255,255,0.2)',
            borderTop: `${parseInt(sizeClasses.container.split('h-')[1]) * 4}px solid transparent`,
            borderBottom: `${parseInt(sizeClasses.container.split('h-')[1]) * 4}px solid transparent`
          }}
        />
        <span className={`${sizeClasses.text} font-bold relative z-10`}>
          {energyClass}
        </span>
      </div>
      
      {showValue && (
        <div className={`${sizeClasses.value} text-neutral-600 text-center`}>
          {value} {type === 'dpe' ? 'kWh/m²/an' : 'kg CO₂/m²/an'}
        </div>
      )}
      
      <div className={`${sizeClasses.value} text-neutral-500 text-center font-medium`}>
        {type.toUpperCase()}
      </div>
    </div>
  )
}

// Composant complet DPE + GES
interface EnergyLabelsProps {
  dpeValue?: number | null
  gesValue?: number | null
  size?: 'sm' | 'md' | 'lg'
  showValues?: boolean
  className?: string
}

export const EnergyLabels = ({ 
  dpeValue, 
  gesValue, 
  size = 'md', 
  showValues = true,
  className = ''
}: EnergyLabelsProps) => {
  if (!dpeValue && !gesValue) return null

  return (
    <div className={`flex gap-4 items-start ${className}`}>
      {dpeValue && (
        <DPELabel 
          value={dpeValue} 
          type="dpe" 
          size={size} 
          showValue={showValues} 
        />
      )}
      {gesValue && (
        <DPELabel 
          value={gesValue} 
          type="ges" 
          size={size} 
          showValue={showValues} 
        />
      )}
    </div>
  )
}