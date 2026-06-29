'use client'

import { type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function MotionConfigProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()

  return (
    <MotionConfig
      reducedMotion={reducedMotion ? 'always' : 'never'}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionConfig>
  )
}
