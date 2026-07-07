import React from 'react'
import { PremiumBackground } from '@/components/ui/PremiumBackground'

const solutions = [
  {
    title: 'Recruitment Engine',
    subtitle: 'Full-cycle talent acquisition',
    desc: 'We manage the entire hiring lifecycle — from sourcing to onboarding. Our consultants leverage a pre-vetted talent pool and structured vetting process to deliver qualified candidates within 7–14 days. Every placement carries a 30–60 day guarantee.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.2" fill="currentColor" fillOpacity="0.05" />
        <path d="M16 28c0-4 3-8 8-8s8 4 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="24" cy="18" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 34h8v-4c0-1.5-1-2.5-2.5-2.5h-3c-1.5 0-2.5 1-2.5 2.5v4z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Payroll Management',
    subtitle: 'Streamlined salary processing',
    desc: 'Automate your payroll cycle from hours-logging to bank transfers. Our system handles complex calculations — overtime, leave adjustments, gratuity — reducing manual processing time from 20+ hours to under 30 minutes monthly.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="8" y="14" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M24 20v10M19 24h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="24" cy="25" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'WPS Guarantee',
    subtitle: 'Zero-penalty compliance',
    desc: 'Every payroll run is validated against WPS (Wage Protection System) requirements before submission. We flag discrepancies early, maintain proper documentation, and guarantee zero MOHRE penalties for WPS compliance throughout our engagement.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="10" y="8" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M17 4v5M31 4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 24l4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Odoo ERP',
    subtitle: 'Unified business system',
    desc: 'Our Odoo-based ERP integrates HR, payroll, recruitment, and compliance into a single platform. Real-time dashboards, automated workflows, and role-based access — designed specifically for UAE SMEs scaling from 10 to 100+ employees.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="28" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="6" y="28" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="28" y="28" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 13h8M20 35h8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

export function HowItWorksPage({ onNavigate: _onNavigate }: { onNavigate?: (page: string) => void } = {}) {
  return (
    <div className="min-h-screen">
      <PremiumBackground variant="default" />
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(var(--gold-rgb), 0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Workforce 360°</span>
            <span className="h-px w-8 bg-accent/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
            How It <span className="text-accent">Works</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four integrated solutions that eliminate the chaos of managing recruitment, payroll, compliance, and operations through separate vendors.
          </p>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
          {solutions.map((s, i) => (
            <div
              key={s.title}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 sm:p-8 hover:border-accent/30 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/15 transition-colors flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                  <p className="text-sm text-accent/80 font-medium">{s.subtitle}</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center bg-card/30 border border-border/60 rounded-3xl p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Unify Your Workforce Operations?</h2>
          <p className="text-muted-foreground mb-8">Book a free consultation to see how our integrated approach can save you time, money, and compliance risk.</p>
          <a
            href="tel:+97145751100"
            className="inline-block bg-gradient-to-r from-accent to-accent/90 text-accent-foreground font-semibold py-3 px-8 rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            Call +971 4 575 1100
          </a>
        </div>
      </section>
    </div>
  )
}
