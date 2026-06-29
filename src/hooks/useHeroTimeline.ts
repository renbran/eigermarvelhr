'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from './useReducedMotion'
import { buildHeroTimeline } from '@/animations/timelines'

interface HeroRefs {
  container: React.RefObject<HTMLElement | null>
  headline?: React.RefObject<HTMLElement | null>
  subline?: React.RefObject<HTMLElement | null>
  ctas?: React.RefObject<HTMLElement | null>
  badge?: React.RefObject<HTMLElement | null>
}

export function useHeroTimeline(refs: HeroRefs, delay = 0) {
  const reducedMotion = useReducedMotion()
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!refs.container.current) return

    if (reducedMotion) {
      // Instantly reveal all elements without animation
      const els = [
        refs.container.current,
        refs.headline?.current,
        refs.subline?.current,
        refs.ctas?.current,
        refs.badge?.current,
      ].filter(Boolean) as HTMLElement[]
      gsap.set(els, { opacity: 1, y: 0, clipPath: 'none' })
      return
    }

    const tl = buildHeroTimeline({
      container: refs.container.current,
      headline: refs.headline?.current ?? null,
      subline: refs.subline?.current ?? null,
      ctas: refs.ctas?.current ?? null,
      badge: refs.badge?.current ?? null,
    })

    tlRef.current = tl
    tl.delay(delay).play()

    return () => {
      tl.kill()
      tlRef.current = null
    }
  }, [reducedMotion, delay]) // eslint-disable-line react-hooks/exhaustive-deps

  return tlRef
}
