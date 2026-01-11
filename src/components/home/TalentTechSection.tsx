import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Rocket, TrendUp, Buildings, Lightning, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { COMPANY_SIZES } from '@/lib/matching'

const bundles = [
  {
    id: 'starter',
    icon: Rocket,
    title: 'TalentTech Starter',
    subtitle: 'SMEs: 10-50 employees',
    headline: 'Complete Team + HR System in 21 Days',
    value: '3-5 strategic hires plus AI-powered HRMS implementation',
    benefits: [
      '14-day ERP deployment (95% faster than traditional)',
      'Automated HR workflows and compliance',
      'Guaranteed ROI within 90 days'
    ],
    price: 'Starting from AED 35,000',
    color: 'from-accent/20 to-accent/5'
  },
  {
    id: 'professional',
    icon: TrendUp,
    title: 'TalentTech Professional',
    subtitle: 'Growth: 50-200 employees',
    headline: 'Executive Team + Advanced Systems',
    value: '5-10 executive hires with integrated HR+Finance+CRM platform',
    benefits: [
      'Performance management workflows',
      'Advanced analytics and reporting',
      '6-month placement guarantee'
    ],
    price: 'Starting from AED 95,000',
    color: 'from-accent/30 to-accent/10',
    featured: true
  },
  {
    id: 'enterprise',
    icon: Buildings,
    title: 'TalentTech Enterprise',
    subtitle: '200+ employees',
    headline: 'C-Suite Search + Digital Transformation',
    value: 'Executive search combined with enterprise-grade AI transformation',
    benefits: [
      'Organizational design consulting',
      'AI-driven talent analytics',
      '12-month strategic partnership'
    ],
    price: 'Starting from AED 200,000',
    color: 'from-accent/20 to-accent/5'
  }
]

export function TalentTechSection() {
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState('')
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    companySize: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const waitlistEntry = {
      id: `waitlist_${Date.now()}`,
      ...formData,
      interestedBundle: selectedBundle,
      submittedAt: new Date().toISOString()
    }

    await spark.kv.set(`talenttech_waitlist:${waitlistEntry.id}`, waitlistEntry)

    toast.success("You're on the list! We'll be in touch soon.", {
      description: 'Our team will contact you within 24 hours.'
    })

    setShowWaitlist(false)
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      companySize: ''
    })
  }

  return (
    <>
      <section className="py-16 sm:py-20 bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
              <Lightning size={20} weight="fill" />
              <span className="text-sm font-semibold uppercase tracking-wide">Coming Soon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              The Future of HR: Integrated Technology Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Eiger Marvel + SGC TECH AI - Combining elite recruitment with AI-native ERP solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {bundles.map((bundle) => {
              const Icon = bundle.icon
              return (
                <Card 
                  key={bundle.id}
                  className={`relative overflow-hidden transition-all hover:shadow-xl ${
                    bundle.featured ? 'border-2 border-accent shadow-lg' : ''
                  }`}
                >
                  {bundle.featured && (
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full premium-badge">
                      POPULAR
                    </div>
                  )}
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${bundle.color} opacity-50`} />
                  
                  <CardHeader className="relative">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={28} weight="bold" className="text-accent" />
                    </div>
                    <CardTitle className="text-xl font-bold">{bundle.title}</CardTitle>
                    <CardDescription className="text-sm font-semibold">{bundle.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <div>
                      <h4 className="font-bold text-lg mb-2">{bundle.headline}</h4>
                      <p className="text-sm text-muted-foreground">{bundle.value}</p>
                    </div>

                    <div className="space-y-2">
                      {bundle.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-lg font-bold text-accent">{bundle.price}</p>
                    </div>
                  </CardContent>

                  <CardFooter className="relative">
                    <Button 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                      onClick={() => {
                        setSelectedBundle(bundle.id)
                        setShowWaitlist(true)
                      }}
                    >
                      Join Early Access Waitlist
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <Dialog open={showWaitlist} onOpenChange={setShowWaitlist}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Join the Waitlist</DialogTitle>
            <DialogDescription>
              Be the first to know when TalentTech launches. Our team will contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
