import Stripe from 'stripe'

// Initialiser Stripe avec la clé secrète
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Plans d'abonnement
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'price_basic_monthly',
    name: 'Basique',
    price: 29,
    currency: 'eur',
    interval: 'month' as const,
    features: {
      analytics: false,
      ai: false,
      maxProperties: 20,
      support: 'email'
    }
  },
  pro: {
    id: 'price_pro_monthly',
    name: 'Professionnel',
    price: 79,
    currency: 'eur',
    interval: 'month' as const,
    features: {
      analytics: true,
      ai: true,
      maxProperties: 100,
      maxAiGenerations: 50,
      support: 'email'
    }
  },
  premium: {
    id: 'price_premium_monthly',
    name: 'Premium',
    price: 149,
    currency: 'eur',
    interval: 'month' as const,
    features: {
      analytics: true,
      ai: true,
      maxProperties: -1, // Illimité
      maxAiGenerations: -1, // Illimité
      customDomain: true,
      prioritySupport: true
    }
  }
}

// Configuration publique pour le frontend
export const getStripePublicKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}

// URLs de redirection après paiement
export const STRIPE_URLS = {
  success: '/admin/subscription/success',
  cancel: '/admin/subscription/cancel',
  billing: '/admin/subscription/billing'
}