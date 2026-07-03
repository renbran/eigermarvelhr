import React from 'react'
import { PremiumBackground } from '@/components/ui/PremiumBackground'

const benefits = [
  {
    title: 'Time-Waste Analysis',
    desc: 'We measure exactly how many hours your team spends on manual HR, payroll, and compliance tasks — and calculate what that\'s costing in lost productivity.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 12v8l5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Cost-Savings Calculation',
    desc: 'We quantify what you\'re spending across recruitment, payroll processing, compliance management, and multi-vendor coordination — then show you the savings.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M10 30V14l10-6 10 6v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 20h20" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="20" cy="26" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Compliance Risk Assessment',
    desc: 'We audit your current WPS, MOHRE, and labor law compliance status — identifying exposure areas that could lead to fines, penalties, or legal action.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 18l4 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '30-Day Roadmap',
    desc: 'A prioritized, actionable plan with timelines — showing exactly what to fix, in what order, and how long each step takes to implement effectively.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="6" y="8" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 16h28" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="21" r="1.5" fill="currentColor" />
        <circle cx="20" cy="21" r="1.5" fill="currentColor" />
        <circle cx="26" cy="21" r="1.5" fill="currentColor" />
        <circle cx="14" cy="27" r="1.5" fill="currentColor" />
        <circle cx="20" cy="27" r="1.5" fill="currentColor" />
        <circle cx="26" cy="27" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
]

export function HealthCheckPage() {
  return (
    <div className="min-h-screen">
      <PremiumBackground variant="cinematic" />
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(184,145,44,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Free Assessment</span>
            <span className="h-px w-8 bg-accent/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
            Workforce <span className="text-accent">Health Check</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A free, no-obligation 30-minute consultation to identify inefficiencies, compliance risks, and cost-saving opportunities in your current workforce operations.
          </p>
        </div>
      </section>

      {/* Form + Benefits */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Booking form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Book Your Free Health Check</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
                  placeholder="+971 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
                  placeholder="Your company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Industry</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
                >
                  <option value="">Select industry</option>
                  <option>Construction & Engineering</option>
                  <option>Hospitality & F&B</option>
                  <option>Events & Entertainment</option>
                  <option>Healthcare</option>
                  <option>Retail & E-commerce</option>
                  <option>Technology</option>
                  <option>Manufacturing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Number of Employees</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
                >
                  <option value="">Select range</option>
                  <option>10–30 employees</option>
                  <option>30–80 employees</option>
                  <option>80+ employees</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent to-accent/90 text-accent-foreground font-semibold py-3 px-6 rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] mt-2"
              >
                Book Free Consultation
              </button>
            </form>
          </div>

          {/* What You Get */}
          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">What You Get</h2>
              <div className="space-y-5">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="p-2.5 rounded-xl bg-accent/10 text-accent flex-shrink-0 self-start">
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-2xl p-6 sm:p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-3">
                BONUS
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">WPS Compliance Checklist</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Every health check participant receives our exclusive WPS Compliance Checklist — valued at AED 500. Includes audit templates, submission deadlines, and common penalty triggers.
              </p>
              <span className="text-xs text-accent font-semibold">+971 4 575 1100</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
