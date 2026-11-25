import { chromium } from 'playwright-core'
import fs from 'node:fs'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'load' })
await p.waitForTimeout(5000)
const n = await p.locator('[data-testid="product-tile"]').count()
for (let i = 0; i < n; i++) {
  const el = p.locator('[data-testid="product-tile"]').nth(i)
  await el.scrollIntoViewIfNeeded()
  await p.waitForTimeout(700)
  await el.locator('div').first().screenshot({ path: `shots/tile-${i}.png` })
}
await p.screenshot({ path: 'shots/gallery.png' })
await b.close()
console.log('tiles captured', n)
