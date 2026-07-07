import React, { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ABOUT_IMAGE = '/images/about/about-image.png'
const TEAM_IMAGE = '/images/about/team.png'

// ─── Data ────────────────────────────────────────────────────────────────────

const chapters = [
  { id: 'mission', numeral: 'I',     label: 'Mission',     tagline: 'Built for the chaos UAE founders live in.' },
  { id: 'values',  numeral: 'II',    label: 'Values',      tagline: 'Four principles. Non-negotiable.' },
  { id: 'journey', numeral: 'III',   label: 'Journey',     tagline: 'A single Dubai office to a regional workforce partner.' },
  { id: 'team',    numeral: 'IV',    label: 'The Team',    tagline: '50+ specialists. One operating system.' },
]

const values = [
  {
    title: 'Integrity',
    desc: 'We operate with complete transparency in every engagement — from pricing to candidate matching to compliance reporting. No hidden terms, no surprises.',
    image: '/images/about/integrity.jpg',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <path d="M20 6L6 14v5c0 9.5 5.5 18.5 14 22 8.5-3.5 14-12.5 14-22v-5L20 6z" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <path d="M15 20l4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Speed',
    desc: '7–14 day candidate deployment is not a goal — it is our standard. We have built systems, processes, and a talent network engineered for velocity without compromise.',
    image: '/images/about/speed.jpg',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 12v8l6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Compliance First',
    desc: 'Every payroll, every visa, every contract — validated against WPS, MOHRE, and UAE labour law before execution. Zero penalty tolerance is our operating principle.',
    image: '/images/about/compliance.jpg',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 18l4 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Partnership',
    desc: 'We do not just fill roles — we embed in your operations. Our account managers learn your business, your culture, and your workforce rhythm to deliver precision outcomes.',
    image: '/images/about/partnership.jpg',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
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

// ─── Page Hero ──────────────────────────────────────────────────────────────

function PageHero({ reducedMotion }: { reducedMotion: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef   = useRef<HTMLParagraphElement>(null)
  const imgRef   = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      // Word-by-word title reveal
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word')
        gsap.fromTo(words,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power4.out', delay: 0.2 }
        )
      }
      gsap.fromTo(subRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.0 }
      )
      // Hero image scale + blur clear
      if (imgRef.current) {
        gsap.fromTo(imgRef.current,
          { scale: 1.18, filter: 'blur(14px)', opacity: 0.6 },
          { scale: 1.0, filter: 'blur(0px)', opacity: 1, duration: 1.6, ease: 'power3.out', delay: 0.1 }
        )
      }
    })
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-background">
      {/* Hero image backdrop */}
      <div className="absolute inset-0">
        <img
          ref={imgRef}
          src="/images/about/hero.jpg"
          alt=""
          className="w-full h-full object-cover will-change-transform"
          aria-hidden="true"
        />
        {/* Multi-stop gradient for editorial darkening */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in oklab, var(--color-background) 35%, transparent) 0%, color-mix(in oklab, var(--color-background) 55%, transparent) 45%, var(--color-background) 95%)',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
        {/* Kicker */}
        <div className="flex items-center gap-3 mb-8">
          <span className="h-px w-12 block bg-accent" />
          <span className="text-xs uppercase tracking-[0.22em] font-medium text-accent">
            Our Story · Chapter Zero
          </span>
        </div>

        {/* Title with word-by-word reveal */}
        <h1
          ref={titleRef}
          className="font-display font-bold leading-[0.95] mb-8 text-foreground"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.035em' }}
        >
          <span className="block overflow-hidden">
            <span className="word inline-block">About</span>{' '}
            <span className="word inline-block text-accent">Eiger</span>{' '}
            <span className="word inline-block">Marvel.</span>
          </span>
        </h1>

        <p
          ref={subRef}
          className="font-body leading-relaxed text-foreground/70 max-w-2xl"
          style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)' }}
        >
          From a single office in Dubai to a regional workforce partner across the GCC —
          built on speed, compliance, and integrity.
        </p>
      </div>
    </section>
  )
}

// ─── Chapter: Mission ────────────────────────────────────────────────────────

