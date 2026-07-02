import { useState, useEffect, useCallback } from 'react'

import { Toaster } from 'sonner'
import { toast } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthDialog } from '@/components/AuthDialog'
import { ProfileBuilderDialog } from '@/components/onboarding/ProfileBuilderDialog'
import { CandidateDashboard } from '@/components/pages/CandidateDashboard'
import { PremiumUpgradePage } from '@/components/pages/PremiumUpgradePage'
import { HeroSection } from '@/components/home/HeroSection'
import { LiveJobsSection } from '@/components/home/LiveJobsSection'
import { TrustedCompaniesSection } from '@/components/home/TrustedCompaniesSection'
import { ProcessSection } from '@/components/home/ProcessSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { IndustriesSection } from '@/components/home/IndustriesSection'
import { StatsSection } from '@/components/home/StatsSection'
import { PremiumSection } from '@/components/home/PremiumSection'
import { JobsPage } from '@/components/pages/JobsPage'
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage'
import { HowItWorksPage } from '@/components/pages/HowItWorksPage'
import { IndustriesPages } from '@/components/pages/IndustriesPages'
import { PricingPage } from '@/components/pages/PricingPage'
import { InsightsPage } from '@/components/pages/InsightsPage'
import { HealthCheckPage } from '@/components/pages/HealthCheckPage'
import { AboutPage } from '@/components/pages/AboutPage'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { FloatingCTA } from '@/components/ui/FloatingCTA'
import { LenisProvider } from '@/components/LenisProvider'
import { kv } from '@/lib/kv'
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
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  
  const [jobs] = useState<JobPosting[]>(sampleJobs)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true)
      const userId = await kv.get<string>('currentUser')
      if (userId) {
        const user = await kv.get<User>(`user:${userId}`)
        if (user) {
          setCurrentUser(user)
          
          if (user.userType === 'candidate') {
            const profile = await kv.get<CandidateProfile>(`candidate_profile:${userId}`)
            if (profile) {
              setCandidateProfile({ ...profile, isPremium: user.isPremium })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error)
      toast.error('Failed to load user session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthMode(type)
    setShowAuth(true)
  }

  const handleAuthSuccess = async (userId: string, userType: UserType) => {
    if (userType === 'candidate') {
      const profile = await kv.get<CandidateProfile>(`candidate_profile:${userId}`)
      
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
    try {
      if (!currentUser || !candidateProfile) {
        toast.error('Please log in as a candidate to apply')
        return
      }
      // Search both persisted jobs and sample jobs
      const allJobs: JobPosting[] = [...(jobs || []), ...sampleJobs]
      const applicationId = `app_${Date.now()}`
      const job = allJobs.find(j => j.id === jobId)
      
      if (!job) {
        toast.error('Job not found')
        return
      }

      const { calculateMatchScore } = await import('@/lib/matching')
      const matchScore = calculateMatchScore(candidateProfile, job).totalScore

      await kv.set(`application:${applicationId}`, {
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
    } catch (error) {
      console.error('Error applying for job:', error)
      toast.error('Failed to submit application. Please try again.')
    }
  }

  const handleUpgradePremium = () => {
    if (!currentUser) {
      toast.info('Please log in to upgrade to premium')
      handleAuthClick('login')
      return
    }
    
    if (currentUser.isPremium) {
      toast.info('You are already a premium member!')
      return
    }
    
    setCurrentPage('premium-upgrade')
  }

  const handleUpgradeSuccess = async () => {
    await loadCurrentUser()
    setCurrentPage('dashboard')
  }

  const handleLogout = async () => {
    try {
      await kv.delete('currentUser')
      setCurrentUser(null)
      setCandidateProfile(null)
      setCurrentPage('home')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out. Please try again.')
    }
  }

  const effectiveJobs = (jobs && jobs.length > 0) ? jobs : sampleJobs

  const handleLoadingComplete = useCallback(() => {
    setShowLoadingScreen(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          onNavigate={setCurrentPage}
          currentPage={currentPage}
          onAuthClick={handleAuthClick}
          currentUser={null}
          candidateProfile={null}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer onNavigate={setCurrentPage} />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <LenisProvider>
      <LoadingScreen minDuration={2000} onComplete={handleLoadingComplete} />
      <ScrollProgress />
      <CustomCursor />
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
            <StatsSection />
            <ServicesSection />
            <IndustriesSection />
            <TrustedCompaniesSection />
            <ProcessSection />
            <LiveJobsSection
              jobs={effectiveJobs}
              onNavigate={setCurrentPage}
              onViewJob={handleViewJob}
            />
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

        {currentPage === 'premium-upgrade' && currentUser && (
          <PremiumUpgradePage
            user={currentUser}
            onBack={() => setCurrentPage(currentUser.userType === 'candidate' ? 'dashboard' : 'home')}
            onUpgradeSuccess={handleUpgradeSuccess}
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

        {currentPage === 'how-it-works' && (
          <HowItWorksPage onNavigate={setCurrentPage} />
        )}

        {currentPage === 'solutions' && (
          <HowItWorksPage onNavigate={setCurrentPage} />
        )}

        {currentPage === 'about' && (
          <AboutPage />
        )}

        {currentPage === 'industries' && (
          <IndustriesPages onNavigate={setCurrentPage} />
        )}

        {currentPage === 'industries-page' && (
          <IndustriesPages onNavigate={setCurrentPage} />
        )}

        {currentPage === 'pricing' && (
          <PricingPage />
        )}

        {currentPage === 'insights' && (
          <InsightsPage />
        )}

        {currentPage === 'resources' && (
          <InsightsPage />
        )}

        {currentPage === 'health-check' && (
          <HealthCheckPage />
        )}

        {currentPage === 'contact' && (
          <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary py-16 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
                <p className="text-lg text-muted-foreground">
                  Get in touch with Eiger Marvel HR Consultancies
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="text-2xl">📞</span> Phone
                    </h3>
                    <a href="tel:+97145751100" className="text-accent hover:underline font-medium">
                      +971 4 575 1100
                    </a>
                  </div>

                  <div className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="text-2xl">✉️</span> Email
                    </h3>
                    <a href="mailto:info@eigermarvelhr.com" className="text-accent hover:underline font-medium">
                      info@eigermarvelhr.com
                    </a>
                  </div>

                  <div className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="text-2xl">📍</span> Location
                    </h3>
                    <p className="text-muted-foreground font-medium">
                      Dubai, UAE
                    </p>
                  </div>

                  <div className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="text-2xl">⏰</span> Hours
                    </h3>
                    <p className="text-muted-foreground font-medium">
                      Monday - Friday: 9 AM - 6 PM (GMT+4)
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card p-8 rounded-lg border border-border shadow-md">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault()
                    toast.success('Thank you for your message! We will get back to you soon.')
                  }}>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input 
                        type="email"
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                        placeholder="Message subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background resize-none"
                        placeholder="Your message..."
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'privacy' && (
          <PrivacyPolicyPage />
        )}
      </main>

      <Footer onNavigate={setCurrentPage} />

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
    <FloatingCTA />
    </LenisProvider>
    <Analytics />
    </ErrorBoundary>
  )
}

export default App