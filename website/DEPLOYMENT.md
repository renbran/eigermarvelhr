# 🚀 DEPLOYMENT GUIDE
## Embedding Your HR Platform into Odoo

This guide will walk you through deploying your website and integrating it into Odoo in **3 simple steps**.

---

## 📋 WHAT YOU'LL NEED

- [ ] GitHub account (you already have: renbran/eiger-marvel-hr-plat)
- [ ] Access to your Odoo instance (admin or website editor)
- [ ] 15-30 minutes of time
- [ ] Internet connection

---

## 🎯 DEPLOYMENT OPTIONS

Choose ONE of these hosting options:

### **Option A: GitHub Pages** (RECOMMENDED - Easiest)
- ✅ 100% Free
- ✅ Automatic deployment from your repo
- ✅ Already set up for you
- ✅ Built-in HTTPS
- ⏱️ Takes: 5 minutes

### **Option B: Netlify**
- ✅ Free tier generous
- ✅ More features (forms, functions)
- ✅ Easy drag-and-drop
- ⏱️ Takes: 10 minutes

### **Option C: Vercel**
- ✅ Free for personal projects
- ✅ Great performance
- ✅ Easy GitHub integration
- ⏱️ Takes: 10 minutes

---

## 🔥 STEP-BY-STEP DEPLOYMENT

### **OPTION A: GitHub Pages (RECOMMENDED)**

#### Step 1: Push Your Changes to GitHub

Open your terminal/command prompt and run:

```bash
cd "d:\01_WORK_PROJECTS\EM WEBSITE\eiger-marvel-hr-plat\website"

# Add all the new configuration files
git add .
git commit -m "Add deployment configuration and Odoo integration"
git push origin main
```

#### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub:
   `https://github.com/renbran/eiger-marvel-hr-plat`

2. Click **Settings** (top right)

3. Scroll down to **Pages** section (left sidebar)

