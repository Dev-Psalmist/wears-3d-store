import { chromium } from 'playwright-core'
import fs from 'node:fs'

const B = process.env.SMOKE_BASE || 'http://127.0.0.1:5173'
const OUT = process.env.SHOT_DIR || '/tmp/wear-shots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

const api = await page.request.get(B + '/api/products')
const { products } = await api.json()
console.log('API', api.status(), 'products', products.length, '| all have image+depth:', products.every(p => p.image && p.depth))

const missing = []
for (const p of products) {
  const r = await page.request.get(B + p.image)
  const d = await page.request.get(B + p.depth)
  if (r.status() !== 200 || d.status() !== 200) missing.push(`${p.slug}:${r.status()}/${d.status()}`)
}
console.log('asset fetch problems:', missing.length ? missing.join(', ') : 'none')

await page.goto(B + '/', { waitUntil: 'load' })
await page.waitForTimeout(5500)

const n = await page.locator('[data-testid="product-tile"]').count()
console.log('tiles:', n)
for (let i = 0; i < n; i++) {
  const el = page.locator('[data-testid="product-tile"]').nth(i)
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(650)
  await el.locator('div').first().screenshot({ path: `${OUT}/tile-${i}.png` })
}
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}/home.png` })

// detail page: does dragging actually turn the piece?
await page.goto(B + '/product/nimbus-07', { waitUntil: 'load' })
await page.waitForTimeout(5500)
const stage = page.locator('[data-testid="product-stage"]')
await stage.screenshot({ path: `${OUT}/spin-a.png` })
const box = await stage.boundingBox()
const cx = box.x + box.width / 2
const cy = box.y + box.height / 2
await page.mouse.move(cx, cy)
await page.mouse.down()
for (let i = 1; i <= 12; i++) await page.mouse.move(cx + i * 22, cy + i * 2)
await page.mouse.up()
await page.waitForTimeout(1800)
await stage.screenshot({ path: `${OUT}/spin-b.png` })
await page.waitForTimeout(2500)
await stage.screenshot({ path: `${OUT}/spin-c.png` })

const body = await page.locator('body').innerText()
console.log('detail has price:', /\$\s?\d/.test(body), '| size select:', await page.locator('select').count())
await page.screenshot({ path: `${OUT}/detail.png` })
console.log('console errors:', errors.length ? JSON.stringify(errors.slice(0, 5)) : 'none')
await browser.close()
