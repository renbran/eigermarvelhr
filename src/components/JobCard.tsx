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
  const companyLogo = job.companyLogoUrl || getCompanyLogo(job.employerName, job.industry)

  return (
    <Card className="hover:shadow-2xl hover:shadow-accent/20 transition-all hover:border-accent/60 relative group overflow-hidden bg-white/5 backdrop-blur-md border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {matchScore !== undefined && matchScore >= 70 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-accent text-accent-foreground font-bold match-score-reveal whitespace-nowrap shadow-lg">
            {matchScore}% Match
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="company-logo-container w-16 h-16 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 rounded-xl flex items-center justify-center flex-shrink-0 p-3 shadow-lg relative overflow-hidden group-hover:shadow-xl transition-all border-2 border-foreground/10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-accent/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={`${job.employerName || 'Company'} logo`}
                className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
                style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(var(--gold-rgb), 0.3))' }}
              />
            ) : (
              <Briefcase size={32} weight="bold" className="text-background relative z-10" />
            )}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                   style={{ 
                    boxShadow: 'inset 0 0 20px rgba(var(--gold-rgb), 0.2), 0 0 15px rgba(var(--gold-rgb), 0.15)' 
                  }} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-bold break-words pr-20 group-hover:text-accent transition-colors text-white">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 break-words text-gray-400">
              <span className="break-words">Eiger Marvel HR Consultants</span>
              {isPremium && (
                <CrownSimple size={14} weight="fill" className="text-accent flex-shrink-0 premium-badge" />
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
            <MapPin size={16} weight="bold" className="flex-shrink-0" />
            <span className="break-words">{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 whitespace-nowrap">
            <CurrencyDollar size={16} weight="bold" className="flex-shrink-0" />
            <span>{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 whitespace-nowrap">
            <Clock size={16} weight="bold" className="flex-shrink-0" />
            <span>{timeText}</span>
          </div>
        </div>

        {!compact && (
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 break-words">
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
          className="flex-1 text-xs sm:text-sm bg-gradient-to-r from-accent via-accent to-accent/90 text-black border-accent hover:from-accent/90 hover:via-accent hover:to-accent font-bold shadow-lg hover:shadow-accent/50 transition-all relative overflow-hidden group"
          onClick={() => onViewDetails(job.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <span className="relative z-10">View Details</span>
        </Button>
        {onApply && (
          <Button 
            className="flex-1 bg-gradient-to-r from-accent via-accent to-accent/90 text-black hover:from-accent/90 hover:via-accent hover:to-accent font-bold text-xs sm:text-sm shadow-lg hover:shadow-accent/50 transition-all relative overflow-hidden group"
            onClick={() => onApply(job.id)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative z-10">Quick Apply</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
