import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, ChartLine, Megaphone, Buildings, Medal } from '@phosphor-icons/react'

const services = [
  {
    icon: Users,
    title: 'Human Resources Consultancy',
    description: 'Comprehensive HR solutions including recruitment, talent management, and organizational development'
  },
  {
    icon: ChartLine,
    title: 'Management Consultancy',
    description: 'Strategic business planning, process optimization, and performance improvement'
  },
  {
    icon: Megaphone,
    title: 'Marketing & Sales Consultancy',
    description: 'Market analysis, brand strategy, and sales optimization for business growth'
  },
  {
    icon: Buildings,
    title: 'Business Setup & Company Formation',
    description: 'Complete UAE company formation and business setup services'
  },
  {
    icon: Medal,
    title: 'Quality & Standardization (ISO)',
    description: 'ISO certification consulting and quality management system implementation'
  }
]

export function ServicesSection() {
  return (
    <section className="py-16 sm:py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Core HR Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive consultancy solutions tailored to MENA market requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <Card key={idx} className="hover:shadow-lg transition-all hover:border-primary/30">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={28} weight="bold" className="text-accent" />
                  </div>
                  <CardTitle className="text-lg font-bold">{service.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
