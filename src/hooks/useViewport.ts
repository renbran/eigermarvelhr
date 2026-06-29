'use client'

import { useEffect, useState } from 'react'

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

interface Viewport {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  is: (bp: Breakpoint) => boolean
  below: (bp: Breakpoint) => boolean
}

export function useViewport(): Viewport {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  const { width, height } = size

  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    is: (bp) => width >= BREAKPOINTS[bp],
    below: (bp) => width < BREAKPOINTS[bp],
  }
}
