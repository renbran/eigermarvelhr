import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe publishable key - in production, this should come from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Validate Stripe key is available
if (!STRIPE_PUBLISHABLE_KEY && import.meta.env.PROD) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe integration will not work.')
}

let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Premium subscription configuration
export const PREMIUM_CONFIG = {
  price: 299, // AED per month
  currency: 'AED',
  benefits: [
    'Featured profile with premium badge',
    'Daily AI-powered job matches',
    'Priority placement in search results',
    '15% AI match score boost',
    'Detailed application analytics',
    'Direct employer messaging',
  ],
  gracePeriodDays: 3,
} as const
