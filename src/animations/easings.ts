// GSAP string easings and Framer Motion cubic-bezier arrays
export const easings = {
  // Entrances — fast start, decelerate
  entrance: 'power3.out' as const,
  entranceFM: [0.16, 1, 0.3, 1] as [number, number, number, number],

  // Exits — slow start, accelerate
  exit: 'power2.in' as const,
  exitFM: [0.7, 0, 0.84, 0] as [number, number, number, number],

  // Spring — magnetic, hover, playful
  spring: { stiffness: 400, damping: 28 },

  // Text reveal — aggressive deceleration for character stagger
  textReveal: 'power4.out' as const,

  // Cinematic — balanced in/out for hero transitions
  cinematic: 'power2.inOut' as const,

  // Micro — instant state feedback
  micro: 'power1.out' as const,

  // Elastic — spring-back after magnetic release
  elastic: 'elastic.out(1, 0.5)' as const,
} as const
