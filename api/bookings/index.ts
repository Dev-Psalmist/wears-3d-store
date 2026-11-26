import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listBookings, saveBooking, validateBookingPayload } from '../../server/bookings.js'
import { findProduct } from '../../server/products.js'
import type { Booking } from '../../server/types.js'

/**
 * POST /api/bookings
 * Books a studio appointment: validates the request, resolves the piece, stores it.
 * Storage is in-memory + /tmp JSON — see server/bookings.ts for the database swap.
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
    res.status(200).json({
      count: listBookings().length,
      storage: 'in-memory + /tmp JSON (ephemeral)',
      timezone: 'Africa/Lagos',
    })
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET, OPTIONS')
    res.status(405).json({ error: 'Method not allowed', method: req.method })
    return
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body
  const validation = validateBookingPayload(body)

  if (!validation.ok || !validation.value) {
    res.status(400).json({ error: 'Booking validation failed', details: validation.errors })
    return
  }

  const { name, email, phone, date, time, pieceSlug, note } = validation.value
  const product = pieceSlug ? findProduct(pieceSlug) : null

  const booking: Booking = {
    id: `OGS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    status: 'requested',
    createdAt: new Date().toISOString(),
    customer: { name, email, phone },
    appointment: { date, time, timezone: 'Africa/Lagos' },
    piece: product ? { slug: product.slug, code: product.code, name: product.name } : null,
    note,
  }

  await saveBooking(booking)

  res.status(201).json({
    booking,
    message: 'Appointment requested. OG Stores will confirm by email or WhatsApp.',
  })
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
