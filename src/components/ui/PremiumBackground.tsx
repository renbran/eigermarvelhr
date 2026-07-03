import { type ReactNode } from 'react'

type Variant = 'default' | 'subtle' | 'editorial' | 'cinematic'

export interface PremiumBackgroundProps {
  variant?: Variant
  className?: string
}

const VARIANTS: Record<Variant, {
  base: string
  spots: { pos: string; size: string; opacity: number; color: string }[]
  gridOpacity: number
  grainOpacity: number
}> = {
  default: {
    base: 'from-background via-background to-secondary',
    spots: [
      { pos: '15% 8%', size: '60% 45%', opacity: 0.09, color: '184,145,44' },
      { pos: '85% 75%', size: '55% 45%', opacity: 0.07, color: '184,145,44' },
      { pos: '50% 50%', size: '40% 30%', opacity: 0.04, color: '120,90,200' },
    ],
    gridOpacity: 0.04,
    grainOpacity: 0.04,
  },
  subtle: {
    base: 'from-background via-background to-secondary',
    spots: [
      { pos: '50% 0%', size: '70% 35%', opacity: 0.06, color: '184,145,44' },
    ],
    gridOpacity: 0.025,
    grainOpacity: 0.03,
  },
  editorial: {
    base: 'from-background to-secondary',
    spots: [
      { pos: '20% 15%', size: '55% 40%', opacity: 0.12, color: '184,145,44' },
      { pos: '80% 60%', size: '50% 45%', opacity: 0.09, color: '184,145,44' },
      { pos: '50% 95%', size: '60% 30%', opacity: 0.05, color: '120,90,200' },
    ],
    gridOpacity: 0.06,
    grainOpacity: 0.05,
  },
  cinematic: {
    base: 'from-[#0a0a0f] via-background to-[#0a0a0f]',
    spots: [
      { pos: '50% 30%', size: '80% 50%', opacity: 0.10, color: '184,145,44' },
      { pos: '20% 80%', size: '40% 35%', opacity: 0.06, color: '60,80,180' },
    ],
    gridOpacity: 0.03,
    grainOpacity: 0.06,
  },
}

export function PremiumBackground({
  variant = 'default',
  className = '',
}: PremiumBackgroundProps) {
  const v = VARIANTS[variant]

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${v.base}`} />

      {v.spots.map((spot, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse ${spot.size} at ${spot.pos}, rgba(${spot.color},${spot.opacity}) 0%, transparent 60%)`,
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: v.gridOpacity,
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 25%, transparent 85%)',
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: v.grainOpacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="premiumGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#premiumGrain)" />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 70%, rgba(7,8,15,0.5) 100%)',
        }}
      />
    </div>
  )
}

export function PageShell({
  children,
  variant = 'default',
  className = '',
}: {
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      <PremiumBackground variant={variant} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}