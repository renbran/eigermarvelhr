# Deep Interview Spec: Eiger Marvel HR Platform — Comprehensive Audit

## Metadata
- Interview ID: di-eiger-audit-001
- Rounds: 8
- Final Ambiguity Score: 45%
- Type: brownfield
- Generated: 2026-07-06
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.65 | 35% | 0.2275 |
| Constraint Clarity | 0.40 | 25% | 0.100 |
| Success Criteria | 0.55 | 25% | 0.1375 |
| Context Clarity | 0.55 | 15% | 0.0825 |
| **Total Clarity** | | | **0.548** |
| **Ambiguity** | | | **45%** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Mobile Compatibility | Active | Responsive layout, touch targets, PWA readiness, mobile UX polish | Full audit + service worker implementation for 90+ mobile Lighthouse |
| Performance | Active | Bundle size, Core Web Vitals, animation optimization, Lighthouse scores | Full Lighthouse audit targeting 90+ on all categories, mobile + desktop |
| Dead Code & Bloat | Active | Unused deps, dead components, bundle bloat, duplicated features | Identification + removal across npm packages and source code |
| SEO & Accessibility | Active | Meta tags, structured data, crawlability, a11y, routing recommendations | Both in scope; includes hash-routing analysis and recommendations |
| Code Quality & Health | Active | TS strictness, lint/errors, runtime bugs, patterns, testing | Comprehensive code health audit with fixes |

## Goal
Perform a comprehensive production-readiness audit of the Eiger Marvel HR platform (React 19 SPA) covering mobile compatibility, performance, dead code, SEO/accessibility, and code quality. All identified issues must be fixed — not just reported.

## Constraints
- Full audit + implement all fixes across all 5 areas
- No explicit time/effort limit
- Mobile + Desktop Lighthouse target: 90+ all categories
- Full PWA capability including service worker (installable, offline support)
- Hash-routing analysis is in scope as part of SEO audit
- All images in WebP/AVIF (maintain existing)
- Deployment is Cloudflare Pages

## Non-Goals
- No changes to the Odoo backend (existing PRODUCTION_READINESS_ASSESSMENT covers that)
- No infrastructure changes (deployment platform stays Cloudflare Pages)
- No database or API architecture changes

## Acceptance Criteria
- [ ] Lighthouse 90+ on Performance, Accessibility, Best Practices, SEO for both mobile and desktop
- [ ] No console errors in production (including the Lenis ReferenceError)
- [ ] Service worker implemented for PWA installability + offline support
- [ ] Web App Manifest validated and functional
- [ ] Dead code identified and removed (dependencies, components, unused imports)
- [ ] Bundle size optimized (at minimum identify all opportunities)
- [ ] All interactive elements pass touch target guidelines (48px minimum)
- [ ] No horizontal scroll on mobile viewports
- [ ] SEO meta tags verified and correct for each "page" (including hash routes)
- [ ] Structured data (JSON-LD) validated
- [ ] Accessibility audit passed (semantic HTML, heading hierarchy, alt text)
- [ ] TypeScript strictness issues identified (at minimum document gaps)
- [ ] ESLint clean (no errors)
- [ ] All known runtime bugs fixed
- [ ] Audit report with findings + actions delivered

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Mobile works fine" | Asked what "mobile compatible" means | "Works but needs polish" — known gaps in PWA/offline |
| "Performance is good" | Challenged with lack of mobile data | Full Lighthouse audit needed, mobile + desktop, 90+ target |
| "Hash routing is fine for SEO" | Asked about routing approach | "Include routing recommendations" in scope |
| "Code quality is important" | Contrarian: is it the bottleneck? | Confirmed — comprehensive code audit wanted |

## Technical Context
**Project**: Vite 7 + React 19 + TypeScript + Tailwind 4 SPA
**Deployment**: Cloudflare Pages (Wrangler) + Vercel config present
**Current State**:
- Desktop Lighthouse: FCP 1.4s, LCP 1.4s, TBT 0ms, CLS 0.011 (good desktop scores)
- No mobile Lighthouse data
- Console error: `ReferenceError: Lenis is not defined`
- Hash-based routing for all "pages" (`/#dashboard`, `/#jobs`, etc.)
- PWA manifest exists but no service worker
- All images in WebP/AVIF
- Brotli + Gzip compression configured
- Vendor chunking (react, gsap, motion, three, icons)
- 48 runtime dependencies, many animation/motion libraries
- TypeScript: partial strictness (strictNullChecks only)
- ESLint configured with TypeScript-ESLint
- React.lazy() code splitting for 11 components
- Tailwind custom screens: coarse, fine, pwa

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Eiger Marvel Platform | core | routes, components, styles, deps | hosts all pages and features |
| Lighthouse | audit tool | scores, audits, categories | measures all 5 audit dimensions |
| Mobile Experience | concern device | viewport, touch, PWA, offline | depends on service worker + responsive design |
| PWA | capability | manifest, service worker, install | extends mobile compatibility |
| Bundle | performance unit | JS, CSS, assets, chunks | optimized via code splitting + vendor chunks |
| Search Engine | external system | crawler, index, ranking | affected by meta, structured data, routing |
| Animation Library | dependency | GSAP, Framer Motion, Three.js, Lenis | used across multiple components |
| ErrorBoundary | component | fallback UI, error catching | wraps entire app at root |
| ServiceWorker | feature | offline cache, install event, fetch handler | to be implemented |
| TypeScript Config | config | strictNullChecks, noImplicitAny, strict | gap analysis target |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 3 | 3 | - | - | - |
| 8 | 10 | 7 | 0 | 3 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (8 rounds)</summary>

### Round 0
**Q:** Topology confirmation — 5 components: Mobile, Performance, Dead Code, SEO/Accessibility, Code Quality?
**A:** Looks right — proceed

### Round 1
**Q:** What does "mobile compatibility" mean? Polish? Full assessment? PWA focus? Known issues?
**A:** Works but needs polish

### Round 2
**Q:** What does "performance" mean? Full Lighthouse? Bundle size? Mobile focus?
**A:** Full Lighthouse audit

### Round 3
**Q:** What should dead code audit cover? Dependencies? Components? Both? Bundle analysis?
**A:** All of the above

### Round 4
**Q:** SEO routing (hash OK?) and accessibility scope?
**A:** SEO + Accessibility both (including routing recommendations)

### Round 5
**Q:** (Contrarian) What drives the code quality concern? General health? Bugs? Testing? Security?
**A:** Comprehensive code audit

### Round 6
**Q:** Constraints — time budget? Depth? Exclusions? Priorities?
**A:** Full audit + all fixes

### Round 7
**Q:** What does "done" look like? Lighthouse targets? Specific success criteria?
**A:** Production-ready certification

### Round 8
**Q:** Mobile Lighthouse target? PWA with service worker?
**A:** 90+ Lighthouse + full PWA

</details>
