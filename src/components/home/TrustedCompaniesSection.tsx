import { Badge } from '@/components/ui/badge'
import { 
  Airplane, 
  Buildings, 
  WifiHigh, 
  Globe, 
  Drop, 
  Boat, 
  ShoppingCart, 
  Package 
} from '@phosphor-icons/react'

const companies = [
  { name: 'Emirates Group', hiring: true, icon: Airplane },
  { name: 'Emaar Properties', hiring: false, icon: Buildings },
  { name: 'Etisalat', hiring: true, icon: WifiHigh },
  { name: 'Dubai Airports', hiring: false, icon: Globe },
  { name: 'ADNOC', hiring: true, icon: Drop },
  { name: 'DP World', hiring: false, icon: Boat },
  { name: 'Majid Al Futtaim', hiring: true, icon: ShoppingCart },
  { name: 'Aramex', hiring: false, icon: Package }
]

export function TrustedCompaniesSection() {
  return (
    <section className="py-12 sm:py-16 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 break-words">
            Trusted by Leading UAE Companies
          </h2>
          <p className="text-muted-foreground break-words px-4">
            Connecting top talent with premier employers across the MENA region
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {companies.map((company, idx) => {
            const Icon = company.icon
            return (
              <div
                key={idx}
                className="relative bg-secondary rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all min-h-[140px]"
              >
                <Icon size={32} weight="fill" className="text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-foreground text-center break-words w-full px-2">
                  {company.name}
                </span>
                {company.hiring && (
                  <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30 whitespace-nowrap">
                    Actively Hiring
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