function ChapterMission({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 1.18, filter: 'blur(14px)' },
        {
          scale: 1.0, filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 30%', scrub: 1 }
        }
      )
      const drop = ref.current?.querySelector('.drop-cap')
      if (drop) {
        gsap.fromTo(drop,
          { opacity: 0, scale: 0.7 },
          {
            opacity: 1, scale: 1,
            duration: 0.9, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: drop, start: 'top 80%', once: true }
          }
        )
      }
      const stats = statsRef.current?.querySelectorAll('.stat-num')
      if (stats) {
        gsap.fromTo(stats,
          { opacity: 0, y: 24, scale: 0.85 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: statsRef.current, start: 'top 80%', once: true }
          }
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={ref} id="mission" className="relative py-24 sm:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Chapter header */}
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-accent/70" style={{ fontSize: '1.1rem', letterSpacing: '0.15em' }}>
                CHAPTER {chapters[0].numeral}
              </span>
              <span className="h-px w-10 bg-accent/40" />
              <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">
                {chapters[0].label}
              </span>
            </div>
            <h2
              className="font-display font-bold leading-[1.05] text-foreground"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.025em' }}
            >
              Eliminate the chaos<br />
              of <span className="text-accent italic">disconnected vendors.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display italic text-foreground/55" style={{ fontSize: '1.05rem' }}>
              "{chapters[0].tagline}"
            </p>
          </div>
        </div>

        {/* Editorial 8/4 layout */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Body column */}
          <div className="lg:col-span-8">
            <div className="font-body text-foreground/75" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
              <p className="mb-6">
                <span className="drop-cap float-left font-display font-bold text-accent mr-3 mt-1"
                  style={{ fontSize: '4.5rem', lineHeight: 0.85 }}>
                  E
                </span>
                iger Marvel HR Consultancies exists to eliminate the chaos of managing recruitment,
                payroll, compliance, and operations through disconnected vendors. We deliver
                integrated workforce solutions that let UAE businesses focus on what matters —
                growing their enterprise.
              </p>
              <p className="mb-6">
                We believe that great workforce management should be invisible. When recruitment,
                payroll, compliance, and ERP work in unison, companies scale faster, hire better,
                and sleep easier. That is the operating principle behind every engagement we take
                on — from a 30-person fit-out contractor in Dubai South to a 5,000-strong facility
                operator across the GCC.
              </p>
              <p>
                Today we are 50+ specialists — recruiters, compliance officers, payroll analysts,
                and ERP consultants — operating as one connected system. Not a vendor directory.
                One system, one contract, one number to call.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div ref={statsRef} className="lg:col-span-4">
            <div className="sticky top-32 space-y-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/30 mb-4">
                By the Numbers
              </div>
              {[
                { n: '500+',  l: 'Placements' },
                { n: '7–14',  l: 'Day Avg Fill' },
                { n: '100%',  l: 'WPS Compliant' },
                { n: '50+',   l: 'Specialists' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="relative pl-5 py-3"
                  style={{ borderLeft: '1px solid color-mix(in oklab, var(--color-accent) 25%, transparent)' }}
                >
                  <div className="stat-num font-display font-bold text-accent" style={{ fontSize: '2.2rem', lineHeight: 1 }}>
                    {s.n}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-foreground/40 mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-bleed image strip */}
        <div className="relative mt-20 rounded-2xl overflow-hidden border border-foreground/8" style={{ maxHeight: 560 }}>
          <img
            ref={imgRef}
            src={ABOUT_IMAGE}
            alt="Eiger Marvel team and operations"
            className="w-full h-full object-cover will-change-transform"
            style={{ maxHeight: 560 }}
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 50%, color-mix(in oklab, var(--color-background) 80%, transparent) 100%)',
            }}
            aria-hidden="true"
          />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between flex-wrap gap-4">
            <div className="text-xs uppercase tracking-[0.18em] text-amber-300 font-semibold">
              Eiger Marvel · Dubai · Est. 2019
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/50 font-medium">
              Plate 01
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Chapter: Values ──────────────────────────────────────────────────────────

