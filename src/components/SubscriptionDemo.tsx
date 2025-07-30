'use client'

import { Button } from '@/shared/Button'
import { 
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface SubscriptionDemoProps {
  onSelectPlan: (planId: 'basic' | 'pro' | 'premium') => void
}

export function SubscriptionDemo({ onSelectPlan }: SubscriptionDemoProps) {
  return (
    <div className="space-y-6">
      {/* Avertissement demo */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
              Mode Démonstration
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Les clés Stripe ne sont pas configurées. Vous pouvez simuler la sélection d'un plan pour tester l'interface.
            </p>
          </div>
        </div>
      </div>

      {/* Simulation plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Basique */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Basique</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">29€</span>
              <span className="text-neutral-500">/mois</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Jusqu'à 20 propriétés</span>
            </li>
            <li className="flex items-start gap-2">
              <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-400">Analytics avancés</span>
            </li>
            <li className="flex items-start gap-2">
              <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-400">Génération IA</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Support par email</span>
            </li>
          </ul>

          <Button
            className="w-full"
            color="light"
            onClick={() => onSelectPlan('basic')}
          >
            Tester ce plan (Demo)
          </Button>
        </div>

        {/* Plan Pro */}
        <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 ring-2 ring-primary-600 transform scale-105">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Recommandé
            </span>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Professionnel</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">79€</span>
              <span className="text-neutral-500">/mois</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Jusqu'à 100 propriétés</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Analytics avancés</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">50 générations IA/mois</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Support par email</span>
            </li>
          </ul>

          <Button
            className="w-full"
            onClick={() => onSelectPlan('pro')}
          >
            Tester ce plan (Demo)
          </Button>
        </div>

        {/* Plan Premium */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Premium</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">149€</span>
              <span className="text-neutral-500">/mois</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Propriétés illimitées</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Analytics avancés</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Génération IA illimitée</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Domaine personnalisé</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Support prioritaire</span>
            </li>
          </ul>

          <Button
            className="w-full"
            color="light"
            onClick={() => onSelectPlan('premium')}
          >
            Tester ce plan (Demo)
          </Button>
        </div>
      </div>
    </div>
  )
}