import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CrownSimple, Check, X } from '@phosphor-icons/react'

interface PremiumSectionProps {
  onUpgrade: () => void
}

export function PremiumSection({ onUpgrade }: PremiumSectionProps) {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden bg-black">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-2 rounded-full mb-4 shadow-lg">
            <CrownSimple size={20} weight="fill" className="flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide whitespace-nowrap">Premium Membership</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 break-words px-4">
            10x Your Career Visibility
          </h2>
          <p className="text-base sm:text-lg text-gray-200 break-words px-4">
            Premium candidates get hired 3x faster with enhanced visibility and AI matching
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-2xl hover:shadow-white/10 transition-all bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <h3 className="text-base sm:text-lg font-bold mb-4 break-words text-white">Free Membership</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm break-words text-gray-200">Basic profile visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm break-words text-gray-200">Weekly AI job matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm break-words text-gray-200">Standard application process</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-gray-600 break-words">Priority employer visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-gray-600 break-words">Daily personalized matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} weight="bold" className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-gray-600 break-words">Application analytics</span>
                </div>
              </div>
              <div className="mt-6 text-xl sm:text-2xl font-bold text-white">Free</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent shadow-2xl shadow-accent/30 relative overflow-hidden hover:shadow-accent/50 hover:-translate-y-1 transition-all bg-white/5 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <CrownSimple size={24} weight="fill" className="text-accent flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold break-words text-white">Premium Membership</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words text-gray-100">Featured profile with premium badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words text-gray-100">Daily AI-powered job matches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words text-gray-100">Priority placement in search results</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words text-gray-100">15% AI match score boost</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words text-gray-100">Detailed application analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold break-words text-gray-100">Direct employer messaging</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xl sm:text-2xl font-bold gradient-gold-shine mb-1 break-words">AED 299/month</div>
                <p className="text-xs text-gray-300 break-words">Average ROI within first placement</p>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-accent to-accent/90 text-black hover:from-accent/90 hover:to-accent/80 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
                onClick={onUpgrade}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400 break-words px-4">
            Join <span className="font-bold gradient-gold-shine">500+</span> premium members who landed their dream jobs faster
          </p>
        </div>
      </div>
    </section>
  )
}
