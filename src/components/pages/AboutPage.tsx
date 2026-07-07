import React from 'react'
import { HeroVideoPlayer } from '@/components/ui/HeroVideoPlayer'

const VIDEO_ID = 'CjXcj29zhM8'
const ABOUT_IMAGE =
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1773004927/kqfgbohxmyhrwveyatrv.png'
const TEAM_IMAGE =
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1772950950/kworkq32aawqd2dfspcx.png'

const values = [
  {
    title: 'Integrity',
    desc: 'We operate with complete transparency in every engagement — from pricing to candidate matching to compliance reporting. No hidden terms, no surprises.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <path d="M20 6L6 14v5c0 9.5 5.5 18.5 14 22 8.5-3.5 14-12.5 14-22v-5L20 6z" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <path d="M15 20l4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Speed',
    desc: '7–14 day candidate deployment is not a goal — it is our standard. We have built systems, processes, and a talent network engineered for velocity without compromise.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 12v8l6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Compliance First',
    desc: 'Every payroll, every visa, every contract — validated against WPS, MOHRE, and UAE labour law before execution. Zero penalty tolerance is our operating principle.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 18l4 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Partnership',
    desc: 'We do not just fill roles — we embed in your operations. Our account managers learn your business, your culture, and your workforce rhythm to deliver precision outcomes.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <circle cx="14" cy="15" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="26" cy="15" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 32c0-6 4-10 6-10h12c2 0 6 4 6 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

const milestones = [
  { year: '2019', event: 'Founded in Dubai with a mission to transform UAE workforce management' },
  { year: '2020', event: 'Launched WPS-compliant payroll processing, saving clients AED 2M+ in penalties' },
  { year: '2021', event: 'Reached 100+ corporate clients across construction, hospitality, and events' },
  { year: '2022', event: 'Integrated Odoo ERP platform, unifying HR, payroll, and recruitment into one system' },
  { year: '2023', event: 'Expanded into Saudi Arabia and Qatar, placing 5,000+ workers regionally' },
  { year: '2024', event: 'Awarded Best HR Consultancy — Gulf Business Awards. 10,000+ total placements milestone' },
  { year: '2025', event: 'Launched Workforce 360° — fully integrated recruitment, payroll, compliance, and ERP solutions' },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary">
      {/* Hero with full-bleed video */}
      <HeroVideoPlayer videoId={VIDEO_ID} fallbackSrc={ABOUT_IMAGE}>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-accent/70" />
          <span className="text-xs uppercase tracking-[0.18em] font-semibold text-accent">Our Story</span>
          <span className="h-px w-8 bg-accent/70" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">
          About <span className="text-accent">Eiger Marvel</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed drop-shadow-md">
          From a single office in Dubai to a regional workforce partner across the GCC — built on speed, compliance, and integrity.
        </p>
      </HeroVideoPlayer>

      {/* Mission + image */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8 items-stretch">
          <div className="lg:col-span-3 relative bg-card/30 border border-border/60 rounded-3xl p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="80" fontWeight="bold" fill="currentColor">EM</text>
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-4">
                Eiger Marvel HR Consultancies exists to eliminate the chaos of managing recruitment, payroll, compliance, and operations through disconnected vendors. We deliver integrated workforce solutions that let UAE businesses focus on what matters — growing their enterprise.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                We believe that great workforce management should be invisible. When recruitment, payroll, compliance, and ERP work in unison, companies scale faster, hire better, and sleep easier.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-border/60 min-h-[280px]">
            <img
              src={ABOUT_IMAGE}
              alt="Eiger Marvel team and operations"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)',
              }}
            />
            <div className="absolute bottom-4 left-4 right-4 text-xs uppercase tracking-[0.14em] text-amber-300 font-semibold">
              Eiger Marvel · Dubai · Est. 2024
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-6 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">What We Stand For</span>
            <span className="h-px w-6 bg-accent/50" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Our Values</h2>
        </div>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="group bg-card/40 backdrop-blur-sm border border-border/60 rounded-2xl p-6 sm:p-7 hover:border-accent/30 transition-all duration-500 hover:shadow-xl"
            >
              <div className="p-3 rounded-xl bg-accent/10 text-accent w-fit mb-4 group-hover:bg-accent/15 transition-colors">
                {v.icon}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-6 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Our Journey</span>
            <span className="h-px w-6 bg-accent/50" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Milestones</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-accent/20" />
            <div className="space-y-8">
              {milestones.map((m) => (
                <div key={m.year} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center relative z-10">
                    <span className="text-xs font-bold text-accent">{m.year.slice(-2)}</span>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-sm font-bold text-accent">{m.year}</span>
                    <p className="text-muted-foreground text-sm mt-0.5">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-8 bg-accent/50" />
              <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Meet The Team</span>
              <span className="h-px w-8 bg-accent/50" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Our Team</h2>
          </div>
          <div
            className="relative rounded-3xl overflow-hidden border border-amber-500/25"
            style={{ boxShadow: '0 0 60px rgba(var(--gold-rgb), 0.08)' }}
          >
            <img
              src={TEAM_IMAGE}
              alt="Eiger Marvel HR team in Dubai"
              className="w-full h-auto object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)',
              }}
            />
            <div className="absolute bottom-6 left-6 right-6 text-center sm:text-left">
              <div className="text-xs uppercase tracking-[0.16em] text-amber-400 font-semibold mb-1">
                50+ Workforce Experts
              </div>
              <div className="text-white text-lg sm:text-xl font-semibold leading-snug max-w-2xl">
                Recruiters, compliance specialists, payroll analysts, and ERP consultants — united across the UAE & GCC.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center bg-card/30 border border-border/60 rounded-3xl p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to work with us?</h2>
          <p className="text-muted-foreground mb-8">
            Talk to our team about your hiring, payroll, or compliance needs — we respond within 24 hours.
          </p>
          <a
            href="tel:+97145751100"
            className="inline-block bg-gradient-to-r from-accent to-accent/90 text-accent-foreground font-semibold py-3 px-8 rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            Speak to Our Team
          </a>
        </div>
      </section>
    </div>
  )
}