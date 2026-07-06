# Autopilot Implementation Plan: Eiger Marvel Comprehensive Audit

**Source**: `.omc/specs/deep-interview-eiger-audit.md`
**Generated**: 2026-07-06

---

## Execution Order (Dependency-Aware)

```
Phase 2a: Code Quality & Fixes ──────────┐
    (fix Lenis error, ESLint, TS strict) │
                                          ├──> Phase 2e: Performance Audit
Phase 2b: Dead Code Removal ─────────────┘    (after codebase cleanup)
    (unused deps, components, imports)

Phase 2c: Mobile Compatibility ──────────┐
    (PWA, service worker, touch targets) │
                                          ├──> Phase 3: QA (verify + build)
Phase 2d: SEO & Accessibility ───────────┘    (run Lighthouse, lint, typecheck)
    (meta, structured data, a11y, html)
```

---

## Phase 2a: Code Quality & Health

### Steps:
1. **Fix Lenis runtime error**: Locate the `ReferenceError: Lenis is not defined` source in production HTML (`src/pages/index.html` line ~482) — it's loading Lenis via CDN but the variable isn't available at that point. Fix by ensuring Lenis is loaded correctly or removing the inline script.
2. **ESLint audit**: Run `npm run lint` — fix or suppress any remaining errors.
3. **TypeScript strictness audit**: Check current `tsconfig.json` gaps. Document what `strict: true` would break.
4. **Error handling patterns audit**: Check for bare `console.error`, empty catch blocks, unhandled promise rejections.

### Files to examine:
- `src/App.tsx` — error handling, loading states
- `src/main.tsx` — root setup
- `tsconfig.json` — strictness config
- `eslint.config.js` — lint rules

---

## Phase 2b: Dead Code & Dependency Bloat

### Steps:
1. **Dependency audit**: Check each of the 48 runtime deps for actual usage via import scanning.
   - Candidates for review: `three`, `@react-three/fiber`, `matter-js`, `simplex-noise`, `vivus`, `flubber`, `svg-path-properties`, `canvas-confetti`, `rough-notation`, `react-fast-marquee`
2. **Duplicate functionality check**: `lenis` vs `framer-motion` for smooth scroll; `d3` vs `recharts` for charts.
3. **Component dead code**: Scan `src/components/` for unused files.
4. **Remove unused dependencies** from `package.json`.

---

## Phase 2c: Mobile Compatibility + PWA

### Steps:
1. **Service worker implementation** (highest impact):
   - Create `public/sw.js` with cache-first strategy for static assets
   - Register from `src/main.tsx`
   - Test offline capability
2. **Web App Manifest** — verify existing `public/site.webmanifest` is complete
3. **Touch target audit**: Check interactive elements for 48px minimum target size
4. **Mobile viewport check**: Verify no horizontal scroll, proper responsive breakpoints
5. **Run mobile Lighthouse** to establish baseline

---

## Phase 2d: SEO & Accessibility

### Steps:
1. **SEO meta audit**: Verify each route in `ROUTE_META` in `src/App.tsx` has correct title and description. Check canonical URLs.
2. **Structured data validation**: Validate the JSON-LD in `src/pages/index.html` with schema.org validator
3. **Accessibility scan**: Check heading hierarchy, alt text, form labels, keyboard navigation
4. **Hash routing analysis**: Document the impact of hash-based SPA routing on SEO. Provide recommendations.
5. **Sitemap**: Verify `public/sitemap.xml` covers all content

---

## Phase 2e: Performance

### Steps:
1. **Run Lighthouse mobile + desktop** — establish scores
2. **Bundle analysis**: Run `npx vite build` with visualizer, analyze chunk sizes
3. **Image optimization check**: Verify all images have proper sizes and formats
4. **Font loading**: Check `@fontsource` loading strategy (swap, preconnect)
5. **Animation performance**: Flag GPU-heavy animations (GSAP, particles) for review
6. **Implement performance fixes** based on findings

---

## Success Criteria Mapping

| AC # | Criteria | Phase | Verification |
|------|----------|-------|-------------|
| AC1 | Lighthouse 90+ mobile + desktop | Phase 2e | Lighthouse run |
| AC2 | No console errors | Phase 2a | Browser console check |
| AC3 | Service worker + PWA | Phase 2c | Lighthouse PWA audit |
| AC4 | Manifest valid | Phase 2c | Lighthouse PWA check |
| AC5 | Dead code removed | Phase 2b | Import scan + bundle size |
| AC6 | Bundle optimized | Phase 2e | Visualizer output |
| AC7 | Touch targets 48px | Phase 2c | Manual check + Lighthouse |
| AC8 | No horizontal scroll | Phase 2c | Viewport testing |
| AC9 | SEO meta correct | Phase 2d | Source review |
| AC10 | Structured data valid | Phase 2d | Schema.org validator |
| AC11 | Accessibility passed | Phase 2d | Lighthouse a11y audit |
| AC12 | TS strictness documented | Phase 2a | tsconfig review |
| AC13 | ESLint clean | Phase 2a | `npm run lint` |
| AC14 | Runtime bugs fixed | Phase 2a | Lenis error fix |
| AC15 | Audit report delivered | Phase 5 | `.omc/reports/` |
