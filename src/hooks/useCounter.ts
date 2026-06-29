'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface UseCounterOptions {
  start?: number
  end: number
  duration?: number
  decimals?: number
  separator?: string
  prefix?: string
  suffix?: string
  onStart?: () => void
  onEnd?: () => void
}

export function useCounter({
  start = 0,
  end,
  duration = 2,
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  onStart,
  onEnd,
}: UseCounterOptions) {
  const [value, setValue] = useState(start)
  const [isRunning, setIsRunning] = useState(false)
  const reducedMotion = useReducedMotion()
  const rafRef = useRef<number>(0)

  const format = (n: number) => {
    const fixed = n.toFixed(decimals)
    const [int, dec] = fixed.split('.')
    const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return `${prefix}${dec !== undefined ? `${formatted}.${dec}` : formatted}${suffix}`
  }

  const startCount = () => {
    if (isRunning) return
    setIsRunning(true)
    onStart?.()

    if (reducedMotion) {
      setValue(end)
      setIsRunning(false)
      onEnd?.()
      return
    }

    const startTime = performance.now()
    const range = end - start

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      // power2.out easing
      const eased = 1 - Math.pow(1 - progress, 2)
      setValue(start + range * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(end)
        setIsRunning(false)
        onEnd?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { value, formatted: format(value), start: startCount, isRunning }
}
