import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CrownSimple, Check, X } from '@phosphor-icons/react'

interface PremiumSectionProps {
  onUpgrade: () => void
}

export function PremiumSection({ onUpgrade }: PremiumSectionProps) {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-2 rounded-full mb-4 shadow-lg">
            <CrownSimple size={20} weight="fill" className="flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide whitespace-nowrap">Premium Membership</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 break-words px-4">
            10x Your Career Visibility
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground break-words px-4">
            Premium candidates get hired 3x faster with enhanced visibility and AI matching
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <h3 className="text-base sm:text-lg font-bold mb-4 break-words">Free Membership</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm break-words">Basic profile visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm break-words">Weekly AI job matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm break-words">Standard application process</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-muted-foreground break-words">Priority employer visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-muted-foreground break-words">Daily personalized matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-muted-foreground break-words">Application analytics</span>
                </div>
              </div>
              <div className="mt-6 text-xl sm:text-2xl font-bold">Free</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent shadow-2xl relative overflow-hidden hover:shadow-accent/20 hover:-translate-y-1 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <CrownSimple size={24} weight="fill" className="text-accent flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold break-words">Premium Membership</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words">Featured profile with premium badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words">Daily AI-powered job matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words">Priority placement in search results</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words">15% AI match score boost</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words">Detailed application analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words">Direct employer messaging</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xl sm:text-2xl font-bold gradient-gold-shine mb-1 break-words">AED 299/month</div>
                <p className="text-xs text-muted-foreground break-words">Average ROI within first placement</p>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:from-accent/90 hover:to-accent/80 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
                onClick={onUpgrade}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground break-words px-4">
            Join <span className="font-bold gradient-gold-shine">500+</span> premium members who landed their dream jobs faster
          </p>
        </div>
      </div>
    </section>
  )
}
