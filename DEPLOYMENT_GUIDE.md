# Eiger Marvel Workforce 360° — Implementation & Deployment Guide

**Last Updated:** January 25, 2026  
**Current Version:** 1.0  

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [File Structure](#file-structure)
3. [Deployment Options](#deployment-options)
4. [Customization Guide](#customization-guide)
5. [Integration Points](#integration-points)
6. [Analytics & Tracking](#analytics--tracking)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Testing (Local)

```bash
# Clone/download all files to your local machine
cd eiger-marvel-hr-plat

# Open any HTML file in a browser
open workforce360.html

# All pages work independently; no backend required
```

### For Deployment (Live Server)

```bash
# Option 1: Deploy to Netlify (fastest)
netlify deploy --dir ./

# Option 2: Deploy to your hosting provider
# Upload all HTML files to /public_html or /wwwroot

# Option 3: Deploy to AWS S3
aws s3 sync . s3://your-bucket/ --include "*.html"
```

---

## File Structure

```
eiger-marvel-hr-plat/
├── workforce360.html              # Main homepage
├── health-check.html              # Lead generation landing page
├── construction-solutions.html     # Construction industry page
├── hospitality-solutions.html      # Hospitality industry page
├── events-solutions.html           # Events industry page
├── blog-wps-compliance.html        # Blog: WPS compliance costs
├── blog-construction-hiring.html   # Blog: Construction hiring delays
├── blog-all-in-one-trap.html       # Blog: All-in-one HR systems
├── README.md                       # This file
└── _redirects                      # Netlify redirects (optional)
```

### Navigation Map

```
Home (workforce360.html)
├── How It Works → (scrolls to section)
├── Industries → (scrolls to section)
│   ├── Construction → /construction-solutions.html
│   ├── Hospitality → /hospitality-solutions.html
│   └── Events → /events-solutions.html
├── Pricing → (scrolls to section)
├── Health Check → /health-check.html
└── Blog articles
    ├── WPS Compliance → /blog-wps-compliance.html
    ├── Construction Hiring → /blog-construction-hiring.html
    └── All-in-One HR → /blog-all-in-one-trap.html
```

---

## Deployment Options

### Option 1: Netlify (Recommended — Free Tier Available)

**Setup (5 minutes):**

1. Create a free account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository (or drag-and-drop files)
3. Deploy:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir ./
   ```
4. Your site goes live at `[random-name].netlify.app`
5. Optional: Custom domain setup in Netlify dashboard

**Benefits:**
- Free HTTPS
- Auto-deploys from GitHub (push = live)
- CDN (fast globally)
- Form handling available (optional)

---

### Option 2: Vercel (Alternative)

1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Deploy automatically (no commands needed)
4. Get a production URL instantly

---

### Option 3: Traditional Hosting (cPanel, etc.)

1. Connect via SFTP or FTP
2. Upload all `.html` files to `/public_html`
3. Set `index.html` as your default document (or upload as `index.html`)
4. Test at `yoursite.com`

**Note:** You may need to set up a redirect from the homepage to `workforce360.html` if your CMS doesn't recognize it as a landing page.

---

### Option 4: Embedded in Existing Site (WordPress, Webflow, etc.)

If you have an existing website and want to embed the new landing pages:

**WordPress:**
```
1. Create a new page
2. Add an HTML block
3. Paste the content of `workforce360.html`
4. Publish
```

**Webflow:**
```
1. Create a new page
2. Use an HTML Embed element
3. Paste the complete HTML code
4. Save and publish
```

**Static Site Generators (Next.js, Hugo, etc.):**
```
1. Copy HTML files to your pages directory
2. Run your build process
3. Deploy as usual
```

---

## Customization Guide

### 1. Update Contact Information

**File:** All HTML files  
**Find & Replace:**

```
+971-XX-XXX-XXXX → Your actual phone number
info@eigermarvel.com → Your email
971XXXXXXXXX (in WhatsApp URL) → Your WhatsApp number
```

**Example:**
```html
<!-- OLD -->
<a href="https://wa.me/971XXXXXXXXX">WhatsApp</a>

<!-- NEW -->
<a href="https://wa.me/971501234567">WhatsApp</a>
```

---

### 2. Integrate Calendly Booking

**File:** `health-check.html` and `construction-solutions.html`  
**Location:** Calendar placeholder section

**Setup:**

1. Create a free Calendly account at [calendly.com](https://calendly.com)
2. Create a 30-minute "Workforce Health Check" event
3. Copy your embed code from Calendly settings
4. Replace the placeholder in `health-check.html`:

```html
<!-- OLD (placeholder) -->
<div class="calendar-placeholder">
  <p>Calendly Embed Placeholder</p>
  <p class="mini">Replace with your actual embed script...</p>
</div>

<!-- NEW (with Calendly) -->
<div class="calendar-embed">
  <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
  <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
  <script>
    Calendly.initInlineWidget({
      url: 'https://calendly.com/YOUR-USERNAME/health-check',
      parentElement: document.querySelector('.calendar-embed'),
      prefill: {}
    });
  </script>
</div>
```

---

### 3. Setup Form Email Notifications

**File:** `health-check.html`  
**Current:** Form data logs to browser console; no backend email

**To Receive Booking Emails:**

**Option A: Use Netlify Forms (Free)**

1. Update form in `health-check.html`:
```html
<form name="booking" method="POST" netlify>
  <!-- All existing form fields stay the same -->
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <!-- ... rest of form ... -->
</form>
```

2. Deploy to Netlify
3. Bookings appear automatically in Netlify dashboard → Forms
4. Setup Netlify email notifications in dashboard

**Option B: Use Formspree (Simple)**

```html
<form action="https://formspree.io/f/YOUR-FORM-ID" method="POST">
  <!-- All existing fields -->
</form>
```

1. Go to [formspree.io](https://formspree.io)
2. Create a form, get ID
3. Replace form action in HTML
4. Emails arrive in your inbox automatically

**Option C: Backend API**

If you have a backend (Node, Python, etc.), update the form handler:

```javascript
// In health-check.html, replace handleSubmit function
async function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Send to your backend
  const response = await fetch('https://api.yoursite.com/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    alert('Booking received! We\'ll contact you within 2 hours.');
    e.target.reset();
  } else {
    alert('Something went wrong. Please call us directly.');
  }
}
```

---

### 4. Update Pricing

**File:** `workforce360.html` and `health-check.html`  

**Current Pricing:**
- Compliance 360°: AED 5,500/month
- Growth 360°: AED 9,500/month
- Enterprise 360°: AED 18,000/month

**To Change:**

Find the pricing section and update:

```html
<!-- OLD -->
<p class="price">AED 5,500 / month</p>

<!-- NEW -->
<p class="price">AED 6,000 / month</p>
```

---

### 5. Update Brand Colors

**File:** All HTML files (in `<style>` section)

**Current Palette:**
```css
--gold: #d4af37           /* Primary CTA, brand color */
--bg-900: #0a0a0a        /* Dark background */
--bg-800: #121212        /* Lighter dark bg */
--bg-700: #1a1a1a        /* Light dark bg */
--text-100: #f5f5f5      /* Primary text (light) */
--text-300: #c9c9c9      /* Secondary text (gray) */
--accent-construction: #f39c12   /* Orange for construction cards */
--accent-hospitality: #3498db    /* Blue for hospitality cards */
--accent-events: #8e44ad         /* Purple for events cards */
```

**To Customize:**

1. Open any HTML file
2. Find the `:root { ... }` CSS section near the top
3. Update color values

Example: Change brand color from gold to cyan
```css
:root {
  --gold: #00d9ff;  /* Changed from #d4af37 */
  /* Rest stays the same */
}
```

---

### 6. Add Google Analytics Tracking

**File:** All HTML files  
**Location:** Add before `</body>` tag

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your Google Analytics measurement ID.

---

## Integration Points

### WhatsApp Button

**File:** `workforce360.html` and other pages  
**Location:** Bottom-right floating button

**Current URL:**
```html
<a class="wa" href="https://wa.me/971XXXXXXXXX">
```

**To Update:**
1. Replace `971XXXXXXXXX` with your WhatsApp number (country code + number, no spaces)
2. Example: `971501234567`

---

### Booking Calendar Embeddings

| Page | Booking Tool | Setup Time |
|------|------|------|
| `health-check.html` | Calendly, Formspree, or backend | 5 min (Calendly), 10 min (backend) |
| `construction-solutions.html` | Same as above | 5 min |
| `hospitality-solutions.html` | Same as above | 5 min |

---

### Email Notifications

**Recommended Setup:**

```
Booking Form → Formspree → Your Email
     ↓
  (Confirmation email to user)
     ↓
  (Booking in CRM / calendar)
```

**For Automation:**

Use Zapier to connect form submission to:
- Slack notification (instant alert)
- Google Calendar (auto-schedule)
- Email (confirmation to user)
- CRM (Salesforce, HubSpot, Pipedrive)

---

## Analytics & Tracking

### What to Monitor

**Traffic:**
- Homepage bounce rate (goal: <40%)
- Time on site (goal: 2–3 minutes)
- Industry page engagement (construction/hospitality/events)

**Conversions:**
- Health Check bookings (target: 10+ per month)
- Blog article reads (target: 500+ views/month by month 3)
- CTA clicks (button clicks before conversion)

**SEO:**
- Organic search traffic (target: 100+ monthly by month 3)
- Keyword rankings for "WPS compliance UAE", "construction recruitment UAE"

### Google Analytics 4 Setup

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Add tracking ID to all pages (see above)
3. Create custom events for button clicks:

```javascript
// Add to each CTA button
document.querySelector('.btn-primary').addEventListener('click', () => {
  gtag('event', 'health_check_cta_click', {
    'page_location': window.location.href
  });
});
```

4. Monitor in GA4 dashboard:
   - Engagement → Pages and screens (bounce rate, session duration)
   - Conversions → Create custom conversion goals for form submissions
   - Traffic sources → See where visitors come from

---

## Troubleshooting

### Issue: Pages not loading correctly

**Solution:**
- Check file paths in links (all HTML files should be in root directory)
- Ensure `.html` extension on all files
- Test locally first before uploading

### Issue: Calendly embed not showing

**Solution:**
1. Verify your Calendly URL is correct: `https://calendly.com/username/event-name`
2. Check that Calendly embed script is between `<head>` and `</head>` tags
3. Clear browser cache and refresh

### Issue: Form submissions not working

**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. If using Netlify: Ensure form has `netlify` attribute
3. If using Formspree: Verify form ID is correct
4. If custom backend: Check API endpoint URL and CORS settings

### Issue: Styling looks broken on mobile

**Solution:**
1. Check viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
2. Test on multiple devices (iPhone, Android, iPad)
3. Use Chrome DevTools to simulate devices (F12 → Device Mode)

### Issue: WhatsApp button not working

**Solution:**
1. Verify phone number format: `+971501234567` (no spaces or dashes)
2. Test URL directly: `https://wa.me/971501234567`
3. Ensure phone number is WhatsApp-enabled

---

## Next Steps

### Month 1: Launch & Optimize

- [ ] Deploy to production (Netlify or your server)
- [ ] Update all contact information and booking links
- [ ] Setup Google Analytics tracking
- [ ] Test all forms and CTAs
- [ ] Share with team and get feedback

### Month 2: Drive Traffic

- [ ] Publish blog articles on LinkedIn
- [ ] Share social media posts (construction, hospitality, events pages)
- [ ] Email existing contacts with health check offer
- [ ] Optimize based on GA4 data

### Month 3: Convert & Refine

- [ ] Analyze booking data: Which page converts best?
- [ ] A/B test CTAs and headlines
- [ ] Refine messaging based on traffic patterns
- [ ] Plan next content (case studies, testimonials)

---

## Support & Questions

**For technical issues:**
- Email: info@eigermarvel.com
- Phone: +971-XX-XXX-XXXX
- WhatsApp: Available 24/7

**For customization help:**
- This document covers 90% of common changes
- For code changes beyond this guide, consult a web developer

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 25, 2026 | Initial release with 8 pages, blog articles, landing pages |

---

**Last Reviewed:** January 25, 2026  
**Next Review:** February 28, 2026
