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
    <section className="py-16 sm:py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 break-words px-4">
            Core HR Services
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto break-words px-4">
            Comprehensive consultancy solutions tailored to MENA market requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <Card key={idx} className="hover:shadow-2xl hover:shadow-accent/20 transition-all hover:border-accent/60 bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/30 rounded-lg flex items-center justify-center mb-4 flex-shrink-0 shadow-lg">
                    <Icon size={28} weight="bold" className="text-accent" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold break-words text-white">{service.title}</CardTitle>
                  <CardDescription className="leading-relaxed break-words text-sm text-gray-400">
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
