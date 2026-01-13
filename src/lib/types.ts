export type UserType = 'candidate' | 'employer' | 'admin'

export interface User {
  id: string
  email: string
  userType: UserType
  isPremium: boolean
  premiumExpiresAt?: Date
  createdAt: Date
}

export interface CandidateProfile {
  userId: string
  fullName: string
  phone: string
  location: string
  cvUrl?: string
  skills: string[]
  experienceLevel: string
  yearsExperience: number
  expectedSalaryMin: number
  expectedSalaryMax: number
  bio: string
  profileCompletion: number
  isPremium?: boolean
  createdAt: Date
}

export interface EmployerProfile {
  userId: string
  companyName: string
  tradeLicenseUrl?: string
  companyLogoUrl?: string
  industry: string
  companySize: string
  verified: boolean
  createdAt: Date
}

export interface JobPosting {
  id: string
  employerId: string
  employerName?: string
  companyLogoUrl?: string
  title: string
  description: string
  requiredSkills: string[]
  minExperience: number
  salaryMin: number
  salaryMax: number
  location: string
  industry?: string
  status: 'active' | 'closed' | 'draft'
  createdAt: Date
}

export interface Application {
  id: string
  jobId: string
  candidateId: string
  candidateName?: string
  matchScore: number
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  appliedAt: Date
  coverLetter?: string
}

export interface TalentTechWaitlist {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  companySize: string
  interestedBundle: 'starter' | 'professional' | 'enterprise'
  submittedAt: Date
}

export interface MatchScoreBreakdown {
  skillsMatch: number
  experienceMatch: number
  locationMatch: number
  totalScore: number
  isPremium: boolean
}

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'cancelled'

export interface PaymentIntent {
  id: string
  userId: string
  amount: number
  currency: string
  status: PaymentStatus
  stripePaymentIntentId?: string
  errorMessage?: string
  createdAt: Date
  completedAt?: Date
}

export interface Subscription {
  id: string
  userId: string
  status: 'active' | 'expired' | 'cancelled' | 'grace_period'
  startDate: Date
  expiryDate: Date
  autoRenew: boolean
  paymentIntentId?: string
}
