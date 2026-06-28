'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const GOLD = 'oklch(0.82 0.12 85)'

const companyLogos = [
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167980/pi5au781emmzlrkhkrdz.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/tw61y7zrf7gm8hpayl3l.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/av0n5tdsx4o2z2ozqovj.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/atxw0ilmdrbmbgtwwhgo.png',
]

export function TrustedCompaniesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.querySelectorAll('h2, p'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true }
          }
        )
      }

      // Gold shimmer underline on header
      gsap.fromTo(
        sectionRef.current?.querySelector('.gold-underline'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
        }
      )

      // Marquee: double the logos for seamless loop
      const track = marqueeRef.current
      if (!track) return

      const totalWidth = track.scrollWidth / 2  // half since we cloned

      gsap.to(track, {
        x: -totalWidth,
        duration: 40,
        ease: 'none',
        repeat: -1,
      })

      // Pause on hover
      const section = sectionRef.current
      if (section) {
        section.addEventListener('mouseenter', () => {
          gsap.to(track, { timeScale: 0, duration: 0.3 })
        })
        section.addEventListener('mouseleave', () => {
          gsap.to(track, { timeScale: 1, duration: 0.5 })
        })
      }
    }, [sectionRef])

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 bg-black border-y border-white/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div ref={headerRef} className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Trusted by Leading UAE Companies
          </h2>
          <p className="text-gray-400">
            Connecting top talent with premier employers across the MENA region
          </p>
        </div>
      </div>

      {/* Gold underline */}
      <div className="flex justify-center mb-6">
        <div className="gold-underline h-[1px] w-20 scale-x-0 origin-center rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
        />
      </div>

      {/* Marquee track */}
      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #000, transparent)' }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, #000, transparent)' }}
        />

        <div className="flex overflow-hidden">
          <div ref={marqueeRef} className="flex gap-16 items-center py-4" style={{ willChange: 'transform' }}>
            {/* Original set */}
            {[...companyLogos, ...companyLogos].map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-32 h-16 sm:w-40 sm:h-20 flex items-center justify-center px-6"
              >
                <img
                  src={logo}
                  alt={`Company logo`}
                  className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
