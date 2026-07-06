'use client'

import { useRef, useEffect, lazy, Suspense } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const SceneBackground = lazy(() => import('./ServicesSectionBackground'))
import {
  MagnifyingGlass,
  UsersThree,
  ClockCounterClockwise,
  ClipboardText,
  SealCheck,
  ShieldCheck,
} from '@phosphor-icons/react'

// ─── Content ──────────────────────────────────────────────────────────────────
const services = [
  {
    icon: MagnifyingGlass,
    title: 'Executive Search',
    tag: 'Senior Roles',
    description:
      'C-suite, directors, and department heads placed with precision. We source leaders who understand the UAE construction and hospitality landscape.',
  },
  {
    icon: UsersThree,
    title: 'Volume Recruitment',
    tag: 'Scale Hiring',
    description:
      'Project-based bulk hiring delivered on schedule — site crews, banqueting teams, or seasonal workforces from 10 to 500 heads.',
  },
  {
    icon: ClockCounterClockwise,
    title: 'Contract & Temp Staffing',
    tag: 'Flexible',
    description:
      'On-demand talent for project spikes, peak seasons, and cover requirements. Fully compliant, fully managed.',
  },
  {
    icon: ClipboardText,
    title: 'Screening & Assessment',
    tag: 'Quality Assured',
    description:
      'Structured competency interviews, background verification, and reference checks. You only meet the top 3–5% who pass our rigorous process.',
  },
  {
    icon: SealCheck,
    title: 'ISO Certification Consulting',
    tag: 'Accreditation',
    description:
      'Expert guidance through ISO 9001, 45001, and 14001 certification. We help construction and hospitality firms achieve accreditation that unlocks government tenders and corporate contracts.',
  },
  {
    icon: ShieldCheck,
    title: 'WPS Compliance',
    tag: 'Compliance',
    description:
      'Every placement is structured for Wage Protection System adherence. We ensure salary packaging and payroll setup meets UAE Ministry of Labour standards.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const gridRef    = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header children reveal
      const hEls = headerRef.current?.querySelectorAll('[data-reveal]') ?? []
      gsap.fromTo(
        hEls,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )

      // Divider draw
      gsap.fromTo(
        sectionRef.current?.querySelector('.svc-divider')!,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.3, ease: 'power3.inOut', transformOrigin: 'left',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 76%', once: true },
        }
      )

      // Cards stagger
      const cards = gridRef.current?.querySelectorAll('.svc-card') ?? []
      gsap.fromTo(
        cards,
        { opacity: 0, y: 56, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.65, stagger: { amount: 0.55 }, ease: 'power3.out',
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
      {/* Three.js wireframe — right ambient background */}
      {!reducedMotion && (
        <div
          className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] pointer-events-none"
          aria-hidden="true"
        >
          <Suspense fallback={null}><SceneBackground /></Suspense>
        </div>
      )}

      {/* Radial gold glow behind the sphere */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,145,44,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div ref={headerRef} className="max-w-xl mb-14">
          <div className="flex items-center gap-3 mb-5" data-reveal>
            <span className="h-px w-8 block bg-accent" />
            <span className="text-xs uppercase tracking-[0.16em] font-medium text-accent/85">
              Recruitment Services
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
            Specialist Hiring,<br />
            <span className="text-accent">Delivered On Time</span>
          </h2>

          <p
            data-reveal
            className="font-body leading-relaxed text-foreground/60"
            style={{ fontSize: '1.05rem' }}
          >
            Six core services purpose-built for construction and hospitality — the sectors
            where precision, speed, and UAE compliance are non-negotiable.
          </p>
        </div>

        {/* Gold divider */}
        <div
          className="svc-divider mb-14 h-px"
          style={{ width: 72, background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent), transparent)' }}
        />

        {/* ── Grid ───────────────────────────────────────────────── */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {services.map((svc, i) => {
            const Icon = svc.icon
            return (
              <div
                key={i}
                className="svc-card group relative rounded-2xl p-6 cursor-default transition-colors duration-300"
                style={{
                  background: 'color-mix(in oklab, var(--color-foreground) 2.5%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--color-foreground) 5.5%, transparent)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'color-mix(in oklab, var(--color-accent) 4%, transparent)'
                  el.style.borderColor = 'color-mix(in oklab, var(--color-accent) 22%, transparent)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'color-mix(in oklab, var(--color-foreground) 2.5%, transparent)'
                  el.style.borderColor = 'color-mix(in oklab, var(--color-foreground) 5.5%, transparent)'
                }}
              >
                {/* Icon pill */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: 'color-mix(in oklab, var(--color-accent) 9%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--color-accent) 16%, transparent)',
                  }}
                >
                  <Icon size={21} weight="bold" color="var(--color-accent)" />
                </div>

                {/* Tag */}
                <div className="mb-3">
                  <span
                    className="text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded"
                    style={{
                      background: 'color-mix(in oklab, var(--color-accent) 7%, transparent)',
                      border: '1px solid color-mix(in oklab, var(--color-accent) 11%, transparent)',
                      color: 'color-mix(in oklab, var(--color-accent) 65%, transparent)',
                    }}
                  >
                    {svc.tag}
                  </span>
                </div>

                <h3
                  className="font-heading font-semibold mb-2 text-foreground"
                  style={{ fontSize: '1.05rem' }}
                >
                  {svc.title}
                </h3>

                <p
                  className="font-body leading-relaxed text-muted-foreground"
                  style={{ fontSize: '0.875rem' }}
                >
                  {svc.description}
                </p>

                {/* Bottom accent line — reveals on hover */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
