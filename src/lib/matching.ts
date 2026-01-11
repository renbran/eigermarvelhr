import type { CandidateProfile, JobPosting, MatchScoreBreakdown } from './types'

export function calculateMatchScore(
  candidateProfile: CandidateProfile,
  jobPosting: JobPosting
): MatchScoreBreakdown {
  const candidateSkills = candidateProfile.skills.map(s => s.toLowerCase())
  const requiredSkills = jobPosting.requiredSkills.map(s => s.toLowerCase())
  
  const matchedSkills = candidateSkills.filter(skill =>
    requiredSkills.some(req => req.includes(skill) || skill.includes(req))
  )
  const skillsMatch = requiredSkills.length > 0 
    ? matchedSkills.length / requiredSkills.length 
    : 0
  
  const expDiff = Math.abs(candidateProfile.yearsExperience - jobPosting.minExperience)
  const experienceMatch = expDiff <= 2 ? 1 : Math.max(0, 1 - (expDiff - 2) * 0.1)
  
  const locationMatch = candidateProfile.location === jobPosting.location ? 1 : 0.7
  
  const baseScore = (skillsMatch * 0.5) + (experienceMatch * 0.3) + (locationMatch * 0.2)
  const premiumBoost = candidateProfile.isPremium ? 0.15 : 0
  
  const totalScore = Math.min(100, Math.round((baseScore + premiumBoost) * 100))
  
  return {
    skillsMatch: Math.round(skillsMatch * 100),
    experienceMatch: Math.round(experienceMatch * 100),
    locationMatch: Math.round(locationMatch * 100),
    totalScore,
    isPremium: candidateProfile.isPremium || false
  }
}

export function sortCandidatesByMatch(
  candidates: (CandidateProfile & { matchScore: number })[]
): (CandidateProfile & { matchScore: number })[] {
  return candidates.sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1
    if (!a.isPremium && b.isPremium) return 1
    return b.matchScore - a.matchScore
  })
}

export function formatSalary(amount: number): string {
  return `AED ${amount.toLocaleString('en-US')}`
}

export function formatSalaryRange(min: number, max: number): string {
  return `${formatSalary(min)} - ${formatSalary(max)}`
}

export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
]

export const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (6-10 years)',
  'Lead/Principal (10+ years)',
  'Executive'
]

export const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
]

export const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Real Estate',
  'Healthcare',
  'Retail & E-commerce',
  'Hospitality & Tourism',
  'Construction & Engineering',
  'Oil & Gas',
  'Education',
  'Telecommunications',
  'Transportation & Logistics',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Other'
]
