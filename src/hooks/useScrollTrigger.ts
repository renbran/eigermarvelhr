'use client'

import { useEffect, useRef, useId } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseScrollTriggerOptions {
  trigger?: string | Element | null
  start?: string
  end?: string
  scrub?: boolean | number
  markers?: boolean
  pin?: boolean | string
  pinSpacing?: boolean
  anticipatePin?: number
  toggleActions?: string
  once?: boolean
  onEnter?: () => void
  onLeave?: () => void
  onEnterBack?: () => void
  onLeaveBack?: () => void
  onToggle?: (self: ScrollTrigger) => void
  onUpdate?: (self: ScrollTrigger) => void
  horizontal?: boolean
  invalidateOnRefresh?: boolean
  disabled?: boolean
}

export function useScrollTrigger(options: UseScrollTriggerOptions) {
  const stRef = useRef<ScrollTrigger | null>(null)
  const id = useId()

  const {
    trigger,
    start = 'top 85%',
    end,
    scrub = false,
    markers = false,
    pin = false,
    pinSpacing = true,
    anticipatePin = 0,
    toggleActions = 'play none none none',
    once = false,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
    onToggle,
    onUpdate,
    horizontal = false,
    invalidateOnRefresh = false,
    disabled = false,
  } = options

  useEffect(() => {
    if (disabled) return

    const st = ScrollTrigger.create({
      id,
      trigger: trigger || undefined,
      start,
      ...(end ? { end } : {}),
      scrub,
      markers,
      pin: pin === true ? true : pin || undefined,
      pinSpacing,
      anticipatePin,
      toggleActions,
      once,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
      onToggle,
      onUpdate,
      horizontal,
      invalidateOnRefresh,
    })

    stRef.current = st

    return () => {
      st.kill()
      stRef.current = null
    }
  }, [disabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return stRef
}
