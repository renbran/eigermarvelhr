'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustedCompaniesSection } from '@/components/home/TrustedCompaniesSection'
import { LiveJobsSection } from '@/components/home/LiveJobsSection'
import { TalentTechSection } from '@/components/home/TalentTechSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { PremiumSection } from '@/components/home/PremiumSection'

import '../main'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-driven narrative page
 * Orchestrates all home sections with GSAP/ScrollTrigger
 * - Pinning for storytelling moments
 * - Perspective transitions
 * - Layered depth
 * - Timeline reveal
 * - Cross-section continuity
 */
export default function IndexPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return

      // 1. Hero pin for cinematic entry
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=800',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            // Perspective shift on hero
            const hero = containerRef.current?.querySelector('.hero-container')
            if (hero) {
              gsap.set(hero, {
                rotateX: self.progress * 5,
                scale: 1 - self.progress * 0.1
              })
            }
          }
        }
      })

      // 2. Layered reveal for each section
      const sections = containerRef.current?.querySelectorAll('.narrative-section')
      if (sections) {
        sections.forEach((section, i) => {
          // Mask reveal for each section
          gsap.fromTo(
            section,
            {
              clipPath: 'inset(0% 100% 0% 0%)',
              opacity: 0,
              y: 100
            },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              opacity: 1,
              y: 0,
              duration: 1.5,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'top 50%',
                toggleActions: 'play none none reverse',
              }
            }
          )

          // Parallax for section content
          gsap.fromTo(
            section.querySelectorAll('.narrative-content'),
            {
              y: 50,
              opacity: 0
            },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              stagger: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                end: 'top 40%',
                scrub: 0.8
              }
            }
          )

          // Scale reveal for images
          const images = section.querySelectorAll('img, .image-container')
          images.forEach((img) => {
            gsap.fromTo(
              img,
              {
                scale: 1.2,
                opacity: 0
              },
              {
                scale: 1,
                opacity: 1,
                duration: 1.8,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 80%',
                  end: 'top 50%',
                  scrub: 1.2
                }
              }
            )
          })
        })
      }

      // 3. Perspective transitions between sections
      sections?.forEach((section, i) => {
        if (i < sections.length - 1) {
          const nextSection = sections[i + 1]
          gsap.to(section, {
            scrollTrigger: {
              trigger: section,
              start: 'top 30%',
              end: 'top 0%',
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress
                // Scale and rotate next section into view
                gsap.set(nextSection, {
                  rotateX: progress * 10,
                  opacity: progress * 0.8
                })
              }
            }
          })
        }
      })

      // 4. Cross-section continuity - connected lines
      const connectingLines = containerRef.current?.querySelectorAll('.narrative-connector')
      connectingLines?.forEach((line, i) => {
        gsap.fromTo(
          line,
          {
            strokeDasharray: 200,
            strokeDashoffset: 200
          },
          {
            strokeDasharray: 200,
            strokeDashoffset: 0,
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

      // 5. Staggered text reveal with blur
      const texts = containerRef.current?.querySelectorAll('.narrative-text')
      texts?.forEach((text, i) => {
        gsap.fromTo(
          text,
          {
            y: 60,
            opacity: 0,
            filter: 'blur(10px)'
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 85%',
              once: true
            }
          }
        )
      })

      // 6. Timeline reveal for progress indicators
      const timelines = containerRef.current?.querySelectorAll('.narrative-timeline')
      timelines?.forEach((timeline, i) => {
        const line = timeline.querySelector('.timeline-line')
        const dots = timeline.querySelectorAll('.timeline-dot')

        gsap.to(line, {
          scaleX: 1,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timeline,
            start: 'top 80%',
            end: 'top 40%',
            scrub: 1
          }
        })

        gsap.fromTo(
          dots,
          {
            scale: 0,
            opacity: 0
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: timeline,
              start: 'top 80%',
              end: 'top 40%',
              scrub: 1
            }
          }
        )
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="narrative-container">
      <div className="hero-container">
        <HeroSection />
      </div>

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Global Presence
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              Operating across the UAE and GCC, we connect top talent with leading enterprises.
              Our network spans multiple cities, ensuring comprehensive coverage and local expertise.
            </p>
          </div>
          <div className="narrative-connector">
            <svg className="w-full h-12" viewBox="0 0 100 20">
              <line
                className="timeline-line"
                x1="0" y1="10"
                x2="100" y2="10"
                stroke="oklch(0.82 0.12 85)"
                strokeWidth="2"
                strokeDasharray="200"
                strokeDashoffset="200"
              />
              <circle className="timeline-dot" cx="0" cy="10" r="6" fill="oklch(0.82 0.12 85)" />
              <circle className="timeline-dot" cx="100" cy="10" r="6" fill="oklch(0.82 0.12 85)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Company Vision
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              To be the most trusted recruitment and workforce solutions partner in the MENA region.
              We combine deep local knowledge with global best practices to deliver exceptional outcomes.
            </p>
          </div>
        </div>
      </div>

      <TrustedCompaniesSection />

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Industries Served
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              From construction and healthcare to oil & gas and technology, we specialize in diverse sectors.
              Our industry-specific expertise ensures we understand your unique talent requirements.
            </p>
          </div>
          <div className="narrative-grid">
            {['Construction', 'Healthcare', 'Oil & Gas', 'Hospitality', 'Retail', 'Logistics'].map((industry, i) => (
              <div key={i} className="narrative-card">
                <div className="narrative-card-content">
                  <h3 className="text-xl font-bold text-white">{industry}</h3>
                  <p className="text-gray-400 mt-2">Industry expertise</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Recruitment Process
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              Our streamlined process ensures exceptional candidates reach the right opportunities.
              From sourcing to placement, every step is designed for efficiency and quality.
            </p>
          </div>
          <div className="narrative-timeline">
            <svg className="w-full h-16" viewBox="0 0 400 40">
              <line
                className="timeline-line"
                x1="0" y1="20"
                x2="400" y2="20"
                stroke="oklch(0.82 0.12 85)"
                strokeWidth="2"
                strokeDasharray="300"
                strokeDashoffset="300"
              />
              <circle className="timeline-dot" cx="0" cy="20" r="8" fill="oklch(0.82 0.12 85)" />
              <circle className="timeline-dot" cx="133" cy="20" r="8" fill="oklch(0.82 0.12 85)" />
              <circle className="timeline-dot" cx="266" cy="20" r="8" fill="oklch(0.82 0.12 85)" />
              <circle className="timeline-dot" cx="400" cy="20" r="8" fill="oklch(0.82 0.12 85)" />
            </svg>
            <div className="grid grid-cols-4 gap-8 mt-6">
              <div>
                <h4 className="text-lg font-bold text-white">Sourcing</h4>
                <p className="text-gray-400 text-sm mt-2">Talent identification</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Screening</h4>
                <p className="text-gray-400 text-sm mt-2">Quality assessment</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Matching</h4>
                <p className="text-gray-400 text-sm mt-2">AI-powered selection</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Placement</h4>
                <p className="text-gray-400 text-sm mt-2">Seamless onboarding</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TalentTechSection />

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Success Metrics
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              Our track record speaks for itself. We consistently deliver exceptional results.
            </p>
          </div>
          <div className="narrative-stats">
            {[
              { value: '500+', label: 'Placements' },
              { value: '98%', label: 'Success Rate' },
              { value: '200+', label: 'Partner Companies' },
              { value: '24/7', label: 'Support' }
            ].map((stat, i) => (
              <div key={i} className="narrative-stat">
                <div className="narrative-stat-value">{stat.value}</div>
                <div className="narrative-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ServicesSection />

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Client Trust
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              Our clients trust us because we deliver. We're proud to work with leading enterprises.
            </p>
          </div>
          <div className="narrative-logos">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="narrative-logo">
                <div className="narrative-logo-placeholder">
                  <span className="text-2xl font-bold text-gray-500">LOGO</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Global Talent Network
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl">
              Our network spans continents, connecting exceptional talent with opportunities worldwide.
            </p>
          </div>
          <div className="narrative-map">
            <svg className="w-full h-64" viewBox="0 0 800 200">
              {[...Array(20)].map((_, i) => (
                <g key={i}>
                  <circle cx={Math.random() * 800} cy={Math.random() * 200} r="4" fill="oklch(0.82 0.12 85)" opacity="0.6" />
                  <line
                    className="network-line"
                    x1={Math.random() * 800} y1={Math.random() * 200}
                    x2={Math.random() * 800} y2={Math.random() * 200}
                    stroke="oklch(0.82 0.12 85)"
                    strokeWidth="0.5"
                    strokeDasharray="50"
                    strokeDashoffset="50"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      <PremiumSection />

      <div className="narrative-section">
        <div className="narrative-content">
          <div className="narrative-text text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied clients and candidates. Let's find your perfect match.
            </p>
            <button className="narrative-cta bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-bold rounded-full hover:scale-105 transition-transform">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
