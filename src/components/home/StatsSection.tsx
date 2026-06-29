'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const stats = [
  { value: 500,  suffix: '+',  label: 'Placements Made',       sublabel: 'Construction & Hospitality' },
  { value: 14,   suffix: '',   label: 'Day Average Fill Time',  sublabel: 'From brief to placement'    },
  { value: 40,   suffix: '+',  label: 'UAE Partner Companies',  sublabel: 'Active hiring clients'      },
  { value: 100,  suffix: '%',  label: 'WPS Compliant',          sublabel: 'Every placement, guaranteed' },
]

const GOLD = '#B8912C'
const GOLD_LIGHT = '#D4A84B'

function CounterEl({ value, suffix }: { value: number; suffix: string }) {
  const numRef = useRef<HTMLSpanElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = numRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          if (triggered.current) return
          triggered.current = true
          const obj = { val: 0 }
          gsap.to(obj, {
            val: value,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toLocaleString()
            },
            onComplete: () => {
              el.textContent = value.toLocaleString()
            },
          })
        },
      })
    })

    return () => ctx.revert()
  }, [value])

  return (
    <span>
      <span ref={numRef}>0</span>
      {suffix}
    </span>
  )
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.stat-item') ?? []
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.65, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
        }
      )

      // Gold line draws across
      gsap.fromTo(
        sectionRef.current?.querySelector('.stats-line'),
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.4, ease: 'power3.inOut', transformOrigin: 'left',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-24 overflow-hidden"
      style={{ background: '#09090D', borderTop: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Top gold rule */}
      <div
        className="stats-line absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${GOLD} 25%, ${GOLD_LIGHT} 50%, ${GOLD} 75%, transparent 100%)`,
          opacity: 0.35,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-item relative text-center py-10 px-6 group"
              style={{ background: '#09090D' }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(184,145,44,0.05) 0%, transparent 70%)',
                }}
              />

              <div
                className="font-heading tabular-nums leading-none mb-2"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <CounterEl value={stat.value} suffix={stat.suffix} />
              </div>

              <div
                className="font-heading font-semibold mb-1"
                style={{ color: '#F4F4F5', fontSize: '0.9rem' }}
              >
                {stat.label}
              </div>

              <div
                className="font-body"
                style={{ color: 'rgba(156,163,175,0.55)', fontSize: '0.75rem', letterSpacing: '0.04em' }}
              >
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
