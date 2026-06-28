'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Briefcase, Buildings, ChevronDown, Sparkles } from '@phosphor-icons/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ParticleField } from '@/components/ui/ParticleField'

gsap.registerPlugin(ScrollTrigger)

const GOLD = {
  base: 'oklch(0.82 0.12 85)',
  light: 'oklch(0.87 0.13 85)',
  dark: 'oklch(0.72 0.09 85)',
  glow: 'rgba(214, 184, 92, 0.4)',
}

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  // ── Cinematic entry: word-by-word GSAP + parallax ────────────
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // 1 — word-by-word title stagger
      const title = titleRef.current
      if (title) {
        const words = title.textContent?.split(' ') ?? []
        title.innerHTML = ''
        words.forEach((w, i) => {
          const span = document.createElement('span')
          span.textContent = w + ' '
          span.style.display = 'inline-block'
          span.style.opacity = '0'
          span.style.transform = 'translateY(40px) rotateX(90deg)'
          title.appendChild(span)
        })
        gsap.to(title.children, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.4,
        })
      }

      // 2 — subtitle fade-up
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: 'power2.out' }
        )
      }

      // 3 — CTA group stagger
      if (ctaRef.current) {
        const btns = ctaRef.current.children
        gsap.fromTo(
          btns,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, delay: 1.6, ease: 'power2.out' }
        )
      }

      // 4 — video parallax on scroll
      if (videoWrapRef.current) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
          onUpdate: (self) => {
            gsap.set(videoWrapRef.current, { y: self.progress * 80 })
          },
        })
      }

      // 5 — gold shimmer divider on scroll
      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          gsap.fromTo(
            section.querySelector('.gold-line'),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.5, ease: 'power3.out' }
          )
        },
        once: true,
      })
    })

    return () => ctx.revert()
  }, [videoReady])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden"
    >
      <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px]">
        {/* Gold ambient overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none mix-blend-overlay opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 20% 30%, ${GOLD.glow} 0%, transparent 70%),
              radial-gradient(ellipse 50% 50% at 80% 70%, ${GOLD.glow} 0%, transparent 60%)
            `
          }}
        />

        {/* Dark vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 z-[2]" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/60 to-transparent z-[2]" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/60 to-transparent z-[2]" />

        {/* Three.js gold ambient particle field */}
        <ParticleField particleCount={60} color="#c9a54a" speed={0.2} size={2} opacity={0.3} />

        {/* Video with parallax wrapper */}
        <div ref={videoWrapRef} className="absolute inset-0 w-full h-[110%] -top-[5%] will-change-transform">
          <video
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setVideoReady(true)}
            className="w-full h-full object-cover object-center"
            controlsList="nodownload"
          >
            <source
              src="https://res.cloudinary.com/dsl5fhclj/video/upload/v1768161201/hero-video.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Gold shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 z-[3] px-6 sm:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div
              className="gold-line h-[1.5px] w-full origin-left scale-x-0"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${GOLD.base} 20%, ${GOLD.light} 50%, ${GOLD.base} 80%, transparent 100%)`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end pb-12 sm:pb-16 lg:pb-20 z-[3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              {/* Gold badge */}
              <div className="mb-4 opacity-0" style={{ animation: 'fadeIn 0.6s 0.2s forwards' }}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[oklch(0.82_0.12_85/0.3)] bg-[oklch(0.82_0.12_85/0.08)] text-[oklch(0.87_0.13_85)] backdrop-blur-sm">
                  <Sparkles size={14} weight="fill" />
                  UAE&rsquo;s Premium Recruitment Platform
                </span>
              </div>

              <h1
                ref={titleRef}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-4 text-white drop-shadow-2xl"
              >
                The UAE&rsquo;s Smartest Way to Hire and Get Hired
              </h1>

              <p
                ref={subtitleRef}
                className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 drop-shadow-lg leading-relaxed"
              >
                AI-powered recruitment connecting exceptional talent with leading UAE companies
                in 24 hours, not 3 months. From Dubai to Abu Dhabi, we deliver results that matter.
              </p>

              <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  onClick={() => onNavigate('jobs')}
                  className="group relative overflow-hidden bg-gradient-to-r from-[oklch(0.82_0.12_85)] via-[oklch(0.87_0.13_85)] to-[oklch(0.82_0.12_85)] text-black font-bold text-sm sm:text-base px-6 sm:px-8 shadow-[0_0_25px_rgba(214,184,92,0.3)] hover:shadow-[0_0_40px_rgba(214,184,92,0.5)] transition-all duration-300 hover:scale-105 border-none h-auto py-3 sm:py-3.5"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Briefcase size={20} weight="bold" className="flex-shrink-0" />
                    Explore Opportunities
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('employers')}
                  className="border-2 border-white/30 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-black font-bold text-sm sm:text-base px-6 sm:px-8 transition-all hover:scale-105 h-auto py-3 sm:py-3.5"
                >
                  <Buildings size={20} weight="bold" className="mr-2 flex-shrink-0" />
                  Hire Top Talent
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[3]">
          <ChevronDown
            size={24}
            className="text-[oklch(0.82_0.12_85/0.5)] animate-bounce"
          />
        </div>
      </div>
    </section>
  )
}
