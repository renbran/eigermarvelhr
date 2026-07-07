'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/JobCard'
import { ArrowRight, Lightning } from '@phosphor-icons/react'
import type { JobPosting } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

const GOLD = 'var(--color-gold-300)'

interface LiveJobsSectionProps {
  jobs: JobPosting[]
  onNavigate: (page: string) => void
  onViewJob: (jobId: string) => void
}

export function LiveJobsSection({ jobs, onNavigate, onViewJob }: LiveJobsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const displayJobs = jobs.slice(0, 6)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.querySelectorAll('h2, p, button'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Job cards stagger
      if (gridRef.current) {
        const cards = gridRef.current.children
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true }
          }
        )
      }
    }, [sectionRef])

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-background relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2">
              {/* Live pulse dot */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: GOLD }}
                />
                <span className="relative inline-flex rounded-full h-3 w-3"
                  style={{ backgroundColor: GOLD }}
                />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Live Job Opportunities
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-400">
              {jobs.length} active positions waiting for the right talent
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => onNavigate('jobs')}
            className="hidden sm:flex items-center gap-2 flex-shrink-0 whitespace-nowrap border-gold-300/30 text-gold-300 hover:bg-gold-300/10"
          >
            View All Jobs
            <ArrowRight size={16} weight="bold" />
          </Button>
        </div>

        {displayJobs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
            <p className="text-sm sm:text-base text-gray-400">No jobs available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={onViewJob}
                compact
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button
            onClick={() => onNavigate('jobs')}
            className="bg-gradient-to-r from-gold-300 to-gold-200 text-black font-semibold"
          >
            View All Jobs
            <ArrowRight size={16} weight="bold" className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
