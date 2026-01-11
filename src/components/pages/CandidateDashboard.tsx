import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProfileCompletionCard } from '@/components/profile/ProfileCompletionCard'
import { 
  User, 
  Briefcase, 
  Lightning, 
  Heart, 
  Clock,
  MapPin,
  CurrencyCircleDollar,
  Crown
} from '@phosphor-icons/react'
import type { CandidateProfile, User as UserType, Application } from '@/lib/types'

interface CandidateDashboardProps {
  user: UserType
  profile: CandidateProfile
  onEditProfile: () => void
  onUpgradePremium: () => void
  onNavigate: (page: string) => void
}

export function CandidateDashboard({ 
  user, 
  profile, 
  onEditProfile, 
  onUpgradePremium,
  onNavigate 
}: CandidateDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [user.id])

  const loadApplications = async () => {
    try {
      const allKeys = await spark.kv.keys()
      const applicationKeys = allKeys.filter(key => key.startsWith('application:'))
      
      const userApplications: Application[] = []
      for (const key of applicationKeys) {
        const app = await spark.kv.get<Application>(key)
        if (app && app.candidateId === user.id) {
          userApplications.push(app)
        }
      }
      
      userApplications.sort((a, b) => 
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      )
      
      setApplications(userApplications)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    applications: applications.length,
    avgMatchScore: applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + app.matchScore, 0) / applications.length)
      : 0,
    savedJobs: 0,
  }

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Welcome back, {profile.fullName}!</h1>
            {user.isPremium && (
              <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-2">
                <Crown className="h-4 w-4 mr-1" weight="fill" />
                Premium Member
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage your profile, track applications, and discover new opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.applications}</div>
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Match Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.avgMatchScore}%</div>
                <Lightning className="h-8 w-8 text-accent" weight="fill" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saved Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.savedJobs}</div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Your professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{profile.fullName}</p>
                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="font-semibold">{profile.location}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p className="font-semibold">{profile.experienceLevel}</p>
                    <p className="text-sm text-muted-foreground">{profile.yearsExperience} years</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <CurrencyCircleDollar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Salary Expectations</p>
                    <p className="font-semibold">
                      AED {profile.expectedSalaryMin.toLocaleString()} - AED {profile.expectedSalaryMax.toLocaleString()}/month
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Lightning className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Professional Summary</p>
                  <p className="text-sm">{profile.bio}</p>
                </div>

                <Button onClick={onEditProfile} variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  {applications.length === 0 
                    ? 'No applications yet. Start applying to jobs!'
                    : `Showing ${Math.min(5, applications.length)} of ${applications.length} applications`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <Button 
                      onClick={() => onNavigate('jobs')}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Browse Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => (
                      <div 
                        key={application.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold mb-1">Application #{application.id.slice(-6)}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Lightning className="h-4 w-4 text-accent" weight="fill" />
                              {application.matchScore}% match
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          application.status === 'hired' ? 'default' :
                          application.status === 'shortlisted' ? 'secondary' :
                          application.status === 'reviewed' ? 'outline' :
                          'secondary'
                        }>
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                    {applications.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Applications
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ProfileCompletionCard 
              profile={profile}
              onEdit={onEditProfile}
              onUpgrade={!user.isPremium ? onUpgradePremium : undefined}
            />

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => onNavigate('jobs')} 
                  className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Lightning className="h-4 w-4 mr-2" weight="fill" />
                  Browse AI-Matched Jobs
                </Button>
                <Button 
                  onClick={onEditProfile}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
