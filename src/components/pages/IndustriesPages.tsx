import React from 'react'

const industries = [
  {
    title: 'Construction',
    subtitle: 'UAE\'s largest employment sector — USD 55.81B market',
    desc: 'From civil engineers and MEP technicians to site supervisors and laborers — we source skilled talent for projects of any scale across UAE, Saudi Arabia, and Qatar. Our network covers all disciplines: structural, mechanical, electrical, plumbing, finishing, and safety. Average deployment: 7–14 days from brief to mobilization.',
    stats: ['2,500+ Placed', '40+ Role Types', '14 Avg Days'],
    gradient: 'from-amber-900/20 via-amber-800/10 to-transparent',
    border: 'hover:border-amber-500/30',
  },
  {
    title: 'Hospitality & F&B',
    subtitle: '26,000+ new hospitality jobs projected in 2026',
    desc: 'We recruit across the full hospitality spectrum — from line staff to executive management. Chefs, waitstaff, housekeeping, front desk, F&B managers, and hotel management professionals. Every candidate is trained, vetted, and visa-ready for rapid deployment across UAE\'s expanding hotel and restaurant sector.',
    stats: ['1,800+ Placed', '30+ Role Types', '12 Avg Days'],
    gradient: 'from-sky-900/20 via-sky-800/10 to-transparent',
    border: 'hover:border-sky-400/30',
  },
  {
    title: 'Events & Entertainment',
    subtitle: 'Seasonal and permanent staffing at scale',
    desc: 'Temporary and permanent event staff, ushers, AV technicians, catering crews, production coordinators, and security personnel. We handle high-volume hiring for major events, exhibitions, concerts, and conferences across Dubai and Abu Dhabi — with the flexibility to scale up or down as demand changes.',
    stats: ['900+ Placed', '25+ Role Types', '7 Avg Days'],
    gradient: 'from-purple-900/20 via-purple-800/10 to-transparent',
    border: 'hover:border-purple-400/30',
  },
]

export function IndustriesPages() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(184,145,44,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Where We Excel</span>
            <span className="h-px w-8 bg-accent/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
            Industries <span className="text-accent">We Serve</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep sector expertise — not a generalist\'s promise. We work exclusively in sectors where precision workforce delivery matters most.
          </p>
        </div>
      </section>

      {/* Industry cards */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 sm:gap-8">
          {industries.map((ind) => (
            <div
              key={ind.title}
              className={`group relative bg-card border border-border/60 rounded-2xl p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:shadow-xl ${ind.border}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${ind.gradient} opacity-100 transition-opacity duration-500 pointer-events-none`} />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-foreground mb-2">{ind.title}</h3>
                <p className="text-sm text-accent font-medium mb-4">{ind.subtitle}</p>
                <p className="text-foreground/80 leading-relaxed text-sm mb-6">{ind.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {ind.stats.map((stat) => (
                    <span key={stat} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-semibold">
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
