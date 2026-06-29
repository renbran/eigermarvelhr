import { gsap, ScrollTrigger } from '@/lib/gsap'
import { easings } from './easings'
import { durations } from './durations'

interface HeroTimelineOptions {
  container: HTMLElement
  headline?: HTMLElement | null
  subline?: HTMLElement | null
  ctas?: HTMLElement | null
  badge?: HTMLElement | null
}

// Builds a cinematic entrance timeline for the hero section
export function buildHeroTimeline(els: HeroTimelineOptions): gsap.core.Timeline {
  const { container, headline, subline, ctas, badge } = els
  const tl = gsap.timeline({ paused: true })

  // Background fades in first
  tl.fromTo(
    container,
    { opacity: 0 },
    { opacity: 1, duration: durations.cinematic, ease: easings.cinematic },
    0
  )

  // Badge / overline label: clip-path left→right
  if (badge) {
    tl.fromTo(
      badge,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
      { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: durations.slow, ease: easings.entrance },
      0.3
    )
  }

  // Headline: fade-up + slight Y
  if (headline) {
    tl.fromTo(
      headline,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: durations.emphasis, ease: easings.textReveal },
      0.5
    )
  }

  // Subline
  if (subline) {
    tl.fromTo(
      subline,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: durations.emphasis, ease: easings.entrance },
      0.85
    )
  }

  // CTAs stagger
  if (ctas) {
    const buttons = Array.from(ctas.children) as HTMLElement[]
    tl.fromTo(
      buttons,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: durations.standard,
        ease: easings.entrance,
        stagger: 0.1,
      },
      1.1
    )
  }

  return tl
}

// Builds a stagger entrance for a grid of cards
export function buildCardStaggerTimeline(
  cards: HTMLElement[],
  trigger: Element
): gsap.core.Timeline {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top 80%',
      once: true,
    },
  })

  tl.fromTo(
    cards,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: durations.standard,
      ease: easings.entrance,
      stagger: 0.08,
    }
  )

  return tl
}

// Clip-path reveal for images (parent must have overflow:hidden)
export function buildImageReveal(imageEl: HTMLElement, trigger: Element): gsap.core.Tween {
  return gsap.fromTo(
    imageEl,
    { clipPath: 'inset(0 100% 0 0)', scale: 1.1 },
    {
      clipPath: 'inset(0 0% 0 0)',
      scale: 1,
      duration: durations.slow,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        once: true,
      },
    }
  )
}

// Pinned step-by-step section reveal
export function buildPinnedSteps(
  section: HTMLElement,
  steps: HTMLElement[]
): ScrollTrigger {
  const totalScroll = `${steps.length * 100}%`

  return ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: totalScroll,
    pin: true,
    pinSpacing: true,
    onUpdate: (self) => {
      const progress = self.progress * steps.length
      steps.forEach((step, i) => {
        const active = progress >= i && progress < i + 1
        const past = progress >= i + 1
        gsap.to(step, {
          opacity: active ? 1 : past ? 0.4 : 0.15,
          y: active ? 0 : past ? -10 : 20,
          duration: 0.3,
          ease: easings.entrance,
        })
      })
    },
  })
}
