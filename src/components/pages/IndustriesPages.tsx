'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ─── Industry data ────────────────────────────────────────────────────────────
type Industry = {
  id: string
  number: string
  kicker: string
  title: string
  tagline: string
  body: string
  bullets: string[]
  stats: { value: string; label: string }[]
  image: string
  imageAlt: string
  accent: string
}

const INDUSTRIES: Industry[] = [
  {
    id: 'construction',
    number: 'I',
    kicker: 'Chapter One',
    title: 'Building the Emirates, Project by Project',
    tagline:
      'Where the skyline meets the workforce — civil, structural, MEP, finishing — deployed in days, not months.',
    body:
      "From the final ascent of the Burj Khalifa to Yas Island's waterfront expansions, our construction recruiters have staffed the projects that define the region. We mobilize entire project teams — visa-ready, safety-certified, and on-site within 14 days of brief. Every candidate is screened for trade-specific competency, UAE compliance familiarity, and the stamina required to deliver on tight GCC construction timelines.",
    bullets: [
      'Turnkey project teams from brief to mobilization in 7–14 days',
      'UAE-relevant trade certifications: OSHA, NEBOSH, CID, CSCS-equivalent',
      'Dedicated account lead per project, on-site mobilization support',
      'Crew scale-up and scale-down for phased tower and infrastructure work',
    ],
    stats: [
      { value: '2,500+', label: 'Placements' },
      { value: '40+', label: 'Role Types' },
      { value: '14-Day', label: 'Avg Fill' },
      { value: '94%', label: 'Retention' },
    ],
    image: '/images/industries/construction.jpg',
    imageAlt:
      'Construction crew in hard hats coordinating on site in the UAE',
    accent: 'gold',
  },
  {
    id: 'engineering',
    number: 'II',
    kicker: 'Chapter Two',
    title: 'Engineering Talent for the Region\'s Boldest Builds',
    tagline:
      'Mid-to-senior technical leadership for consultancies, contractors, and project owners across the Gulf.',
    body:
      "Behind every megaproject sits a technical backbone — BIM specialists, structural engineers, design leads, and project engineers who turn concept into constructible. Our engineering desk has placed leads on marquee Gulf developments from Riyadh's Diriyah Gate to Dubai Creek Harbour, with deep familiarity in international codes (ACI, BS, Eurocode) and the multidisciplinary coordination required of GCC design environments.",
    bullets: [
      'BIM Managers and Coordinators across Revit, Navisworks, BIM 360',
      'Chartered Engineers (ICE, IStructE, PE) for senior design oversight',
      'Project Engineers with PMC and EPC contractor experience',
      'CAD/BIM Technicians fluent in regional detailing standards',
    ],
    stats: [
      { value: '800+', label: 'Placements' },
      { value: '18', label: 'Role Categories' },
      { value: '21-Day', label: 'Avg Fill' },
      { value: '92%', label: 'Retention' },
    ],
    image: '/images/industries/engineering.jpg',
    imageAlt:
      'Engineering team reviewing technical drawings and project plans',
    accent: 'blue',
  },
  {
    id: 'mep',
    number: 'III',
    kicker: 'Chapter Three',
    title: 'The Power Behind Operations: MEP & Facilities',
    tagline:
      'Mechanical, electrical, plumbing specialists and the FM professionals who keep towers running 24/7.',
    body:
      "Buildings breathe through their MEP systems — and stay alive through dedicated facilities teams. We staff the technical spine of the UAE's commercial towers, malls, hospitals, and mixed-use districts: from HVAC commissioning engineers and BMS operators to facilities managers who hold RERA, DEWA, and DCD compliance in their day-to-day vocabulary. Whether greenfield commissioning or live FM transitions, we mobilize teams that hit the ground running.",
    bullets: [
      'MEP engineers with carrier OEM certifications (Trane, Daikin, ABB, Schneider)',
      'BMS specialists on Honeywell, Schneider, Siemens platforms',
      'Facilities Managers with RERA, DEWA, DCD compliance depth',
      'HVAC and ELV technicians available on 24/7 shift coverage',
    ],
    stats: [
      { value: '1,200+', label: 'Placements' },
      { value: '25+', label: 'Role Types' },
      { value: '10-Day', label: 'Avg Fill' },
      { value: '95%', label: 'Retention' },
    ],
    image: '/images/industries/mep.jpg',
    imageAlt:
      'MEP technician working on electrical wiring with a hard hat',
    accent: 'gold',
  },
  {
    id: 'hospitality',
    number: 'IV',
    kicker: 'Chapter Four',
    title: 'Staffing the UAE\'s Five-Star Experiences',
    tagline:
      'Pre-vetted, guest-ready professionals across luxury hotels, resorts, restaurant groups, and event venues.',
    body:
      "Hospitality is detail, executed at speed. From the concierge desk to the executive kitchen, we place the people who create the UAE's five-star moments — opening teams for new hotel flags, seasonal surge support for resort peaks, and permanent leadership for established brands. Every candidate is reference-checked, language-assessed, and trained on the cultural fluency required to deliver across Dubai, Abu Dhabi, Sharjah, and the Northern Emirates.",
    bullets: [
      'Pre-opening teams for hotel flags: leadership + line staff in one mobilization',
      'F&B Directors and Executive Chefs with international luxury brand pedigree',
      'Front office and guest relations with multi-lingual capability',
      'Housekeeping and stewarding teams ready for Forbes/AAA-rated properties',
    ],
    stats: [
      { value: '1,800+', label: 'Placements' },
      { value: '30+', label: 'Role Types' },
      { value: '12-Day', label: 'Avg Fill' },
      { value: '91%', label: 'Retention' },
    ],
    image: '/images/industries/hospitality.jpg',
    imageAlt:
      'Hotel reception lobby with hospitality staff greeting guests',
    accent: 'gold',
  },
  {
    id: 'manufacturing',
    number: 'V',
    kicker: 'Chapter Five',
    title: 'Factory Floors, Warehouses, and Global Supply Chains',
    tagline:
      'Production-line operators and logistics coordinators for Jafza, KIZAD, and Dubai South operators.',
    body:
      "As the UAE accelerates industrial diversification under Operation 300bn, manufacturers and 3PLs need operators who show up ready. We staff production lines, distribution centers, and supply chain teams for the country's largest industrial operators — with depth in food processing, FMCG packaging, automotive assembly, and the e-commerce fulfillment networks that move through the region's free zones.",
    bullets: [
      'Production supervisors trained on lean, Six Sigma, and 5S environments',
      'Warehouse leads with WMS experience (SAP EWM, Manhattan, Oracle)',
      'QC inspectors with ISO 9001, HACCP, and IATF awareness',
      'Forklift and heavy equipment operators with RTA-certified licenses',
    ],
    stats: [
      { value: '600+', label: 'Placements' },
      { value: '22+', label: 'Role Types' },
      { value: '16-Day', label: 'Avg Fill' },
      { value: '89%', label: 'Retention' },
    ],
    image: '/images/industries/manufacturing.jpg',
    imageAlt:
      'Manufacturing operator working on a production line machine',
    accent: 'blue',
  },
  {
    id: 'heavy-manpower',
    number: 'VI',
    kicker: 'Chapter Six',
    title: 'The Crews That Move the Region',
    tagline:
      'High-volume blue-collar teams for contractors who can\'t afford a delay.',
    body:
      "Behind every polished handover is a workforce of hundreds — general laborers, masons, carpenters, scaffolders, steel fixers, and helpers. We mobilize high-volume blue-collar teams for the UAE's largest contractors, with rapid camp deployment, transport coordination, and on-site supervisor support. When the project schedule slips and the headcount gap shows up on Monday, our crews close it by Wednesday.",
    bullets: [
      'Bulk mobilization: 50–500 personnel per project, deployed within 7 days',
      'Camp logistics and transport coordination across emirates',
      'Trade-specific screening: masons, carpenters, steel fixers, scaffolders',
      'On-site supervisor and timekeeper support included',
    ],
    stats: [
      { value: '5,000+', label: 'Mobilized' },
      { value: '100+', label: 'Crews / Year' },
      { value: '7-Day', label: 'Avg Fill' },
      { value: '93%', label: 'Retention' },
    ],
    image: '/images/industries/heavy-manpower.jpg',
    imageAlt:
      'Heavy manpower construction crew working together on a project site',
    accent: 'gold',
  },
]

