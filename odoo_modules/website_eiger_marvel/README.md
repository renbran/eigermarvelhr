# Eiger Marvel Website Module for Odoo 18

Modern, responsive recruitment website module that brings the Cloudflare-deployed website design into Odoo 18.

## Features

✅ **Modern Design**
- Responsive layout optimized for mobile, tablet, and desktop
- Dark theme with gold accents matching brand identity
- Google Fonts (Poppins & Montserrat)
- Smooth animations and transitions

✅ **Key Pages**
- **Home**: Hero section with team photo, services showcase, latest jobs
- **Jobs**: Complete job listings with search and filtering
- **For Employers**: Information for companies looking to hire
- **Contact**: Contact form with lead capture

✅ **Integration**
- Seamless integration with Odoo HR Recruitment
- Uses UAE Recruitment Management system data
- Contact form creates CRM leads automatically
- Job postings from Odoo displayed on website

## Installation

1. **Copy Module to Odoo Addons**
   ```bash
   cp -r odoo_modules/website_eiger_marvel /opt/odoo18/custom-addons/
   ```

2. **Update Apps List**
   - Go to Odoo → Apps → Update Apps List

3. **Install Module**
   - Search for "Eiger Marvel Website"
   - Click Install

4. **Configure Website**
   - Go to Website → Configuration
   - Set as default homepage if desired

## Module Structure

```
website_eiger_marvel/
├── __init__.py
├── __manifest__.py
├── controllers/
│   ├── __init__.py
│   └── main.py          # Web controllers for routing
├── views/
│   ├── website_templates.xml  # Main page templates
│   └── snippets.xml          # Header & footer overrides
├── data/
│   └── website_menu.xml      # Website menu items
└── static/
    └── src/
        ├── css/
        │   └── eiger_marvel.css  # Custom styles
        └── img/
            ├── logo-icon.png
            └── team-photo.jpg
```

## Dependencies

Required Odoo modules:
- `website` (core)
- `website_hr_recruitment`
- `uae_recruitment_mgmt`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, services, and jobs |
| `/jobs` | All job listings |
| `/employers` | Information for employers |
| `/contact` | Contact form |
| `/contact/submit` | Contact form submission handler |

## Customization

### Colors
Edit `/static/src/css/eiger_marvel.css`:
```css
:root {
    --primary: #1E3A8A;      /* Deep Blue */
    --accent: #F59E0B;       /* Gold */
    --background: #000000;    /* Black */
}
```

### Images
Replace images in `/static/src/img/`:
- `logo-icon.png` - Company logo (recommended: 80x80px)
- `team-photo.jpg` - Hero section background (recommended: 1920x1080px)

### Content
Templates are in `/views/website_templates.xml` - edit using standard QWeb syntax.

## Design System

### Typography
- **Headings**: Montserrat (700-800 weight)
- **Body**: Poppins (400-600 weight)

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Components
- **Cards**: Services, jobs with hover effects
- **Buttons**: Primary (gold) and secondary (outlined)
- **Navigation**: Sticky header with mobile menu
- **Footer**: 3-column layout with glow effects

## Support

For issues or questions:
- Email: info@em-gc.com
- Phone: +971 58 624 1100

## License

LGPL-3

---

**Version**: 18.0.1.0.0  
**Author**: Eiger Marvel HR Consultancies  
**Website**: https://eigermarvelhr.com
