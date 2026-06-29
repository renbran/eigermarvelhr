'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number
  y: number
  opacity: number
  speed: number
  size: number
  drift: number
  reset(w: number): void
  update(h: number): void
  draw(ctx: CanvasRenderingContext2D, gold: boolean): void
}

export interface ParticleHeroProps {
  goldMode?: boolean
  className?: string
}

// ─── Factory ──────────────────────────────────────────────────────────────────
function makeParticle(w: number, h: number, scatter = true): Particle {
  const p: Particle = {
    x: Math.random() * w,
    y: scatter ? Math.random() * h : Math.random() * -120,
    opacity: Math.random() * 0.55 + 0.1,
    speed: Math.random() * 1.2 + 0.4,
    size: Math.random() * 1.4 + 0.3,
    drift: (Math.random() - 0.5) * 0.25,
    reset(width: number) {
      this.x = Math.random() * width
      this.y = -8
      this.opacity = Math.random() * 0.55 + 0.1
      this.speed = Math.random() * 1.2 + 0.4
      this.size = Math.random() * 1.4 + 0.3
      this.drift = (Math.random() - 0.5) * 0.25
    },
    update(height: number) {
      this.y += this.speed
      this.x += this.drift
      if (this.y > height + 10) this.reset(w)
    },
    draw(ctx: CanvasRenderingContext2D, gold: boolean) {
      if (gold) {
        const g = Math.floor(148 + Math.random() * 38)
        ctx.fillStyle = `rgba(212, ${g}, 58, ${this.opacity})`
      } else {
        const b = Math.floor(200 + Math.random() * 55)
        const gr = Math.floor(190 + Math.random() * 50)
        ctx.fillStyle = `rgba(160, ${gr}, ${b}, ${this.opacity})`
      }
      ctx.fillRect(
        Math.floor(this.x),
        Math.floor(this.y),
        this.size,
        this.size * (1 + Math.random() * 1.8)
      )
    },
  }
  return p
}

// ─── Mountain silhouette drawn on canvas ──────────────────────────────────────
function drawMountains(ctx: CanvasRenderingContext2D, w: number, h: number, gold: boolean) {
  const layers = [
    { peaks: [0.1, 0.35, 0.55, 0.78, 1.0], heights: [0.55, 0.35, 0.48, 0.38, 0.6], alpha: 0.18 },
    { peaks: [0.0, 0.25, 0.5, 0.72, 0.92, 1.0], heights: [0.7, 0.45, 0.6, 0.52, 0.65, 0.75], alpha: 0.26 },
    { peaks: [0.0, 0.18, 0.42, 0.65, 0.85, 1.0], heights: [0.8, 0.62, 0.72, 0.68, 0.78, 0.85], alpha: 0.38 },
  ]

  layers.forEach(({ peaks, heights, alpha }) => {
    ctx.beginPath()
    ctx.moveTo(0, h)
    peaks.forEach((px, i) => {
      ctx.lineTo(px * w, h - heights[i] * h * 0.35)
    })
    ctx.lineTo(w, h)
    ctx.closePath()
    if (gold) {
      ctx.fillStyle = `rgba(30, 22, 8, ${alpha})`
    } else {
      ctx.fillStyle = `rgba(8, 12, 28, ${alpha})`
    }
    ctx.fill()
  })
}

// ─── Spotlight beams (canvas) ─────────────────────────────────────────────────
function drawSpotlights(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  gold: boolean,
  tick: number
) {
  const beams = [
    { x: w * 0.25, spread: 0.18, phase: 0 },
    { x: w * 0.5,  spread: 0.22, phase: Math.PI * 0.6 },
    { x: w * 0.75, spread: 0.16, phase: Math.PI * 1.2 },
  ]

  beams.forEach(({ x, spread, phase }) => {
    const sway = Math.sin(tick * 0.0008 + phase) * w * 0.06
    const cx = x + sway
    const grd = ctx.createRadialGradient(cx, 0, 0, cx, h * 0.6, w * spread)

    if (gold) {
      grd.addColorStop(0, 'rgba(212, 148, 58, 0.06)')
      grd.addColorStop(0.5, 'rgba(184, 120, 40, 0.02)')
      grd.addColorStop(1, 'transparent')
    } else {
      grd.addColorStop(0, 'rgba(80, 120, 220, 0.05)')
      grd.addColorStop(0.5, 'rgba(60, 100, 200, 0.02)')
      grd.addColorStop(1, 'transparent')
    }

    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx - w * spread, h)
    ctx.lineTo(cx + w * spread, h)
    ctx.closePath()
    ctx.fill()
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ParticleHero({ goldMode: goldModeProp, className = '' }: ParticleHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [internalGold, setInternalGold] = useState(false)
  const reducedMotion = useReducedMotion()

  // Controlled vs uncontrolled
  const goldMode = goldModeProp !== undefined ? goldModeProp : internalGold

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PARTICLE_COUNT = reducedMotion ? 0 : 90

    let particles: Particle[] = []
    let raf = 0
    let tick = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
        makeParticle(canvas.width, canvas.height, i < PARTICLE_COUNT * 0.7)
      )
    }

    const draw = () => {
      if (!ctx) return
      const { width: w, height: h } = canvas

      // Clear
      ctx.clearRect(0, 0, w, h)

      // Base gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      if (goldMode) {
        bg.addColorStop(0, '#0e0a04')
        bg.addColorStop(0.5, '#100c06')
        bg.addColorStop(1, '#0c0906')
      } else {
        bg.addColorStop(0, '#07080f')
        bg.addColorStop(0.5, '#0a0c18')
        bg.addColorStop(1, '#080a14')
      }
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Spotlights
      drawSpotlights(ctx, w, h, goldMode, tick)

      // Particles
      particles.forEach((p) => {
        p.update(h)
        p.draw(ctx, goldMode)
      })

      // Mountains (foreground silhouette)
      drawMountains(ctx, w, h, goldMode)

      tick++
      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [goldMode, reducedMotion])

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Gold mode: warm radial overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: goldMode ? 1 : 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(184,120,44,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Side accent lines */}
      {[{ left: '10%', delay: '0s' }, { right: '10%', delay: '0.3s' }].map((pos, i) => (
        <div
          key={i}
          className="absolute top-[8%] bottom-[12%] w-px pointer-events-none"
          style={{
            ...pos,
            background: goldMode
              ? 'linear-gradient(to bottom, transparent 0%, rgba(184,120,44,0.25) 40%, rgba(184,120,44,0.25) 60%, transparent 100%)'
              : 'linear-gradient(to bottom, transparent 0%, rgba(80,120,220,0.2) 40%, rgba(80,120,220,0.2) 60%, transparent 100%)',
            animationDelay: pos.delay,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Toggle button (standalone use only — hidden when goldMode is controlled externally) */}
      {goldModeProp === undefined && (
        <button
          onClick={() => setInternalGold((g) => !g)}
          className="absolute top-4 right-4 z-20 text-xs uppercase tracking-widest px-3 py-1.5 rounded border transition-all duration-300"
          style={{
            borderColor: goldMode ? 'rgba(184,120,44,0.5)' : 'rgba(80,120,220,0.4)',
            color: goldMode ? 'rgba(212,168,80,0.9)' : 'rgba(140,170,240,0.8)',
            background: 'transparent',
          }}
        >
          {goldMode ? 'Gold' : 'Standard'}
        </button>
      )}
    </div>
  )
}
