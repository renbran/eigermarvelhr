# Planning Guide

Eiger Marvel HR Consultancies is an enterprise HR recruitment and consultancy platform that serves as the digital transformation engine for a Dubai-based HR consultancy positioning for integrated HR+Technology leadership in the MENA region.

**Experience Qualities**: 
1. **Elite Professional** - The platform exudes UAE corporate excellence with sophisticated visual design reflecting the premium positioning of the consultancy brand
2. **Intelligent Efficiency** - AI-powered matching and streamlined workflows create a frictionless experience from job discovery to application submission
3. **Business-First Transformation** - Every feature drives revenue through premium subscriptions, employer services, and TalentTech waitlist capture for future consulting opportunities

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This platform requires sophisticated role-based authentication (candidates, employers, admins), AI matching algorithms, payment integration, multi-step workflows, comprehensive dashboards, and data-driven business intelligence.

## Essential Features

### User Authentication & Onboarding
- **Functionality**: Three-tier authentication system supporting candidates, employers, and admin roles with profile-specific onboarding flows
- **Purpose**: Segment users for personalized experiences and enable role-specific features while building comprehensive profiles for AI matching
- **Trigger**: User clicks "Register" and selects account type (Candidate/Employer)
- **Progression**: Registration form → Email verification → Profile completion wizard → Dashboard access → Feature discovery
- **Success Criteria**: 90%+ profile completion rate, <2 minutes from registration to first action, clear role separation

### AI-Powered Job Matching
- **Functionality**: Algorithm calculating compatibility scores between candidate profiles and job postings based on skills (50%), experience (30%), and location (20%)
- **Purpose**: Reduce time-to-hire by surfacing best-fit opportunities and candidates, creating competitive differentiation
- **Trigger**: Candidate views job listings or employer reviews applicants
- **Progression**: User action → Profile/job data extraction → Score calculation → Results ranked by match + premium status → Display with visual indicators
- **Success Criteria**: Match scores correlate with application success rate >70%, visible score explanations increase application conversion 30%+

### Job Board & Application System
- **Functionality**: Advanced job listing platform with filtering, search, AI match indicators, and one-click application submission
- **Purpose**: Core revenue driver connecting candidates with opportunities while generating employer value
- **Trigger**: User navigates to "Jobs" or searches from homepage
- **Progression**: Browse/search → Filter refinement → Job detail view → Match score review → One-click apply → Confirmation
- **Success Criteria**: <3 clicks from search to application, 40%+ job view to application conversion, <500ms filter response time

### Premium Subscription Monetization
- **Functionality**: AED 299/month Stripe-powered subscription offering candidates 15% match boost, premium badge, priority visibility, and daily AI matches
- **Purpose**: Primary revenue stream targeting career-focused professionals willing to invest in visibility
- **Trigger**: Candidate sees free vs premium comparison on profile page or job listings
- **Progression**: Upgrade CTA → Benefit comparison → Stripe checkout → Payment → Instant premium activation → Badge display
- **Success Criteria**: 4%+ freemium conversion rate, <30 second checkout completion, visual premium benefits immediately apparent

### Employer Dashboard & Candidate Pipeline
- **Functionality**: Comprehensive recruitment management system with job posting, AI-ranked candidate review, pipeline management, and performance analytics
- **Purpose**: Deliver employer value justifying job posting fees and consultancy relationships
- **Trigger**: Employer logs in or completes job posting
- **Progression**: Dashboard view → Job performance metrics → Candidate list (sorted by match) → Profile review → Status update → Communication
- **Success Criteria**: Employers review 80%+ of matched candidates, time-to-shortlist reduced 50%, job posting completion rate >90%

### TalentTech Waitlist Capture
- **Functionality**: Strategic "Coming Soon" section showcasing three bundled HR+Tech packages (Starter/Professional/Enterprise) with waitlist signup
- **Purpose**: Generate high-value leads for future consultancy bundles combining recruitment with AI ERP implementation
- **Trigger**: Homepage scroll to TalentTech section or navigation to dedicated page
- **Progression**: Bundle comparison → Interest identification → Waitlist form → Company details submission → Confirmation with follow-up promise
- **Success Criteria**: 25+ waitlist signups in first 30 days, average company size >50 employees, 60%+ provide complete contact details

## Edge Case Handling

- **Incomplete Profiles**: Progressive disclosure encourages profile completion with visual progress bars and feature unlocks at milestones
- **No Job Matches**: Display skills development recommendations and similar jobs in adjacent industries or locations
- **Payment Failures**: Retry logic with clear error messaging, fallback to manual payment coordination with admin contact
- **Employer Verification Pending**: Limited dashboard access until trade license verified, clear timeline expectations
- **Premium Expiry**: 3-day grace period with upgrade prompts, soft downgrade maintaining historical data
- **Mobile Form Abandonment**: Multi-step forms with progress saving, resume on any device

## Design Direction

The design should evoke UAE corporate prestige and digital sophistication - think Emirates Airlines meets LinkedIn meets premium financial services. Users should feel they're engaging with an elite, technology-forward consultancy that understands both human capital excellence and cutting-edge innovation. Every interaction reinforces trust, professionalism, and transformation potential.

## Color Selection

The color palette balances deep corporate professionalism with strategic gold accents signaling premium positioning.

