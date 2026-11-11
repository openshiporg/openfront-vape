// Load every dashboard and storefront page as each role; print PASS/FAIL per page.
// CRAWL_BASE=... CRAWL_LOGINS=/path/logins.json (single {email,password} or { role: {email,password} }) node scripts/r6-crawl.mjs [roles...]
import fs from 'node:fs'
import { chromium } from '/Users/junaid/Code/vibeghost/vibeghost/node_modules/playwright/index.mjs'
const BASE = process.env.CRAWL_BASE
const raw = JSON.parse(fs.readFileSync(process.env.CRAWL_LOGINS, 'utf8'))
const people = raw.email ? { owner: raw } : raw
const roles = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(people)
const gql = async (query, cookie, variables) => (await fetch(BASE + '/api/graphql', { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify({ query, variables }) })).json()
const p0 = people[roles[0]]
const tok = (await gql('mutation($e:String!,$p:String!){authenticateUserWithPassword(email:$e,password:$p){... on UserAuthenticationWithPasswordSuccess{sessionToken}}}', null, { e: p0.email, p: p0.password })).data?.authenticateUserWithPassword?.sessionToken
const cookie = 'keystonejs-session=' + tok
const lists = { products: 'products', orders: 'orders', users: 'users', invoices: 'accounts', 'compliance-reports': 'complianceReports', jurisdictions: 'jurisdictions', 'merchant-profiles': 'merchantProfiles', 'provider-approvals': 'providerApprovals', 'compliance-ledger': 'complianceEvents' }
const q = '{' + Object.entries(lists).map(([k, l]) => `${k.replace(/-/g, '_')}: ${l}(take:1){id}`).join(' ') + ' productsStore: products(take:1){handle} }'
const d = (await gql(q, cookie)).data ?? {}
const paths = ['overview', 'analytics', 'products', 'orders', 'users', 'invoices', 'inventory', 'compliance', 'compliance-reports', 'jurisdictions', 'merchant-profiles', 'provider-approvals', 'compliance-ledger', 'product-evidence', 'gift-cards', 'discounts', 'price-lists', 'regions', 'shipping', 'shipping-options', 'payment-providers', 'store', 'system', 'api-keys', 'apps', 'claims', 'markets', 'product-collections', 'product-categories', 'business-account-requests', 'products/create', 'orders/create']
for (const [k, l] of Object.entries(lists)) { const id = d[k.replace(/-/g, '_')]?.[0]?.id; if (id && ['products', 'orders', 'users', 'compliance-reports', 'jurisdictions', 'merchant-profiles', 'provider-approvals', 'compliance-ledger'].includes(k)) paths.push(`${k}/${id}`) }
const nope = ['products', 'orders', 'users', 'compliance-reports', 'jurisdictions', 'merchant-profiles', 'provider-approvals', 'compliance-ledger', 'invoices'].map(k => `${k}/nope123`)
const store = ['', 'store', 'cart', 'search', 'account', 'policies/shipping', 'checkout']
const h = d.productsStore?.[0]?.handle; if (h) store.push('products/' + h)
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' })
let bad = 0, n = 0
const BROKEN = /this page could not be loaded|something went wrong|application error|internal server error/i
async function visit(p, url, expect404) {
  const r = await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 }).catch(() => null)
  await p.waitForTimeout(1200)
  const txt = await p.evaluate(() => document.body.innerText).catch(() => '')
  const http = r?.status() ?? 0
  const ok = expect404 ? http === 404 : http >= 200 && http < 400 && !BROKEN.test(txt)
  n++; if (!ok) bad++
  console.log(`CHECK ${url}: ${ok ? 'PASS' : 'FAIL'} (${http}${expect404 ? ' expected 404' : ''})`)
}
for (const role of roles) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true })
  const p = await ctx.newPage()
  await p.goto(BASE + '/dashboard/signin')
  await p.fill('input[name=email]', people[role].email); await p.fill('input[name=password]', people[role].password)
  await Promise.all([p.waitForURL(u => !u.pathname.includes('signin'), { timeout: 30000 }), p.click('button[type=submit]')])
  console.log('ROLE', role)
  for (const x of paths) await visit(p, '/dashboard/platform/' + x, false)
  for (const x of nope) await visit(p, '/dashboard/platform/' + x, true)
  await ctx.close()
}
const ctx = await b.newContext({ ignoreHTTPSErrors: true }); const p = await ctx.newPage()
for (const x of store) await visit(p, '/us/' + x, false)
// Signed-out shoppers get a 404 on account subpages and unknown orders.
for (const x of ['account/orders', 'account/invoices', 'order/confirmed/nope123']) await visit(p, '/us/' + x, true)
await b.close()
console.log(`CHECK all pages: ${bad ? 'FAIL' : 'PASS'} (${n} loads, ${bad} failed)`)
process.exit(bad ? 1 : 0)
