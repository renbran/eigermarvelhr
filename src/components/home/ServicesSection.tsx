'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Users, ChartLine, Megaphone, Buildings, Medal } from '@phosphor-icons/react'

gsap.registerPlugin(ScrollTrigger)

const GOLD = 'oklch(0.82 0.12 85)'
const GOLD_LIGHT = 'oklch(0.87 0.13 85)'

const services = [
  { icon: Users, title: 'Human Resources Consultancy', description: 'Comprehensive HR solutions including recruitment, talent management, and organizational development' },
  { icon: ChartLine, title: 'Management Consultancy', description: 'Strategic business planning, process optimization, and performance improvement' },
  { icon: Megaphone, title: 'Marketing & Sales Consultancy', description: 'Market analysis, brand strategy, and sales optimization for business growth' },
  { icon: Buildings, title: 'Business Setup & Company Formation', description: 'Complete UAE company formation and business setup services' },
  { icon: Medal, title: 'Quality & Standardization (ISO)', description: 'ISO certification consulting and quality management system implementation' },
]

function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
    card.style.boxShadow = `
      ${x * 20}px ${y * 20}px 30px rgba(214, 184, 92, 0.12),
      0 0 20px rgba(214, 184, 92, 0.05)
    `
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'
    card.style.boxShadow = ''
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-200 ease-out"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.querySelectorAll('h2, p'),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Gold shimmer line
      gsap.fromTo(
        sectionRef.current?.querySelector('.section-gold-line'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true }
        }
      )

      // Cards stagger
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.service-card')
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true }
          }
        )
      }
    }, [sectionRef])

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-black relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute top-0 left-1/3 w-1/2 h-1/2 opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Core HR Services
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
            Comprehensive consultancy solutions tailored to MENA market requirements
          </p>
        </div>

        {/* Gold divider */}
        <div className="flex justify-center mb-10">
          <div className="section-gold-line h-[1px] w-24 scale-x-0 origin-center rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <TiltCard key={idx}>
                <div className="service-card bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-[oklch(0.82_0.12_85/0.3)] rounded-xl p-6 transition-all duration-300"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.82 0.12 85 / 0.2), oklch(0.82 0.12 85 / 0.05))`,
                      border: `1px solid oklch(0.82 0.12 85 / 0.2)`,
                    }}
                  >
                    <Icon size={24} weight="bold" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{service.description}</p>
                </div>
              </TiltCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
