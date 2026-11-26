import { chromium } from 'playwright-core'

const B = process.env.SMOKE_BASE || 'http://127.0.0.1:5173'
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1200, height: 820 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto(`${B}/product/rift-06`, { waitUntil: 'load' })
await page.waitForTimeout(6000)

const table = page.locator('[data-testid="turntable"]')
const present = await table.count()
console.log('turntable mounted:', present > 0)
if (!present) { console.log('errors:', errors); await browser.close(); process.exit(0) }

const angle0 = await page.locator('[data-testid="turntable-angle"]').innerText()
const canvas = page.locator('[data-testid="turntable"] canvas')
const box = await canvas.boundingBox()
await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5)
await page.mouse.down()
for (let i = 1; i <= 20; i++) await page.mouse.move(box.x + box.width * 0.7 - i * 12, box.y + box.height * 0.5)
await page.mouse.up()
await page.waitForTimeout(500)
const angle1 = await page.locator('[data-testid="turntable-angle"]').innerText()

// pause the auto-spin and confirm the angle holds
await page.getByRole('button', { name: /pause/i }).click()
await page.waitForTimeout(300)
const held = await page.locator('[data-testid="turntable-angle"]').innerText()
await page.waitForTimeout(2500)
const stillHeld = await page.locator('[data-testid="turntable-angle"]').innerText()

console.log('angle before drag:', angle0, '| after drag:', angle1, '| changed:', angle0 !== angle1)
console.log('paused holds angle:', held === stillHeld, `(${held})`)
console.log('console errors:', errors.length ? errors : 'none')
await page.screenshot({ path: 'docs/turntable.png' })
await browser.close()
