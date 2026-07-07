'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollProgressProps {
  color?: string
  height?: number
  zIndex?: number
  gradient?: string
}

export function ScrollProgress({
  color,
  height = 2,
  zIndex = 9999,
  gradient = 'linear-gradient(90deg, var(--color-gold-500), var(--color-gold-200), var(--color-gold-500))',
}: ScrollProgressProps) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          gsap.set(bar, { scaleX: self.progress })
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-label="Scroll progress"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height,
        width: '100%',
        transformOrigin: '0% 50%',
        transform: 'scaleX(0)',
        background: color || gradient,
        zIndex,
        pointerEvents: 'none',
      }}
    />
  )
}
