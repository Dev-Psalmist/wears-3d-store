import { chromium } from 'playwright-core'

const B = process.env.SMOKE_BASE || 'https://wears-3d-store.vercel.app'
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })

await page.goto(B + '/', { waitUntil: 'load' })
await page.waitForTimeout(6000)
await page.screenshot({ path: 'docs/gallery.png' })

await page.evaluate(() => window.scrollTo(0, 640))
await page.waitForTimeout(3000)
await page.screenshot({ path: 'docs/grid.png' })
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1200)
await page.screenshot({ path: 'docs/gallery-full.png', fullPage: true })

await page.locator('[data-testid="product-tile"]').nth(0).hover()
await page.waitForTimeout(1500)
await page.screenshot({ path: 'docs/gallery-hover.png' })

await page.goto(B + '/product/nimbus-07', { waitUntil: 'load' })
await page.waitForTimeout(6000)
await page.screenshot({ path: 'docs/detail.png' })

// spin it part way round for a second frame
const stage = page.locator('[data-testid="product-stage"]')
const box = await stage.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
for (let i = 1; i <= 14; i++) await page.mouse.move(box.x + box.width / 2 + i * 24, box.y + box.height / 2)
await page.mouse.up()
await page.waitForTimeout(1500)
await page.screenshot({ path: 'docs/detail-spun.png' })

await browser.close()
console.log('captured')
