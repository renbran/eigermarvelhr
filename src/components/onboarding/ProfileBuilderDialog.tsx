import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Briefcase, MapPin, CurrencyCircleDollar, Sparkle, CheckCircle } from '@phosphor-icons/react'
import type { CandidateProfile } from '@/lib/types'

interface ProfileBuilderDialogProps {
  isOpen: boolean
  userId: string
  onComplete: (profile: CandidateProfile) => void
  existingProfile?: CandidateProfile
}

const UAE_LOCATIONS = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
]

const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (6-10 years)',
  'Lead/Principal (10+ years)',
  'Executive/C-Level'
]

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL', 'AWS',
  'Project Management', 'Data Analysis', 'Marketing', 'Sales', 'Customer Service',
  'UI/UX Design', 'Content Writing', 'Financial Analysis', 'HR Management',
  'Business Development', 'Quality Assurance', 'DevOps', 'Machine Learning'
]

export function ProfileBuilderDialog({ isOpen, userId, onComplete, existingProfile }: ProfileBuilderDialogProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [expectedSalaryMin, setExpectedSalaryMin] = useState('')
  const [expectedSalaryMax, setExpectedSalaryMax] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.fullName)
      setPhone(existingProfile.phone)
      setLocation(existingProfile.location)
      setExperienceLevel(existingProfile.experienceLevel)
      setYearsExperience(existingProfile.yearsExperience.toString())
      setSkills(existingProfile.skills)
      setExpectedSalaryMin(existingProfile.expectedSalaryMin.toString())
      setExpectedSalaryMax(existingProfile.expectedSalaryMax.toString())
      setBio(existingProfile.bio)
    }
  }, [existingProfile])

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const isStepValid = () => {
    switch (step) {
      case 1:
        return fullName.trim() && phone.trim() && location
      case 2:
        return experienceLevel && yearsExperience
      case 3:
        return skills.length > 0
      case 4:
        return expectedSalaryMin && expectedSalaryMax
      case 5:
        return bio.trim().length >= 50
      default:
        return false
    }
  }

  const handleNext = () => {
    if (isStepValid()) {
      if (step < totalSteps) {
        setStep(step + 1)
      }
    } else {
      toast.error('Please complete all required fields')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      if (skills.length < 10) {
        setSkills([...skills, skill])
      } else {
        toast.error('Maximum 10 skills allowed')
      }
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      if (skills.length < 10) {
        setSkills([...skills, customSkill.trim()])
        setCustomSkill('')
      } else {
        toast.error('Maximum 10 skills allowed')
      }
    }
  }

  const handleComplete = async () => {
    if (!isStepValid()) {
      toast.error('Please complete all required fields')
      return
    }

    setLoading(true)

    try {
      const profile: CandidateProfile = {
        userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        location,
        skills,
        experienceLevel,
        yearsExperience: parseInt(yearsExperience),
        expectedSalaryMin: parseInt(expectedSalaryMin),
        expectedSalaryMax: parseInt(expectedSalaryMax),
        bio: bio.trim(),
        profileCompletion: 100,
        createdAt: existingProfile?.createdAt || new Date(),
        isPremium: existingProfile?.isPremium
      }

      await spark.kv.set(`candidate_profile:${userId}`, profile)
      
      if (existingProfile) {
        toast.success('Profile updated successfully!')
      } else {
        toast.success('Profile created successfully!', {
          description: 'Your profile is now complete and visible to employers'
        })
      }

      onComplete(profile)
    } catch (error) {
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <Badge variant="secondary" className="text-sm">
                Step {step} of {totalSteps}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Complete all steps to unlock AI-powered job matching
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">Let's start with the essentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Current Location *</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select your emirate" />
                    </SelectTrigger>
                    <SelectContent>
                      {UAE_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Professional Experience</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your work background</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger id="experienceLevel">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Enter total years"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Skills & Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    Select up to 10 skills (selected: {skills.length}/10)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Popular Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={skills.includes(skill) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          skills.includes(skill) 
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                            : 'hover:border-accent'
                        }`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skills.includes(skill) && <CheckCircle className="h-3 w-3 mr-1" weight="fill" />}
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customSkill">Add Custom Skill</Label>
                  <div className="flex gap-2">
                    <Input
                      id="customSkill"
                      placeholder="Type a skill and press Add"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomSkill()
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={addCustomSkill}
                      disabled={!customSkill.trim() || skills.length >= 10}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-accent text-accent-foreground"
                        >
                          {skill}
                          <button
                            onClick={() => toggleSkill(skill)}
                            className="ml-2 hover:text-accent-foreground/80"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <CurrencyCircleDollar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Salary Expectations</h3>
                  <p className="text-sm text-muted-foreground">Help us find roles within your range</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary (AED/month) *</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="e.g., 10000"
                      value={expectedSalaryMin}
                      onChange={(e) => setExpectedSalaryMin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary (AED/month) *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="e.g., 20000"
                      value={expectedSalaryMax}
                      onChange={(e) => setExpectedSalaryMax(e.target.value)}
                    />
                  </div>
                </div>

                {expectedSalaryMin && expectedSalaryMax && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your expected salary range: 
                      <span className="font-semibold text-foreground ml-1">
                        AED {parseInt(expectedSalaryMin).toLocaleString()} - AED {parseInt(expectedSalaryMax).toLocaleString()}
                      </span> per month
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Professional Summary</h3>
                  <p className="text-sm text-muted-foreground">Tell employers about yourself</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    About You * 
                    <span className="text-muted-foreground ml-2">
                      ({bio.length}/500 characters, minimum 50)
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your professional background, key achievements, and career goals..."
                    value={bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setBio(e.target.value)
                      }
                    }}
                    rows={8}
                    className="resize-none"
                  />
                  {bio.length < 50 && bio.length > 0 && (
                    <p className="text-sm text-destructive">
                      Please write at least {50 - bio.length} more characters
                    </p>
                  )}
                </div>

                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Tip:</strong> A compelling summary includes your expertise, 
                    notable achievements, and what you're looking for in your next role.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleComplete}
                  disabled={!isStepValid() || loading}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
