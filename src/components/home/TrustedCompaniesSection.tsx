import { Badge } from '@/components/ui/badge'
import { Buildings, Briefcase } from '@phosphor-icons/react'

const companies = [
  { name: 'Emirates Group', hiring: true },
  { name: 'Emaar Properties', hiring: false },
  { name: 'Etisalat', hiring: true },
  { name: 'Dubai Airports', hiring: false },
  { name: 'ADNOC', hiring: true },
  { name: 'DP World', hiring: false },
  { name: 'Majid Al Futtaim', hiring: true },
  { name: 'Aramex', hiring: false }
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
          {companies.map((company, idx) => (
            <div
              key={idx}
              className="relative bg-gradient-to-br from-foreground to-foreground/90 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 hover:shadow-xl transition-all min-h-[140px] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Buildings 
                size={40} 
                weight="bold" 
                className="text-background relative z-10 transition-transform group-hover:scale-110" 
              />
              <span className="text-xs sm:text-sm font-semibold text-background text-center break-words w-full px-2 relative z-10">
                {company.name}
              </span>
              {company.hiring && (
                <Badge className="text-[10px] bg-accent text-accent-foreground border-accent/30 whitespace-nowrap relative z-10 shadow-md">
                  Actively Hiring
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
