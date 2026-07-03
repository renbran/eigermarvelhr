import React from 'react'
import { PremiumBackground } from '@/components/ui/PremiumBackground'

const plans = [
  {
    name: 'Compliance 360°',
    price: '5,500',
    period: '/month',
    desc: 'Essential compliance and payroll support for growing teams.',
    employees: '10–30 employees',
    placements: '2 placements included',
    extra: 'AED 1,500 per additional placement',
    popular: false,
    features: [
      'WPS-compliant payroll processing',
      'MOHRE documentation management',
      'Employee records & visa tracking',
      'Basic HR policy framework',
      'Monthly compliance reports',
      'Email support (24h response)',
    ],
  },
  {
    name: 'Growth 360°',
    price: '9,500',
    period: '/month',
    desc: 'Full HR operations suite for scaling companies. Our most popular plan.',
    employees: '30–80 employees',
    placements: '4 placements included',
    extra: 'AED 1,200 per additional placement',
    popular: true,
    features: [
      'Everything in Compliance 360°, plus:',
      'Full recruitment cycle (7–14 day delivery)',
      'Odoo ERP access with HR & payroll modules',
      'Dedicated account manager',
      'Performance management setup',
      'Employee handbook creation',
      'Priority support (4h response)',
    ],
  },
  {
    name: 'Enterprise 360°',
    price: '18,000',
    period: '/month',
    desc: 'Enterprise-grade workforce management for large organizations.',
    employees: '80+ employees',
    placements: 'Unlimited placements',
    extra: 'No overage fees',
    popular: false,
    features: [
      'Everything in Growth 360°, plus:',
      'Unlimited recruitment across all roles',
      'Full Odoo ERP suite (HR, Payroll, CRM, Ops)',
      'Custom HR policy development',
      'Organizational restructuring support',
      'Quarterly business reviews',
      '24/7 dedicated support team',
    ],
  },
]

const faqs = [
  {
    q: 'Is skilled labor recruitment really free?',
    a: 'Yes — there are zero recruitment fees for skilled labor (operational, technical, and support roles). Executive hiring is charged at 8.33% (one month salary).',
  },
  {
    q: 'Are there any upfront fees?',
    a: 'Never. We invoice after service delivery. No deposits, no retainers, no subscription lock-in.',
  },
  {
    q: 'What if a candidate doesn\'t work out?',
    a: 'Every placement is backed by a 3-month guarantee — if a candidate isn\'t the right fit, we replace them at no additional cost.',
  },
  {
    q: 'Can I switch plans as my company grows?',
    a: 'Absolutely. Upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle.',
  },
]

export function PricingPage() {
  return (
    <div className="min-h-screen">
      <PremiumBackground variant="editorial" />
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(184,145,44,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Transparent Pricing</span>
            <span className="h-px w-8 bg-accent/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
            No Hidden Fees. <span className="text-accent">No Surprises.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your organization size. All plans include WPS-compliant payroll, MOHRE documentation, and dedicated support.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card/50 backdrop-blur-sm border rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-500 hover:shadow-xl ${
                plan.popular
                  ? 'border-accent/50 shadow-lg shadow-accent/10 scale-[1.02] md:scale-105'
                  : 'border-border/60 hover:border-accent/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-accent/90 text-accent-foreground text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">AED {plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-accent/80 font-medium">{plan.employees}</p>
                <p className="text-sm text-muted-foreground">{plan.placements}</p>
                <p className="text-xs text-muted-foreground mt-1">{plan.extra}</p>
              </div>

              <div className="flex-1">
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-muted-foreground flex items-start gap-2">
                      <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => window.location.href = 'tel:+97145751100'}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:shadow-xl hover:scale-[1.02]'
                    : 'border border-accent/50 text-accent hover:bg-accent/10'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How We Compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Job Portals</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Other Agencies</th>
                  <th className="text-center py-3 px-4 font-semibold text-accent">Eiger Marvel</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Skilled Labor Cost', 'AED 500–2K/mo + your time', 'AED 1,500–3,000/head', 'FREE'],
                  ['Executive Hiring Cost', 'DIY (unpredictable)', '15–20% of annual salary', '8.33% (1 month)'],
                  ['Time to Hire', '30–60 days (DIY screen)', '30–45 days', '18 days average'],
                  ['Candidate Vetting', 'None (DIY)', 'Basic', 'Thorough (90% success)'],
                  ['Guarantee Period', 'None', '30–90 days', '3 months (best)'],
                  ['Upfront Payment', 'Subscription', 'Often required', 'Never'],
                  ['Personal Service', 'Automated', 'Generic', 'Dedicated recruiter'],
                ].map(([feature, portal, agency, em]) => (
                  <tr key={feature} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{feature}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{portal}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{agency}</td>
                    <td className="text-center py-3 px-4 text-accent font-semibold">{em}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-card/30 border border-border/60 rounded-xl overflow-hidden">
                <summary className="p-4 sm:p-5 font-semibold text-foreground cursor-pointer list-none flex items-center justify-between hover:bg-card/50 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-accent transition-transform group-open:rotate-180 flex-shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