function ChapterValues({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      const items = ref.current?.querySelectorAll('.value-item')
      if (items) {
        gsap.fromTo(items,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0,
            duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true }
          }
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={ref} id="values" className="relative py-24 sm:py-32 bg-background">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-foreground) 12%, transparent) 50%, transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Chapter header */}
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-accent/70" style={{ fontSize: '1.1rem', letterSpacing: '0.15em' }}>
                CHAPTER {chapters[1].numeral}
              </span>
              <span className="h-px w-10 bg-accent/40" />
              <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">
                {chapters[1].label}
              </span>
            </div>
            <h2
              className="font-display font-bold leading-[1.05] text-foreground"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.025em' }}
            >
              Four principles.<br />
              <span className="text-accent italic">Non-negotiable.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display italic text-foreground/55" style={{ fontSize: '1.05rem' }}>
              "{chapters[1].tagline}"
            </p>
          </div>
        </div>

        {/* Values as alternating editorial rows */}
        <div className="space-y-6">
          {values.map((v, i) => (
            <div
              key={v.title}
              className={`value-item grid lg:grid-cols-12 gap-6 lg:gap-10 items-center rounded-2xl overflow-hidden border border-foreground/8 ${
                i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
              style={{ background: 'color-mix(in oklab, var(--color-foreground) 2.2%, transparent)' }}
            >
              {/* Image */}
              <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:h-[280px] overflow-hidden">
                <img
                  src={v.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in oklab, var(--color-background) 25%, transparent), transparent 60%)',
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Text */}
              <div className="lg:col-span-7 p-7 lg:p-10">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-accent"
                    style={{
                      background: 'color-mix(in oklab, var(--color-accent) 10%, transparent)',
                      border: '1px solid color-mix(in oklab, var(--color-accent) 20%, transparent)',
                    }}
                  >
                    {v.icon}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-foreground/30 mb-1">
                      Principle · 0{i + 1}
                    </div>
                    <h3
                      className="font-display font-bold text-foreground"
                      style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}
                    >
                      {v.title}
                    </h3>
                  </div>
                </div>
                <p className="font-body text-foreground/65 leading-relaxed" style={{ fontSize: '0.98rem' }}>
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Chapter: Journey ─────────────────────────────────────────────────────────

function ChapterJourney({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top center',
            scrollTrigger: { trigger: ref.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 }
          }
        )
      }
      const items = ref.current?.querySelectorAll('.ms-item')
      if (items) {
        gsap.fromTo(items,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0,
            duration: 0.7, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true }
          }
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={ref} id="journey" className="relative py-24 sm:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Chapter header */}
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-accent/70" style={{ fontSize: '1.1rem', letterSpacing: '0.15em' }}>
                CHAPTER {chapters[2].numeral}
              </span>
              <span className="h-px w-10 bg-accent/40" />
              <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">
                {chapters[2].label}
              </span>
            </div>
            <h2
              className="font-display font-bold leading-[1.05] text-foreground"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.025em' }}
            >
              A single Dubai office<br />
              <span className="text-accent italic">to a regional partner.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display italic text-foreground/55" style={{ fontSize: '1.05rem' }}>
              "{chapters[2].tagline}"
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 lg:col-start-2">
            <div className="relative pl-12">
              {/* Vertical accent line */}
              <div
                className="absolute left-[15px] top-2 bottom-2 w-px"
                style={{ background: 'color-mix(in oklab, var(--color-foreground) 10%, transparent)' }}
                aria-hidden="true"
              />
              <div
                ref={lineRef}
                className="absolute left-[15px] top-2 bottom-2 w-px bg-accent origin-top"
                aria-hidden="true"
              />
              <div className="space-y-10">
                {milestones.map((m, i) => (
                  <div key={m.year} className="ms-item relative flex gap-7">
                    {/* Year badge */}
                    <div
                      className="absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                      style={{
                        background: 'var(--color-background)',
                        border: '1px solid var(--color-accent)',
                        color: 'var(--color-accent)',
                        fontSize: '0.65rem',
                      }}
                    >
                      {m.year.slice(-2)}
                    </div>
                    <div>
                      <div className="font-display font-bold text-accent mb-1" style={{ fontSize: '0.95rem' }}>
                        {m.year}
                      </div>
                      <p className="font-body text-foreground/65 leading-relaxed" style={{ fontSize: '0.95rem' }}>
                        {m.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Chapter: Team ───────────────────────────────────────────────────────────

function ChapterTeam({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 1.15, filter: 'blur(10px)' },
        {
          scale: 1.0, filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 30%', scrub: 1 }
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={ref} id="team" className="relative py-24 sm:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Chapter header */}
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-accent/70" style={{ fontSize: '1.1rem', letterSpacing: '0.15em' }}>
                CHAPTER {chapters[3].numeral}
              </span>
              <span className="h-px w-10 bg-accent/40" />
              <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">
                {chapters[3].label}
              </span>
            </div>
            <h2
              className="font-display font-bold leading-[1.05] text-foreground"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.025em' }}
            >
              50+ specialists.<br />
              <span className="text-accent italic">One operating system.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display italic text-foreground/55" style={{ fontSize: '1.05rem' }}>
              "{chapters[3].tagline}"
            </p>
          </div>
        </div>

        {/* Full-bleed team image */}
        <div
          className="relative rounded-2xl overflow-hidden border border-foreground/8"
          style={{ boxShadow: '0 0 60px rgba(var(--gold-rgb), 0.08)' }}
        >
          <div className="aspect-[16/9] sm:aspect-[21/9]">
            <img
              ref={imgRef}
              src={TEAM_IMAGE}
              alt="Eiger Marvel HR team in Dubai"
              className="w-full h-full object-cover will-change-transform"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--color-background) 80%, transparent) 90%, var(--color-background) 100%)',
            }}
            aria-hidden="true"
          />
          <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-amber-300 font-semibold mb-2">
                50+ Workforce Experts
              </div>
              <div className="text-foreground font-display font-semibold leading-snug max-w-xl" style={{ fontSize: '1.15rem' }}>
                Recruiters, compliance specialists, payroll analysts, and ERP consultants —
                united across the UAE & GCC.
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/45 font-medium">
              Plate 02
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Closing CTA ────────────────────────────────────────────────────────────

function ClosingCTA({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word')
        gsap.fromTo(words,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true }
          }
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={ref} id="connect" className="relative py-24 sm:py-32 bg-background overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, color-mix(in oklab, var(--color-accent) 5%, transparent) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-10 bg-accent/50" />
          <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">
            The End · Begin
          </span>
          <span className="h-px w-10 bg-accent/50" />
        </div>
        <h2
          ref={titleRef}
          className="font-display font-bold leading-[1.05] mb-6 text-foreground"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}
        >
          <span className="word inline-block">Ready</span>{' '}
          <span className="word inline-block">to</span>{' '}
          <span className="word inline-block text-accent italic">work</span>{' '}
          <span className="word inline-block">with</span>{' '}
          <span className="word inline-block">us?</span>
        </h2>
        <p className="font-body text-foreground/65 mb-10 max-w-xl mx-auto" style={{ fontSize: '1.05rem' }}>
          Talk to our team about your hiring, payroll, or compliance needs — we respond within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="tel:+97145751100"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-accent/90 text-accent-foreground font-semibold py-3.5 px-8 rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            Speak to Our Team
          </a>
          <a
            href="mailto:info@eigermarvelhr.com"
            className="inline-flex items-center gap-2 border border-foreground/15 text-foreground hover:border-accent/50 hover:text-accent font-semibold py-3.5 px-8 rounded-xl transition-all"
          >
            info@eigermarvelhr.com
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Side TOC rail (desktop) ────────────────────────────────────────────────

function SideTOC({ activeId }: { activeId: string }) {
  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-30 flex-col gap-5"
    >
      {chapters.map((c) => {
        const isActive = activeId === c.id
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="group flex items-center gap-3 justify-end"
          >
            <span
              className={`text-[11px] uppercase tracking-[0.18em] font-medium transition-all duration-300 ${
                isActive ? 'opacity-100 text-accent translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
              }`}
            >
              {c.label}
            </span>
            <span className="relative flex items-center justify-end" style={{ width: 32, height: 1 }}>
              <span
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-px bg-foreground/15 transition-all duration-500 ${
                  isActive ? 'w-full bg-accent' : 'w-3 group-hover:w-6 group-hover:bg-accent/50'
                }`}
              />
            </span>
            <span
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                isActive ? 'w-3 h-3' : 'w-2 h-2 group-hover:w-2.5 group-hover:h-2.5'
              }`}
              style={{
                background: isActive ? 'var(--color-accent)' : 'color-mix(in oklab, var(--color-foreground) 30%, transparent)',
                boxShadow: isActive ? '0 0 0 4px color-mix(in oklab, var(--color-accent) 25%, transparent), 0 0 12px var(--color-accent)' : 'none',
              }}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'var(--color-accent)', opacity: 0.5 }}
                />
              )}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

// ─── Mobile TOC pill nav ────────────────────────────────────────────────────

function MobileTOC({ activeId }: { activeId: string }) {
  return (
    <nav
      aria-label="Table of contents"
      className="xl:hidden sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-foreground/8"
    >
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-foreground/30 flex-shrink-0">
          Contents
        </span>
        {chapters.map((c) => {
          const isActive = activeId === c.id
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.14em] font-medium transition-all ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/55 hover:text-foreground border border-foreground/10'
              }`}
            >
              {c.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function AboutPage() {
  const reducedMotion = useReducedMotion()
  const [activeId, setActiveId] = useState<string>(chapters[0].id)

  useEffect(() => {
    if (reducedMotion) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    chapters.forEach((c) => {
      const el = document.getElementById(c.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <>
      <MobileTOC activeId={activeId} />
      <SideTOC activeId={activeId} />
      <main>
        <PageHero reducedMotion={reducedMotion} />
        <ChapterMission reducedMotion={reducedMotion} />
        <ChapterValues reducedMotion={reducedMotion} />
        <ChapterJourney reducedMotion={reducedMotion} />
        <ChapterTeam reducedMotion={reducedMotion} />
        <ClosingCTA reducedMotion={reducedMotion} />
      </main>
    </>
  )
}