4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/website` or `/root` (depending on structure)
   - Click **Save**

5. Wait 2-3 minutes for deployment

6. Your site will be live at:
   ```
   https://renbran.github.io/eiger-marvel-hr-plat/
   ```
   OR
   ```
   https://renbran.github.io/eiger-marvel-hr-plat/website/
   ```

7. **Test it** - Open the URL in your browser to confirm it works

#### Step 3: Update Configuration

Once deployed, you need to update the `_config.yml` file with your actual URL:

1. Open `_config.yml` in your editor

2. Update this line:
   ```yaml
   url: "https://renbran.github.io"
   ```
   
   To your actual URL (check GitHub Pages settings for exact URL)

3. If your site is in a subfolder, update:
   ```yaml
   baseurl: "/eiger-marvel-hr-plat"
   ```

4. Save and push changes:
   ```bash
   git add _config.yml
   git commit -m "Update site URL configuration"
   git push origin main
   ```

---

### **OPTION B: Netlify**

#### Step 1: Create Netlify Account

1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Sign up with your GitHub account (easiest)
3. Authorize Netlify to access your repositories

#### Step 2: Deploy from GitHub

1. Click **Add new site** → **Import an existing project**

2. Choose **GitHub**

3. Select your repository: `renbran/eiger-marvel-hr-plat`

4. Configure build settings:
   - **Base directory:** `website`
   - **Build command:** (leave empty - static site)
   - **Publish directory:** `.` (current directory)

5. Click **Deploy site**

6. Wait 1-2 minutes for deployment

7. Your site will be live at:
   ```
   https://random-name-12345.netlify.app
   ```

#### Step 3: Custom Domain (Optional)

1. In Netlify dashboard, click **Domain settings**

2. Click **Add custom domain**

3. Enter your domain (e.g., `workforce360.eigermarvel.com`)

4. Follow DNS configuration instructions

5. Enable HTTPS (automatic with Let's Encrypt)

---

### **OPTION C: Vercel**

#### Step 1: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel

#### Step 2: Deploy from GitHub

1. Click **Add New Project**

2. Import `renbran/eiger-marvel-hr-plat`

3. Configure:
   - **Root Directory:** `website`
   - **Framework Preset:** Other
   - Leave build commands empty

4. Click **Deploy**

5. Wait 1-2 minutes

6. Your site will be live at:
   ```
   https://eiger-marvel-hr-plat.vercel.app
   ```

#### Step 3: Update Domain Settings

1. Vercel will automatically detect and configure

2. Optional: Add custom domain in project settings

---

## 🔗 ODOO INTEGRATION

Once your site is deployed and you have the URL, follow these steps to integrate it into Odoo:

### Step 1: Update Odoo Integration Code

1. Open the file: `ODOO_INTEGRATION.html`

2. Find and replace **ALL** instances of:
   ```
   YOUR-HOSTED-WEBSITE-URL
   ```
   
   With your actual URL, for example:
   ```
   https://renbran.github.io/eiger-marvel-hr-plat/
   ```

3. Save the file

### Step 2: Create New Page in Odoo

1. Log into your Odoo instance

2. Go to **Website** app

3. Click **+ New** → **Page**

4. Enter page details:
   - **Page Title:** `Workforce 360°` or `HR Platform`
   - **URL:** `/workforce-360` or `/hr-platform`

5. Click **Create**

### Step 3: Add Integration Code

1. On the new page, click **Edit**

2. Click anywhere in the content area

3. In the editor toolbar, find the **< />** icon (HTML editor)
   - Or use **Insert** → **Code** → **HTML**

4. **Delete all default content**

5. **Copy the ENTIRE contents** of `ODOO_INTEGRATION.html`

6. **Paste** into the HTML editor

7. Click **Save**

### Step 4: Create Menu Link

1. Go to **Website** → **Configuration** → **Menus**

2. Click **Create**

3. Fill in:
   - **Menu:** `Workforce 360°` (or your preferred name)
   - **URL:** `/workforce-360` (match the page URL you created)
   - **Parent Menu:** `Top Menu` (or wherever you want it)
   - **Sequence:** Adjust to control position

4. Click **Save**

### Step 5: Publish and Test

1. Go back to your page editor

2. Click **Publish** (top right)

3. Open your Odoo website in a new browser

4. You should see the new menu item

5. Click it - your HR platform should load inside Odoo!

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify everything works:

### Website Deployment
- [ ] Site loads at hosted URL (no errors)
- [ ] All styles are applied correctly
- [ ] Images load (if any)
- [ ] Forms work properly
- [ ] WhatsApp button works
- [ ] Mobile responsive (test on phone)
- [ ] HTTPS is enabled (secure)

### Odoo Integration
- [ ] Menu item appears in Odoo navbar
- [ ] Clicking menu loads the embedded page
- [ ] Embedded site displays correctly
- [ ] Loading spinner shows then disappears
- [ ] No console errors (press F12 to check)
- [ ] Forms work within iframe
- [ ] WhatsApp button works from iframe
- [ ] Mobile view works in Odoo
- [ ] Desktop view works in Odoo
- [ ] No security warnings/blocked content

---

## 🔧 TROUBLESHOOTING

### Site doesn't load in iframe

**Problem:** Blank iframe or "Refused to connect" error

**Solutions:**
1. Check if your hosting allows iframe embedding
2. For GitHub Pages: May need custom domain for CORS
3. Update security headers in deployment config files
4. Try Netlify or Vercel (better iframe support)

### Styles are broken

**Problem:** Site looks unstyled or broken

**Solutions:**
1. Check that paths to CSS/JS are correct
2. Make sure `.nojekyll` file exists (for GitHub Pages)
3. Check browser console for 404 errors
4. Verify all files were committed to repository

### Mixed content warnings

**Problem:** "Mixed content" or "Not secure" warnings

**Solutions:**
1. Ensure all resources (CSS, JS, images) use HTTPS
2. Update any `http://` links to `https://`
3. Check iframe `src` uses HTTPS

### Forms don't submit

**Problem:** Form submissions fail or don't work

**Solutions:**
1. Check iframe `sandbox` attribute allows forms
2. Verify form action URL is correct
3. Check CORS settings on form endpoint
4. Test form outside of iframe first

### Site is too tall/short in iframe

**Problem:** Iframe doesn't show full content or has too much space

**Solutions:**
1. Adjust `padding-bottom` percentages in CSS
2. Enable auto-height adjustment (see comments in code)
3. Use different values for mobile vs desktop

---

## 🎨 CUSTOMIZATION OPTIONS

### Update Security Headers for Your Domain

**In `netlify.toml` and `vercel.json`**, replace:
```
https://your-odoo-domain.com
```

With your actual Odoo domain:
```
https://yourcompany.odoo.com
```

### Custom Loading Message

In `ODOO_INTEGRATION.html`, find:
```html
<p>Loading Workforce 360° Platform...</p>
```

Change to:
```html
<p>Your custom message here...</p>
```

### Adjust Iframe Height

In the CSS section of `ODOO_INTEGRATION.html`, modify:
```css
padding-bottom: 100vh; /* Change this value */
```

Try:
- `90vh` - Shorter (desktop)
- `120vh` - Taller (mobile)
- `150vh` - Very tall content

### Enable Auto-Height

Uncomment this section in the JavaScript:
```javascript
/*
function adjustIframeHeight() {
    // ... code here
}
*/
```

Remove the `/*` and `*/` to enable.

