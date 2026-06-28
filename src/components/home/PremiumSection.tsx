'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CrownSimple, Check, X, Sparkles } from '@phosphor-icons/react'

gsap.registerPlugin(ScrollTrigger)

const GOLD = 'oklch(0.82 0.12 85)'
const GOLD_LIGHT = 'oklch(0.87 0.13 85)'

interface PremiumSectionProps {
  onUpgrade: () => void
}

export function PremiumSection({ onUpgrade }: PremiumSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const freeCardRef = useRef<HTMLDivElement>(null)
  const premCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.querySelectorAll('div, h2, p'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Free card slides from left
      if (freeCardRef.current) {
        gsap.fromTo(
          freeCardRef.current,
          { opacity: 0, x: -80 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true }
          }
        )
      }

      // Premium card slides from right with a slight delay
      if (premCardRef.current) {
        gsap.fromTo(
          premCardRef.current,
          { opacity: 0, x: 80 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true }
          }
        )
      }

      // Gold shimmer line
      gsap.fromTo(
        sectionRef.current?.querySelector('.prem-gold-line'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true }
        }
      )
    }, [sectionRef])

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 relative overflow-hidden bg-black">
      {/* Gold ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.05] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
      />
      <div className="absolute bottom-0 left-0 w-96 h-96 opacity-[0.05] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 shadow-lg"
            style={{
              background: `linear-gradient(135deg, oklch(0.82 0.12 85 / 0.2), oklch(0.82 0.12 85 / 0.05))`,
              border: `1px solid oklch(0.82 0.12 85 / 0.3)`,
            }}
          >
            <CrownSimple size={18} weight="fill" style={{ color: GOLD }} />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide" style={{ color: GOLD_LIGHT }}>
              Premium Membership
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            10x Your Career Visibility
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Premium candidates get hired 3x faster with enhanced visibility and AI matching
          </p>
        </div>

        {/* Gold shimmer line */}
        <div className="flex justify-center mb-10">
          <div className="prem-gold-line h-[1px] w-20 scale-x-0 origin-center rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Free Card */}
          <div ref={freeCardRef} className="relative overflow-hidden rounded-xl p-6 sm:p-8 border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-6">Free Membership</h3>
            <div className="space-y-3 mb-6">
              {[
                { text: 'Basic profile visibility', included: true },
                { text: 'Weekly AI job matches', included: true },
                { text: 'Standard application process', included: true },
                { text: 'Priority employer visibility', included: false },
                { text: 'Daily personalized matches', included: false },
                { text: 'Application analytics', included: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  {item.included ? (
                    <Check size={18} weight="bold" className="text-gray-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X size={18} weight="bold" className="text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${item.included ? 'text-gray-300' : 'text-gray-600'}`}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="text-2xl font-bold text-white">Free</div>
          </div>

          {/* Premium Card */}
          <div ref={premCardRef} className="relative overflow-hidden rounded-xl p-6 sm:p-8 border-2"
            style={{
              borderColor: `oklch(0.82 0.12 85 / 0.4)`,
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 40px rgba(214,184,92,0.15)',
            }}
          >
            {/* Decorative top-right glow */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <CrownSimple size={24} weight="fill" style={{ color: GOLD }} />
                <h3 className="text-lg sm:text-xl font-bold text-white">Premium Membership</h3>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  'Featured profile with premium badge',
                  'Daily AI-powered job matches',
                  'Priority placement in search results',
                  '15% AI match score boost',
                  'Detailed application analytics',
                  'Direct employer messaging',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={18} weight="bold" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-200">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <div className="text-2xl font-bold mb-1" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AED 299/month
                </div>
                <p className="text-xs text-gray-500">Average ROI within first placement</p>
              </div>
              <button
                onClick={onUpgrade}
                className="group relative overflow-hidden w-full font-bold py-3 px-6 rounded-lg text-sm transition-all duration-300 hover:scale-105 border-none"
                style={{
                  background: `linear-gradient(135deg, oklch(0.82 0.12 85), oklch(0.72 0.09 85))`,
                  color: '#000',
                  boxShadow: '0 0 20px rgba(214,184,92,0.3)',
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={16} weight="fill" />
                  Upgrade to Premium
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Join <span className="font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>500+</span> premium members who landed their dream jobs faster
          </p>
        </div>
      </div>
    </section>
  )
}
