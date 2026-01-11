import { Button } from '@/components/ui/button'
import { Briefcase, Buildings } from '@phosphor-icons/react'
import teamPhoto from '@/assets/images/Professional_corporate_team_photoshoot_of_diverse_-1768161201140_(1).png'

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative bg-background text-foreground overflow-hidden">
      <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
        
        <img 
          src={teamPhoto} 
          alt="Eiger Marvel Team" 
          className="w-full h-full object-cover object-center"
        />
        
        <div className="absolute inset-0 flex items-end pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 text-white drop-shadow-lg break-words">
                Your Success Partners in the MENA Region
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  size="lg"
                  onClick={() => onNavigate('jobs')}
                  className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:from-accent/90 hover:to-accent/80 font-bold text-sm sm:text-base px-6 sm:px-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 whitespace-normal break-words"
                >
                  <Briefcase size={20} className="mr-2 flex-shrink-0" weight="bold" />
                  <span className="break-words">Explore Opportunities</span>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('employers')}
                  className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-foreground font-bold text-sm sm:text-base px-6 sm:px-8 transition-all hover:scale-105 shadow-xl whitespace-normal break-words"
                >
                  <Buildings size={20} className="mr-2 flex-shrink-0" weight="bold" />
                  <span className="break-words">Hire Top Talent</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
