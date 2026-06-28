'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChatText } from '@phosphor-icons/react'

gsap.registerPlugin(ScrollTrigger)

interface FloatingCTAProps {
  label?: string
  phoneNumber?: string
}

export function FloatingCTA({
  label = "Let's Talk",
  phoneNumber = '+971XXXXXXXXX',
}: FloatingCTAProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Reveal after hero section
    const ctx = gsap.context(() => {
      gsap.fromTo(
        container,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          delay: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: document.body,
            start: 'top +=600',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9997,
        opacity: 0,
      }}
    >
      <a
        href={`https://wa.me/${phoneNumber.replace(/\s+/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="magnetic"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 24px',
          borderRadius: 50,
          background:
            'linear-gradient(135deg, oklch(0.82 0.12 85), oklch(0.72 0.09 85))',
          color: '#070707',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
          letterSpacing: '0.02em',
          boxShadow: '0 4px 24px oklch(0.82 0.12 85 / 0.3)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1.08,
            boxShadow: '0 8px 40px oklch(0.82 0.12 85 / 0.5)',
            duration: 0.3,
            ease: 'power2.out',
          })
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1,
            boxShadow: '0 4px 24px oklch(0.82 0.12 85 / 0.3)',
            duration: 0.3,
            ease: 'power2.out',
          })
        }}
      >
        <ChatText size={20} weight="fill" />
        {label}
      </a>
    </div>
  )
}
