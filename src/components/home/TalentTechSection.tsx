'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { kv } from '@/lib/kv'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Rocket, TrendUp, Buildings, Lightning, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { COMPANY_SIZES } from '@/lib/matching'

gsap.registerPlugin(ScrollTrigger)

const GOLD = 'oklch(0.82 0.12 85)'

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
    color: 'from-accent/20 to-accent/5'
  }
]

export function TalentTechSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState('')
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    companySize: ''
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.querySelectorAll('h2, p, div'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Cards stagger
      if (gridRef.current) {
        const cards = gridRef.current.children
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true }
          }
        )
      }

      // Gold line reveal
      gsap.fromTo(
        sectionRef.current?.querySelector('.tt-gold-line'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true }
        }
      )
    }, [sectionRef])

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const waitlistEntry = {
      id: `waitlist_${Date.now()}`,
      ...formData,
      interestedBundle: selectedBundle,
      submittedAt: new Date().toISOString()
    }

    await kv.set(`talenttech_waitlist:${waitlistEntry.id}`, waitlistEntry)

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
      <section ref={sectionRef} className="py-16 sm:py-20 relative overflow-hidden bg-black">
        {/* Gold ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
        />
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div ref={headerRef} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border border-[oklch(0.82_0.12_85/0.3)] bg-[oklch(0.82_0.12_85/0.08)]">
              <Lightning size={20} weight="fill" className="text-[oklch(0.82_0.12_85)] flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-[oklch(0.87_0.13_85)]">Coming Soon</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
              The Future of HR: Integrated Technology Solutions
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-3xl mx-auto">
              Eiger Marvel + SGC TECH AI - Combining elite recruitment with AI-native ERP solutions
            </p>
          </div>

          {/* Gold shimmer line */}
          <div className="flex justify-center mb-10">
            <div className="tt-gold-line h-[1px] w-24 scale-x-0 origin-center rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />
          </div>

          <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {bundles.map((bundle) => {
              const Icon = bundle.icon
              return (
                <Card
                  key={bundle.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    bundle.featured
                      ? 'border-2 scale-105 shadow-xl hover:shadow-2xl hover:-translate-y-2'
                      : 'border border-white/10 hover:shadow-xl hover:-translate-y-1'
                  }`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(8px)',
                    borderColor: bundle.featured ? `oklch(0.82 0.12 85 / 0.4)` : undefined,
                    boxShadow: bundle.featured ? `0 0 30px rgba(214,184,92,0.15)` : undefined,
                  }}
                >
                  {bundle.featured && (
                    <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.82 0.12 85), oklch(0.72 0.09 85))`,
                        color: '#000',
                      }}
                    >
                      POPULAR
                    </div>
                  )}

                  <div className={`absolute inset-0 bg-gradient-to-br ${bundle.color} opacity-30 pointer-events-none`} />

                  <CardHeader className="relative">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.82 0.12 85 / 0.25), oklch(0.82 0.12 85 / 0.05))`,
                        border: `1px solid oklch(0.82 0.12 85 / 0.2)`,
                      }}
                    >
                      <Icon size={28} weight="bold" style={{ color: GOLD }} />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-white">{bundle.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm font-semibold text-gray-400">{bundle.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg mb-2 text-white">{bundle.headline}</h4>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{bundle.value}</p>
                    </div>

                    <div className="space-y-2">
                      {bundle.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check size={18} weight="bold" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="relative">
                    <Button
                      className="w-full font-semibold shadow-md text-sm"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.82 0.12 85), oklch(0.72 0.09 85))`,
                        color: '#000',
                      }}
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

          <div className="text-center mt-12">
            <p className="text-gray-500 text-xs sm:text-sm">
              Transforming businesses across the MENA region with integrated talent and technology solutions
            </p>
          </div>
        </div>
      </section>

      <Dialog open={showWaitlist} onOpenChange={setShowWaitlist}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">Join the Waitlist</DialogTitle>
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
              className="w-full font-semibold"
              style={{
                background: `linear-gradient(135deg, oklch(0.82 0.12 85), oklch(0.72 0.09 85))`,
                color: '#000',
              }}
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
