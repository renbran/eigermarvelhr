'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const TEAM_IMAGE =
  'https://res.cloudinary.com/dsl5fhclj/image/upload/f_auto,q_auto,c_fill,g_auto:faces,ar_16:9/v1772907258/qgrjckaexnewfjjlnpif.png'
const EXEC_IMAGE =
  'https://res.cloudinary.com/dsl5fhclj/image/upload/f_auto,q_auto,c_fill,g_auto,ar_4:3,w_800/v1773034091/pmhd832m4b2qdfxg2rcf.jpg'

const highlights = [
  { stat: '50+', label: 'Workforce Experts' },
  { stat: '150+', label: 'Successful Placements' },
  { stat: '18-Day', label: 'Average Fill Time' },
  { stat: '90%', label: 'Retention Rate' },
]

export function PremiumSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current?.querySelectorAll('[data-reveal]') ?? [],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
        }
      )

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
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
      className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: '#07080F' }}
    >
      {/* Ambient gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(184,145,44,0.07) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4" data-reveal>
            <span className="h-px w-8 bg-amber-500/55" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-amber-400/80">
              Our Team
            </span>
            <span className="h-px w-8 bg-amber-500/55" />
          </div>

          <h2
            data-reveal
            className="font-heading font-light mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#F4F4F5',
              letterSpacing: '-0.02em',
            }}
          >
            Backed by <span style={{ color: '#D4A84B' }}>50+ Workforce Experts</span>
          </h2>

          <p
            data-reveal
            className="font-body max-w-2xl mx-auto"
            style={{ color: 'rgba(156,163,175,0.7)', fontSize: '1rem', lineHeight: 1.65 }}
          >
            Our team spans recruiters, compliance specialists, payroll analysts, and ERP consultants —
            each with deep UAE market expertise across construction, hospitality, and events.
          </p>
        </div>

        {/* Image grid */}
        <div
          ref={imageRef}
          className="grid lg:grid-cols-3 gap-6 items-stretch"
          style={{ opacity: 0 }}
        >
          {/* Main wide image */}
          <div
            className="lg:col-span-2 rounded-2xl overflow-hidden relative group"
            style={{
              border: '1px solid rgba(184,145,44,0.25)',
              boxShadow: '0 0 60px rgba(184,145,44,0.08)',
            }}
          >
            <div className="relative aspect-video">
              <img
                src={TEAM_IMAGE}
                alt="Eiger Marvel consultants meeting clients in Dubai"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(7,8,15,0.55) 0%, transparent 40%)',
                }}
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] font-semibold text-amber-400 mb-1">
                    Leadership & Client Engagement
                  </div>
                  <div className="text-white text-lg sm:text-xl font-semibold leading-snug">
                    Meeting clients across Dubai & the UAE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side card with execution team */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between gap-5"
            style={{
              border: '1px solid rgba(184,145,44,0.25)',
              background:
                'linear-gradient(160deg, rgba(184,145,44,0.06) 0%, rgba(7,8,15,0.6) 60%)',
              boxShadow: '0 0 60px rgba(184,145,44,0.06)',
            }}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(184,145,44,0.3)' }}
            >
              <img
                src={EXEC_IMAGE}
                alt="Eiger Marvel execution team delivering recruitment operations in Dubai"
                className="w-full h-44 object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <h3
                className="font-heading text-xl font-bold mb-2"
                style={{ color: '#F4F4F5' }}
              >
                Execution Excellence
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(212,212,216,0.7)' }}
              >
                We combine relationship-first consulting with rigorous delivery standards to help UAE
                employers hire faster, safer, and smarter — with zero compliance penalties.
              </p>
            </div>
            <a
              href="tel:+97145751100"
              className="inline-flex items-center justify-center w-full font-semibold py-2.5 px-4 rounded-lg transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #B8912C 0%, #D4A84B 100%)',
                color: '#07080F',
                boxShadow: '0 0 24px rgba(184,145,44,0.25)',
              }}
            >
              Speak to Our Team
            </a>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="text-center p-4 rounded-xl"
              style={{
                border: '1px solid rgba(184,145,44,0.15)',
                background: 'rgba(184,145,44,0.04)',
              }}
            >
              <div
                className="font-heading font-bold mb-1"
                style={{
                  fontSize: '1.6rem',
                  background: 'linear-gradient(135deg, #D4A84B 0%, #B8912C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {h.stat}
              </div>
              <div
                className="text-[11px] uppercase tracking-[0.1em]"
                style={{ color: 'rgba(156,163,175,0.6)' }}
              >
                {h.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}