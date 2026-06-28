'use client'

import { useEffect, useRef, useCallback } from 'react'
import Lenis from 'lenis'

interface UseLenisOptions {
  duration?: number
  easing?: (t: number) => number
  orientation?: 'vertical' | 'horizontal'
  gestureOrientation?: 'vertical' | 'horizontal' | 'both'
  smoothWheel?: boolean
  wheelMultiplier?: number
  touchMultiplier?: number
  infinite?: boolean
  autoRaf?: boolean
}

const DEFAULT_EASING = (t: number) => {
  // power4.out
  return 1 - Math.pow(1 - t, 4)
}

export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafId = useRef<number>(0)

  const {
    duration = 0.8,
    easing = DEFAULT_EASING,
    orientation = 'vertical',
    gestureOrientation = 'vertical',
    smoothWheel = true,
    wheelMultiplier = 1,
    touchMultiplier = 1.5,
    infinite = false,
    autoRaf = true,
  } = options

  useEffect(() => {
    const lenis = new Lenis({
      duration,
      easing,
      orientation,
      gestureOrientation,
      smoothWheel,
      wheelMultiplier,
      touchMultiplier,
      infinite,
      autoRaf,
    })

    lenisRef.current = lenis

    if (autoRaf) {
      function raf(time: number) {
        lenis.raf(time)
        rafId.current = requestAnimationFrame(raf)
      }
      rafId.current = requestAnimationFrame(raf)
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [
    duration,
    easing,
    orientation,
    gestureOrientation,
    smoothWheel,
    wheelMultiplier,
    touchMultiplier,
    infinite,
    autoRaf,
  ])

  const scrollTo = useCallback(
    (target: Parameters<Lenis['scrollTo']>[0], opts?: Parameters<Lenis['scrollTo']>[1]) => {
      lenisRef.current?.scrollTo(target, opts)
    },
    []
  )

  const stop = useCallback(() => {
    lenisRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    lenisRef.current?.start()
  }, [])

  const on = useCallback(
    (event: string, callback: (...args: unknown[]) => void) => {
      lenisRef.current?.on(event, callback)
    },
    []
  )

  const getLenis = useCallback(() => lenisRef.current, [])

  return { scrollTo, stop, start, on, getLenis }
}
