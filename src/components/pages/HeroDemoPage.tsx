import { HeroLandingPage } from '@/components/ui/hero-landing-page'

export function HeroDemoPage() {
  return (
    <div className="w-full">
      <HeroLandingPage
        title="Elevate Your"
        subtitle="Workforce Excellence"
        description="AI-powered recruitment connecting exceptional talent with leading UAE companies. Gold-standard placement in hours, not months."
        ctaLabel="Explore Opportunities"
        secondaryCtaLabel="Hire Top Talent"
        onCtaClick={() => console.log('CTA clicked')}
        onSecondaryCtaClick={() => console.log('Secondary CTA clicked')}
      />
    </div>
  )
}
