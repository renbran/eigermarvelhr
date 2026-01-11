import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, WarningCircle, Lightning, Crown } from '@phosphor-icons/react'
import type { CandidateProfile } from '@/lib/types'

interface ProfileCompletionCardProps {
  profile: CandidateProfile
  onEdit: () => void
  onUpgrade?: () => void
}

export function ProfileCompletionCard({ profile, onEdit, onUpgrade }: ProfileCompletionCardProps) {
  const completionItems = [
    { key: 'name', label: 'Full name', completed: !!profile.fullName },
    { key: 'phone', label: 'Phone number', completed: !!profile.phone },
    { key: 'location', label: 'Location', completed: !!profile.location },
    { key: 'experience', label: 'Experience level', completed: !!profile.experienceLevel },
    { key: 'skills', label: 'Skills (3+ added)', completed: profile.skills.length >= 3 },
    { key: 'salary', label: 'Salary expectations', completed: profile.expectedSalaryMin > 0 },
    { key: 'bio', label: 'Professional summary', completed: profile.bio.length >= 50 },
  ]

  const completedCount = completionItems.filter(item => item.completed).length
  const totalCount = completionItems.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  const isComplete = completionPercentage === 100

  return (
    <Card className={isComplete ? 'border-accent/50 bg-accent/5' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Profile Completion
              {isComplete && (
                <Badge className="bg-accent text-accent-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" weight="fill" />
                  Complete
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isComplete 
                ? 'Your profile is complete and optimized for AI matching'
                : 'Complete your profile to unlock AI-powered job matching'}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Progress value={completionPercentage} className="h-3" />

        <div className="space-y-2">
          {completionItems.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" weight="fill" />
              ) : (
                <WarningCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {!isComplete && (
          <Button 
            onClick={onEdit} 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Complete Profile
          </Button>
        )}

        {isComplete && !profile.isPremium && (
          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Crown className="h-5 w-5 text-accent" weight="fill" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Upgrade to Premium</h4>
                <p className="text-sm text-muted-foreground">
                  Get 3x more job matches with AI-powered daily recommendations
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-background/50">
                <Lightning className="h-3 w-3 mr-1" weight="fill" />
                15% Match Boost
              </Badge>
              <Badge variant="outline" className="bg-background/50">
                Premium Badge
              </Badge>
              <Badge variant="outline" className="bg-background/50">
                Priority Visibility
              </Badge>
            </div>
            {onUpgrade && (
              <Button 
                onClick={onUpgrade}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Upgrade Now - AED 299/month
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
