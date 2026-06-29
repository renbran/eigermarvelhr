import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import { Flip } from 'gsap/Flip'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, Observer, Flip, ScrollToPlugin, MotionPathPlugin, TextPlugin)

// Returns a cleanup function to remove the ticker + listener
export function syncGsapWithLenis(lenis: Lenis): () => void {
  const onScroll = () => ScrollTrigger.update()
  const ticker = (time: number) => lenis.raf(time * 1000)

  lenis.on('scroll', onScroll)
  gsap.ticker.add(ticker)
  gsap.ticker.lagSmoothing(0)

  return () => {
    lenis.off('scroll', onScroll)
    gsap.ticker.remove(ticker)
  }
}

export { gsap, ScrollTrigger, Observer, Flip }
