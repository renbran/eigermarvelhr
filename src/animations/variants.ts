import type { Variants } from 'framer-motion'
import { easings } from './easings'
import { durations } from './durations'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.standard, ease: easings.entranceFM },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.standard, ease: easings.entranceFM },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.emphasis, ease: easings.entranceFM },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.emphasis, ease: easings.entranceFM },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.standard, ease: easings.entranceFM },
  },
}

// Parent container — staggers children
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Child item used inside staggerContainer
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.standard, ease: easings.entranceFM },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.fast, ease: easings.entranceFM },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: durations.fast, ease: easings.exitFM },
  },
}

// Glass card hover state
export const cardHover = {
  scale: 1.02,
  transition: { duration: durations.micro, ease: easings.entranceFM },
}
