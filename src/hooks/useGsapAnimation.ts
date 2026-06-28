'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseGsapAnimationOptions {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  scrollTrigger?: boolean | gsap.plugins.ScrollTriggerInstanceVars
  timeline?: boolean
  stages?: gsap.TweenVars[]
  disabled?: boolean
}

export function useGsapAnimation<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options: UseGsapAnimationOptions
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const { from: fromVars, to: toVars, scrollTrigger: st, timeline, stages, disabled } = options

  useEffect(() => {
    if (disabled || !ref.current) return

    const el = ref.current
    const ctx = gsap.context(() => {
      if (timeline && stages) {
        // Build a timeline from stages
        const tl = gsap.timeline(
          st
            ? {
                scrollTrigger: typeof st === 'boolean' ? { trigger: el } : st,
              }
            : undefined
        )
        stages.forEach((stage) => {
          tl.to(el, stage)
        })
        timelineRef.current = tl
      } else if (fromVars && toVars) {
        // fromTo animation
        tweenRef.current = gsap.fromTo(
          el,
          fromVars,
          st
            ? {
                ...toVars,
                scrollTrigger: typeof st === 'boolean' ? { trigger: el } : st,
              }
            : toVars
        )
      } else if (toVars) {
        // to animation
        tweenRef.current = gsap.to(
          el,
          st
            ? {
                ...toVars,
                scrollTrigger: typeof st === 'boolean' ? { trigger: el } : st,
              }
            : toVars
        )
      } else if (fromVars) {
        // from animation
        tweenRef.current = gsap.from(
          el,
          st
            ? {
                ...fromVars,
                scrollTrigger: typeof st === 'boolean' ? { trigger: el } : st,
              }
            : fromVars
        )
      }
    }, ref)

    return () => {
      ctx.revert()
      timelineRef.current = null
      tweenRef.current = null
    }
  }, [ref, disabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { timeline: timelineRef.current, tween: tweenRef.current }
}
