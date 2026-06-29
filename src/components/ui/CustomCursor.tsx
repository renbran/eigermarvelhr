'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD = '#D4A84B'
const GOLD_DIM = 'rgba(212,168,75,0.45)'
const WHITE = 'rgba(255,255,255,0.90)'

// ─── Cursor states ────────────────────────────────────────────────────────────
type State = 'idle' | 'hover' | 'active' | 'hidden'

function applyState(
  dot: HTMLElement,
  ring: HTMLElement,
  glow: HTMLElement,
  state: State
) {
  switch (state) {
    case 'idle':
      gsap.to(dot,  { scale: 1, opacity: 1, backgroundColor: GOLD, borderRadius: '50%', duration: 0.35, ease: 'power2.out' })
      gsap.to(ring, { scale: 1, opacity: 1, borderColor: GOLD_DIM, backgroundColor: 'transparent', width: 36, height: 36, duration: 0.45, ease: 'power2.out' })
      gsap.to(glow, { opacity: 0.6, scale: 1, duration: 0.5 })
      break

    case 'hover':
      gsap.to(dot,  { scale: 0.45, opacity: 0.9, backgroundColor: WHITE, duration: 0.3, ease: 'power2.out' })
      gsap.to(ring, {
        scale: 1,
        opacity: 1,
        width: 54,
        height: 54,
        borderColor: 'rgba(255,255,255,0.55)',
        backgroundColor: 'rgba(212,168,75,0.06)',
        duration: 0.4,
        ease: 'power2.out',
      })
      gsap.to(glow, { opacity: 1, scale: 1.4, duration: 0.5 })
      break

    case 'active':
      gsap.to(dot,  { scale: 0.3, duration: 0.08, ease: 'power3.in' })
      gsap.to(ring, { scale: 0.85, duration: 0.08, ease: 'power3.in' })
      gsap.to(glow, { scale: 0.8, opacity: 1.2, duration: 0.08 })
      break

    case 'hidden':
      gsap.to([dot, ring, glow], { opacity: 0, duration: 0.22, ease: 'power2.in' })
      break
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const glowRef  = useRef<HTMLDivElement>(null)
  const stateRef = useRef<State>('idle')

  useEffect(() => {
    // Desktop pointer only
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot  = dotRef.current!
    const ring = ringRef.current!
    const glow = glowRef.current!

    // ── Initial GSAP position centering ──────────────────────────────────────
    gsap.set([dot, ring, glow], { xPercent: -50, yPercent: -50, opacity: 0 })

    // ── quickTo setters — creates one tween per axis, reused every frame ─────
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.05 })
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.05 })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power2.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power2.out' })
    const glowX = gsap.quickTo(glow, 'x', { duration: 0.65, ease: 'power2.out' })
    const glowY = gsap.quickTo(glow, 'y', { duration: 0.65, ease: 'power2.out' })

    document.body.style.cursor         = 'none'
    document.documentElement.style.cursor = 'none'

    // ── Handlers ─────────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);  dotY(e.clientY)
      ringX(e.clientX); ringY(e.clientY)
      glowX(e.clientX); glowY(e.clientY)

      // Reveal on first move
      if (stateRef.current === 'hidden') return
      gsap.to([dot, ring, glow], { opacity: 1, duration: 0.2, overwrite: 'auto' })
    }

    const onOver = (e: MouseEvent) => {
      const next: State = (e.target as HTMLElement).closest(
        'a, button, [role="button"], [data-cursor="hover"], label, summary'
      ) ? 'hover' : 'idle'

      if (stateRef.current === next) return
      stateRef.current = next
      applyState(dot, ring, glow, next)
    }

    const onDown = () => {
      stateRef.current = 'active'
      applyState(dot, ring, glow, 'active')
    }

    const onUp = () => {
      const next: State = stateRef.current === 'active' ? 'idle' : stateRef.current
      stateRef.current = next
      // Spring back
      gsap.to(dot,  { scale: next === 'hover' ? 0.45 : 1, duration: 0.5, ease: 'elastic.out(1.1, 0.4)' })
      gsap.to(ring, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
      gsap.to(glow, { scale: next === 'hover' ? 1.4 : 1, duration: 0.5, ease: 'power2.out' })
    }

    const onLeave = () => {
      stateRef.current = 'hidden'
      applyState(dot, ring, glow, 'hidden')
    }

    const onEnter = () => {
      stateRef.current = 'idle'
      applyState(dot, ring, glow, 'idle')
    }

    window.addEventListener('mousemove',    onMove,  { passive: true })
    document.addEventListener('mouseover',  onOver)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      document.body.style.cursor            = ''
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove',    onMove)
      document.removeEventListener('mouseover',  onOver)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return (
    <>
      {/* Layer 1 — ambient glow blob (slowest) */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 110,
          height: 110,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99987,
          background: 'radial-gradient(circle, rgba(212,168,75,0.10) 0%, transparent 68%)',
          filter: 'blur(18px)',
          willChange: 'transform',
        }}
      />

      {/* Layer 2 — lagging ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1px solid ${GOLD_DIM}`,
          pointerEvents: 'none',
          zIndex: 99989,
          willChange: 'transform',
          backdropFilter: 'blur(0px)',
        }}
      />

      {/* Layer 3 — precise dot (fastest) */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: GOLD,
          pointerEvents: 'none',
          zIndex: 99990,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
    </>
  )
}
