import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe publishable key - in production, this should come from environment variables
// For demo purposes, using test mode key placeholder
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'

let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  if (!stripePromise) {
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