---

## 📊 ANALYTICS & TRACKING

### Add Google Analytics

1. Get your GA4 Measurement ID

2. In your `index.html`, add before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

3. Deploy changes

### Track Iframe Interactions

The `ODOO_INTEGRATION.html` already includes event tracking.

Check browser console (F12) to see:
- Navigation events
- Form submissions
- Error messages

---

## 🔐 SECURITY CONSIDERATIONS

### HTTPS is Required
- Never use `http://` for production
- All hosting options provide free HTTPS
- Odoo requires HTTPS for secure iframes

### Content Security Policy
- Already configured in deployment files
- Allows embedding only from your Odoo domain
- Prevents clickjacking attacks

### Sandbox Attributes
- Limits what iframe can do
- Already configured safely
- Modify only if you need specific features

---

## 🚀 PERFORMANCE OPTIMIZATION

### Enable Caching
- Already configured in deployment files
- CSS/JS cached for 1 year
- HTML revalidates on each visit

### Compress Assets
- Netlify/Vercel do this automatically
- GitHub Pages: may need manual optimization
- Use WebP for images (future enhancement)

### Lazy Loading
- Iframe already uses `loading="lazy"`
- Loads only when scrolled into view
- Saves bandwidth on mobile

---

## 📱 MOBILE OPTIMIZATION TIPS

1. **Test on Real Devices**
   - Don't rely only on browser emulation
   - Test iPhone (Safari) and Android (Chrome)

2. **Touch Targets**
   - Ensure buttons are at least 48x48px
   - Already implemented in your CSS

3. **Viewport Meta Tag**
   - Already set: `viewport-fit=cover`
   - Works with notched displays (iPhone X+)

4. **Form Simplification**
   - Consider 2-step progressive form
   - Reduce initial fields for mobile

---

## 🆘 NEED HELP?

### Common Support Resources

1. **GitHub Pages Issues:**
   - [GitHub Pages Documentation](https://docs.github.com/en/pages)
   - Check repository Actions tab for build errors

2. **Netlify Issues:**
   - [Netlify Support Docs](https://docs.netlify.com)
   - Check deploy logs in Netlify dashboard

3. **Vercel Issues:**
   - [Vercel Documentation](https://vercel.com/docs)
   - Check deployment logs

4. **Odoo Website Issues:**
   - [Odoo Website Builder Docs](https://www.odoo.com/documentation)
   - Odoo Community Forums

### Quick Diagnostic Commands

**Check if site is accessible:**
```bash
curl -I https://your-site-url.com
```

**Test CORS headers:**
```bash
curl -H "Origin: https://your-odoo-domain.com" \
     -I https://your-site-url.com
```

**Validate HTML:**
```bash
# Use W3C Validator
# https://validator.w3.org/
```

---

## 📈 NEXT STEPS AFTER DEPLOYMENT

1. **Monitor Performance**
   - Use Google PageSpeed Insights
   - Target: 90+ score on mobile
   - Check Core Web Vitals

2. **Set Up Analytics**
   - Google Analytics 4
   - Microsoft Clarity (heatmaps)
   - Track form submissions

3. **A/B Testing**
   - Test different CTAs
   - Test form layouts
   - Measure conversion rates

4. **Regular Updates**
   - Update content regularly
   - Keep security headers current
   - Monitor for broken links

5. **Backup Strategy**
   - Git repository is your backup
   - Download production builds monthly
   - Document any manual changes

---

## 📞 FINAL DEPLOYMENT SUMMARY

### What You've Accomplished:

✅ **Website Prepared:**
- Configuration files for 3 hosting options
- Security headers for iframe embedding
- Optimized for performance

✅ **Odoo Integration Ready:**
- Complete HTML/CSS/JS code
- Responsive iframe wrapper
- Loading states and error handling

✅ **Documentation Complete:**
- Step-by-step deployment guide
- Troubleshooting solutions
- Customization options

### Estimated Timeline:

- **Hosting Setup:** 5-15 minutes
- **Odoo Integration:** 10-20 minutes
- **Testing & Verification:** 10-15 minutes
- **Total:** 25-50 minutes

### Expected Results:

- **User Experience:** Seamless, native-looking integration
- **Performance:** <3 second load times
- **Mobile:** Fully responsive, touch-friendly
- **Security:** HTTPS, proper CORS, sandboxed
- **Maintenance:** Git-based, easy updates

---

## 🎉 YOU'RE READY TO LAUNCH!

Choose your hosting option (GitHub Pages recommended) and follow the steps above.

Your HR platform will be live and integrated into Odoo within the hour.

**Good luck! 🚀**

---

*Last updated: January 26, 2026*
*Version: 1.0*
