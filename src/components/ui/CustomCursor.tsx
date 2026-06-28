'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const mouseRef = useRef({ x: 0, y: 0 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseOver = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest(
      'a, button, [data-cursor="magnetic"], [data-cursor="hover"]'
    )
    if (!cursorRef.current) return
    if (target) {
      gsap.to(cursorRef.current, {
        scale: 1.8,
        borderColor: 'oklch(0.87 0.13 85)',
        backgroundColor: 'oklch(0.87 0.13 85 / 0.08)',
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      gsap.to(cursorRef.current, {
        scale: 1,
        borderColor: 'oklch(0.72 0.09 85)',
        backgroundColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [])

  useEffect(() => {
    // Only on non-touch devices
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return

    document.body.style.cursor = 'none'
    document.documentElement.style.cursor = 'none'

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)

    // RAF loop — smooth interpolation
    const raf = () => {
      const cursor = cursorRef.current
      const follower = followerRef.current
      if (!cursor) return

      posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.15
      posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.15

      gsap.set(cursor, {
        x: mouseRef.current.x,
        y: mouseRef.current.y,
      })

      if (follower) {
        gsap.set(follower, {
          x: posRef.current.x,
          y: posRef.current.y,
        })
      }

      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      document.body.style.cursor = ''
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [onMouseMove, onMouseOver])

  return (
    <>
      {/* Main cursor — follows mouse exactly */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: 'oklch(0.82 0.12 85)',
          pointerEvents: 'none',
          zIndex: 99990,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      />
      {/* Follower ring — lags behind */}
      <div
        ref={followerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid oklch(0.72 0.09 85 / 0.6)',
          pointerEvents: 'none',
          zIndex: 99989,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s, height 0.3s, border-color 0.3s',
        }}
      />
    </>
  )
}
