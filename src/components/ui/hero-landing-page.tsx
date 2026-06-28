'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, Variants, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, Sparkles, Star, Shield, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

// ─── Gold Color Tokens ───────────────────────────────────────────────
const GOLD = {
  light: 'oklch(0.92 0.15 85)',
  base: 'oklch(0.82 0.12 85)',
  dark: 'oklch(0.72 0.09 85)',
  deep: 'oklch(0.62 0.08 85)',
  glow: 'rgba(214, 184, 92, 0.4)',
  glowStrong: 'rgba(214, 184, 92, 0.7)',
}

// ─── Animation Variants ──────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: 90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
}

const statItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3 + i * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

interface StatItem {
  value: number
  suffix: string
  label: string
  icon: React.ReactNode
}

interface HeroLandingPageProps {
  title?: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  secondaryCtaLabel?: string
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
  stats?: StatItem[]
}

const defaultStats: StatItem[] = [
  { value: 40, suffix: '+', label: 'Industries Served', icon: <Shield className="w-5 h-5" /> },
  { value: 3000, suffix: '+', label: 'Professionals Placed', icon: <Users className="w-5 h-5" /> },
  { value: 24, suffix: 'h', label: 'Average Time-to-Hire', icon: <Zap className="w-5 h-5" /> },
  { value: 98, suffix: '%', label: 'Client Satisfaction', icon: <Star className="w-5 h-5" /> },
]

function AnimatedStatCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          if (hasAnimated.current) return
          hasAnimated.current = true
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: value,
              duration: 2,
              ease: 'power2.out',
              snap: { textContent: 1 },
              onUpdate: () => {
                const current = parseFloat(el.textContent || '0')
                // Format with commas for large numbers
                el.textContent = current >= 1000
                  ? Math.round(current).toLocaleString()
                  : Math.round(current).toString()
              },
            }
          )
        },
      })
    })

    return () => ctx.revert()
  }, [value])

  return (
    <span className="tabular-nums">
      <span ref={ref}>0</span>
      {suffix}
    </span>
  )
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${GOLD.glowStrong}, transparent 70%)`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${GOLD.glow}, transparent 70%)`,
        }}
        animate={{
          y: [0, 20, 0],
          x: [0, -15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full opacity-5"
        style={{
          background: `radial-gradient(circle, ${GOLD.glowStrong}, transparent 60%)`,
        }}
        animate={{
          y: [0, 25, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}

export function HeroLandingPage({
  title = 'Accelerate Your',
  subtitle = 'Talent Acquisition',
  description = 'AI-powered recruitment connecting exceptional talent with leading UAE companies. Gold-standard placement in hours, not months.',
  ctaLabel = 'Explore Opportunities',
  secondaryCtaLabel = 'Hire Top Talent',
  onCtaClick,
  onSecondaryCtaClick,
  stats = defaultStats,
}: HeroLandingPageProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })
  const [mobileOpen, setMobileOpen] = useState(false)
  const titleWords = [...title, ' ', ...subtitle].join('').split(' ')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // GSAP parallax effect on video overlay
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => {
          gsap.set(section.querySelector('.hero-bg-parallax'), {
            y: self.progress * 100,
          })
        },
      })

      // Shimmer line animation on the gold divider
      ScrollTrigger.create({
        trigger: section.querySelector('.gold-divider'),
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            section.querySelector('.gold-divider-inner'),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.5, ease: 'power3.out' }
          )
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* Background layer */}
      <div className="absolute inset-0 hero-bg-parallax">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0a] to-[#0a0a0a]" />

        {/* Gold vignette overlays */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-radial from-[oklch(0.82_0.12_85/0.08)] via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-[oklch(0.72_0.09_85/0.06)] via-transparent to-transparent" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(214, 184, 92, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(214, 184, 92, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <FloatingOrbs />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center pt-32 pb-20">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              {/* Gold badge */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-[oklch(0.82_0.12_85/0.3)] bg-[oklch(0.82_0.12_85/0.08)] text-[oklch(0.87_0.13_85)] backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  UAE&apos;s Premium Recruitment Platform
                </span>
              </motion.div>

              {/* Animated title with gold gradient */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[-3px] leading-[1.05] mb-6"
              >
                <span>{title} </span>
                <span className="gradient-gold-shine inline-block">{subtitle}</span>
              </motion.h1>

              {/* Staggered word animation for subtitle */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-[#b8b8b8] max-w-2xl mb-10 leading-relaxed font-light"
              >
                {description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <Button
                  size="lg"
                  onClick={onCtaClick}
                  className="group relative overflow-hidden bg-gradient-to-r from-[oklch(0.82_0.12_85)] via-[oklch(0.87_0.13_85)] to-[oklch(0.82_0.12_85)] text-black font-bold text-base px-8 py-6 h-auto rounded-lg shadow-[0_0_25px_rgba(214,184,92,0.3)] hover:shadow-[0_0_40px_rgba(214,184,92,0.5)] transition-all duration-300 hover:scale-105 border-none"
                >
                  {/* Shine sweep */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {ctaLabel}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={onSecondaryCtaClick}
                  className="border-[oklch(0.82_0.12_85/0.5)] bg-transparent text-white hover:bg-[oklch(0.82_0.12_85/0.1)] hover:border-[oklch(0.87_0.13_85)] font-bold text-base px-8 py-6 h-auto rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {secondaryCtaLabel}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Gold shimmer divider */}
        <div className="gold-divider relative px-6 sm:px-10 lg:px-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="gold-divider-inner h-px w-full origin-left scale-x-0"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${GOLD.light} 20%, ${GOLD.base} 50%, ${GOLD.light} 80%, transparent 100%)`,
              }}
            />
          </div>
        </div>

        {/* Stats section - GSAP scroll animation */}
        <div
          ref={statsRef}
          className="px-6 sm:px-10 lg:px-16 py-12"
        >
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial="hidden"
              animate={statsInView ? 'visible' : 'hidden'}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  custom={index}
                  variants={statItemVariants}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[oklch(0.82_0.12_85/0.1)] border border-[oklch(0.82_0.12_85/0.2)] text-[oklch(0.82_0.12_85)] mb-4 group-hover:bg-[oklch(0.82_0.12_85/0.2)] group-hover:border-[oklch(0.87_0.13_85/0.4)] transition-all duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-4xl sm:text-5xl font-light text-white mb-2 tracking-tight">
                    <AnimatedStatCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-[#b8b8b8] font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-[oklch(0.82_0.12_85/0.5)]" />
      </motion.div>
    </section>
  )
}
