// Transform production-scorecard.html: set UAE market rate (AED 600/hr) + 50% off
import { readFileSync, writeFileSync } from 'fs'

const path = new URL('../production-scorecard.html', import.meta.url).pathname
let html = readFileSync(path, 'utf-8')
let version = 2

// ---- 1. Change all rate cells from 350 to 600 ----
html = html.replace(/rate-cell">350<\/td>/g, 'rate-cell">600</td>')

// ---- 2. Multiply every total-cell value by 600/350 (12/7 ≈ 1.7143) ----
const MULT = 12 / 7
html = html.replace(/total-cell">([\d,]+)<\/td>/g, (_m, val) => {
  const num = parseInt(val.replace(/,/g, ''), 10)
  const newNum = Math.round(num * MULT)
  return `total-cell">${newNum.toLocaleString()}</td>`
})

// ---- 3. Multiply every AED category/exec/grand total by 12/7 ----
html = html.replace(/>AED ([\d,]+)<\//g, (_m, val) => {
  const num = parseInt(val.replace(/,/g, ''), 10)
  const newNum = Math.round(num * MULT)
  return `>AED ${newNum.toLocaleString()}<\\`
}).replace(/<\\>/g, '</') // fix the escaped slash

// ---- 4. Update exec summary: change note text ----
html = html.replace(
  '46 hours @ AED 350/hr + 15% project mgmt',
  '46 hours @ Market rate AED 600/hr · 50% OFF LAUNCH PROMO'
)

// ---- 5. Update grand total note ----
html = html.replace(
  '46.0 hours &middot; 7 categories &middot; 48 items &middot; Standard rate AED 350/hr &middot; 15% project mgmt included',
  '46.0 hours · 7 categories · 48 items · Market rate AED 600/hr · 50% OFF — Your price below'
)

// ---- 6. Get the new market total ----
const marketTotalMatch = html.match(/>AED ([\d,]+)<\//)
const marketTotal = parseInt(marketTotalMatch[1].replace(/,/g, ''), 10)
const yourPrice = Math.round(marketTotal * 0.5)

// ---- 7. Add 50% OFF promo banner after header-top ----
html = html.replace(
  '</div>',
  `    <div class="promo-banner">🔥 50% OFF LAUNCH PROMO — Pay only <strong>AED ${yourPrice.toLocaleString()}</strong> (half the UAE market rate)</div>`
)

// ---- 8. Replace single "value" grand total with dual market/you-pay ----
html = html.replace(
  '<div class="value">AED ' + marketTotal.toLocaleString() + '</div>',
  '<div class="value" style="text-decoration:line-through;color:#999;font-size:1.4rem">AED ' + marketTotal.toLocaleString() + '</div>\n      <div class="value" style="color:#d4af37;font-size:2.2rem">AED ' + yourPrice.toLocaleString() + ' <span style="font-size:1rem;font-weight:400;color:#999">(50% off)</span></div>'
)

// ---- 9. Update exec summary gold value ----
html = html.replace(
  'class="value gold">AED ' + marketTotal.toLocaleString(),
  'class="value" style="text-decoration:line-through;color:#999">AED ' + marketTotal.toLocaleString()
)
html = html.replace(
  '<div class="value gold">AED ' + marketTotal.toLocaleString(),
  '<div class="value gold">AED ' + (marketTotal) + ''
)

// Hmm, the exec gold total gets matched twice. Let me just add the 50% off below it.
html = html.replace(
  '</div>\n    </div>\n    <div class="exec-block">\n      <div class="label">Total Items</div>',
  '</div>\n      <div class="note" style="font-weight:700;margin-top:4px;color:#d4af37">🎉 50% OFF — Your Price: AED ' + yourPrice.toLocaleString() + '</div>\n    </div>\n    <div class="exec-block">\n      <div class="label">Total Items</div>'
)

// ---- 10. Add promo styles ----
html = html.replace(
  '.header-badge {',
  '.promo-banner { background: linear-gradient(135deg, #d4af37, #f5d77c); color: #0a0a0a; text-align: center; padding: 10px 20px; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; }\n'
+ '  .promo-banner strong { font-size: 20px; }\n'
+ '  .header-badge {'
)

// ---- 11. Update version ----
html = html.replace('v1.0', 'v2.0 (50% OFF)')
html = html.replace('Production Scorecard v1', 'Production Scorecard v2')

// ---- 12. Add gold 50% off tag to each category total ----
html = html.replace(
  /(<div class="category-total">AED [\d,]+<\/div>)/g,
  '$1<div class="category-promo" style="font-size:11px;color:#d4af37;font-weight:600;margin-top:1px">50% OFF: AED ' + Math.round(marketTotal * 0.5 / 7).toLocaleString() + '</div>'
)

// Fix the escaped slashes from step 3 that might have left artifacts
html = html.replace(/<\//g, '</')

writeFileSync(path, html, 'utf-8')
console.log(`[OK] Updated: ${path}`)
console.log(`Market rate: AED 600/hr → Market total: AED ${marketTotal.toLocaleString()}`)
console.log(`Your price (50% off): AED ${yourPrice.toLocaleString()}`)
