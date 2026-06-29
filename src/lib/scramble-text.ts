/**
 * Free alternative to GSAP Club's ScrambleTextPlugin.
 * Randomly cycles through characters before settling on the final text.
 */
import { gsap } from '@/lib/gsap'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

interface ScrambleOptions {
  chars?: string       // character pool
  duration?: number
  delay?: number
  ease?: string
  onComplete?: () => void
}

export function scrambleText(
  el: HTMLElement,
  finalText: string,
  {
    chars = CHARSET,
    duration = 1.2,
    delay = 0,
    ease = 'none',
    onComplete,
  }: ScrambleOptions = {}
): gsap.core.Tween {
  const len = finalText.length
  const startTime = { t: 0 }

  return gsap.to(startTime, {
    t: 1,
    duration,
    delay,
    ease,
    onUpdate() {
      const progress = startTime.t
      const resolvedCount = Math.floor(progress * len)
      let result = ''
      for (let i = 0; i < len; i++) {
        if (i < resolvedCount) {
          result += finalText[i]
        } else if (finalText[i] === ' ') {
          result += ' '
        } else {
          result += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      el.textContent = result
    },
    onComplete() {
      el.textContent = finalText
      onComplete?.()
    },
  })
}
