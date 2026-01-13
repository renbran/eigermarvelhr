import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  CrownSimple, 
  Check, 
  X, 
  Lightning, 
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  ArrowClockwise
} from '@phosphor-icons/react'
import { PREMIUM_CONFIG } from '@/lib/stripe-config'
import { 
  createPaymentIntent, 
  processPayment, 
  activatePremiumSubscription 
} from '@/lib/payment-service'
import type { User, PaymentStatus } from '@/lib/types'
import { toast } from 'sonner'

interface PremiumUpgradePageProps {
  user: User
  onBack: () => void
  onUpgradeSuccess: () => void
}

export function PremiumUpgradePage({ user, onBack, onUpgradeSuccess }: PremiumUpgradePageProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')

  const handleUpgrade = async () => {
    try {
      setPaymentStatus('processing')
      setErrorMessage('')

      // Create payment intent
      const paymentIntent = await createPaymentIntent(user.id)
      setPaymentIntentId(paymentIntent.id)

      // Process payment
      const result = await processPayment(paymentIntent.id, user.id)

      if (result.success) {
        // Activate premium subscription
        await activatePremiumSubscription(user.id, paymentIntent.id)
        
        setPaymentStatus('succeeded')
        toast.success('Premium activated!', {
          description: 'Your account has been upgraded to Premium.',
        })

        // Redirect after short delay to show success state
        setTimeout(() => {
          onUpgradeSuccess()
        }, 2000)
      } else {
        setPaymentStatus('failed')
        setErrorMessage(result.error || 'Payment failed. Please try again.')
        toast.error('Payment failed', {
          description: result.error || 'Please try again.',
        })
      }
    } catch (error) {
      setPaymentStatus('failed')
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrorMessage(message)
      toast.error('Error', {
        description: message,
      })
    }
  }

  const handleRetry = () => {
    setPaymentStatus('idle')
    setErrorMessage('')
  }

  const freeBenefits = [
    { text: 'Basic profile visibility', included: true },
    { text: 'Weekly AI job matches', included: true },
    { text: 'Standard application process', included: true },
    { text: 'Priority employer visibility', included: false },
    { text: 'Daily personalized matches', included: false },
    { text: 'Application analytics', included: false },
  ]

  const isProcessing = paymentStatus === 'processing'
  const hasSucceeded = paymentStatus === 'succeeded'
  const hasFailed = paymentStatus === 'failed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-6 py-3 rounded-full mb-6 shadow-lg">
              <CrownSimple size={24} weight="fill" />
              <span className="text-sm font-bold uppercase tracking-wide">Premium Upgrade</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Accelerate Your Career Journey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join premium members who get hired 3x faster with enhanced AI matching and priority visibility
            </p>
          </div>
        </div>

        {/* Success State */}
        {hasSucceeded && (
          <Alert className="mb-8 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Payment Successful!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your premium subscription has been activated. Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {hasFailed && errorMessage && (
          <Alert className="mb-8 border-red-500 bg-red-50 dark:bg-red-950">
            <WarningCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">Payment Failed</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300 space-y-2">
              <p>{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                <ArrowClockwise className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free Membership</CardTitle>
              <CardDescription>Essential features to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {freeBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {benefit.included ? (
                      <Check size={20} weight="bold" className="text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X size={20} weight="bold" className="text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={benefit.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="text-3xl font-bold">Free</div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-accent shadow-xl shadow-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full" />
            
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-2 shadow-lg">
                <Lightning className="h-3 w-3 mr-1" weight="fill" />
                Recommended
              </Badge>
            </div>

            <CardHeader className="pt-8">
              <div className="flex items-center gap-2 mb-2">
                <CrownSimple size={28} weight="fill" className="text-accent" />
                <CardTitle className="text-2xl">Premium Membership</CardTitle>
              </div>
              <CardDescription>Everything you need to stand out</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PREMIUM_CONFIG.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <div className="text-3xl font-bold gradient-gold-shine">
                  AED {PREMIUM_CONFIG.price}/month
                </div>
                <p className="text-sm text-muted-foreground">
                  Cancel anytime • {PREMIUM_CONFIG.gracePeriodDays}-day grace period
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:from-accent/90 hover:to-accent/80 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg py-6"
                onClick={handleUpgrade}
                disabled={isProcessing || hasSucceeded}
              >
                {isProcessing ? (
                  <>
                    <ArrowClockwise className="h-5 w-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : hasSucceeded ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Activated!
                  </>
                ) : (
                  <>
                    <CrownSimple className="h-5 w-5 mr-2" weight="fill" />
                    Upgrade to Premium
                  </>
                )}
              </Button>

              {isProcessing && (
                <p className="text-xs text-center text-muted-foreground">
                  Please wait while we process your payment...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="bg-secondary/50">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lightning className="h-5 w-5 text-accent" weight="fill" />
              Why Upgrade to Premium?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">3x Faster Hiring</h4>
                <p className="text-sm text-muted-foreground">
                  Premium members get noticed first with priority placement in employer searches and daily AI matches.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">15% Match Boost</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI gives premium candidates a 15% boost in match scores, increasing your visibility.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">ROI Guaranteed</h4>
                <p className="text-sm text-muted-foreground">
                  Average premium member lands their ideal role within 4 weeks - often with higher salaries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Trust */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🔒 Secure payment powered by Stripe • Cancel anytime • No hidden fees</p>
        </div>
      </div>
    </div>
  )
}
