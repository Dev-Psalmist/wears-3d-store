import { chromium } from 'playwright-core'
const B='https://wears-3d-store.vercel.app'
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const p=await b.newPage({viewport:{width:1440,height:900}})
const posts=[]
p.on('response', async r=>{ if(r.url().includes('/api/orders')) posts.push(r.status()) })
await p.goto(B+'/product/rift-06',{waitUntil:'load'}); await p.waitForTimeout(3500)
await p.locator('select').first().selectOption('L')
await p.waitForTimeout(400)
const btn=p.getByRole('button',{name:/add to bag/i}).first()
console.log('button text:', await btn.innerText())
await btn.click()
await p.waitForTimeout(1200)
console.log('bag opened:', /PLACE ORDER/i.test(await p.locator('body').innerText()))
const place = p.getByRole('button', { name: /place order/i }).first()
if (await place.count()) { await place.click(); await p.waitForTimeout(3000) }
console.log('order responses:', JSON.stringify(posts))
const body=await p.locator('body').innerText()
console.log('order id shown:', /MNT-/.test(body))
await p.screenshot({path:'/tmp/live-shots/order-placed.png'})
await b.close()
