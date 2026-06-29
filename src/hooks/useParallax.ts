'use client'

import { useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from './useReducedMotion'

interface UseParallaxOptions {
  speed?: number   // 0–1: fraction of scroll distance to translate
  start?: string
  end?: string
}

export function useParallax<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { speed = 0.3, start = 'top bottom', end = 'bottom top' }: UseParallaxOptions = {}
) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return
    const el = ref.current

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 0 },
        {
          y: () => el.offsetHeight * speed * -1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [ref, speed, start, end, reducedMotion])
}
