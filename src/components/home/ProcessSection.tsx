'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const steps = [
  {
    num: '01',
    title: 'Discovery & Brief',
    body: 'We start with a detailed intake call — role requirements, team culture, salary band, timeline, and any compliance specifics for UAE labour law.',
    detail: '24h turnaround on job spec confirmation',
  },
  {
    num: '02',
    title: 'Talent Sourcing',
    body: 'We search our network of 10,000+ pre-screened candidates and activate targeted outreach across construction and hospitality channels.',
    detail: 'Active database + passive candidate outreach',
  },
  {
    num: '03',
    title: 'Screening & Assessment',
    body: 'Every candidate goes through structured competency interviews, reference verification, and background checks before you see a single CV.',
    detail: 'Only the top 3–5% of applicants progress',
  },
  {
    num: '04',
    title: 'Shortlist Delivery',
    body: 'You receive 3–5 fully vetted candidate profiles with structured summaries, match rationale, and our recommendation within 72 hours.',
    detail: '72-hour guaranteed shortlist delivery',
  },
  {
    num: '05',
    title: 'Interview & Selection',
    body: 'We manage scheduling, preparation, and post-interview feedback so the process moves fast and candidates stay engaged throughout.',
    detail: 'Full coordination — zero admin for your team',
  },
  {
    num: '06',
    title: 'Placement & Onboarding',
    body: 'After offer acceptance we handle visa, WPS registration, accommodation coordination, and a 3-month check-in to ensure retention.',
    detail: '90-day retention support included',
  },
]

export function ProcessSection() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const headerRef   = useRef<HTMLDivElement>(null)
  const stepsRef    = useRef<HTMLDivElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      const hEls = headerRef.current?.querySelectorAll('[data-reveal]') ?? []
      gsap.fromTo(
        hEls,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          duration: 0.75, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )

      // Timeline line draw
      if (lineRef.current && !reducedMotion) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1, duration: 1.6, ease: 'power2.inOut', transformOrigin: 'top',
            scrollTrigger: { trigger: stepsRef.current, start: 'top 80%', once: true },
          }
        )
      }

      // Steps cascade in
      const stepEls = stepsRef.current?.querySelectorAll('.proc-step') ?? []
      gsap.fromTo(
        stepEls,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          duration: 0.6, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 82%', once: true },
        }
      )

      // Each detail pill fades in after its step
      const pills = stepsRef.current?.querySelectorAll('.proc-pill') ?? []
      gsap.fromTo(
        pills,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1,
          duration: 0.4, stagger: 0.14, ease: 'back.out(1.4)', delay: 0.3,
          scrollTrigger: { trigger: stepsRef.current, start: 'top 80%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: '#0C0C0F' }}
    >
      {/* Ambient glow top-left */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,145,44,0.04) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="mb-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-5" data-reveal>
            <span className="inline-block h-px w-8" style={{ background: '#B8912C' }} />
            <span
              className="text-xs uppercase tracking-[0.16em] font-medium"
              style={{ color: 'rgba(184,145,44,0.8)' }}
            >
              Our Process
            </span>
          </div>

          <h2
            data-reveal
            className="font-display font-bold leading-tight mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#F4F4F5',
              letterSpacing: '-0.02em',
            }}
          >
            How We Place Talent<br />
            <span style={{ color: '#D4A84B' }}>In 7–14 Days</span>
          </h2>

          <p
            data-reveal
            className="font-body leading-relaxed"
            style={{ color: 'rgba(209,213,219,0.65)', fontSize: '1.05rem' }}
          >
            Six steps. Zero guesswork. Every placement is backed by our structured process
            — built for speed without sacrificing quality or compliance.
          </p>
        </div>

        {/* Steps grid */}
        <div
          ref={stepsRef}
          className="relative grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0"
        >
          {/* Vertical connecting line (desktop left column) */}
          <div
            className="hidden md:block absolute left-0 top-6 bottom-6 w-px"
            style={{ left: 'calc(50% - 0.5px)', background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              ref={lineRef}
              className="w-full h-full"
              style={{
                background: 'linear-gradient(180deg, #B8912C 0%, rgba(184,145,44,0.15) 100%)',
              }}
            />
          </div>

          {steps.map((step, i) => (
            <div
              key={step.num}
              className="proc-step relative flex gap-5 pb-12 last:pb-0"
            >
              {/* Number */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-sm relative z-10"
                  style={{
                    background: '#0C0C0F',
                    border: '1px solid rgba(184,145,44,0.3)',
                    color: '#D4A84B',
                    letterSpacing: '0.04em',
                  }}
                >
                  {step.num}
                </div>
                {/* Connector dot-line (mobile) */}
                {i < steps.length - 1 && (
                  <div
                    className="md:hidden w-px flex-1 mt-2"
                    style={{ background: 'rgba(184,145,44,0.12)', minHeight: 32 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pt-2 pb-2">
                <h3
                  className="font-heading font-semibold mb-2"
                  style={{ color: '#F4F4F5', fontSize: '1.1rem' }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-body leading-relaxed mb-3"
                  style={{ color: 'rgba(156,163,175,0.75)', fontSize: '0.9rem' }}
                >
                  {step.body}
                </p>
                <span
                  className="proc-pill inline-block text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded"
                  style={{
                    background: 'rgba(184,145,44,0.07)',
                    border: '1px solid rgba(184,145,44,0.15)',
                    color: 'rgba(212,168,75,0.75)',
                  }}
                >
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
