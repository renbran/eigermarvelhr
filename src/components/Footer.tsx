'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Phone, Envelope, MapPin, ArrowUp } from '@phosphor-icons/react'

gsap.registerPlugin(ScrollTrigger)

const GOLD = 'var(--color-gold-300)'

interface FooterProps {
  onNavigate?: (page: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      if (!section) return

      // Stagger all content columns
      const cols = section.querySelectorAll('.footer-col')
      gsap.fromTo(
        cols,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 85%', once: true }
        }
      )

      // Gold line reveal
      gsap.fromTo(
        section.querySelector('.footer-gold-line'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', once: true }
        }
      )

      // Bottom copyright stagger
      gsap.fromTo(
        section.querySelector('.footer-bottom'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 80%', once: true }
        }
      )
    }, [sectionRef])

    return () => ctx.revert()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      ref={sectionRef}
      className="bg-background border-t border-border text-foreground mt-auto relative overflow-hidden"
    >
      {/* Gold ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
      />
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand col */}
          <div className="footer-col">
            <div className="flex flex-col leading-tight mb-4">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">Eiger Marvel</span>
              <span className="text-xs sm:text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, var(--color-gold-200))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Exceed Your Expectations
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed uppercase tracking-wider mb-1">
              EIGER MARVEL HUMAN RESOURCE CONSULTANCIES LLC
            </p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Specialized HR &amp; Management Consultants serving the MENA region since 2022.
            </p>
          </div>

          {/* Contact col */}
          <div className="footer-col">
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wide mb-4" style={{ color: GOLD }}>Contact</h3>
            <div className="space-y-3">
              <a href="tel:+97145751100" className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1">
                <Phone size={16} weight="bold" style={{ color: GOLD }} className="flex-shrink-0" />
                <span>+971 4 575 1100</span>
              </a>
              <a href="mailto:info@eigermarvelhr.com" className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1">
                <Envelope size={16} weight="bold" style={{ color: GOLD }} className="flex-shrink-0" />
                <span>info@eigermarvelhr.com</span>
              </a>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                <MapPin size={16} weight="bold" style={{ color: GOLD }} className="flex-shrink-0" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>

          {/* Company col */}
          <div className="footer-col">
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wide mb-4" style={{ color: GOLD }}>Company</h3>
            <div className="space-y-2">
              <button className="block text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 text-left">About Us</button>
              <button className="block text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 text-left">Services</button>
              <button
                className="block text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 text-left"
                onClick={() => onNavigate?.('privacy')}
              >
                Privacy Policy
              </button>
              <button className="block text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 text-left">Terms &amp; Conditions</button>
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="footer-gold-line h-[1px] w-full scale-x-0 origin-left mt-8 mb-6"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${GOLD} 50%, transparent 100%)` }}
        />

        {/* Bottom row */}
        <div className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Eiger Marvel HR Consultancies. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-all duration-300"
          >
            Back to top
            <ArrowUp size={14} weight="bold" />
          </button>
        </div>
      </div>
    </footer>
  )
}
