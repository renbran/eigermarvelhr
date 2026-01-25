# 🎯 QUICK START GUIDE
## Deploy & Integrate in 3 Steps (15 Minutes)

---

## STEP 1: Deploy Your Website (5 minutes)

### Using GitHub Pages (EASIEST):

```bash
# Open terminal and run these commands:
cd "d:\01_WORK_PROJECTS\EM WEBSITE\eiger-marvel-hr-plat\website"

git add .
git commit -m "Add deployment config"
git push origin main
```

Then:
1. Go to https://github.com/renbran/eiger-marvel-hr-plat
2. Click **Settings** → **Pages**
3. Source: Branch `main`, Folder `/website` or `/root`
4. Click **Save**
5. Wait 2 minutes
6. Your site is live at: `https://renbran.github.io/eiger-marvel-hr-plat/`

✅ **Test it:** Open the URL to confirm it works

---

## STEP 2: Update Integration Code (5 minutes)

1. Open file: `ODOO_INTEGRATION.html`

2. Press Ctrl+H (Find & Replace)

3. Find: `YOUR-HOSTED-WEBSITE-URL`

4. Replace with your URL from Step 1, example:
   ```
   https://renbran.github.io/eiger-marvel-hr-plat/
   ```

5. Replace ALL (should be 3-4 instances)

6. Save the file

---

## STEP 3: Add to Odoo (5 minutes)

### A. Create New Page

1. Log into Odoo
2. Go to **Website** app
3. Click **+ New** → **Page**
4. Name: `Workforce 360°`
5. URL: `/workforce-360`
6. Click **Create**

### B. Add Integration Code

1. Click **Edit** on the new page
2. Find **< />** icon (HTML editor) in toolbar
3. Delete all default content
4. Open `ODOO_INTEGRATION.html`
5. Copy EVERYTHING (Ctrl+A, Ctrl+C)
6. Paste into Odoo HTML editor
7. Click **Save**

### C. Create Menu

1. Go to **Website** → **Configuration** → **Menus**
2. Click **Create**
3. Menu: `Workforce 360°`
4. URL: `/workforce-360`
5. Parent Menu: `Top Menu`
6. Click **Save**

### D. Publish

1. Go back to your page
2. Click **Publish** (top right)
3. Open your Odoo website
4. You should see the new menu item
5. Click it!

---

## ✅ DONE! 

Your website is now embedded in Odoo.

**Test These:**
- [ ] Menu item appears and works
- [ ] Website loads inside Odoo
- [ ] Forms work
- [ ] WhatsApp button works
- [ ] Works on mobile

---

## 🆘 Problems?

**Site doesn't load?**
- Check your URL is correct in ODOO_INTEGRATION.html
- Make sure site deployed successfully (Step 1)
- Try opening deployed site directly first

**Blank iframe?**
- Wait 30 seconds for loading
- Check browser console (F12) for errors
- Verify HTTPS (not HTTP)

**Need detailed help?**
- Open `DEPLOYMENT.md` for complete guide
- Includes troubleshooting for all issues

---

**That's it! 🚀**
