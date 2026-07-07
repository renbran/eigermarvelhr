'use client'

import { useRef, useEffect, lazy, Suspense } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const IndustryCanvas = lazy(() => import('./IndustriesSectionBackground'))
import { HardHat, ForkKnife, Wrench, Truck } from '@phosphor-icons/react'
import { industryClientLogos } from '@/lib/company-logos'

// ─── Content ──────────────────────────────────────────────────────────────────
const industries = [
  {
    id: 'construction',
    label: 'Construction',
    headline: 'Build the UAE\'s Future',
    description:
      'From luxury high-rise to critical infrastructure — we staff the projects that define the skyline. Site managers, civil engineers, MEP technicians, and skilled trades placed in days, not months.',
    stat: '300+ Placements',
    roles: [
      'Project Managers & Site Managers',
      'Civil & Structural Engineers',
      'MEP Technicians (M, E, P)',
      'QA/QC Inspectors',
      'Surveyors & Estimators',
      'Skilled Trades & Labour',
    ],
    icon: HardHat,
    gold: true,
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    headline: 'Staff the UAE\'s Best Hotels',
    description:
      'We place the people who create five-star experiences — from hotel general managers and F&B directors to front-of-house teams and culinary talent for the UAE\'s leading brands.',
    stat: '200+ Placements',
    roles: [
      'General Managers & Directors',
      'F&B Managers & Head Chefs',
      'Front Office & Concierge',
      'Housekeeping Supervisors',
      'Revenue & Events Managers',
      'Culinary & Kitchen Teams',
    ],
    icon: ForkKnife,
    gold: false,
  },
  {
    id: 'facilities',
    label: 'Facilities',
    headline: 'Keep Operations Running',
    description:
      'Hard and soft FM staffing for commercial buildings, malls, and mixed-use developments. MEP engineers, cleaning managers, and security supervisors who meet RERA and DEWA standards.',
    stat: '60+ Placements',
    roles: [
      'Facilities Managers',
      'MEP Engineers & Supervisors',
      'HVAC & ELV Technicians',
      'Cleaning & Soft Services',
      'Security & Access Control',
      'Maintenance Coordinators',
    ],
    icon: Wrench,
    gold: false,
  },
  {
    id: 'logistics',
    label: 'Logistics',
    headline: 'Move Goods. Move Fast.',
    description:
      'Warehouse supervisors, fleet managers, and supply chain coordinators for the UAE\'s booming e-commerce and distribution networks. All roles ready for Jafza and Dubai South operations.',
    stat: '50+ Placements',
    roles: [
      'Logistics & Supply Chain Managers',
      'Warehouse Supervisors',
      'Fleet & Transport Managers',
      'Inventory Controllers',
      'Import/Export Coordinators',
      'Forklift & Heavy Equipment',
    ],
    icon: Truck,
    gold: false,
  },
]

