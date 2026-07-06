'use client'

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useRef } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

const STORAGE_KEY = 'eiger-marvel-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [curtainTheme, setCurtainTheme] = useState<Theme | null>(null)
  const prevTheme = useRef<Theme>(theme)

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    if (t === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }
    localStorage.setItem(STORAGE_KEY, t)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setCurtainTheme(next)
  }, [theme])

  const handleCurtainComplete = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    setCurtainTheme(null)
  }, [applyTheme])

  useEffect(() => {
    applyTheme(theme)
  }, [])

  useEffect(() => {
    prevTheme.current = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: (t) => { setThemeState(t); applyTheme(t) } }}>
      {children}
      {curtainTheme && (
        <CurtainOverlay
          prevTheme={prevTheme.current}
          nextTheme={curtainTheme}
          onComplete={handleCurtainComplete}
        />
      )}
    </ThemeContext.Provider>
  )
}

const GOLD_LIGHT = '#D4A84B'
const GOLD_DARK = '#B8912C'

function CurtainOverlay({
  prevTheme,
  nextTheme,
  onComplete,
}: {
  prevTheme: Theme
  nextTheme: Theme
  onComplete: (next: Theme) => void
}) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const seamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const left = leftRef.current
    const right = rightRef.current
    const seam = seamRef.current
    if (!left || !right) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    async function animate() {
      const root = document.documentElement
      if (nextTheme === 'light') {
        root.setAttribute('data-theme', 'light')
      } else {
        root.removeAttribute('data-theme')
      }

      if (prefersReduced) {
        onComplete(nextTheme)
        return
      }

      const gsapModule = await import('gsap')
      const gsap = gsapModule.default

      gsap.set([left, right], { scaleX: 0 })
      gsap.set(left, { transformOrigin: 'left center' })
      gsap.set(right, { transformOrigin: 'right center' })
      gsap.set(seam, { opacity: 0, scaleX: 0 })

      const closePhase = gsap.timeline({
        onComplete: () => {
          const openPhase = gsap.timeline({
            onComplete: () => onComplete(nextTheme),
          })
          openPhase
            .to(seam, { opacity: 0, scaleX: 0, duration: 0.1 })
            .to(left, { scaleX: 0, duration: 0.7, ease: 'power3.inOut' }, 0)
            .to(right, { scaleX: 0, duration: 0.7, ease: 'power3.inOut' }, 0)
        },
      })

      closePhase
        .to(left, { scaleX: 1, duration: 0.65, ease: 'power3.inOut' }, 0)
        .to(right, { scaleX: 1, duration: 0.65, ease: 'power3.inOut' }, 0)
        .to(seam, { opacity: 1, scaleX: 1, duration: 0.25, ease: 'back.out(2)' }, 0.45)
        .to(seam, {
          boxShadow: `0 0 30px ${GOLD_LIGHT}, 0 0 60px rgba(212,168,75,0.3)`,
          duration: 0.3,
          ease: 'sine.inOut',
        }, 0.6)
    }

    animate()
  }, [])

  const panelStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    [side]: 0,
    width: '50%',
    height: '100%',
    zIndex: 999999,
    pointerEvents: 'none',
    transform: 'scaleX(0)',
    transformOrigin: side === 'left' ? 'left center' : 'right center',
    background: nextTheme === 'dark'
      ? `linear-gradient(${side === 'left' ? '135deg' : '225deg'}, #0A0A0E 0%, #07080F 100%)`
      : `linear-gradient(${side === 'left' ? '135deg' : '225deg'}, #F0F0F3 0%, #F8F9FA 100%)`,
    overflow: 'hidden',
  })

  const darkBg = 'linear-gradient(135deg, #0A0A0E 0%, #07080F 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)'
  const lightBg = 'linear-gradient(135deg, #F0F0F3 0%, #F8F9FA 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)'

  const foldStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.04) 20px, rgba(0,0,0,0.04) 21px)',
  }

  return (
    <>
      <div ref={leftRef} style={{ ...panelStyle('left'), backgroundImage: nextTheme === 'dark' ? darkBg : lightBg }}>
        <div style={foldStyle} />
      </div>
      <div ref={rightRef} style={{ ...panelStyle('right'), backgroundImage: nextTheme === 'dark' ? darkBg : lightBg }}>
        <div style={foldStyle} />
      </div>
      <div
        ref={seamRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          width: 3,
          height: '100%',
          zIndex: 1000000,
          pointerEvents: 'none',
          transform: 'translateX(-50%) scaleX(0)',
          background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD_DARK}, ${GOLD_LIGHT})`,
          boxShadow: `0 0 20px ${GOLD_LIGHT}`,
          opacity: 0,
        }}
      />
    </>
  )
}
