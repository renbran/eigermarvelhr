'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from './useReducedMotion'

interface UseMagneticOptions {
  strength?: number  // 0–1 translation factor
  radius?: number    // px proximity for activation
}

export function useMagnetic<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { strength = 0.4, radius = 100 }: UseMagneticOptions = {}
) {
  const reducedMotion = useReducedMotion()
  const quickX = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const quickY = useRef<ReturnType<typeof gsap.quickTo> | null>(null)

  useEffect(() => {
    if (!ref.current || reducedMotion) return
    const el = ref.current

    quickX.current = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1,0.5)' })
    quickY.current = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1,0.5)' })

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < radius) {
        quickX.current?.(dx * strength)
        quickY.current?.(dy * strength)
      }
    }

    const onMouseLeave = () => {
      quickX.current?.(0)
      quickY.current?.(0)
    }

    window.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [ref, strength, radius, reducedMotion])
}
