'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useLenis } from '@/hooks/useLenis'
import type Lenis from 'lenis'

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
  const { scrollTo, stop, start, getLenis } = useLenis({
    duration: 0.8,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  })

  return (
    <LenisContext.Provider value={{ lenis: getLenis(), scrollTo, stop, start }}>
      {children}
    </LenisContext.Provider>
  )
}

export function useLenisContext() {
  return useContext(LenisContext)
}
