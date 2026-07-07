import React from 'react'
import { PremiumBackground } from '@/components/ui/PremiumBackground'

const articles = [
  {
    title: 'The Hidden Costs of WPS Non-Compliance in UAE',
    excerpt: 'WPS fines cost companies AED 5,000–50,000 annually. Learn how automation eliminates penalties, streamlines salary processing, and protects your business from MOHRE audits.',
    readTime: '8 min read',
    date: 'Feb 10, 2026',
    category: 'Compliance',
    tag: 'WPS & Payroll',
    gradient: 'from-amber-900/20 via-amber-800/5 to-transparent',
  },
  {
    title: 'Why UAE Construction Companies Are Losing Projects to Hiring Delays',
    excerpt: '3-month hiring delays cost AED 500K+ per project. Discover how structured recruitment processes compress timelines to 14 days without compromising quality.',
    readTime: '7 min read',
    date: 'Jan 28, 2026',
    category: 'Construction',
    tag: 'Recruitment',
    gradient: 'from-sky-900/20 via-sky-800/5 to-transparent',
  },
  {
    title: 'The All-in-One HR System Trap: Why Most UAE Businesses Get It Wrong',
    excerpt: 'Why stitching together separate HR, payroll, and recruitment tools costs more than you think — and how an integrated ERP approach eliminates the overhead.',
    readTime: '9 min read',
    date: 'Jan 15, 2026',
    category: 'Operations',
    tag: 'ERP & Systems',
    gradient: 'from-purple-900/20 via-purple-800/5 to-transparent',
  },
]

export function InsightsPage() {
  return (
    <div className="min-h-screen">
      <PremiumBackground variant="default" />
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(var(--gold-rgb), 0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-accent/50" />
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-accent/70">Insights & Resources</span>
            <span className="h-px w-8 bg-accent/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
            Latest from the <span className="text-accent">Eiger Marvel Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert guides on UAE recruitment, compliance, payroll, and workforce management.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid gap-6 sm:gap-8">
          {articles.map((article) => (
            <article
              key={article.title}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 sm:p-8 overflow-hidden hover:border-accent/30 transition-all duration-500 hover:shadow-xl cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${article.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{article.category}</span>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {article.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                  <span>{article.tag}</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center bg-card/30 border border-border/60 rounded-3xl p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stay Ahead of UAE Workforce Trends</h2>
          <p className="text-muted-foreground mb-8">Get the latest insights on recruitment, compliance, and HR technology delivered to your inbox.</p>
          <form className="max-w-md mx-auto flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground text-sm"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-xl hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
