import { Badge } from '@/components/ui/badge'
import { Buildings } from '@phosphor-icons/react'

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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Trusted by Leading UAE Companies
          </h2>
          <p className="text-muted-foreground">
            Connecting top talent with premier employers across the MENA region
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {companies.map((company, idx) => (
            <div
              key={idx}
              className="relative bg-secondary rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
            >
              <Buildings size={32} weight="bold" className="text-primary/40" />
              <span className="text-sm font-semibold text-foreground text-center">
                {company.name}
              </span>
              {company.hiring && (
                <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30">
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
