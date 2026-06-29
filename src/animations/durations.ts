// All values in seconds (GSAP convention)
export const durations = {
  instant: 0.1,    // State feedback (button press, toggle)
  micro: 0.15,     // Hover states
  fast: 0.25,      // UI transitions
  standard: 0.4,   // Component entrance
  emphasis: 0.6,   // Section title reveals
  slow: 0.9,       // Hero elements, image reveals
  cinematic: 1.4,  // Full-screen transitions
  epic: 2.0,       // Opening curtain / loading reveal
} as const

export type DurationKey = keyof typeof durations
