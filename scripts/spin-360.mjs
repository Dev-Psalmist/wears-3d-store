import { chromium } from 'playwright-core'

/** Drags the detail stage through a half turn and screenshots front vs back. */
const B = process.env.SMOKE_BASE || 'https://wears-3d-store.vercel.app'
const slug = process.env.SLUG || 'arc-03'
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1200, height: 820 } })
await page.goto(`${B}/product/${slug}`, { waitUntil: 'load' })
await page.waitForTimeout(6000)

const stage = page.locator('[data-testid="product-stage"]')
const box = await stage.boundingBox()
const cx = box.x + box.width / 2
const cy = box.y + box.height / 2

await stage.screenshot({ path: 'docs/spin-front.png' })

// 0.0075 rad per px, so ~420px of drag is a half turn
await page.mouse.move(cx - 210, cy)
await page.mouse.down()
for (let i = 1; i <= 42; i++) await page.mouse.move(cx - 210 + i * 10, cy)
await page.mouse.up()
await page.waitForTimeout(1400)
await stage.screenshot({ path: 'docs/spin-back.png' })
await browser.close()
console.log('captured front/back for', slug)
