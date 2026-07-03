// Walk public/images/ recursively and optimize oversized PNG/JPG to WebP.
// Skips logo-icon.png (small) and existing .webp/.avif.
import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join, extname } from 'node:path'

const ROOT = 'public/images'
const SKIP_NAMES = new Set(['logo-icon.png'])
const SKIP_EXT = new Set(['.webp', '.avif', '.svg'])
const MIN_SIZE_BYTES = 50_000

const fmt = (b) => `${(b / 1024).toFixed(1)} KB`

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) await walk(full, out)
    else out.push(full)
  }
  return out
}

const files = await walk(ROOT)
const targets = files.filter((f) => {
  const ext = extname(f).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return false
  if (SKIP_EXT.has(ext)) return false
  const base = f.split(/[\\/]/).pop()
  if (SKIP_NAMES.has(base)) return false
  return true
})

let totalBefore = 0, totalWebp = 0
const results = []
for (const src of targets) {
  try {
    const before = (await stat(src)).size
    if (before < MIN_SIZE_BYTES) continue
    const base = src.replace(/\.(png|jpg|jpeg)$/i, '')
    const webpDest = `${base}.webp`
    await sharp(src).webp({ quality: 80, effort: 4 }).toFile(webpDest)
    const webpSize = (await stat(webpDest)).size
    await unlink(src)
    results.push({ src: src.replace(/^public\//, ''), before, webpSize })
    totalBefore += before
    totalWebp += webpSize
  } catch (e) {
    console.error(`[ERR] ${src}: ${e.message}`)
  }
}

console.log('\n' + '='.repeat(80))
for (const r of results) {
  const pct = (((r.before - r.webpSize) / r.before) * 100).toFixed(1)
  console.log(`${r.src.padEnd(40)} ${fmt(r.before).padStart(10)} -> ${fmt(r.webpSize).padStart(10)} (-${pct}%)`)
}
console.log('-'.repeat(80))
const totalPct = totalBefore > 0 ? (((totalBefore - totalWebp) / totalBefore) * 100).toFixed(1) : '0.0'
console.log(`${'TOTAL'.padEnd(40)} ${fmt(totalBefore).padStart(10)} -> ${fmt(totalWebp).padStart(10)} (-${totalPct}%)`)
console.log('='.repeat(80))
console.log(`\n[OK] Converted ${results.length} files. Originals deleted.`)