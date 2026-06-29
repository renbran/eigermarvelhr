'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollProgressOptions {
  target?: React.RefObject<HTMLElement | null>  // defaults to window scroll
  onUpdate?: (progress: number) => void
}

// Returns a ref with 0–1 progress. Optionally calls onUpdate on each frame.
// Use the ref when you need per-frame access without re-renders.
export function useScrollProgress(options: UseScrollProgressOptions = {}): {
  progress: React.MutableRefObject<number>
  progressState: number
} {
  const { target, onUpdate } = options
  const progress = useRef(0)
  const [progressState, setProgressState] = useState(0)

  useEffect(() => {
    const getProgress = () => {
      if (target?.current) {
        const el = target.current
        const rect = el.getBoundingClientRect()
        const total = el.offsetHeight + window.innerHeight
        const current = window.innerHeight - rect.top
        return Math.max(0, Math.min(1, current / total))
      }
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      return scrollable > 0 ? window.scrollY / scrollable : 0
    }

    const handler = () => {
      const p = getProgress()
      progress.current = p
      setProgressState(p)
      onUpdate?.(p)
    }

    window.addEventListener('scroll', handler, { passive: true })
    handler()

    return () => window.removeEventListener('scroll', handler)
  }, [target, onUpdate])

  return { progress, progressState }
}
