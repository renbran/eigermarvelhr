import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/JobCard'
import { ArrowRight, Lightning } from '@phosphor-icons/react'
import type { JobPosting } from '@/lib/types'

interface LiveJobsSectionProps {
  jobs: JobPosting[]
  onNavigate: (page: string) => void
  onViewJob: (jobId: string) => void
}

export function LiveJobsSection({ jobs, onNavigate, onViewJob }: LiveJobsSectionProps) {
  const displayJobs = jobs.slice(0, 6)

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <Lightning size={24} weight="fill" className="text-accent flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground break-words">
                Live Job Opportunities
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              {jobs.length} active positions waiting for the right talent
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => onNavigate('jobs')}
            className="hidden sm:flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
          >
            View All Jobs
            <ArrowRight size={16} weight="bold" />
          </Button>
        </div>

        {displayJobs.length === 0 ? (
          <div className="text-center py-12 bg-secondary rounded-lg">
            <p className="text-sm sm:text-base text-muted-foreground break-words px-4">No jobs available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            View All Jobs
            <ArrowRight size={16} weight="bold" className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
