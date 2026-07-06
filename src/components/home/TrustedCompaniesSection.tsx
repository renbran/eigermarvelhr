'use client'

import { useRef, useEffect, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Awards } from '@/components/ui/award'

interface BadgeItem {
  title: string
  subtitle: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  variant: 'stamp' | 'award' | 'certificate' | 'badge' | 'sticker' | 'id-card'
}

const awards: BadgeItem[] = [
  { title: 'MOHRE Licensed',          subtitle: 'Ministry of Human Resources & Emiratisation', level: 'platinum', variant: 'award' },
  { title: 'WPS Compliant',           subtitle: 'UAE Wage Protection System',                  level: 'gold',     variant: 'award' },
  { title: 'Odoo Gold Partner',       subtitle: 'ERP Implementation & Consulting',                  level: 'gold',     variant: 'award' },
]

// ─── Marquee track ────────────────────────────────────────────────────────────
function MarqueeTrack({
  items,
  reverse = false,
  speed = 52,
  reducedMotion,
  onTweenReady,
}: {
  items: BadgeItem[]
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

  // Repeat items 4x to ensure seamless infinite scroll on all screen widths
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-3 items-center py-1.5"
        style={{ willChange: 'transform' }}
      >
        {repeated.map((item, i) => (
          <div
            key={`${item.title}-${i}`}
            className="flex-shrink-0"
            style={{ width: 280, height: 320 }}
          >
            <Awards
              title={item.title}
              subtitle={item.subtitle}
              level={item.level}
              variant={item.variant}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function TrustedCompaniesSection() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const headerRef   = useRef<HTMLDivElement>(null)
  const marqueeWrap = useRef<HTMLDivElement>(null)
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
        marqueeWrap.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.9, ease: 'power2.out',
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
      className="relative py-16 sm:py-20 overflow-hidden bg-background border-t border-foreground/4 border-b border-foreground/4"
    >
      {/* Ambient centre glow */}
      <div
        className="absolute inset-0 pointer-events-none ambient-glow-gold"
        aria-hidden="true"
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div ref={headerRef} className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 mb-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-3" data-reveal>
          <span className="h-px w-8 block bg-accent/55" />
          <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/75">
            Awards & Recognition
          </span>
          <span className="h-px w-8 block bg-accent/55" />
        </div>

        <h2
          data-reveal
          className="font-heading font-bold mb-2 text-foreground"
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            letterSpacing: '-0.02em',
          }}
        >
          Trusted by UAE Employers
        </h2>

        <p
          data-reveal
          className="font-body text-muted-foreground/80"
          style={{ fontSize: '0.9rem' }}
        >
          EIGER MARVEL HUMAN RESOURCE CONSULTANCIES LLC — Industry awards, government licenses, and compliance certifications earned on our journey
        </p>
      </div>

      {/* ── Single marquee ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div ref={marqueeWrap} className="relative" style={{ opacity: 0 }}>
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, var(--color-background), transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(-90deg, var(--color-background), transparent)' }}
          />
          <MarqueeTrack
            items={awards}
            reverse={false}
            speed={45}
            reducedMotion={reducedMotion}
            onTweenReady={registerTween}
          />
        </div>
      </div>

      {/* ── Footer stats ───────────────────────────────────────── */}
      <div className="mt-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
          {[
            { val: '3',        label: 'Verified Certifications' },
            { val: '100%',     label: 'WPS & MOHRE Compliant' },
            { val: 'Since',    label: '2020 Serving UAE' },
          ].map((item) => (
            <div key={item.val} className="text-center">
              <div
                className="font-heading font-bold mb-0.5 text-accent"
                style={{
                  fontSize: '1.2rem',
                }}
              >
                {item.val}
              </div>
              <div className="font-body text-[11px] uppercase tracking-[0.1em] text-muted-foreground/60">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
