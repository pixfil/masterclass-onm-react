'use client'

import { Button } from '@/shared/Button'
import { 
  LockClosedIcon,
  SparklesIcon,
  ChartBarIcon,
  CreditCardIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SubscriptionPaywallProps {
  feature: 'analytics' | 'ai'
  title: string
  description: string
  className?: string
}

export function SubscriptionPaywall({ 
  feature, 
  title, 
  description, 
  className = '' 
}: SubscriptionPaywallProps) {
  const getFeatureIcon = () => {
    switch (feature) {
      case 'analytics':
        return <ChartBarIcon className="h-12 w-12 text-neutral-400" />
      case 'ai':
        return <SparklesIcon className="h-12 w-12 text-neutral-400" />
      default:
        return <LockClosedIcon className="h-12 w-12 text-neutral-400" />
    }
  }

  const getRecommendedPlan = () => {
    switch (feature) {
      case 'analytics':
        return 'Pro'
      case 'ai':
        return 'Pro'
      default:
        return 'Pro'
    }
  }

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 text-center ${className}`}>
      <div className="mb-6">
        {getFeatureIcon()}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <LockClosedIcon className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
            Fonctionnalité Premium
          </span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Cette fonctionnalité est disponible à partir du plan {getRecommendedPlan()}
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/admin/subscription">
          <Button className="w-full flex items-center justify-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Découvrir nos plans
          </Button>
        </Link>
        
        <Link href="/admin/subscription" className="block">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-neutral-600 dark:text-neutral-400"
          >
            En savoir plus sur les fonctionnalités premium
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Composant pour afficher une limitation (ex: nombre de propriétés)
interface SubscriptionLimitProps {
  current: number
  max: number
  feature: string
  className?: string
}

export function SubscriptionLimit({ 
  current, 
  max, 
  feature, 
  className = '' 
}: SubscriptionLimitProps) {
  const percentage = max === -1 ? 0 : (current / max) * 100
  const isNearLimit = percentage > 80
  const isAtLimit = current >= max && max !== -1

  if (max === -1) {
    return null // Illimité
  }

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {feature}
        </span>
        <span className={`text-sm font-medium ${
          isAtLimit ? 'text-red-600' :
          isNearLimit ? 'text-orange-600' :
          'text-neutral-600 dark:text-neutral-400'
        }`}>
          {current} / {max}
        </span>
      </div>
      
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' :
            isNearLimit ? 'bg-orange-500' :
            'bg-primary-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {isAtLimit && (
        <div className="mt-3">
          <p className="text-xs text-red-600 mb-2">
            Limite atteinte. Passez à un plan supérieur pour continuer.
          </p>
          <Link href="/admin/subscription">
            <Button size="sm" className="w-full">
              Upgrader mon plan
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}