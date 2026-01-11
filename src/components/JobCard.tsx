import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, MapPin, CurrencyDollar, Clock, CrownSimple } from '@phosphor-icons/react'
import { formatSalaryRange } from '@/lib/matching'
import { getCompanyLogo } from '@/lib/company-logos'
import type { JobPosting } from '@/lib/types'

interface JobCardProps {
  job: JobPosting
  matchScore?: number
  isPremium?: boolean
  onViewDetails: (jobId: string) => void
  onApply?: (jobId: string) => void
  compact?: boolean
}

export function JobCard({ job, matchScore, isPremium, onViewDetails, onApply, compact }: JobCardProps) {
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const timeText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
  const companyLogo = job.companyLogoUrl || getCompanyLogo(job.employerName)

  return (
    <Card className="hover:shadow-lg transition-all hover:border-primary/30 relative group">
      {matchScore !== undefined && matchScore >= 70 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-accent text-accent-foreground font-bold match-score-reveal whitespace-nowrap">
            {matchScore}% Match
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0 p-1.5">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={`${job.employerName || 'Company'} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Briefcase size={24} weight="bold" className="text-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-bold break-words pr-20">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 break-words">
              <span className="break-words">{job.employerName || 'Eiger Marvel Client'}</span>
              {isPremium && (
                <CrownSimple size={14} weight="fill" className="text-accent flex-shrink-0" />
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <MapPin size={16} weight="bold" className="flex-shrink-0" />
            <span className="break-words">{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            <CurrencyDollar size={16} weight="bold" className="flex-shrink-0" />
            <span>{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            <Clock size={16} weight="bold" className="flex-shrink-0" />
            <span>{timeText}</span>
          </div>
        </div>

        {!compact && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
            {job.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.slice(0, 4).map((skill, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs break-words">
              {skill}
            </Badge>
          ))}
          {job.requiredSkills.length > 4 && (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              +{job.requiredSkills.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 text-xs sm:text-sm"
          onClick={() => onViewDetails(job.id)}
        >
          View Details
        </Button>
        {onApply && (
          <Button 
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-xs sm:text-sm"
            onClick={() => onApply(job.id)}
          >
            Quick Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
