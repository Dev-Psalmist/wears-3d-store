import type {
  BookingRequest,
  BookingResponse,
  OrderLineInput,
  OrderResponse,
  ProductResponse,
  ProductsResponse,
} from './types'

/**
 * The storefront always talks to the serverless API — no product data is baked
 * into the client bundle. In dev, vite.config.ts serves the same handlers.
 */
const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    ...init,
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as { error?: string; details?: string[] }
      detail = body.details?.join(' ') || body.error || ''
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(`${init?.method ?? 'GET'} ${path} failed (${response.status})${detail ? `: ${detail}` : ''}`)
  }

  return (await response.json()) as T
}

export function getProducts() {
  return request<ProductsResponse>('/api/products')
}

export function getProduct(slug: string) {
  return request<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`)
}

export function createOrder(items: OrderLineInput[], note?: string) {
  return request<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      items,
      customer: note ? { note } : undefined,
    }),
  })
}

export function createBooking(payload: BookingRequest) {
  return request<BookingResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
