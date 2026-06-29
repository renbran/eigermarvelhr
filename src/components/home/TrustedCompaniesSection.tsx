'use client'

import { useRef, useEffect, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { partnerLogos, type PartnerLogo } from '@/lib/company-logos'

const cloudinaryLogos: PartnerLogo[] = [
  { name: 'UAE Enterprise Client', src: 'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167980/pi5au781emmzlrkhkrdz.png' },
  { name: 'UAE Enterprise Client', src: 'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/tw61y7zrf7gm8hpayl3l.png' },
  { name: 'UAE Enterprise Client', src: 'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/av0n5tdsx4o2z2ozqovj.png' },
  { name: 'UAE Enterprise Client', src: 'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/atxw0ilmdrbmbgtwwhgo.png' },
]

const allLogos = [...partnerLogos, ...cloudinaryLogos]
const row1Logos = allLogos.slice(0, 8)
const row2Logos = allLogos.slice(8)

// ─── Logo tile ────────────────────────────────────────────────────────────────
function LogoTile({ logo }: { logo: PartnerLogo }) {
  return (
    <div className="flex-shrink-0 group" style={{ width: 88, height: 88 }}>
      <div
        className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          background: 'rgba(255,255,255,0.022)',
          border: '1px solid rgba(255,255,255,0.055)',
          transition: 'border-color 0.3s ease, background 0.3s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'rgba(184,145,44,0.4)'
          el.style.background = 'rgba(184,145,44,0.06)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'rgba(255,255,255,0.055)'
          el.style.background = 'rgba(255,255,255,0.022)'
        }}
      >
        <img
          src={logo.src}
          alt={`${logo.name} — Eiger Marvel HR client`}
          className="w-full h-full object-contain p-1.5 opacity-55 group-hover:opacity-92 transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  )
}

// ─── Marquee track ────────────────────────────────────────────────────────────
function MarqueeTrack({
  logos,
  reverse = false,
  speed = 52,
  reducedMotion,
  onTweenReady,
}: {
  logos: PartnerLogo[]
  reverse?: boolean
  speed?: number
  reducedMotion: boolean
  onTweenReady?: (tween: gsap.core.Tween) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || reducedMotion) return

    let tween: gsap.core.Tween

    const rafId = requestAnimationFrame(() => {
      const totalWidth = track.scrollWidth / 2
      if (totalWidth <= 0) return

      if (reverse) {
        gsap.set(track, { x: -totalWidth })
        tween = gsap.to(track, {
          x: 0,
          duration: speed,
          ease: 'none',
          repeat: -1,
        })
      } else {
        gsap.set(track, { x: 0 })
        tween = gsap.to(track, {
          x: -totalWidth,
          duration: speed,
          ease: 'none',
          repeat: -1,
        })
      }
      onTweenReady?.(tween)
    })

    return () => {
      cancelAnimationFrame(rafId)
      tween?.kill()
    }
  }, [reverse, speed, reducedMotion, onTweenReady])

  const doubled = [...logos, ...logos]

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-3 items-center py-1.5"
        style={{ willChange: 'transform' }}
      >
        {doubled.map((logo, i) => (
          <LogoTile key={`${logo.name}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function TrustedCompaniesSection() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const headerRef   = useRef<HTMLDivElement>(null)
  const row1WrapRef = useRef<HTMLDivElement>(null)
  const row2WrapRef = useRef<HTMLDivElement>(null)
  const tweensRef   = useRef<gsap.core.Tween[]>([])
  const reducedMotion = useReducedMotion()

  const registerTween = useCallback((tween: gsap.core.Tween) => {
    tweensRef.current.push(tween)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current?.querySelectorAll('[data-reveal]') ?? [],
        { opacity: 0, y: 22 },
        {
          opacity: 1, y: 0,
          duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 86%', once: true },
        }
      )

      gsap.fromTo(
        [row1WrapRef.current, row2WrapRef.current],
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.9, stagger: 0.18, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
        }
      )
    }, sectionRef)

    const section = sectionRef.current
    const pause  = () => tweensRef.current.forEach(t => t.pause())
    const resume = () => tweensRef.current.forEach(t => t.resume())
    section?.addEventListener('mouseenter', pause)
    section?.addEventListener('mouseleave', resume)

    return () => {
      ctx.revert()
      section?.removeEventListener('mouseenter', pause)
      section?.removeEventListener('mouseleave', resume)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 overflow-hidden"
      style={{
        background: '#0A0A0E',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Ambient centre glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,145,44,0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div ref={headerRef} className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 mb-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-3" data-reveal>
          <span className="h-px w-8 block" style={{ background: 'rgba(184,145,44,0.55)' }} />
          <span
            className="text-xs uppercase tracking-[0.18em] font-medium"
            style={{ color: 'rgba(184,145,44,0.75)' }}
          >
            Our Clients
          </span>
          <span className="h-px w-8 block" style={{ background: 'rgba(184,145,44,0.55)' }} />
        </div>

        <h2
          data-reveal
          className="font-display font-light mb-2"
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            color: '#F4F4F5',
            letterSpacing: '-0.02em',
          }}
        >
          Trusted by UAE&apos;s Leading Enterprises
        </h2>

        <p
          data-reveal
          className="font-body"
          style={{ color: 'rgba(156,163,175,0.6)', fontSize: '0.9rem' }}
        >
          40+ active hiring partners — government authorities to global brands
        </p>
      </div>

      {/* ── Dual marquee ───────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Row 1 — scrolls left */}
        <div ref={row1WrapRef} className="relative" style={{ opacity: 0 }}>
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #0A0A0E, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(-90deg, #0A0A0E, transparent)' }}
          />
          <MarqueeTrack
            logos={row1Logos}
            reverse={false}
            speed={55}
            reducedMotion={reducedMotion}
            onTweenReady={registerTween}
          />
        </div>

        {/* Row 2 — scrolls right */}
        <div ref={row2WrapRef} className="relative" style={{ opacity: 0 }}>
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #0A0A0E, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(-90deg, #0A0A0E, transparent)' }}
          />
          <MarqueeTrack
            logos={row2Logos}
            reverse={true}
            speed={48}
            reducedMotion={reducedMotion}
            onTweenReady={registerTween}
          />
        </div>
      </div>

      {/* ── Footer stats ───────────────────────────────────────── */}
      <div className="mt-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
          {[
            { val: '40+',      label: 'Enterprise Clients' },
            { val: 'UAE & GCC', label: 'Geographic Reach' },
            { val: '100%',     label: 'WPS Compliant' },
          ].map((item) => (
            <div key={item.val} className="text-center">
              <div
                className="font-heading font-bold mb-0.5"
                style={{
                  fontSize: '1.2rem',
                  background: 'linear-gradient(135deg, #D4A84B 0%, #B8912C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {item.val}
              </div>
              <div
                className="font-body text-[11px] uppercase tracking-[0.1em]"
                style={{ color: 'rgba(156,163,175,0.45)' }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
