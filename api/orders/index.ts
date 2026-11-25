import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validateOrderPayload, saveOrder, listOrders } from '../../server/orders.js'
import { findProduct } from '../../server/products.js'
import type { Order, OrderLine } from '../../server/types.js'

/**
 * POST /api/orders
 * Validates the bag, prices it server-side, and stores the order.
 * Storage is in-memory + /tmp JSON — see server/orders.ts for how to swap in a real DB.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method === 'GET') {
    // Handy for smoke tests; never exposes customer PII beyond counts.
    res.status(200).json({ count: listOrders().length, storage: 'in-memory + /tmp JSON (ephemeral)' })
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET, OPTIONS')
    res.status(405).json({ error: 'Method not allowed', method: req.method })
    return
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body
  const validation = validateOrderPayload(body)

  if (!validation.ok) {
    res.status(400).json({ error: 'Order validation failed', details: validation.errors })
    return
  }

  const items: OrderLine[] = validation.items.map((line) => {
    const product = findProduct(line.slug)!
    return {
      slug: product.slug,
      code: product.code,
      name: product.name,
      size: line.size,
      quantity: line.quantity,
      unitPrice: product.price,
      lineTotal: product.price * line.quantity,
    }
  })

  const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)
  const customer = (body as { customer?: Record<string, unknown> }).customer ?? {}
  const asString = (value: unknown, max = 200) =>
    typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null

  const order: Order = {
    id: `MNT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    status: 'received',
    createdAt: new Date().toISOString(),
    customer: {
      name: asString(customer.name),
      email: asString(customer.email),
      note: asString(customer.note, 500),
    },
    items,
    subtotal,
    currency: 'USD',
  }

  await saveOrder(order)

  res.status(201).json({
    order,
    message: 'Order received. Stored in memory for this demo — connect a database before taking real payments.',
  })
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
