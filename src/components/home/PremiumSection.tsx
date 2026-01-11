import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CrownSimple, Check, X } from '@phosphor-icons/react'

interface PremiumSectionProps {
  onUpgrade: () => void
}

export function PremiumSection({ onUpgrade }: PremiumSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-accent/10 via-background to-accent/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full mb-4">
            <CrownSimple size={20} weight="fill" />
            <span className="text-sm font-bold uppercase tracking-wide">Premium Membership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            10x Your Career Visibility
          </h2>
          <p className="text-lg text-muted-foreground">
            Premium candidates get hired 3x faster with enhanced visibility and AI matching
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Free Membership</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic profile visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Weekly AI job matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Standard application process</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Priority employer visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Daily personalized matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Application analytics</span>
                </div>
              </div>
              <div className="mt-6 text-2xl font-bold">Free</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <CrownSimple size={24} weight="fill" className="text-accent" />
                <h3 className="text-lg font-bold">Premium Membership</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Featured profile with premium badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Daily AI-powered job matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Priority placement in search results</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">15% AI match score boost</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Detailed application analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Direct employer messaging</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-2xl font-bold text-accent mb-1">AED 299/month</div>
                <p className="text-xs text-muted-foreground">Average ROI within first placement</p>
              </div>
              <Button 
                className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                onClick={onUpgrade}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Join <span className="font-bold text-accent">500+</span> premium members who landed their dream jobs faster
          </p>
        </div>
      </div>
    </section>
  )
}
