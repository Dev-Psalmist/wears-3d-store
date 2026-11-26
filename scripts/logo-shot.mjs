import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 1000, height: 560 } })
await p.goto('file:///tmp/logo-preview.html'); await p.waitForTimeout(600)
await p.screenshot({ path: 'docs/logo.png' })
await b.close(); console.log('logo shot done')