// ─── Industry card ────────────────────────────────────────────────────────────
function IndustryCard({
  industry,
  reducedMotion,
}: {
  industry: (typeof industries)[0]
  reducedMotion: boolean
}) {
  const Icon = industry.icon
  const clientLogos = industryClientLogos[industry.id] ?? []

  return (
    <div
      className="ind-card group relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'color-mix(in oklab, var(--color-foreground) 2.2%, transparent)',
        border: '1px solid color-mix(in oklab, var(--color-foreground) 6%, transparent)',
        minHeight: 420,
      }}
    >
      {/* Three.js particle background */}
      {!reducedMotion && (
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <Suspense fallback={null}><IndustryCanvas gold={industry.gold} /></Suspense>
        </div>
      )}

      {/* Gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, var(--color-background) 92%, transparent) 0%, color-mix(in oklab, var(--color-background) 70%, transparent) 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] font-medium mb-2 text-accent/70" style={{ opacity: industry.gold ? 1 : 0.7 }}>
              {industry.label}
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
              background: industry.gold
                ? 'color-mix(in oklab, var(--color-accent) 12%, transparent)'
                : 'color-mix(in oklab, var(--color-accent-8) 15%, transparent)',
              border: industry.gold
                ? '1px solid color-mix(in oklab, var(--color-accent) 20%, transparent)'
                : '1px solid color-mix(in oklab, var(--color-accent-8) 25%, transparent)',
              }}
            >
              <Icon size={20} weight="bold" color={industry.gold ? 'var(--color-accent)' : 'var(--color-accent-9)'} />
            </div>
          </div>

          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: industry.gold
                ? 'color-mix(in oklab, var(--color-accent) 10%, transparent)'
                : 'color-mix(in oklab, var(--color-accent-8) 15%, transparent)',
              border: industry.gold
                ? '1px solid color-mix(in oklab, var(--color-accent) 20%, transparent)'
                : '1px solid color-mix(in oklab, var(--color-accent-8) 25%, transparent)',
              color: industry.gold ? 'var(--color-accent)' : 'var(--color-accent-11)',
            }}
          >
            {industry.stat}
          </span>
        </div>

        <h3
          className="font-display font-bold leading-tight mb-3 text-foreground"
          style={{
            fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {industry.headline}
        </h3>

        <p
          className="font-body leading-relaxed mb-6 text-foreground/60"
          style={{ fontSize: '0.875rem' }}
        >
          {industry.description}
        </p>

        {/* Roles list */}
        <div className="mt-auto">
          <div className="text-[10px] uppercase tracking-[0.12em] mb-3 font-medium text-foreground/25">
            Key Roles
          </div>
          <ul className="space-y-1.5">
            {industry.roles.map((role) => (
              <li
                key={role}
                className="flex items-center gap-2 font-body text-foreground/55"
                style={{ fontSize: '0.8rem' }}
              >
                <span
                  className="flex-shrink-0 w-1 h-1 rounded-full"
                  style={{
                    background: industry.gold ? 'var(--color-gold-600)' : '#4A7EC8',
                  }}
                />
                {role}
              </li>
            ))}
          </ul>

          {/* Client logos */}
          {clientLogos.length > 0 && (
            <div
              className="mt-5 pt-4"
              style={{ borderTop: '1px solid color-mix(in oklab, var(--color-foreground) 6%, transparent)' }}
            >
              <div className="text-[10px] uppercase tracking-[0.12em] mb-2.5 font-medium text-foreground/20"
              >
                Placed At
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {clientLogos.map((logo) => (
                  <div
                    key={logo.name}
                    className="group"
                    style={{ width: 38, height: 38 }}
                    title={logo.name}
                  >
                    <div
                      className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center"
                      style={{
                        background: 'color-mix(in oklab, var(--color-foreground) 3%, transparent)',
                        border: industry.gold
                          ? '1px solid color-mix(in oklab, var(--color-accent) 12%, transparent)'
                          : '1px solid color-mix(in oklab, var(--color-foreground) 7%, transparent)',
                      }}
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="w-full h-full object-contain p-0.5 opacity-50 group-hover:opacity-85 transition-opacity duration-200"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent border on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{
          background: industry.gold
            ? 'linear-gradient(90deg, var(--color-accent), var(--color-accent), transparent)'
            : 'linear-gradient(90deg, var(--color-accent-11), var(--color-accent-9), transparent)',
        }}
      />
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function IndustriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const gridRef    = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      gsap.fromTo(
        headerRef.current?.querySelectorAll('[data-reveal]') ?? [],
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          duration: 0.75, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      )

      // Industry cards stagger
      const cards = gridRef.current?.querySelectorAll('.ind-card') ?? []
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7, stagger: { amount: 0.5 }, ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 84%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden bg-background"
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, color-mix(in oklab, var(--color-accent) 4%, transparent) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, color-mix(in oklab, oklch(0.5 0.15 260) 4%, transparent) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="max-w-2xl mb-14">
          <div className="flex items-center gap-3 mb-5" data-reveal>
            <span className="h-px w-8 block bg-accent" />
            <span className="text-xs uppercase tracking-[0.16em] font-medium text-accent/80">
              Industries We Serve
            </span>
          </div>

          <h2
            data-reveal
            className="font-display font-bold leading-tight mb-4 text-foreground"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Deep Sector Expertise,<br />
            <span className="text-accent">Not a Generalist's Promise</span>
          </h2>

          <p
            data-reveal
            className="font-body leading-relaxed text-foreground/60"
            style={{ fontSize: '1.05rem' }}
          >
            We work exclusively in sectors where precision workforce delivery matters most.
            Our recruiters live in your industry — they know the roles, the standards, and the UAE compliance landscape.
          </p>
        </div>

        {/* Industry cards grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {industries.map((ind) => (
            <IndustryCard
              key={ind.id}
              industry={ind}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