- **Primary Color**: Deep Navy Blue (oklch(0.185 0.035 255)) - Communicates trust, corporate stability, and UAE business sophistication; used for headers, navigation, primary buttons
- **Secondary Colors**: 
  - Clean White (oklch(1 0 0)) - Creates breathing room and modern minimalism
  - Slate Gray (oklch(0.45 0.015 255)) - Supporting text and subtle backgrounds
  - Light Gray (oklch(0.96 0.002 255)) - Card backgrounds and section dividers
- **Accent Color**: Premium Gold (oklch(0.72 0.12 85)) - Exclusively for CTAs, premium badges, TalentTech bundles, and conversion-focused elements; creates luxury association
- **Foreground/Background Pairings**: 
  - Deep Navy (oklch(0.185 0.035 255)): White text (oklch(1 0 0)) - Ratio 12.3:1 ✓
  - Premium Gold (oklch(0.72 0.12 85)): Deep Navy text (oklch(0.185 0.035 255)) - Ratio 5.2:1 ✓
  - White (oklch(1 0 0)): Deep Navy text (oklch(0.185 0.035 255)) - Ratio 12.3:1 ✓
  - Light Gray (oklch(0.96 0.002 255)): Slate text (oklch(0.45 0.015 255)) - Ratio 7.1:1 ✓

## Font Selection

Typography should project international corporate credibility with exceptional readability across devices - Inter font family throughout creates modern SaaS sophistication while maintaining professional gravitas suitable for UAE enterprise context.

- **Typographic Hierarchy**: 
  - H1 (Hero Headlines): Inter Bold/48px/tight (-0.02em) letter spacing/line-height 1.1
  - H2 (Section Headers): Inter SemiBold/36px/tight (-0.01em) letter spacing/line-height 1.2
  - H3 (Card Titles): Inter SemiBold/24px/normal letter spacing/line-height 1.3
  - Body Text: Inter Regular/16px/normal letter spacing/line-height 1.6
  - Small Text (Meta): Inter Regular/14px/normal letter spacing/line-height 1.5
  - CTA Buttons: Inter SemiBold/16px/normal letter spacing/uppercase

## Animations

Animations should emphasize business intelligence and responsive professionalism - subtle transitions reinforce platform reliability while strategic motion draws attention to AI matching scores and premium features. Primary uses: match score count-ups (create anticipation), smooth job card reveals on scroll (progressive discovery), premium badge pulse (draw conversion attention), and fluid dashboard metric updates (emphasize real-time intelligence).

## Component Selection

- **Components**: 
  - Navigation: Custom header with dropdown menus for role-specific links, mobile-responsive hamburger
  - Job Cards: Shadcn Card with custom match score badge overlay, bookmark button, salary range display
  - Forms: Shadcn Form + Input + Select with multi-step wizard using Tabs for onboarding flows
  - Authentication: Shadcn Dialog with custom branded login/register forms
  - Dashboard: Custom layout with Shadcn Table for candidate lists, Badge for status indicators
  - TalentTech Bundles: Shadcn Card with custom gold accent borders and hover lift effects
  - Payments: Shadcn Button integrated with Stripe checkout overlay
  - Filters: Shadcn Select + Slider for job search refinement
  - Notifications: Sonner toast for application confirmations and success states
  - Loading States: Shadcn Skeleton for content loading, custom spinner for AI matching
  
- **Customizations**: 
  - Premium badge component with gold gradient and subtle glow effect
  - AI match score circular progress indicator with percentage display
  - Job posting wizard with custom multi-step validation
  - Employer candidate pipeline Kanban board (custom drag-drop later, static status columns Phase 1)
  
- **States**: 
  - Buttons: Navy solid (default) → Navy+10% brightness (hover) → Navy-5% brightness (active), disabled 50% opacity
  - Form Inputs: Gray border (default) → Navy border + subtle glow (focus) → Red border (error) → Green border (success)
  - Job Cards: White background + subtle shadow (default) → lifted shadow + navy border (hover) → scale 0.98 (click)
  - Premium Badge: Gold gradient with 1s pulse animation on initial load, static otherwise
  
- **Icon Selection**: 
  - Phosphor Icons: Briefcase (jobs), User (profile), Buildings (employers), CrownSimple (premium), MagnifyingGlass (search), FunnelSimple (filters), Lightning (AI features), ArrowRight (CTAs), Check (success), X (close), CaretDown (dropdowns), Star (featured)
  
- **Spacing**: 
  - Consistent 8px base unit: gap-2 (8px), gap-4 (16px), gap-6 (24px), gap-8 (32px)
  - Section padding: py-16 (64px) desktop, py-12 (48px) mobile
  - Card padding: p-6 (24px) standard, p-8 (32px) for featured content
  - Form field spacing: space-y-4 (16px) between fields
  
- **Mobile**: 
  - Navigation collapses to hamburger menu <768px with full-screen overlay
  - Job cards stack vertically on mobile, horizontal on tablet+
  - Multi-step forms show progress dots on mobile, full sidebar on desktop
  - Dashboard switches from multi-column grid to single column on mobile
  - TalentTech bundles stack vertically <1024px with full-width CTAs
  - Filter panel becomes bottom sheet drawer on mobile
  - Table views convert to card-based layouts on mobile
