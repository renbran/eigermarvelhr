import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import { toast } from 'sonner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthDialog } from '@/components/AuthDialog'
import { ProfileBuilderDialog } from '@/components/onboarding/ProfileBuilderDialog'
import { CandidateDashboard } from '@/components/pages/CandidateDashboard'
import { HeroSection } from '@/components/home/HeroSection'
import { LiveJobsSection } from '@/components/home/LiveJobsSection'
import { TrustedCompaniesSection } from '@/components/home/TrustedCompaniesSection'
import { TalentTechSection } from '@/components/home/TalentTechSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { PremiumSection } from '@/components/home/PremiumSection'
import { JobsPage } from '@/components/pages/JobsPage'
import type { UserType, JobPosting, CandidateProfile, User } from '@/lib/types'
import { sampleJobs } from '@/lib/sample-jobs'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileBuilder, setShowProfileBuilder] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newCandidateId, setNewCandidateId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null)
  
  const [jobs] = useKV<JobPosting[]>('jobs', [])

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const userId = await spark.kv.get<string>('currentUser')
    if (userId) {
      const user = await spark.kv.get<User>(`user:${userId}`)
      if (user) {
        setCurrentUser(user)
        
        if (user.userType === 'candidate') {
          const profile = await spark.kv.get<CandidateProfile>(`candidate_profile:${userId}`)
          if (profile) {
            setCandidateProfile({ ...profile, isPremium: user.isPremium })
          }
        }
      }
    }
  }

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthMode(type)
    setShowAuth(true)
  }

  const handleAuthSuccess = async (userId: string, userType: UserType) => {
    if (userType === 'candidate') {
      const profile = await spark.kv.get<CandidateProfile>(`candidate_profile:${userId}`)
      
      if (!profile) {
        setNewCandidateId(userId)
        setShowAuth(false)
        setShowProfileBuilder(true)
      } else {
        await loadCurrentUser()
        setShowAuth(false)
      }
    } else {
      await loadCurrentUser()
      setShowAuth(false)
    }
  }

  const handleProfileComplete = async (profile: CandidateProfile) => {
    setShowProfileBuilder(false)
    setIsEditingProfile(false)
    await loadCurrentUser()
    
    if (isEditingProfile) {
      toast.success('Profile updated successfully!')
    } else {
      toast.success('Welcome to Eiger Marvel!', {
        description: 'Your profile is complete. Start exploring job opportunities.'
      })
      setCurrentPage('dashboard')
    }
  }

  const handleEditProfile = () => {
    if (currentUser) {
      setIsEditingProfile(true)
      setNewCandidateId(currentUser.id)
      setShowProfileBuilder(true)
    }
  }

  const handleViewJob = (jobId: string) => {
    toast.info('Job details view - Feature in development')
  }

  const handleApplyJob = async (jobId: string) => {
    if (!currentUser || !candidateProfile) {
      toast.error('Please log in as a candidate to apply')
      return
    }
    // Search both persisted jobs and sample jobs
    const allJobs: JobPosting[] = [...(jobs || []), ...sampleJobs]
    const applicationId = `app_${Date.now()}`
    const job = allJobs.find(j => j.id === jobId)
    
    if (job) {
      const { calculateMatchScore } = await import('@/lib/matching')
      const matchScore = calculateMatchScore(candidateProfile, job).totalScore

      await spark.kv.set(`application:${applicationId}`, {
        id: applicationId,
        jobId,
        candidateId: currentUser.id,
        candidateName: candidateProfile.fullName,
        matchScore,
        status: 'submitted',
        appliedAt: new Date().toISOString()
      })

      toast.success('Application submitted successfully!', {
        description: `Match score: ${matchScore}%`
      })
    }
  }

  const handleUpgradePremium = () => {
    if (!currentUser) {
      toast.info('Please log in to upgrade to premium')
      handleAuthClick('login')
      return
    }
    
    toast.info('Premium upgrade - Stripe integration ready for production')
  }

  const handleLogout = async () => {
    await spark.kv.delete('currentUser')
    setCurrentUser(null)
    setCandidateProfile(null)
    setCurrentPage('home')
    toast.success('Logged out successfully')
  }

  const effectiveJobs = (jobs && jobs.length > 0) ? jobs : sampleJobs

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        onAuthClick={handleAuthClick}
        currentUser={currentUser}
        candidateProfile={candidateProfile}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            <HeroSection onNavigate={setCurrentPage} />
            <LiveJobsSection 
              jobs={effectiveJobs} 
              onNavigate={setCurrentPage}
              onViewJob={handleViewJob}
            />
            <TrustedCompaniesSection />
            <TalentTechSection />
            <ServicesSection />
            <PremiumSection onUpgrade={handleUpgradePremium} />
          </>
        )}

        {currentPage === 'dashboard' && currentUser && candidateProfile && (
          <CandidateDashboard
            user={currentUser}
            profile={candidateProfile}
            onEditProfile={handleEditProfile}
            onUpgradePremium={handleUpgradePremium}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'jobs' && (
          <JobsPage
            jobs={effectiveJobs}
            candidateProfile={candidateProfile || undefined}
            onViewJob={handleViewJob}
            onApply={handleApplyJob}
          />
        )}

        {currentPage === 'employers' && (
          <div className="min-h-screen bg-secondary flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">Employer Portal</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Post jobs, review AI-matched candidates, and hire top talent across the MENA region.
              </p>
              <p className="text-sm text-muted-foreground">Feature in development</p>
            </div>
          </div>
        )}

        {currentPage === 'talenttech' && (
          <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
            <div className="py-16">
              <TalentTechSection />
            </div>
          </div>
        )}

        {currentPage === 'contact' && (
          <div className="min-h-screen bg-secondary flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Get in touch with Eiger Marvel HR Consultancies
              </p>
              <div className="space-y-4 text-left bg-background p-8 rounded-lg shadow-md">
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-muted-foreground">+971 58 624 1100</p>
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">info@em-gc.com</p>
                </div>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-muted-foreground">Dubai, UAE</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <AuthDialog
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {newCandidateId && (
        <ProfileBuilderDialog
          isOpen={showProfileBuilder}
          userId={newCandidateId}
          onComplete={handleProfileComplete}
          existingProfile={isEditingProfile ? candidateProfile || undefined : undefined}
        />
      )}

      <Toaster position="top-right" />
    </div>
  )
}

export default App