'use client'

import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface LenisContextValue {
  lenis: Lenis | null
  scrollTo: (target: Parameters<Lenis['scrollTo']>[0], opts?: Parameters<Lenis['scrollTo']>[1]) => void
  stop: () => void
  start: () => void
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
})

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    // Skip Lenis entirely when the user prefers reduced motion
    if (reducedMotion) return

    const lenis = new Lenis({
      duration: 0.8,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis

    // GSAP ticker drives the RAF loop — keeps ScrollTrigger in sync
    const onScroll = () => ScrollTrigger.update()
    const ticker = (time: number) => lenis.raf(time * 1000)

    lenis.on('scroll', onScroll)
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger on resize so pinned sections recalculate
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(ticker)
      window.removeEventListener('resize', onResize)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  const scrollTo = useCallback(
    (target: Parameters<Lenis['scrollTo']>[0], opts?: Parameters<Lenis['scrollTo']>[1]) => {
      lenisRef.current?.scrollTo(target, opts)
    },
    []
  )

  const stop = useCallback(() => lenisRef.current?.stop(), [])
  const start = useCallback(() => lenisRef.current?.start(), [])

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollTo, stop, start }}>
      {children}
    </LenisContext.Provider>
  )
}

export function useLenisContext() {
  return useContext(LenisContext)
}
