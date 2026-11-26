import { chromium } from 'playwright-core'

const B = process.env.SMOKE_BASE || 'https://og-stores.vercel.app'
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

await page.goto(B + '/', { waitUntil: 'load' })
await page.waitForTimeout(6500)
await page.screenshot({ path: 'docs/home.png' })

await page.evaluate(() => window.scrollTo(0, 620))
await page.waitForTimeout(3000)
await page.screenshot({ path: 'docs/grid.png' })

await page.locator('#booking').scrollIntoViewIfNeeded()
await page.waitForTimeout(2200)
await page.screenshot({ path: 'docs/booking.png' })

await page.goto(B + '/product/rift-06', { waitUntil: 'load' })
await page.waitForTimeout(6000)
await page.screenshot({ path: 'docs/detail.png' })

await browser.close()
console.log('captured')
