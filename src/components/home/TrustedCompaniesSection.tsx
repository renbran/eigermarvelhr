import { Badge } from '@/components/ui/badge'
import companyLogo1 from '@/assets/images/company-logo.svg'
import companyLogo2 from '@/assets/images/company-logo-2.svg'
import companyLogo3 from '@/assets/images/company-logo-3.svg'
import companyLogo4 from '@/assets/images/company-logo-4.svg'
import companyLogo5 from '@/assets/images/company-logo-5.svg'
import companyLogo6 from '@/assets/images/company-logo-6.svg'
import companyLogo7 from '@/assets/images/company-logo-7.svg'
import companyLogo8 from '@/assets/images/company-logo-8.svg'

const companies = [
  { name: 'Emirates Group', hiring: true, logo: companyLogo1 },
  { name: 'Emaar Properties', hiring: false, logo: companyLogo2 },
  { name: 'Etisalat', hiring: true, logo: companyLogo3 },
  { name: 'Dubai Airports', hiring: false, logo: companyLogo4 },
  { name: 'ADNOC', hiring: true, logo: companyLogo5 },
  { name: 'DP World', hiring: false, logo: companyLogo6 },
  { name: 'Majid Al Futtaim', hiring: true, logo: companyLogo7 },
  { name: 'Aramex', hiring: false, logo: companyLogo8 }
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
              className="relative bg-secondary rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all min-h-[160px] group"
            >
              <div className="w-16 h-16 flex-shrink-0 transition-transform group-hover:scale-110">
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground text-center break-words w-full px-2">
                {company.name}
              </span>
              {company.hiring && (
                <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30 whitespace-nowrap">
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