// ─── Chapter ──────────────────────────────────────────────────────────────────
function Chapter({
  industry,
  index,
  total,
  reducedMotion,
  registerSection,
}: {
  industry: Industry
  index: number
  total: number
  reducedMotion: boolean
  registerSection: (id: string, el: HTMLElement | null) => void
}) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const bodyRef = useRef<HTMLParagraphElement | null>(null)
  const statRefs = useRef<HTMLDivElement[]>([])
  const numberRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    registerSection(industry.id, sectionRef.current)
    return () => registerSection(industry.id, null)
  }, [industry.id, registerSection])

  useEffect(() => {
    if (reducedMotion) return
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Hero image parallax + reveal
      gsap.fromTo(
        imageRef.current,
        { scale: 1.18, filter: 'blur(8px)' },
        {
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.6,
          },
        }
      )

      // Chapter number reveal
      gsap.fromTo(
        numberRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
        }
      )

      // Title - word by word
      const title = titleRef.current
      if (title) {
        const words = title.querySelectorAll<HTMLSpanElement>('[data-word]')
        gsap.fromTo(
          words,
          { opacity: 0.1, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.04,
            ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 80%', once: true },
          }
        )
      }

      // Body paragraph fade-in
      gsap.fromTo(
        bodyRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: { trigger: bodyRef.current, start: 'top 85%', once: true },
        }
      )

      // Stats stagger
      gsap.fromTo(
        statRefs.current.filter(Boolean),
        { opacity: 0, y: 24, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: section, start: 'top 60%', once: true },
        }
      )

      // Bullets stagger
      const bullets = section.querySelectorAll<HTMLLIElement>('[data-bullet]')
      gsap.fromTo(
        bullets,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 60%', once: true },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [reducedMotion])

  const isGold = industry.accent === 'gold'

  // Split title into words for animation
  const titleWords = industry.title.split(' ')

  return (
    <section
      ref={sectionRef}
      id={`chapter-${industry.id}`}
      data-chapter={industry.id}
      className="relative pt-12 pb-24 sm:pt-20 sm:pb-32"
    >
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Kicker */}
        <div ref={numberRef} className="flex items-center gap-4 mb-6">
          <span
            className="font-heading text-[10px] sm:text-xs uppercase tracking-[0.32em] font-medium"
            style={{ color: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)' }}
          >
            {industry.kicker}
          </span>
          <span
            className="font-heading text-[10px] sm:text-xs uppercase tracking-[0.32em] font-medium text-foreground/30"
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span
            className="h-px flex-1 max-w-[80px]"
            style={{ background: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)', opacity: 0.5 }}
          />
        </div>

        {/* Hero image with number badge */}
        <div
          ref={imageRef}
          className="relative overflow-hidden rounded-2xl mb-10 sm:mb-14"
          style={{
            height: 'min(56vh, 560px)',
            border: isGold
              ? '1px solid color-mix(in oklab, var(--color-accent) 22%, transparent)'
              : '1px solid color-mix(in oklab, var(--color-accent-8) 22%, transparent)',
            boxShadow: isGold
              ? '0 24px 60px -20px color-mix(in oklab, var(--color-accent) 20%, transparent)'
              : '0 24px 60px -20px color-mix(in oklab, var(--color-accent-8) 20%, transparent)',
            willChange: 'transform, filter',
          }}
        >
          <img
            src={industry.image}
            alt={industry.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in oklab, var(--color-background) 35%, transparent) 0%, transparent 30%, transparent 70%, color-mix(in oklab, var(--color-background) 75%, transparent) 100%)',
            }}
            aria-hidden="true"
          />
          {/* Roman numeral badge */}
          <div
            className="absolute top-5 right-5 sm:top-8 sm:right-8 w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-heading"
            style={{
              background: 'color-mix(in oklab, var(--color-background) 70%, transparent)',
              backdropFilter: 'blur(12px)',
              border: isGold
                ? '1px solid color-mix(in oklab, var(--color-accent) 45%, transparent)'
                : '1px solid color-mix(in oklab, var(--color-accent-8) 45%, transparent)',
              color: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)',
              fontSize: 'clamp(1rem, 2vw, 1.4rem)',
              letterSpacing: '0.04em',
            }}
          >
            {industry.number}
          </div>
          {/* Industry label on the image */}
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 right-5 sm:right-8">
            <div
              className="font-heading text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mb-1"
              style={{ color: 'var(--color-foreground)', opacity: 0.7 }}
            >
              Industry Focus
            </div>
            <div
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
              style={{ letterSpacing: '-0.02em' }}
            >
              {industry.title.split(',')[0]}
            </div>
          </div>
        </div>

        {/* Two-column editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main column */}
          <div className="lg:col-span-8">
            <h2
              ref={titleRef}
              className="font-display font-bold text-foreground mb-6"
              style={{
                fontSize: 'clamp(1.75rem, 3.4vw, 2.8rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
              }}
            >
              {titleWords.map((w, i) => (
                <span key={i} data-word className="inline-block mr-[0.25em]">
                  {w}
                </span>
              ))}
            </h2>

            <p
              className="font-body text-base sm:text-lg mb-3 italic"
              style={{
                color: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)',
                lineHeight: 1.55,
              }}
            >
              {industry.tagline}
            </p>

            {/* Drop cap body */}
            <p
              ref={bodyRef}
              className="font-body text-foreground/80 leading-relaxed"
              style={{ fontSize: '1.0625rem' }}
            >
              <span
                className="font-display font-bold float-left mr-3 mt-1 leading-none"
                style={{
                  fontSize: '4.2rem',
                  color: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)',
                  lineHeight: 0.85,
                }}
              >
                {industry.body.charAt(0)}
              </span>
              {industry.body.slice(1)}
            </p>

            {/* What we deliver */}
            <div className="mt-10 pt-8" style={{ borderTop: '1px solid color-mix(in oklab, var(--color-foreground) 8%, transparent)' }}>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="h-px w-6"
                  style={{ background: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)' }}
                />
                <h3
                  className="font-heading text-xs uppercase tracking-[0.18em] font-semibold"
                  style={{ color: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)' }}
                >
                  What We Deliver
                </h3>
              </div>
              <ul className="space-y-3">
                {industry.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    data-bullet
                    className="flex items-start gap-3 font-body text-foreground/75"
                    style={{ fontSize: '0.95rem', lineHeight: 1.55 }}
                  >
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                      style={{ background: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)' }}
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar - stats */}
          <aside className="lg:col-span-4">
            <div
              className="lg:sticky lg:top-24 rounded-2xl p-6 sm:p-8"
              style={{
                background: 'color-mix(in oklab, var(--color-foreground) 3%, transparent)',
                border: isGold
                  ? '1px solid color-mix(in oklab, var(--color-accent) 22%, transparent)'
                  : '1px solid color-mix(in oklab, var(--color-accent-8) 22%, transparent)',
              }}
            >
              <div
                className="font-heading text-[10px] uppercase tracking-[0.2em] font-medium mb-5 text-foreground/40"
              >
                By the Numbers
              </div>
              <div className="space-y-5">
                {industry.stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    ref={(el) => {
                      if (el) statRefs.current[i] = el
                    }}
                    className="flex items-baseline justify-between gap-3 pb-4 last:pb-0"
                    style={{
                      borderBottom:
                        i < industry.stats.length - 1
                          ? '1px solid color-mix(in oklab, var(--color-foreground) 8%, transparent)'
                          : 'none',
                    }}
                  >
                    <div>
                      <div
                        className="font-display font-bold leading-none"
                        style={{
                          fontSize: '2rem',
                          color: isGold ? 'var(--color-accent)' : 'var(--color-accent-9)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="font-body text-xs uppercase tracking-[0.08em] text-foreground/55 mt-1.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next chapter teaser */}
              {index < total - 1 && (
                <a
                  href={`#chapter-${INDUSTRIES[index + 1].id}`}
                  className="mt-7 pt-6 flex items-center justify-between gap-2 font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-foreground/60 hover:text-foreground transition-colors group"
                  style={{ borderTop: '1px solid color-mix(in oklab, var(--color-foreground) 8%, transparent)' }}
                >
                  <span>Next Chapter</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

// ─── TOC Rail ─────────────────────────────────────────────────────────────────
function TOCRail({
  industries,
  activeId,
  onJump,
}: {
  industries: Industry[]
  activeId: string
  onJump: (id: string) => void
}) {
  return (
    <nav
      aria-label="Industries table of contents"
      className="hidden lg:block fixed right-8 xl:right-12 top-1/2 -translate-y-1/2 z-30"
    >
      <ul className="space-y-3">
        {industries.map((ind, i) => {
          const isActive = ind.id === activeId
          return (
            <li key={ind.id}>
              <button
                onClick={() => onJump(ind.id)}
                aria-label={`Jump to ${ind.title}`}
                aria-current={isActive ? 'true' : undefined}
                className="group flex items-center gap-3 cursor-pointer"
              >
                <span
                  className="font-heading text-[10px] uppercase tracking-[0.2em] tabular-nums transition-all duration-300"
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-foreground)',
                    opacity: isActive ? 1 : 0.35,
                    width: '20px',
                    textAlign: 'right',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="relative h-px transition-all duration-500"
                  style={{
                    width: isActive ? '48px' : '24px',
                    background: isActive ? 'var(--color-accent)' : 'var(--color-foreground)',
                    opacity: isActive ? 1 : 0.25,
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute -top-[3px] left-0 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'var(--color-accent)',
                        boxShadow: '0 0 8px var(--color-accent)',
                      }}
                    />
                  )}
                </span>
                <span
                  className="font-body text-xs whitespace-nowrap transition-all duration-300"
                  style={{
                    color: 'var(--color-foreground)',
                    opacity: isActive ? 0.95 : 0,
                    transform: isActive ? 'translateX(0)' : 'translateX(8px)',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  {ind.title.split(',')[0]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ─── Mobile TOC ───────────────────────────────────────────────────────────────
function MobileTOC({
  industries,
  activeId,
  onJump,
}: {
  industries: Industry[]
  activeId: string
  onJump: (id: string) => void
}) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-foreground/10">
      <div className="overflow-x-auto">
        <ul className="flex gap-1 px-4 py-3 min-w-max">
          {industries.map((ind, i) => {
            const isActive = ind.id === activeId
            return (
              <li key={ind.id}>
                <button
                  onClick={() => onJump(ind.id)}
                  className="px-3 py-1.5 rounded-full font-heading text-[11px] uppercase tracking-[0.1em] transition-all"
                  style={{
                    background: isActive
                      ? 'color-mix(in oklab, var(--color-accent) 12%, transparent)'
                      : 'transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-foreground)',
                    border: isActive
                      ? '1px solid color-mix(in oklab, var(--color-accent) 35%, transparent)'
                      : '1px solid color-mix(in oklab, var(--color-foreground) 12%, transparent)',
                    opacity: isActive ? 1 : 0.55,
                  }}
                >
                  {String(i + 1).padStart(2, '0')} · {ind.title.split(' ')[0]}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ─── Page Hero ────────────────────────────────────────────────────────────────
function PageHero({ reducedMotion }: { reducedMotion: boolean }) {
  const heroRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const subRef = useRef<HTMLParagraphElement | null>(null)
  const metaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      // Title word-by-word reveal
      const title = titleRef.current
      if (title) {
        const words = title.querySelectorAll<HTMLSpanElement>('[data-hero-word]')
        gsap.fromTo(
          words,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: 'power3.out',
            delay: 0.1,
          }
        )
      }

      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.6,
        }
      )

      gsap.fromTo(
        metaRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.85,
        }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const titleWords = ['Where', 'we', 'recruit,', 'reputation', 'is', 'everything.']

  return (
    <section
      ref={heroRef}
      className="relative pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 overflow-hidden bg-background"
    >
      {/* Background ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 30%, color-mix(in oklab, var(--color-accent) 8%, transparent) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--color-background) 80%, transparent) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <div
            ref={metaRef}
            className="flex items-center gap-3 mb-7"
          >
            <span className="h-px w-8 bg-accent/55" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/80 font-heading">
              The Industry Atlas · 2026 Edition
            </span>
          </div>

          <h1
            ref={titleRef}
            className="font-display font-bold text-foreground mb-7"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
            }}
          >
            {titleWords.map((w, i) => (
              <span key={i} data-hero-word className="inline-block mr-[0.22em]">
                {w}
              </span>
            ))}
          </h1>

          <p
            ref={subRef}
            className="font-body text-foreground/65 max-w-2xl"
            style={{ fontSize: '1.0625rem', lineHeight: 1.65 }}
          >
            Six industries. One operating principle: precision over breadth.
            <br className="hidden sm:block" />
            Each chapter below is the playbook our recruiters use every day —
            from brief to mobilization, across the UAE.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Closing CTA ──────────────────────────────────────────────────────────────
function ClosingCTA() {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current?.querySelectorAll('[data-cta-reveal]') ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in oklab, var(--color-accent) 10%, transparent) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div data-cta-reveal className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-accent/55" />
          <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/80 font-heading">
            End of Atlas
          </span>
          <span className="h-px w-8 bg-accent/55" />
        </div>
        <h2
          data-cta-reveal
          className="font-display font-bold text-foreground mb-5"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}
        >
          Ready to Staff Your<br />
          <span className="text-accent">Next Chapter?</span>
        </h2>
        <p
          data-cta-reveal
          className="font-body text-foreground/65 mb-9 max-w-xl mx-auto"
          style={{ fontSize: '1.0625rem', lineHeight: 1.6 }}
        >
          Send us your brief — discipline, headcount, timeline, site location. Our
          industry desks respond with shortlisted candidates within 48 hours.
        </p>
        <div data-cta-reveal className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+97145751100"
            className="inline-flex items-center gap-2 font-semibold py-3.5 px-7 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent))',
              color: 'var(--color-accent-foreground)',
              boxShadow: '0 8px 24px -8px color-mix(in oklab, var(--color-accent) 35%, transparent)',
              fontSize: '0.95rem',
            }}
          >
            Speak to a Recruiter
          </a>
          <a
            href="mailto:hello@eigermarvelhr.ae"
            className="inline-flex items-center gap-2 font-semibold py-3.5 px-7 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'transparent',
              color: 'var(--color-foreground)',
              border: '1px solid color-mix(in oklab, var(--color-foreground) 20%, transparent)',
              fontSize: '0.95rem',
            }}
          >
            Send a Brief
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function IndustriesPages({ onNavigate: _onNavigate }: { onNavigate?: (page: string) => void } = {}) {
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map())
  const [activeId, setActiveId] = useState<string>(INDUSTRIES[0].id)
  const reducedMotion = useReducedMotion()

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionsRef.current.set(id, el)
    else sectionsRef.current.delete(id)
  }, [])

  // Track active section with IntersectionObserver
  useEffect(() => {
    const sections = Array.from(sectionsRef.current.values())
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section closest to top-center of viewport
        let best: { id: string; ratio: number } | null = null
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.chapter
            if (!id) continue
            const ratio = entry.intersectionRatio
            if (!best || ratio > best.ratio) {
              best = { id, ratio }
            }
          }
        }
        if (best) setActiveId(best.id)
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const handleJump = useCallback((id: string) => {
    const el = sectionsRef.current.get(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  return (
    <div className="min-h-screen bg-background">
      <PageHero reducedMotion={reducedMotion} />

      <MobileTOC industries={INDUSTRIES} activeId={activeId} onJump={handleJump} />

      <div className="relative">
        {INDUSTRIES.map((ind, i) => (
          <Chapter
            key={ind.id}
            industry={ind}
            index={i}
            total={INDUSTRIES.length}
            reducedMotion={reducedMotion}
            registerSection={registerSection}
          />
        ))}
      </div>

      <ClosingCTA />

      <TOCRail industries={INDUSTRIES} activeId={activeId} onJump={handleJump} />
    </div>
  )
}