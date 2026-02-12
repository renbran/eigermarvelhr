# Deploy to Netlify Button

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/renbran/eiger-marvel-hr-plat)

## Quick Netlify Deployment Steps

### 1. Click the "Deploy to Netlify" button above

OR manually:

### 2. Manual Deployment

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub"
5. Select repository: `renbran/eiger-marvel-hr-plat`
6. Configure:
   - **Base directory**: `website`
   - **Build command**: (leave empty)
   - **Publish directory**: `.` or `website`
7. Click "Deploy site"
8. Wait 1-2 minutes
9. Your site will be live at: `https://random-name.netlify.app`

### 3. Get Your URL

After deployment, Netlify will give you a URL like:
```
https://eiger-marvel-hr-plat.netlify.app
```

Copy this URL - you'll need it for the Odoo integration!

### 4. Update ODOO_INTEGRATION.html

Replace `YOUR-HOSTED-WEBSITE-URL` with your Netlify URL.

---

**Advantage:** Works with private repositories, free forever, better features than GitHub Pages.
