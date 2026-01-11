import { Button } from '@/components/ui/button'
import { Briefcase, Buildings, Lightning } from '@phosphor-icons/react'

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Exceed Your Expectations
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Specialized HR & Management Consultants Since 2022
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => onNavigate('jobs')}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8"
            >
              <Briefcase size={20} className="mr-2" weight="bold" />
              Find Your Next Role
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => onNavigate('employers')}
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8"
            >
              <Buildings size={20} className="mr-2" weight="bold" />
              Post a Job
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl sm:text-4xl font-bold text-accent">1000+</div>
              <div className="text-sm text-primary-foreground/80">Placements</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl sm:text-4xl font-bold text-accent">95%</div>
              <div className="text-sm text-primary-foreground/80">Success Rate</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl sm:text-4xl font-bold text-accent flex items-center gap-1">
                24 <Lightning size={32} weight="fill" />
              </div>
              <div className="text-sm text-primary-foreground/80">Hour Response</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
