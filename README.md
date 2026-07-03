# Eiger Marvel HR Platform

**Master Recruiter for Construction & Hospitality | UAE**

Vite 7 + React 19 + TypeScript + Tailwind 4 SPA. Deployed on Cloudflare Pages.

## Quick Start

```bash
npm install
npm run dev        # dev server at localhost:5173
npm run build      # production build → dist/
npm run typecheck  # TypeScript validation
```

## Project Structure

```
src/                    React application
  App.tsx               Root component with route meta + Helmet
  main.tsx              Entry point (HelmetProvider)
  components/           React components
  lib/                  Utilities, API clients
  animations/           GSAP/Framer Motion animations
  assets/images/        Partner logos (WebP)
public/                 Static assets
  images/               Slideshows, icons, team photos (WebP/AVIF)
  robots.txt            SEO
  sitemap.xml           SEO
  llms.txt              AI-crawler surface
dist/                   Build output
_headers                Cloudflare security headers
_redirects              Cloudflare redirect rules + SPA fallback
wrangler.toml           Cloudflare Pages config
```

## Deploy

`npm run build` → deploy `dist/` via Cloudflare Pages (Wrangler).

## Performance

- Code-splitting via React.lazy() + Suspense
- Vendor chunking (react, gsap, motion, icons)
- All images in WebP (~46 MB reduction from PNGs)
- Brotli: ~95% compression ratio on JS bundle
