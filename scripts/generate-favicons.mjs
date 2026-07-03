import sharp from 'sharp'
import { writeFile, stat, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const SRC = 'public/images/logo-icon.png'
const OUT = 'public'

await mkdir(OUT, { recursive: true })

const srcSize = (await stat(SRC)).size
console.log(`Source: ${SRC} (${(srcSize / 1024).toFixed(1)} KB)`)

const icoSizes = [16, 32, 48]
const icoBuffers = []
for (const size of icoSizes) {
  const buf = await sharp(SRC).resize(size, size, { fit: 'contain', background: { r: 7, g: 8, b: 15, alpha: 1 } }).png().toBuffer()
  icoBuffers.push({ size, buf })
}

const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(icoBuffers.length, 4)

const entrySize = 16
const icoEntries = Buffer.concat(
  icoBuffers.map(({ size, buf }) => {
    const entry = Buffer.alloc(entrySize)
    entry.writeUInt8(size === 256 ? 0 : size, 0)
    entry.writeUInt8(size === 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(buf.length, 8)
    entry.writeUInt32LE(6 + entrySize * icoBuffers.length + icoBuffers.slice(0, icoBuffers.indexOf({ size, buf })).reduce((s, b) => s + b.buf.length, 0), 12)
    return entry
  })
)

const icoBody = Buffer.concat(icoBuffers.map((b) => b.buf))
const icoOut = Buffer.concat([icoHeader, icoEntries, icoBody])
await writeFile(join(OUT, 'favicon.ico'), icoOut)
console.log(`favicon.ico: ${(icoOut.length / 1024).toFixed(1)} KB (${icoSizes.join(',')} px)`)

const svg32 = await sharp(SRC).resize(32, 32).png().toBuffer()
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#07080f"/>
  <image href="data:image/png;base64,${svg32.toString('base64')}" x="0" y="0" width="32" height="32"/>
</svg>`
await writeFile(join(OUT, 'favicon.svg'), svg)
console.log(`favicon.svg: ${(svg.length / 1024).toFixed(1)} KB`)

const apple = await sharp(SRC).resize(180, 180, { fit: 'contain', background: { r: 7, g: 8, b: 15, alpha: 1 } }).png().toBuffer()
await writeFile(join(OUT, 'apple-touch-icon.png'), apple)
console.log(`apple-touch-icon.png: 180x180, ${(apple.length / 1024).toFixed(1)} KB`)

const android192 = await sharp(SRC).resize(192, 192, { fit: 'contain', background: { r: 7, g: 8, b: 15, alpha: 1 } }).png().toBuffer()
await writeFile(join(OUT, 'android-chrome-192x192.png'), android192)
console.log(`android-chrome-192x192.png: 192x192, ${(android192.length / 1024).toFixed(1)} KB`)

const android512 = await sharp(SRC).resize(512, 512, { fit: 'contain', background: { r: 7, g: 8, b: 15, alpha: 1 } }).png().toBuffer()
await writeFile(join(OUT, 'android-chrome-512x512.png'), android512)
console.log(`android-chrome-512x512.png: 512x512, ${(android512.length / 1024).toFixed(1)} KB`)

const manifest = {
  name: 'Eiger Marvel Consultants',
  short_name: 'Eiger Marvel',
  description: "UAE's master recruiter for construction & hospitality",
  start_url: '/',
  display: 'standalone',
  background_color: '#07080f',
  theme_color: '#070707',
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
}
await writeFile(join(OUT, 'site.webmanifest'), JSON.stringify(manifest, null, 2))
console.log(`site.webmanifest: ${(JSON.stringify(manifest).length / 1024).toFixed(1)} KB`)

console.log('\n[OK] Favicon assets written to public/')