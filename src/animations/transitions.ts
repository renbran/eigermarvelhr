import type { Transition } from 'framer-motion'
import { durations } from './durations'
import { easings } from './easings'

export const defaultTransition: Transition = {
  duration: durations.standard,
  ease: easings.entranceFM,
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: easings.spring.stiffness,
  damping: easings.spring.damping,
}

export const cinematicTransition: Transition = {
  duration: durations.cinematic,
  ease: easings.cinematicFM,
}

export const pageEnterTransition: Transition = {
  duration: durations.fast,
  ease: easings.entranceFM,
  delay: 0.05,
}

export const pageExitTransition: Transition = {
  duration: durations.fast,
  ease: easings.exitFM,
}
