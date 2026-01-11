import { Badge } from '@/components/ui/badge'

const companies = [
  { name: 'Emirates Group', hiring: true, logo: 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png' },
  { name: 'Emaar Properties', hiring: false, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Emaar_Properties_logo.svg/2560px-Emaar_Properties_logo.svg.png' },
  { name: 'Etisalat', hiring: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Etisalat_logo.svg/2560px-Etisalat_logo.svg.png' },
  { name: 'Dubai Airports', hiring: false, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Dubai_Airports_logo.svg/2560px-Dubai_Airports_logo.svg.png' },
  { name: 'ADNOC', hiring: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/ADNOC_Logo.svg/2560px-ADNOC_Logo.svg.png' },
  { name: 'DP World', hiring: false, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/DP_World_logo.svg/2560px-DP_World_logo.svg.png' },
  { name: 'Majid Al Futtaim', hiring: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Majid_Al_Futtaim_Holding_logo.svg/2560px-Majid_Al_Futtaim_Holding_logo.svg.png' },
  { name: 'Aramex', hiring: false, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Aramex_logo.svg/2560px-Aramex_logo.svg.png' }
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
              className="relative bg-card border-2 border-border/50 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 hover:shadow-xl hover:border-accent/50 transition-all min-h-[140px] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-accent/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-24 h-16 relative z-10 flex items-center justify-center">
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
                />
              </div>
              
              <span className="text-xs sm:text-sm font-semibold text-foreground text-center break-words w-full px-2 relative z-10">
                {company.name}
              </span>
              {company.hiring && (
                <Badge className="text-[10px] bg-accent text-accent-foreground border-accent/30 whitespace-nowrap relative z-10 shadow-md">
                  Actively Hiring
                </Badge>
              )}
              
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                   style={{ 
                     boxShadow: 'inset 0 0 30px rgba(214, 184, 92, 0.08)' 
                   }} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
