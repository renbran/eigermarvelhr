'use client'

import { useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from './useReducedMotion'

interface UseTiltOptions {
  maxRotation?: number  // degrees max tilt
  perspective?: number
  scale?: number
  glare?: boolean
}

export function useTilt<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  {
    maxRotation = 8,
    perspective = 800,
    scale = 1.03,
    glare: _glare = false,
  }: UseTiltOptions = {}
) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return
    const el = ref.current

    gsap.set(el, { transformPerspective: perspective, transformOrigin: 'center' })

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rx = ((e.clientY - cy) / (rect.height / 2)) * -maxRotation
      const ry = ((e.clientX - cx) / (rect.width / 2)) * maxRotation

      gsap.to(el, {
        rotateX: rx,
        rotateY: ry,
        scale,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.set(el, { rotateX: 0, rotateY: 0, scale: 1 })
    }
  }, [ref, maxRotation, perspective, scale, reducedMotion])
}
