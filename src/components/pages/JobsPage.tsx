import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JobCard } from '@/components/JobCard'
import { MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'
import { UAE_EMIRATES, INDUSTRIES } from '@/lib/matching'
import type { JobPosting, CandidateProfile } from '@/lib/types'
import { calculateMatchScore } from '@/lib/matching'

interface JobsPageProps {
  jobs: JobPosting[]
  candidateProfile?: CandidateProfile
  onViewJob: (jobId: string) => void
  onApply: (jobId: string) => void
}

export function JobsPage({ jobs, candidateProfile, onViewJob, onApply }: JobsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [salaryFilter, setSalaryFilter] = useState<string>('all')

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => job.status === 'active')

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.requiredSkills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter)
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(job => job.industry === industryFilter)
    }

    if (salaryFilter !== 'all') {
      const [min, max] = salaryFilter.split('-').map(Number)
      filtered = filtered.filter(job => {
        if (max) {
          return job.salaryMin >= min && job.salaryMax <= max
        } else {
          return job.salaryMin >= min
        }
      })
    }

    if (candidateProfile) {
      const jobsWithScores = filtered.map(job => ({
        ...job,
        matchScore: calculateMatchScore(candidateProfile, job).totalScore
      }))

      jobsWithScores.sort((a, b) => {
        if (candidateProfile.isPremium) {
          return b.matchScore - a.matchScore
        }
        return b.matchScore - a.matchScore
      })

      return jobsWithScores
    }

    return filtered.map(job => ({ ...job, matchScore: undefined }))
  }, [jobs, searchQuery, locationFilter, industryFilter, salaryFilter, candidateProfile])

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Next Role</h1>
          <p className="text-primary-foreground/80">{jobs.length} opportunities waiting for you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-background rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FunnelSimple size={20} weight="bold" className="text-muted-foreground" />
            <h2 className="font-semibold">Filter Jobs</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {UAE_EMIRATES.map(emirate => (
                  <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={salaryFilter} onValueChange={setSalaryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Salaries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salaries</SelectItem>
                <SelectItem value="0-5000">Up to AED 5,000</SelectItem>
                <SelectItem value="5000-10000">AED 5,000 - 10,000</SelectItem>
                <SelectItem value="10000-20000">AED 10,000 - 20,000</SelectItem>
                <SelectItem value="20000-50000">AED 20,000 - 50,000</SelectItem>
                <SelectItem value="50000">AED 50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-background rounded-lg shadow-md p-12 text-center">
            <p className="text-muted-foreground text-lg">No jobs match your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  matchScore={job.matchScore}
                  isPremium={candidateProfile?.isPremium}
                  onViewDetails={onViewJob}
                  onApply={candidateProfile ? onApply : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
