'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface LoadingScreenProps {
  minDuration?: number
  brandName?: string
  onComplete?: () => void
}

export function LoadingScreen({
  minDuration = 2000,
  brandName = 'EIGER MARVEL',
  onComplete,
}: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const overlay = overlayRef.current
    const curtain = curtainRef.current
    const brand = brandRef.current
    if (!overlay || !curtain || !brand) return

    const ctx = gsap.context(() => {
      // Timeline: brand pulse → curtain drop → overlay slides up
      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false)
          onComplete?.()
        },
      })

      tl.to(brand, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      })
        .to(brand, {
          opacity: 0.3,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        })
        .to(
          curtain,
          {
            scaleY: 0,
            duration: 0.8,
            ease: 'power4.inOut',
            transformOrigin: 'top center',
          },
          '+=0.2'
        )
        .to(
          overlay,
          {
            y: '-100%',
            duration: 0.6,
            ease: 'power3.inOut',
          },
          '-=0.3'
        )
    })

    return () => ctx.revert()
  }, [minDuration, onComplete])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#070707',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Gold curtain overlay */}
      <div
        ref={curtainRef}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, oklch(0.82 0.12 85 / 0.6), oklch(0.62 0.08 85 / 0.3))',
          transformOrigin: 'bottom center',
          transform: 'scaleY(1)',
        }}
      />

      {/* Brand mark */}
      <div
        ref={brandRef}
        style={{
          position: 'relative',
          zIndex: 2,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          fontWeight: 700,
          color: 'oklch(0.82 0.12 85)',
          letterSpacing: '0.05em',
          opacity: 0,
        }}
      >
        {brandName}
      </div>
    </div>
  )
}
