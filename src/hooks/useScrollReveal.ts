'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from './useReducedMotion'

interface UseScrollRevealOptions {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  start?: string
  end?: string
  scrub?: boolean | number
  once?: boolean
  markers?: boolean
}

export function useScrollReveal<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options: UseScrollRevealOptions = {}
) {
  const reducedMotion = useReducedMotion()
  const triggerRef = useRef<ScrollTrigger | null>(null)

  const {
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    start = 'top 85%',
    end,
    scrub = false,
    once = true,
    markers = false,
  } = options

  useEffect(() => {
    if (!ref.current || reducedMotion) return
    const el = ref.current

    const ctx = gsap.context(() => {
      gsap.fromTo(el, from, {
        ...to,
        scrollTrigger: {
          trigger: el,
          start,
          ...(end ? { end } : {}),
          scrub,
          once,
          markers,
        },
      })
    })

    return () => {
      ctx.revert()
      triggerRef.current = null
    }
  }, [ref, reducedMotion]) // eslint-disable-line react-hooks/exhaustive-deps

  return triggerRef
}
