'use client'

import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from './useReducedMotion'

interface UseSectionPinOptions {
  start?: string
  end?: string
  pinSpacing?: boolean
  anticipatePin?: number
  onUpdate?: (progress: number) => void
}

export function useSectionPin<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  {
    start = 'top top',
    end = '+=300%',
    pinSpacing = true,
    anticipatePin = 1,
    onUpdate,
  }: UseSectionPinOptions = {}
) {
  const stRef = useRef<ScrollTrigger | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reducedMotion) return
    const el = ref.current

    stRef.current = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      pin: true,
      pinSpacing,
      anticipatePin,
      onUpdate: onUpdate ? (self) => onUpdate(self.progress) : undefined,
    })

    return () => {
      stRef.current?.kill()
      stRef.current = null
    }
  }, [ref, start, end, pinSpacing, anticipatePin, onUpdate, reducedMotion])

  return stRef
}
