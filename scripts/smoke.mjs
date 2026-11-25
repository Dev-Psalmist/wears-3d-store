import { chromium } from 'playwright-core'

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:4173'
const OUT = process.env.SMOKE_OUT || 'shots'
const errors = []

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

const api = await page.request.get(BASE + '/api/products')
const apiJson = await api.json()
console.log('API /api/products', api.status(), 'items:', apiJson.products?.length)

await page.goto(BASE + '/', { waitUntil: 'load' })
await page.waitForTimeout(4500)

const tiles = await page.locator('[data-testid="product-tile"]').count()
console.log('tiles:', tiles)

// pixel stats on the fixed WebGL canvas
const stats = await page.evaluate(() => {
  const canvases = [...document.querySelectorAll('canvas')]
  const big = canvases.sort((a, b) => b.width * b.height - a.width * a.height)[0]
  if (!big) return { found: 0 }
  const gl = big.getContext('webgl2') || big.getContext('webgl')
  const w = big.width, h = big.height
  const px = new Uint8Array(w * h * 4)
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px)
  let lit = 0, max = 0, sum = 0
  for (let i = 0; i < px.length; i += 4) {
    const v = px[i] + px[i + 1] + px[i + 2]
    sum += v
    if (v > 40) lit++
    if (v > max) max = v
  }
  return { found: canvases.length, w, h, lit, max, mean: +(sum / (px.length / 4)).toFixed(2) }
})
console.log('canvas stats:', JSON.stringify(stats))

await page.screenshot({ path: `${OUT}/gallery.png`, fullPage: false })
await page.locator('[data-testid="product-tile"]').first().hover()
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUT}/gallery-hover.png` })

await page.locator('[data-testid="product-tile"]').first().click()
await page.waitForTimeout(4000)
console.log('url after click:', page.url())
const detailStats = await page.evaluate(() => {
  const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]
  if (!c) return { found: 0 }
  const gl = c.getContext('webgl2') || c.getContext('webgl')
  const px = new Uint8Array(c.width * c.height * 4)
  gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, px)
  let lit = 0, max = 0
  for (let i = 0; i < px.length; i += 4) { const v = px[i] + px[i + 1] + px[i + 2]; if (v > 40) lit++; if (v > max) max = v }
  return { found: 1, w: c.width, h: c.height, lit, max }
})
console.log('detail canvas stats:', JSON.stringify(detailStats))
await page.screenshot({ path: `${OUT}/detail.png` })

const selects = await page.locator('select').count()
console.log('selects:', selects)
if (selects) {
  const sel = page.locator('select').first()
  const opts = await sel.locator('option').allTextContents()
  console.log('size options:', JSON.stringify(opts))
  const pick = opts.find((o) => /^(M|L|EU 42)$/.test(o.trim())) || opts[1]
  await sel.selectOption({ label: pick })
  await page.waitForTimeout(300)
  const addBtn = page.getByRole('button', { name: /add to bag/i }).first()
  if (await addBtn.count()) { await addBtn.click(); await page.waitForTimeout(1200) }
  await page.screenshot({ path: `${OUT}/detail-bag.png` })
  console.log('picked size:', pick)
}

// direct order POST
const order = await page.request.post(BASE + '/api/orders', {
  data: { items: [{ slug: 'rift-06', size: 'L', quantity: 1 }], note: 'smoke test' },
})
console.log('POST /api/orders', order.status(), (await order.text()).slice(0, 220))

console.log('console errors:', errors.length ? JSON.stringify(errors.slice(0, 6)) : 'none')
await browser.close()
