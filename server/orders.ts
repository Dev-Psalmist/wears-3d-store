import { promises as fs } from 'node:fs'
import path from 'node:path'
import { findProduct } from './products'
import type { Order, OrderLineInput } from './types'

/**
 * Order persistence — deliberately simple.
 *
 * Orders are held in a module-scoped array (warm serverless invocations keep it) and
 * mirrored to a JSON file when the filesystem is writable. Vercel's serverless
 * filesystem is read-only apart from /tmp, and /tmp is per-instance and ephemeral,
 * so this is NOT durable storage. To go to production, replace `saveOrder` /
 * `listOrders` with a real database:
 *
 *   - Vercel Postgres / Neon  -> `@vercel/postgres`, table `orders (id, created_at, payload jsonb)`
 *   - Supabase                -> `@supabase/supabase-js`, table `orders`
 *   - MongoDB Atlas           -> `mongodb` driver, collection `orders`
 *   - Vercel KV / Upstash     -> `@vercel/kv`, `kv.lpush('orders', JSON.stringify(order))`
 *
 * Everything else (validation, pricing, response shape) stays the same.
 */
const orders: Order[] = []

const DATA_DIR = process.env.ORDER_DATA_DIR || '/tmp'
const DATA_FILE = path.join(DATA_DIR, 'mantle-orders.json')

export function listOrders(): Order[] {
  return orders
}

export async function saveOrder(order: Order): Promise<Order> {
  orders.push(order)

  // Best-effort mirror to disk. Never let a storage hiccup fail the request.
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    let existing: Order[] = []
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) existing = parsed as Order[]
    } catch {
      existing = []
    }
    existing.push(order)
    await fs.writeFile(DATA_FILE, JSON.stringify(existing.slice(-200), null, 2), 'utf8')
  } catch (error) {
    console.warn('[orders] could not persist to disk (expected on read-only fs):', (error as Error).message)
  }

  return order
}

export interface ValidationResult {
  ok: boolean
  errors: string[]
  items: OrderLineInput[]
}

const MAX_QTY = 10
const MAX_LINES = 20

/** Validates and normalises an untrusted POST /api/orders body. */
export function validateOrderPayload(body: unknown): ValidationResult {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['Body must be a JSON object.'], items: [] }
  }

  const rawItems = (body as { items?: unknown }).items
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, errors: ['`items` must be a non-empty array.'], items: [] }
  }
  if (rawItems.length > MAX_LINES) {
    errors.push(`A single order may contain at most ${MAX_LINES} lines.`)
  }

  const items: OrderLineInput[] = []
  rawItems.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') {
      errors.push(`items[${index}] must be an object.`)
      return
    }
    const line = raw as Record<string, unknown>
    const slug = typeof line.slug === 'string' ? line.slug.trim().toLowerCase() : ''
    const size = typeof line.size === 'string' ? line.size.trim().toUpperCase() : ''
    const quantity = typeof line.quantity === 'number' ? line.quantity : Number(line.quantity)

    if (!slug) {
      errors.push(`items[${index}].slug is required.`)
      return
    }
    const product = findProduct(slug)
    if (!product) {
      errors.push(`items[${index}].slug "${slug}" is not in the catalogue.`)
      return
    }
    if (!size) {
      errors.push(`items[${index}].size is required.`)
      return
    }
    if (!product.sizes.includes(size)) {
      errors.push(`items[${index}].size "${size}" is not available for ${product.code}.`)
      return
    }
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      errors.push(`items[${index}].quantity must be an integer between 1 and ${MAX_QTY}.`)
      return
    }
    if (!product.inStock) {
      errors.push(`${product.code} is currently out of stock.`)
      return
    }

    const existing = items.find((i) => i.slug === slug && i.size === size)
    if (existing) {
      existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity)
    } else {
      items.push({ slug, size, quantity })
    }
  })

  return { ok: errors.length === 0 && items.length > 0, errors, items }
}
