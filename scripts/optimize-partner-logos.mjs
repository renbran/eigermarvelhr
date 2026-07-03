// Optimize src/assets/images/ PNGs to WebP (delete originals — kept consistent with public/images script).
import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'

const DIR = 'src/assets/images'
const SKIP = new Set(['logo-icon.png'])
const fmt = (b) => `${(b / 1024).toFixed(1)} KB`

const all = await readdir(DIR)
const pngs = all.filter((f) => /\.png$/i.test(f) && !SKIP.has(f))

let totalBefore = 0, totalWebp = 0
for (const name of pngs) {
  const src = join(DIR, name)
  const base = name.replace(/\.png$/, '')
  const webpDest = join(DIR, `${base}.webp`)
  try {
    const before = (await stat(src)).size
    await sharp(src).webp({ quality: 80, effort: 4 }).toFile(webpDest)
    const webpSize = (await stat(webpDest)).size
    await unlink(src)
    const pct = (((before - webpSize) / before) * 100).toFixed(1)
    console.log(`${name.padEnd(40)} ${fmt(before).padStart(10)} -> ${fmt(webpSize).padStart(10)} (-${pct}%)`)
    totalBefore += before
    totalWebp += webpSize
  } catch (e) {
    console.error(`[ERR] ${name}: ${e.message}`)
  }
}

const totalPct = (((totalBefore - totalWebp) / totalBefore) * 100).toFixed(1)
console.log('-'.repeat(70))
console.log(`${'TOTAL'.padEnd(40)} ${fmt(totalBefore).padStart(10)} -> ${fmt(totalWebp).padStart(10)} (-${totalPct}%)`)
console.log(`\n[OK] Converted ${pngs.length} PNGs to WebP. Originals deleted.`)