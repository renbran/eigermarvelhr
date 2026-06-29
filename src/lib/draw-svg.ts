/**
 * Free alternative to GSAP Club's DrawSVGPlugin.
 * Uses stroke-dashoffset — the same underlying technique.
 */
import { gsap } from '@/lib/gsap'

type DrawFrom = number | `${number}%`
type DrawRange = [DrawFrom, DrawFrom] | DrawFrom

function resolveLength(val: DrawFrom, totalLength: number): number {
  if (typeof val === 'string') return (parseFloat(val) / 100) * totalLength
  return val
}

/**
 * Animates an SVG path to "draw" itself from start to end.
 *
 * @example
 * drawSVG(pathEl)                        // draws 0% → 100%
 * drawSVG(pathEl, '50% 100%', 1.5)       // draws 50% → 100% in 1.5s
 * drawSVG(pathEl, [0.2, 1.0], 1, true)   // reverses (erases)
 */
export function drawSVG(
  path: SVGPathElement | SVGCircleElement | SVGEllipseElement,
  range: DrawRange = [0, 1],
  duration = 1,
  ease = 'power2.inOut',
  reverse = false
): gsap.core.Tween {
  const length = (path as SVGPathElement).getTotalLength?.() ?? 0

  let fromOffset: number
  let toOffset: number

  if (Array.isArray(range)) {
    const [from, to] = range
    fromOffset = length - resolveLength(from, length)
    toOffset = length - resolveLength(to, length)
  } else {
    fromOffset = length
    toOffset = length - resolveLength(range, length)
  }

  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: reverse ? toOffset : fromOffset,
  })

  return gsap.to(path, {
    strokeDashoffset: reverse ? fromOffset : toOffset,
    duration,
    ease,
  })
}

/**
 * Immediately set a path to a drawn state (no animation).
 */
export function setDrawSVG(
  path: SVGPathElement,
  progress: number /* 0–1 */
): void {
  const length = path.getTotalLength()
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length * (1 - progress),
  })
}
