import { gsap } from '@/lib/gsap'
import { easings } from './easings'
import { durations } from './durations'

// Fade-up entrance (attach to a ScrollTrigger or call directly)
export function fadeUpEffect(el: HTMLElement, delay = 0): gsap.core.Tween {
  return gsap.fromTo(
    el,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: durations.standard, ease: easings.entrance, delay }
  )
}

// Clip-path text underline reveal
export function underlineReveal(el: HTMLElement): gsap.core.Tween {
  return gsap.fromTo(
    el,
    { backgroundSize: '0% 2px' },
    { backgroundSize: '100% 2px', duration: durations.standard, ease: easings.entrance }
  )
}

// Count-up number animation (pure GSAP, not react-countup)
export function countUpEffect(el: HTMLElement, target: number, duration = 2): gsap.core.Tween {
  const obj = { val: 0 }
  return gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toString()
    },
  })
}

// Horizontal scroll marquee (GPU-accelerated, no layout shift)
export function infiniteMarquee(track: HTMLElement, speed = 1): gsap.core.Tween {
  const w = track.scrollWidth / 2
  return gsap.fromTo(
    track,
    { x: 0 },
    {
      x: -w,
      duration: w / (80 * speed),
      ease: 'none',
      repeat: -1,
    }
  )
}

// Glow pulse on an element (box-shadow)
export function glowPulse(el: HTMLElement, color = 'rgba(37, 99, 235, 0.4)'): gsap.core.Tween {
  return gsap.to(el, {
    boxShadow: `0 0 40px 12px ${color}`,
    duration: 1.5,
    yoyo: true,
    repeat: -1,
    ease: 'power1.inOut',
  })
}

// Ambient gradient shift (for mesh gradient backgrounds)
export function ambientGradient(el: HTMLElement): gsap.core.Tween {
  return gsap.to(el, {
    backgroundPosition: '100% 50%',
    duration: 8,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  })
}
