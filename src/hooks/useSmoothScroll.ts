'use client'

import { useCallback } from 'react'
import { useLenisContext } from '@/components/LenisProvider'

interface ScrollToOptions {
  offset?: number
  duration?: number
  immediate?: boolean
}

export function useSmoothScroll() {
  const { scrollTo, stop, start, lenis } = useLenisContext()

  const scrollToElement = useCallback(
    (target: string | HTMLElement, options: ScrollToOptions = {}) => {
      const { offset = 0, duration = 0.8, immediate = false } = options
      scrollTo(target, { offset, duration, immediate })
    },
    [scrollTo]
  )

  const scrollToTop = useCallback(
    (options: ScrollToOptions = {}) => scrollToElement(0, options),
    [scrollToElement]
  )

  const scrollToAnchor = useCallback(
    (hash: string, options: ScrollToOptions = {}) => {
      const el = document.querySelector(hash)
      if (el) scrollToElement(el as HTMLElement, options)
    },
    [scrollToElement]
  )

  return { scrollTo: scrollToElement, scrollToTop, scrollToAnchor, stop, start, lenis }
}
