'use client'

import { useEffect, useRef } from 'react'

interface MousePosition {
  x: number  // normalized -1 → 1
  y: number
}

// Returns a ref (not state) to avoid re-renders on every mouse move.
// Read .current inside rAF or event handlers.
export function useMousePosition(): React.MutableRefObject<MousePosition> {
  const pos = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      pos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      }
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return pos
}
