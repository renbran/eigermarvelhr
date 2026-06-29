'use client'

import { type ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfigProvider } from './MotionConfig'
import { LenisProvider } from '@/components/LenisProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

// Compose all providers in the correct render order:
// 1. HelmetProvider  — SEO metadata
// 2. QueryClient    — data fetching
// 3. MotionConfig   — Framer Motion reduced-motion config
// 4. LenisProvider  — smooth scroll + GSAP sync
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MotionConfigProvider>
          <LenisProvider>{children}</LenisProvider>
        </MotionConfigProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
