'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { 
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'
import { SubscriptionDemo } from '@/components/SubscriptionDemo'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'price_basic_monthly',
    name: 'Basique',
    price: 29,
    features: {
      maxProperties: 20,
      analytics: false,
      ai: false,
      support: 'email'
    }
  },
  pro: {
    id: 'price_pro_monthly',
    name: 'Professionnel',
    price: 79,
    features: {
      maxProperties: 100,
      analytics: true,
      ai: true,
      maxAiGenerations: 50,
      support: 'email'
    }
  },
  premium: {
    id: 'price_premium_monthly',
    name: 'Premium',
    price: 149,
    features: {
      maxProperties: -1,
      analytics: true,
      ai: true,
      maxAiGenerations: -1,
      customDomain: true,
      prioritySupport: true
    }
  }
}

const SubscriptionContent = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  
  // Vérifier si Stripe est configuré
  const isStripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
                            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_temp'

  useEffect(() => {
    fetchCurrentSubscription()
  }, [])

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current')
      const data = await response.json()
      
      if (data.subscription) {
        setCurrentPlan(data.subscription.plan_id)
      }
    } catch (error) {
      console.error('Erreur récupération abonnement:', error)
    }
  }

  const handleSubscribe = async (planId: 'basic' | 'pro' | 'premium') => {
    try {
      setLoading(true)
      
      // Vérifier les clés Stripe
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'pk_test_temp') {
        alert('Configuration Stripe manquante. Veuillez configurer vos clés Stripe dans .env.local')
        return
      }
      
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe non chargé')

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        console.error('Erreur Stripe:', error)
        alert('Erreur lors de la redirection vers Stripe: ' + error.message)
      }
    } catch (error) {
      console.error('Erreur souscription:', error)
      alert('Erreur: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setBillingLoading(true)
      
      const response = await fetch('/api/subscription/billing-portal', {
        method: 'POST',
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erreur portail facturation:', error)
    } finally {
      setBillingLoading(false)
    }
  }

  // Fonction pour simuler la sélection d'un plan en mode demo
  const handleDemoSubscribe = (planId: 'basic' | 'pro' | 'premium') => {
    alert(`Mode Demo: Vous avez sélectionné le plan ${SUBSCRIPTION_PLANS[planId].name}.\n\nPour activer les vrais paiements :\n1. Créez un compte Stripe\n2. Ajoutez vos clés dans .env.local\n3. Redémarrez le serveur`)
  }

  const PlanCard = ({ plan, planKey }: { plan: any, planKey: 'basic' | 'pro' | 'premium' }) => {
    const isCurrentPlan = currentPlan === plan.id
    const isPro = planKey === 'pro'
    
    return (
      <div className={`relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 ${
        isPro ? 'ring-2 ring-blue-600 transform scale-105' : ''
      }`}>
        {isPro && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Recommandé
            </span>
          </div>
        )}
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">{plan.price}€</span>
            <span className="text-neutral-500">/mois</span>
          </div>
        </div>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-2">
            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              {plan.features.maxProperties === -1 
                ? 'Propriétés illimitées' 
                : `Jusqu'à ${plan.features.maxProperties} propriétés`}
            </span>
          </li>
          
          <li className="flex items-start gap-2">
            {plan.features.analytics ? (
              <>
                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Analytics avancés</span>
              </>
            ) : (
              <>
                <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-400">Analytics avancés</span>
              </>
            )}
          </li>
          
          <li className="flex items-start gap-2">
            {plan.features.ai ? (
              <>
                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  {plan.features.maxAiGenerations === -1
                    ? 'Génération IA illimitée'
                    : `${plan.features.maxAiGenerations} générations IA/mois`}
                </span>
              </>
            ) : (
              <>
                <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-400">Génération IA</span>
              </>
            )}
          </li>
          
          {plan.features.customDomain && (
            <li className="flex items-start gap-2">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">Domaine personnalisé</span>
            </li>
          )}
          
          <li className="flex items-start gap-2">
            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              Support {plan.features.prioritySupport ? 'prioritaire' : 'par email'}
            </span>
          </li>
        </ul>

        {isCurrentPlan ? (
          <Button
            className="w-full"
            disabled
          >
            Plan actuel
          </Button>
        ) : (
          <Button
            className="w-full"
            color={isPro ? 'primary' : 'light'}
            onClick={() => handleSubscribe(planKey)}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Choisir ce plan'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <AdminLayout currentPage="subscription">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h1">Abonnement & Facturation</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez votre abonnement et débloquez des fonctionnalités premium
            </p>
          </div>
          
          {currentPlan && (
            <Button
              onClick={handleManageBilling}
              disabled={billingLoading}
              outline
              className="flex items-center gap-2"
            >
              <CreditCardIcon className="h-4 w-4" />
              {billingLoading ? 'Chargement...' : 'Gérer la facturation'}
            </Button>
          )}
        </div>

        {/* Plans */}
        <div className="mt-8">
          {isStripeConfigured ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PlanCard plan={SUBSCRIPTION_PLANS.basic} planKey="basic" />
              <PlanCard plan={SUBSCRIPTION_PLANS.pro} planKey="pro" />
              <PlanCard plan={SUBSCRIPTION_PLANS.premium} planKey="premium" />
            </div>
          ) : (
            <SubscriptionDemo onSelectPlan={handleDemoSubscribe} />
          )}
        </div>

        {/* Fonctionnalités détaillées */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold mb-6">Détail des fonctionnalités premium</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Analytics avancés</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Suivez les vues de vos propriétés, analysez le comportement des visiteurs 
                  et optimisez vos annonces avec des statistiques détaillées.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Génération IA</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Créez automatiquement des descriptions attractives pour vos propriétés 
                  grâce à l'intelligence artificielle.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Note :</strong> Vous pouvez changer de plan ou annuler votre abonnement à tout moment. 
            Les changements prendront effet à la fin de la période de facturation en cours.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function SubscriptionPage() {
  return <SubscriptionContent />
}