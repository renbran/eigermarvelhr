'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SplitType from 'split-type'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { heroTrustLogos } from '@/lib/company-logos'
import {
  CalendarCheck,
  ArrowRight,
  CaretDown,
  Buildings,
  UserCircle,
} from '@phosphor-icons/react'

// ─── Constants ────────────────────────────────────────────────────────────────
const ADVANCE_MS = 7500
const SLIDE_INTERVAL = 6000
const CROSSFADE_DURATION = 1.2

const SLIDE_PATHS = Array.from({ length: 8 }, (_, i) => `/images/slides/slide-${String(i + 1).padStart(2, '0')}.svg`)
const SLIDE2_PATHS = Array.from({ length: 8 }, (_, i) => `/images/slides2/slide2-${String(i + 1).padStart(2, '0')}.jpg`)

const GOLD = {
  base: '#B8912C',
  light: '#D4A84B',
  glow: 'rgba(184,145,44,0.35)',
  text: 'rgba(212,168,72,0.92)',
}

interface SlideshowHeroProps {
  seq: number
}

function SlideshowHero({ seq }: SlideshowHeroProps) {
  const container1Ref = useRef<HTMLDivElement>(null)
  const container2Ref = useRef<HTMLDivElement>(null)
  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active1Ref = useRef(0)
  const active2Ref = useRef(0)
  const isMountedRef = useRef(true)
  const reducedMotion = useReducedMotion()
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Preload all slideshow images to prevent blank frames
  useEffect(() => {
    const allPaths = [...SLIDE_PATHS, ...SLIDE2_PATHS]
    let loaded = 0
    let errored = 0

    allPaths.forEach((src) => {
      const img = new Image()
      img.onload = () => {
        loaded++
        if (loaded + errored >= allPaths.length) setImagesLoaded(true)
      }
      img.onerror = () => {
        errored++
        console.warn(`[SlideshowHero] Failed to load image: ${src}`)
        if (loaded + errored >= allPaths.length) setImagesLoaded(true)
      }
      img.src = src
    })
  }, [])

  const crossfadeTo = useCallback(
    (slides: NodeListOf<Element>, nextIdx: number, duration: number) => {
      const prevIdx = (nextIdx - 1 + slides.length) % slides.length
      const prev = slides[prevIdx] as HTMLElement
      const next = slides[nextIdx] as HTMLElement

      gsap.killTweensOf(prev)
      gsap.killTweensOf(next)
      next.classList.remove('ken-burns')

      prev.classList.remove('active', 'ken-burns')
      next.classList.add('active')

      if (!reducedMotion) {
        gsap.fromTo(
          next,
          { opacity: 0, scale: 1.15 },
          {
            opacity: 0.35,
            scale: 1,
            duration,
            ease: 'power3.out',
            onComplete: () => {
              gsap.set(next, { clearProps: 'transform' })
              next.classList.add('ken-burns')
            },
          }
        )
        gsap.to(prev, { opacity: 0, duration, ease: 'power3.in' })
      } else {
        gsap.set(next, { opacity: 0.35 })
        next.classList.add('ken-burns')
      }
    },
    [reducedMotion]
  )

  const startTimer = useCallback(
    (
      containerRef: React.RefObject<HTMLDivElement | null>,
      activeRef: React.MutableRefObject<number>,
      paths: string[],
      timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
    ) => {
      const tick = () => {
        if (!isMountedRef.current) return
        const slides = containerRef.current?.querySelectorAll('.slide')
        if (!slides?.length) return
        activeRef.current = (activeRef.current + 1) % paths.length
        crossfadeTo(slides, activeRef.current, CROSSFADE_DURATION)
        timerRef.current = setTimeout(tick, SLIDE_INTERVAL)
      }
      timerRef.current = setTimeout(tick, SLIDE_INTERVAL)
    },
    [crossfadeTo]
  )

  useEffect(() => {
    isMountedRef.current = true

    const initSlides = (
      containerRef: React.RefObject<HTMLDivElement | null>,
      activeRef: React.MutableRefObject<number>,
      paths: string[],
      timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
      startImmediately: boolean
    ) => {
      const container = containerRef.current
      if (!container) return
      const slides = container.querySelectorAll('.slide')
      if (!slides.length) return

      activeRef.current = 0
      slides[0].classList.add('active', 'ken-burns')
      gsap.set(slides[0], { opacity: 0.35 })

      if (startImmediately) {
        startTimer(containerRef, activeRef, paths, timerRef)
      }
    }

    initSlides(container1Ref, active1Ref, SLIDE_PATHS, timer1Ref, true)
    initSlides(container2Ref, active2Ref, SLIDE2_PATHS, timer2Ref, false)

    return () => {
      isMountedRef.current = false
      if (timer1Ref.current) clearTimeout(timer1Ref.current)
      if (timer2Ref.current) clearTimeout(timer2Ref.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const c1 = container1Ref.current
    const c2 = container2Ref.current
    if (!c1 || !c2) return

    const slides1 = c1.querySelectorAll('.slide')
    const slides2 = c2.querySelectorAll('.slide')
    if (!slides1.length || !slides2.length) return

    if (timer1Ref.current) { clearTimeout(timer1Ref.current); timer1Ref.current = null }
    if (timer2Ref.current) { clearTimeout(timer2Ref.current); timer2Ref.current = null }

    if (seq === 0) {
      c1.style.display = ''
      c2.style.display = 'none'
      active1Ref.current = (active1Ref.current) % SLIDE_PATHS.length
      startTimer(container1Ref, active1Ref, SLIDE_PATHS, timer1Ref)
    } else {
      c1.style.display = 'none'
      c2.style.display = ''
      active2Ref.current = (active2Ref.current) % SLIDE2_PATHS.length
      startTimer(container2Ref, active2Ref, SLIDE2_PATHS, timer2Ref)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq])

  return (
    <>
      <style>{`
        .slideshow-container { position: absolute; inset: 0; overflow: hidden; pointer-events: none }
        .slideshow-container .slide {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          opacity: 0; z-index: 0;
        }
        .slideshow-container .slide.active { opacity: 0.35; z-index: 1; }
        .slideshow-container .slide.ken-burns { animation: kenBurns 12s ease-out forwards; }
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.12); } }
      `}</style>

      {/* Seq0 slideshow — UAE landmarks */}
      <div ref={container1Ref} className="slideshow-container" style={{ display: '' }}>
        {SLIDE_PATHS.map((src, i) => (
          <div key={src} className="slide" style={{ backgroundImage: `url('${src}')` }} />
        ))}
      </div>

      {/* Seq1 slideshow — workers/industry */}
      <div ref={container2Ref} className="slideshow-container" style={{ display: 'none' }}>
        {SLIDE2_PATHS.map((src, i) => (
          <div key={src} className="slide" style={{ backgroundImage: `url('${src}')` }} />
        ))}
      </div>
    </>
  )
}

// ─── Sequence definitions ─────────────────────────────────────────────────────
const SEQUENCES = [
  {
    id: 'brand',
    goldMode: false,
    tag: 'Master Recruiter · UAE · Est. 2024',
    headlineWords: ['EIGER', 'MARVEL', 'HR'],
    subline:
      "The UAE's dedicated construction & hospitality workforce partner. Precision placements in 7–14 days.",
    cta1: { label: 'Book Consultation', icon: 'calendar', page: 'contact' },
    cta2: { label: 'Client Portal', icon: 'buildings', page: 'employers' },
    badges: ['500+ Placements', '7–14 Day Avg', '100% WPS Compliant'],
  },
  {
    id: 'hook',
    goldMode: true,
    tag: 'On Time. Every Time.',
    bigNumber: '7–14',
    headlineSuffix: 'DAYS. NOT 90.',
    subline:
      'When generalists fail, specialists deliver. Stop waiting 3 months for construction & hospitality talent.',
    cta1: { label: 'Start Hiring Now', icon: 'arrow', page: 'contact' },
    cta2: { label: 'Find Your Role', icon: 'user', page: 'jobs' },
    badges: ['Construction', 'Hospitality', 'UAE & GCC'],
  },
] as const

// ─── Sequence 0 — Brand Identity ──────────────────────────────────────────────
function Seq0Content({
  seq,
  onNavigate,
}: {
  seq: typeof SEQUENCES[0]
  onNavigate: (page: string) => void
}) {
  const headlineRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!headlineRef.current || reducedMotion) return

    const words = headlineRef.current.querySelectorAll<HTMLElement>('.hero-word')
    const splits: SplitType[] = []

    words.forEach((word) => {
      const split = new SplitType(word, { types: 'chars' })
      splits.push(split)
    })

    const allChars = splits.flatMap((s) => s.chars ?? [])

    gsap.fromTo(
      allChars,
      { opacity: 0, rotateX: 90, y: 22, transformPerspective: 600 },
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        stagger: 0.032,
        duration: 0.65,
        ease: 'power4.out',
        delay: 0.08,
      }
    )

    return () => {
      splits.forEach((s) => s.revert())
    }
  }, [reducedMotion])

  return (
    <motion.div
      key="seq-brand"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.6, 1] }}
    >
      {/* Tag */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mb-6 flex items-center gap-3"
      >
        <span className="inline-block h-px w-8" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <span
          className="text-xs uppercase tracking-[0.16em] font-medium"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {seq.tag}
        </span>
      </motion.div>

      {/* 3-D headline — split-type animates chars */}
      <div
        ref={headlineRef}
        className="mb-6 leading-none"
        style={{ perspective: '800px', perspectiveOrigin: '50% 40%' }}
        aria-label="EIGER MARVEL HR"
      >
        {seq.headlineWords.map((word, wi) => (
          <div key={word} className="overflow-hidden">
            <span
              className="hero-word block font-heading tracking-tight"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
                fontWeight: wi === 1 ? 700 : 300,
                lineHeight: 1.05,
                color: wi === 2 ? GOLD.light : '#F4F4F5',
                letterSpacing: wi === 2 ? '0.22em' : '-0.03em',
              }}
            >
              {word}
            </span>
          </div>
        ))}
      </div>

      {/* Subline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 max-w-xl font-body leading-relaxed"
        style={{ color: 'rgba(209,213,219,0.8)', fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)' }}
      >
        {seq.subline}
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row gap-3 mb-10"
      >
        <Button
          size="lg"
          onClick={() => onNavigate(seq.cta1.page)}
          className="group relative overflow-hidden text-black font-bold h-auto py-3.5 px-7 rounded-md border-none"
          style={{
            background: `linear-gradient(135deg, ${GOLD.base} 0%, ${GOLD.light} 50%, ${GOLD.base} 100%)`,
            boxShadow: `0 0 28px ${GOLD.glow}`,
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative z-10 flex items-center gap-2">
            <CalendarCheck size={18} weight="bold" />
            {seq.cta1.label}
          </span>
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => onNavigate(seq.cta2.page)}
          className="h-auto py-3.5 px-7 rounded-md font-semibold transition-all duration-300"
          style={{
            borderColor: 'rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(244,244,245,0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Buildings size={18} weight="bold" className="mr-2" />
          {seq.cta2.label}
        </Button>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.95 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
      >
        {seq.badges.map((badge, i) => (
          <span
            key={badge}
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] font-medium"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            {i > 0 && (
              <span className="block w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
            )}
            {badge}
          </span>
        ))}
      </motion.div>

      {/* Client logo trust strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.15 }}
        className="mt-7 pt-5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.14em] mb-3 font-medium"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Trusted by
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {heroTrustLogos.map((logo) => (
            <div
              key={logo.name}
              className="group flex-shrink-0"
              style={{ width: 46, height: 46 }}
              title={logo.name}
            >
              <div
                className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'border-color 0.25s ease, background 0.25s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(184,145,44,0.35)'
                  el.style.background = 'rgba(184,145,44,0.05)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.07)'
                  el.style.background = 'rgba(255,255,255,0.03)'
                }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="w-full h-full object-contain p-1 opacity-42 group-hover:opacity-80 transition-opacity duration-250"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Sequence 1 — The Hook (Gold) ─────────────────────────────────────────────
function Seq1Content({
  seq,
  onNavigate,
}: {
  seq: typeof SEQUENCES[1]
  onNavigate: (page: string) => void
}) {
  const numberRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!numberRef.current || reducedMotion) return

    gsap.fromTo(
      numberRef.current,
      { opacity: 0, scale: 0.6, rotateX: -30, transformPerspective: 600 },
      { opacity: 1, scale: 1, rotateX: 0, duration: 0.9, ease: 'back.out(1.4)', delay: 0.1 }
    )
  }, [reducedMotion])

  return (
    <motion.div
      key="seq-hook"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.6, 1] }}
    >
      {/* Gold tag */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mb-6 flex items-center gap-3"
      >
        <span className="inline-block h-px w-8" style={{ background: GOLD.base }} />
        <span
          className="text-xs uppercase tracking-[0.16em] font-semibold"
          style={{ color: GOLD.text }}
        >
          {seq.tag}
        </span>
      </motion.div>

      {/* Big impact number */}
      <div className="mb-2">
        <div
          ref={numberRef}
          className="font-heading tabular-nums"
          style={{
            fontSize: 'clamp(5rem, 18vw, 11rem)',
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            background: `linear-gradient(135deg, ${GOLD.light} 0%, #F0C060 40%, ${GOLD.base} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            opacity: 0, // GSAP animates this
          }}
          aria-hidden="true"
        >
          {seq.bigNumber}
        </div>
      </div>

      {/* Suffix line */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 leading-none"
      >
        <span
          className="font-heading font-light"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'rgba(244,244,245,0.9)',
            letterSpacing: '-0.02em',
          }}
        >
          {seq.headlineSuffix}
        </span>
      </motion.div>

      {/* Visually accessible label */}
      <span className="sr-only">7 to 14 days. Not 90.</span>

      {/* Subline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 max-w-xl font-body leading-relaxed"
        style={{ color: 'rgba(209,213,219,0.75)', fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)' }}
      >
        {seq.subline}
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row gap-3 mb-10"
      >
        <Button
          size="lg"
          onClick={() => onNavigate(seq.cta1.page)}
          className="group relative overflow-hidden text-black font-bold h-auto py-3.5 px-7 rounded-md border-none"
          style={{
            background: `linear-gradient(135deg, ${GOLD.base} 0%, ${GOLD.light} 50%, ${GOLD.base} 100%)`,
            boxShadow: `0 0 36px ${GOLD.glow}, 0 0 12px rgba(184,145,44,0.2)`,
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative z-10 flex items-center gap-2">
            {seq.cta1.label}
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </span>
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => onNavigate(seq.cta2.page)}
          className="h-auto py-3.5 px-7 rounded-md font-semibold transition-all duration-300"
          style={{
            borderColor: `rgba(184,145,44,0.35)`,
            background: 'rgba(184,145,44,0.05)',
            color: 'rgba(244,244,245,0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <UserCircle size={18} weight="bold" className="mr-2" />
          {seq.cta2.label}
        </Button>
      </motion.div>

      {/* Industry badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
      >
        {seq.badges.map((badge, i) => (
          <span
            key={badge}
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] font-medium"
            style={{ color: 'rgba(184,145,44,0.55)' }}
          >
            {i > 0 && (
              <span className="block w-px h-3" style={{ background: 'rgba(184,145,44,0.2)' }} />
            )}
            {badge}
          </span>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Progress bar with CSS keyframe ──────────────────────────────────────────
function ProgressBar({ seq, paused }: { seq: number; paused: boolean }) {
  return (
    <>
      <style>{`
        @keyframes em-hero-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
      <div className="h-[1.5px] w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          key={`${seq}-progress`}
          style={{
            height: '100%',
            background:
              seq === 1
                ? `linear-gradient(90deg, ${GOLD.base}, ${GOLD.light})`
                : 'rgba(255,255,255,0.45)',
            animation: `em-hero-progress ${ADVANCE_MS}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface HeroSectionProps {
  onNavigate: (page: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [seq, setSeq] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  const totalSeqs = SEQUENCES.length
  const currentSeq = SEQUENCES[seq]

  const goTo = useCallback(
    (next: number) => {
      setSeq(next % totalSeqs)
    },
    [totalSeqs]
  )

  // Auto-advance
  useEffect(() => {
    if (paused || reducedMotion) return
    timerRef.current = setTimeout(() => {
      setSeq((s) => (s + 1) % totalSeqs)
    }, ADVANCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [seq, paused, totalSeqs, reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: '#07080F' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero — Eiger Marvel HR"
    >
      {/* ── Slideshow background (z-0) ───────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <SlideshowHero seq={seq} />
      </div>

      {/* ── Gradient overlays for text legibility (z-1) ─────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(7,8,15,0.75) 0%, rgba(7,8,15,0.45) 55%, rgba(7,8,15,0.1) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(7,8,15,0.3) 0%, transparent 40%, rgba(7,8,15,0.5) 100%)',
        }}
      />

      {/* Gold ambient when hook sequence is active (z-2) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 z-[2]"
        style={{
          opacity: seq === 1 ? 1 : 0,
          background:
            'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(184,145,44,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-[100svh]">
        <div className="flex-1 flex items-center">
          <div
            className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16"
            style={{ paddingTop: 'max(5rem, 12vh)', paddingBottom: 'max(4rem, 10vh)' }}
          >
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                {seq === 0 ? (
                  <Seq0Content key="brand" seq={SEQUENCES[0]} onNavigate={onNavigate} />
                ) : (
                  <Seq1Content key="hook" seq={SEQUENCES[1]} onNavigate={onNavigate} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Bottom controls ───────────────────────────────── */}
        <div className="relative z-20">
          <ProgressBar seq={seq} paused={paused} />

          <div className="flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4">
            {/* Sequence dots */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero sequence">
              {SEQUENCES.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === seq}
                  aria-label={`View sequence ${i + 1}: ${s.id}`}
                  onClick={() => goTo(i)}
                  className="transition-all duration-400 rounded-full"
                  style={{
                    width: i === seq ? 28 : 8,
                    height: 4,
                    borderRadius: 2,
                    background:
                      i === seq
                        ? seq === 1
                          ? GOLD.light
                          : 'rgba(255,255,255,0.85)'
                        : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </div>

            {/* Right: sequence label + scroll hint */}
            <div className="flex items-center gap-5">
              <span
                className="hidden sm:block text-[10px] uppercase tracking-[0.14em]"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {seq + 1} / {totalSeqs}
              </span>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ color: 'rgba(255,255,255,0.25)' }}
                aria-label="Scroll down"
              >
                <CaretDown size={20} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
