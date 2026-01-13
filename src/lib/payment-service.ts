import { getStripe, PREMIUM_CONFIG } from './stripe-config'
import type { PaymentIntent, Subscription, User } from './types'

/**
 * Simulates creating a payment intent with Stripe
 * In production, this would call a backend API that creates a Stripe Payment Intent
 */
export async function createPaymentIntent(userId: string): Promise<PaymentIntent> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const paymentIntent: PaymentIntent = {
    id: `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId,
    amount: PREMIUM_CONFIG.price,
    currency: PREMIUM_CONFIG.currency,
    status: 'idle',
    createdAt: new Date(),
  }
  
  return paymentIntent
}

/**
 * Processes a payment through Stripe Checkout
 * In production, this would redirect to Stripe Checkout or use Stripe Elements
 * For demo purposes, we simulate the payment flow
 */
export async function processPayment(
  paymentIntentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate 95% success rate for demo
    const success = Math.random() > 0.05
    
    if (!success) {
      throw new Error('Payment declined. Please check your card details and try again.')
    }
    
    // Update payment intent status
    await spark.kv.set(`payment_intent:${paymentIntentId}`, {
      id: paymentIntentId,
      userId,
      amount: PREMIUM_CONFIG.price,
      currency: PREMIUM_CONFIG.currency,
      status: 'succeeded',
      completedAt: new Date(),
    } as PaymentIntent)
    
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Payment failed'
    
    // Log failed payment
    await spark.kv.set(`payment_intent:${paymentIntentId}`, {
      id: paymentIntentId,
      userId,
      amount: PREMIUM_CONFIG.price,
      currency: PREMIUM_CONFIG.currency,
      status: 'failed',
      errorMessage,
      completedAt: new Date(),
    } as PaymentIntent)
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Activates premium subscription for a user
 */
export async function activatePremiumSubscription(
  userId: string,
  paymentIntentId: string
): Promise<Subscription> {
  const now = new Date()
  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + 1) // 1 month from now
  
  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    status: 'active',
    startDate: now,
    expiryDate,
    autoRenew: true,
    paymentIntentId,
  }
  
  // Save subscription
  await spark.kv.set(`subscription:${userId}`, subscription)
  
  // Update user premium status
  const user = await spark.kv.get<User>(`user:${userId}`)
  if (user) {
    await spark.kv.set(`user:${userId}`, {
      ...user,
      isPremium: true,
      premiumExpiresAt: expiryDate,
    })
  }
  
  // Update candidate profile
  const profile = await spark.kv.get(`candidate_profile:${userId}`)
  if (profile) {
    await spark.kv.set(`candidate_profile:${userId}`, {
      ...profile,
      isPremium: true,
    })
  }
  
  return subscription
}

/**
 * Checks subscription status and handles grace period
 */
export async function checkSubscriptionStatus(userId: string): Promise<Subscription | null> {
  const subscription = await spark.kv.get<Subscription>(`subscription:${userId}`)
  
  if (!subscription) {
    return null
  }
  
  const now = new Date()
  const expiryDate = new Date(subscription.expiryDate)
  const gracePeriodEnd = new Date(expiryDate)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + PREMIUM_CONFIG.gracePeriodDays)
  
  // Check if subscription has expired
  if (now > expiryDate && subscription.status === 'active') {
    // Enter grace period
    const updatedSubscription: Subscription = {
      ...subscription,
      status: 'grace_period',
    }
    await spark.kv.set(`subscription:${userId}`, updatedSubscription)
    return updatedSubscription
  }
  
  // Check if grace period has ended
  if (now > gracePeriodEnd && subscription.status === 'grace_period') {
    // Expire subscription
    const updatedSubscription: Subscription = {
      ...subscription,
      status: 'expired',
    }
    await spark.kv.set(`subscription:${userId}`, updatedSubscription)
    
    // Update user premium status
    const user = await spark.kv.get<User>(`user:${userId}`)
    if (user) {
      await spark.kv.set(`user:${userId}`, {
        ...user,
        isPremium: false,
      })
    }
    
    return updatedSubscription
  }
  
  return subscription
}

/**
 * Cancels an active subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  const subscription = await spark.kv.get<Subscription>(`subscription:${userId}`)
  
  if (!subscription) {
    return false
  }
  
  const updatedSubscription: Subscription = {
    ...subscription,
    status: 'cancelled',
    autoRenew: false,
  }
  
  await spark.kv.set(`subscription:${userId}`, updatedSubscription)
  return true
}
