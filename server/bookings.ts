import { promises as fs } from 'node:fs'
import path from 'node:path'
import { findProduct } from './products.js'
import type { Booking } from './types.js'

/**
 * Appointment persistence — same shape as server/orders.ts.
 *
 * Held in a module-scoped array (warm serverless invocations keep it) and mirrored to
 * /tmp when writable. That is NOT durable: replace `saveBooking` / `listBookings` with a
 * real store before taking live appointments:
 *
 *   - Neon / Vercel Postgres -> `@vercel/postgres`, table `bookings (id, created_at, payload jsonb)`
 *   - Supabase               -> `@supabase/supabase-js`, table `bookings`
 *   - Vercel KV / Upstash    -> `@vercel/kv`, `kv.lpush('bookings', JSON.stringify(booking))`
 *
 * Validation, the response shape and the client all stay as they are.
 */
const bookings: Booking[] = []

const DATA_DIR = process.env.BOOKING_DATA_DIR || '/tmp'
const DATA_FILE = path.join(DATA_DIR, 'og-stores-bookings.json')

export function listBookings(): Booking[] {
  return bookings
}

export async function saveBooking(booking: Booking): Promise<Booking> {
  bookings.push(booking)

  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    let existing: Booking[] = []
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) existing = parsed as Booking[]
    } catch {
      existing = []
    }
    existing.push(booking)
    await fs.writeFile(DATA_FILE, JSON.stringify(existing.slice(-200), null, 2), 'utf8')
  } catch (error) {
    console.warn('[bookings] could not persist to disk (expected on read-only fs):', (error as Error).message)
  }

  return booking
}

export interface BookingValidation {
  ok: boolean
  errors: string[]
  value: {
    name: string
    email: string
    phone: string
    date: string
    time: string
    pieceSlug: string | null
    note: string | null
  } | null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9][0-9\s()-]{6,19}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

const asText = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/** Validates and normalises an untrusted POST /api/bookings body. */
export function validateBookingPayload(body: unknown): BookingValidation {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['Body must be a JSON object.'], value: null }
  }

  const input = body as Record<string, unknown>
  const name = asText(input.name, 80)
  const email = asText(input.email, 160).toLowerCase()
  const phone = asText(input.phone, 24)
  const date = asText(input.date, 10)
  const time = asText(input.time, 5)
  const pieceSlug = asText(input.piece, 60) || null
  const note = asText(input.note, 500) || null

  if (name.length < 2) errors.push('name must be at least 2 characters.')
  if (!EMAIL.test(email)) errors.push('email must be a valid address.')
  if (!PHONE.test(phone)) errors.push('phone must be a valid number, e.g. +234 906 565 6710.')
  if (!DATE.test(date)) errors.push('date must be an ISO date (YYYY-MM-DD).')
  if (!TIME.test(time)) errors.push('time must be 24-hour HH:MM.')

  if (DATE.test(date)) {
    const today = new Date()
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`
    if (date < todayIso) errors.push('date cannot be in the past.')
  }

  if (pieceSlug && !findProduct(pieceSlug)) {
    errors.push(`piece "${pieceSlug}" is not in the catalogue.`)
  }

  return {
    ok: errors.length === 0,
    errors,
    value: errors.length === 0 ? { name, email, phone, date, time, pieceSlug, note } : null,
  }
}
