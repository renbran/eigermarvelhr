// Optimize orphaned PNG icons in public/images/ to WebP + AVIF.
// Icons are unused per audit (no references in src/ or HTML), so originals are removed after conversion.
// Usage: node scripts/optimize-icons.mjs
import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'

const ICON_DIR = 'public/images'
const NAMES = ['icon-ai.png', 'icon-speed.png', 'icon-analytics.png', 'icon-automation.png']

const fmt = (b) => `${(b / 1024).toFixed(1)} KB`

async function convertOne(name) {
  const src = join(ICON_DIR, name)
  const base = name.replace(/\.png$/, '')
  const webpDest = join(ICON_DIR, `${base}.webp`)
  const avifDest = join(ICON_DIR, `${base}.avif`)

  const before = (await stat(src)).size
  await sharp(src).webp({ quality: 75, effort: 4 }).toFile(webpDest)
  await sharp(src).avif({ quality: 55, effort: 4 }).toFile(avifDest)
  const webpSize = (await stat(webpDest)).size
  const avifSize = (await stat(avifDest)).size

  await unlink(src)

  return { name, before, webpSize, avifSize }
}

async function main() {
  const results = []
  for (const n of NAMES) {
    try {
      results.push(await convertOne(n))
    } catch (e) {
      console.error(`[ERR] ${n}: ${e.message}`)
    }
  }

  let totalBefore = 0, totalWebp = 0, totalAvif = 0
  console.log('\n' + '='.repeat(72))
  console.log('name'.padEnd(28), 'before'.padStart(10), 'webp'.padStart(10), 'avif'.padStart(10), 'savings'.padStart(10))
  console.log('-'.repeat(72))
  for (const r of results) {
    const webpSav = (((r.before - r.webpSize) / r.before) * 100).toFixed(1)
    const avifSav = (((r.before - r.avifSize) / r.before) * 100).toFixed(1)
    console.log(
      r.name.padEnd(28),
      fmt(r.before).padStart(10),
      `${fmt(r.webpSize)} (-${webpSav}%)`.padStart(10),
      `${fmt(r.avifSize)} (-${avifSav}%)`.padStart(10)
    )
    totalBefore += r.before
    totalWebp += r.webpSize
    totalAvif += r.avifSize
  }
  console.log('-'.repeat(72))
  const totalPct = (((totalBefore - totalAvif) / totalBefore) * 100).toFixed(1)
  console.log(
    'TOTAL'.padEnd(28),
    fmt(totalBefore).padStart(10),
    fmt(totalWebp).padStart(10),
    `${fmt(totalAvif)} (-${totalPct}%)`.padStart(10)
  )
  console.log('='.repeat(72))
  console.log(`\n[OK] Removed ${results.length} unused PNGs. Replaced with WebP+AVIF.`)

  const remaining = (await readdir(ICON_DIR)).filter((f) => /^icon-.*\.png$/.test(f))
  if (remaining.length) console.log('[WARN] leftover PNGs:', remaining)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
