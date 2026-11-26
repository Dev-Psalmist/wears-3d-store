import { chromium } from 'playwright-core'
const B = process.env.SMOKE_BASE || 'https://wears-3d-store.vercel.app'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
await p.goto(B + '/', { waitUntil: 'load' }); await p.waitForTimeout(5000)
await p.screenshot({ path: 'docs/gallery.png' })
await p.locator('[data-testid="product-tile"]').first().hover(); await p.waitForTimeout(1200)
await p.screenshot({ path: 'docs/gallery-hover.png' })
await p.goto(B + '/product/rift-06', { waitUntil: 'load' }); await p.waitForTimeout(5000)
await p.screenshot({ path: 'docs/detail.png' })
await b.close()
console.log('captured')
