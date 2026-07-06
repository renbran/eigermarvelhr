'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

interface LoadingScreenProps {
  minDuration?: number
  onComplete?: () => void
}

export function LoadingScreen({ minDuration = 2800, onComplete }: LoadingScreenProps) {
  const overlayRef   = useRef<HTMLDivElement>(null)
  const lineRef      = useRef<HTMLDivElement>(null)
  const brandTopRef  = useRef<HTMLDivElement>(null)
  const brandBotRef  = useRef<HTMLDivElement>(null)
  const taglineRef   = useRef<HTMLDivElement>(null)
  const exitBarRef   = useRef<HTMLDivElement>(null)
  const [visible, setVisible]   = useState(true)

  useEffect(() => {
    const overlay  = overlayRef.current
    const line     = lineRef.current
    const top      = brandTopRef.current
    const bot      = brandBotRef.current
    const tag      = taglineRef.current
    const exitBar  = exitBarRef.current
    if (!overlay || !line || !top || !bot || !tag || !exitBar) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false)
          onComplete?.()
        },
      })

      // ── Phase 1: gold separator line draws from center out ──────────────
      tl.fromTo(
        line,
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, duration: 0.75, ease: 'power3.inOut', transformOrigin: 'center' }
      )

      // ── Phase 2: "EIGER MARVEL" clips up from below ─────────────────────
      tl.fromTo(
        top,
        { yPercent: 105, opacity: 1 },
        { yPercent: 0, duration: 0.7, ease: 'power4.out' },
        '-=0.25'
      )

      // ── Phase 3: "HR" scales + fades in ─────────────────────────────────
      tl.fromTo(
        bot,
        { opacity: 0, scale: 0.7, yPercent: 30 },
        { opacity: 1, scale: 1, yPercent: 0, duration: 0.55, ease: 'back.out(1.6)' },
        '-=0.35'
      )

      // ── Phase 4: tagline letter-spacing expand ───────────────────────────
      tl.fromTo(
        tag,
        { opacity: 0, letterSpacing: '-0.05em' },
        { opacity: 1, letterSpacing: '0.22em', duration: 0.6, ease: 'power3.out' },
        '-=0.2'
      )

      // ── Hold at full brand display ───────────────────────────────────────
      tl.to({}, { duration: Math.max(0, (minDuration - 2200) / 1000) })

      // ── Phase 5: gold edge bar sweeps up first ───────────────────────────
      tl.fromTo(
        exitBar,
        { yPercent: 0, opacity: 1 },
        { yPercent: -100, duration: 0.55, ease: 'power3.in' }
      )

      // ── Phase 6: whole overlay lifts ─────────────────────────────────────
      tl.to(
        overlay,
        { yPercent: -100, duration: 0.75, ease: 'power4.inOut' },
        '-=0.25'
      )
    })

    return () => ctx.revert()
  }, [minDuration, onComplete])

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes em-spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes em-pulse-glow {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
      `}</style>

      <div
        ref={overlayRef}
        aria-hidden="true"
        aria-label="Loading Eiger Marvel HR"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'var(--color-background)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* ── Ambient radial glow ───────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 55% at 50% 46%, rgba(184,145,44,0.07) 0%, transparent 70%)',
            animation: 'em-pulse-glow 3.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* ── Subtle grid ──────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(184,145,44,0.04) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(184,145,44,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            pointerEvents: 'none',
          }}
        />

        {/* ── Rotating outer ring (decorative) ─────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: '1px solid rgba(184,145,44,0.10)',
            animation: 'em-spin-slow 12s linear infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '1px solid rgba(184,145,44,0.07)',
            animation: 'em-spin-slow 8s linear infinite reverse',
            pointerEvents: 'none',
          }}
        />

        {/* ── Brand content ─────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            textAlign: 'center',
          }}
        >
          {/* "EIGER MARVEL" — clip reveal wrapper */}
          <div style={{ overflow: 'hidden', paddingBottom: 4 }}>
            <div
              ref={brandTopRef}
              style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2.2rem, 6vw, 3.6rem)',
                fontWeight: 300,
                color: 'var(--color-foreground)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              EIGER MARVEL
            </div>
          </div>

          {/* Gold separator line */}
          <div
            ref={lineRef}
            style={{
              width: '100%',
              maxWidth: 340,
              height: 1,
              background:
                'linear-gradient(90deg, transparent 0%, #B8912C 20%, #D4A84B 50%, #B8912C 80%, transparent 100%)',
              margin: '10px 0',
              transformOrigin: 'center',
            }}
          />

          {/* "HR" — gold, bold, spaced */}
          <div
            ref={brandBotRef}
            style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
              fontWeight: 700,
              letterSpacing: '0.42em',
              background: 'linear-gradient(135deg, #B8912C 0%, #D4A84B 50%, #B8912C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0,
              paddingLeft: '0.42em', // compensate for letter-spacing
            }}
          >
            HR
          </div>

          {/* Tagline */}
          <div
            ref={taglineRef}
            style={{
              marginTop: 20,
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              opacity: 0,
            }}
          >
            Master Recruiter · UAE
          </div>
        </div>

        {/* ── Exit sweep bar (gold leading edge of curtain) ─────────────── */}
        <div
          ref={exitBarRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              'linear-gradient(90deg, transparent 0%, #B8912C 30%, #D4A84B 50%, #B8912C 70%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  )
}
