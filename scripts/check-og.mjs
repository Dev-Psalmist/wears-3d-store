import { chromium } from 'playwright-core'
import fs from 'node:fs'

const B = process.env.SMOKE_BASE || 'http://127.0.0.1:5173'
const OUT = process.env.SHOT_DIR || '/tmp/og-shots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

const api = await page.request.get(B + '/api/products')
const { products } = await api.json()
console.log('products', products.length, '| currency', products[0].currency, '| first price', products[0].price)

await page.goto(B + '/', { waitUntil: 'load' })
await page.waitForTimeout(5500)
console.log('title:', await page.title())
console.log('tiles:', await page.locator('[data-testid="product-tile"]').count())

const body = await page.locator('body').innerText()
console.log('naira shown:', /₦\s?[\d,]+/.test(body), '| has OG Stores:', /OG\s*STORES|OG\s+Stores/i.test(body))
console.log('email:', body.includes('ogahsamsonogah@gmail.com'), '| phone:', body.includes('+234 906 565 6710'))

await page.locator('header').screenshot({ path: `${OUT}/header.png` })

// booking flow
await page.locator('#booking').scrollIntoViewIfNeeded()
await page.waitForTimeout(900)
await page.screenshot({ path: `${OUT}/booking.png` })
const form = page.locator('[data-testid="booking-form"]')
await form.locator('input[name="name"]').fill('Ada Obi')
await form.locator('input[name="email"]').fill('ada@example.com')
await form.locator('input[name="phone"]').fill('+2349065656710')
await form.locator('select[name="piece"]').selectOption({ index: 1 })
await form.locator('textarea[name="note"]').fill('Size M, Saturday if possible.')
const post = page.waitForResponse((r) => r.url().includes('/api/bookings') && r.request().method() === 'POST')
await form.locator('button[type="submit"]').click()
const res = await post
console.log('POST /api/bookings', res.status())
await page.waitForTimeout(1200)
const ok = page.locator('[data-testid="booking-success"]')
console.log('success panel:', await ok.count() === 1, '| reference:', /OGS-[A-Z0-9-]+/.test(await ok.innerText().catch(() => '')))
await page.screenshot({ path: `${OUT}/booking-done.png` })

// product page price + 3D
await page.goto(B + '/product/nimbus-07', { waitUntil: 'load' })
await page.waitForTimeout(5000)
const pdp = await page.locator('body').innerText()
console.log('pdp naira:', /₦\s?[\d,]+/.test(pdp), '| NGN label:', pdp.includes('NGN'))
await page.screenshot({ path: `${OUT}/detail.png` })
console.log('console errors:', errors.length ? JSON.stringify(errors.slice(0, 4)) : 'none')
await browser.close()
