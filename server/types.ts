/**
 * Shared domain types for the OG Stores storefront.
 * Imported by the Vercel serverless functions in /api (never bundled into the client).
 */

export type GarmentModel =
  | 'hoodie'
  | 'tee'
  | 'bomber'
  | 'trousers'
  | 'cap'
  | 'joggers'
  | 'shirt'
  | 'puffer'
  | 'knit'
  | 'coat'

export type SizeSet = 'apparel' | 'headwear'

export interface Product {
  id: string
  slug: string
  /** Two-word editorial code, e.g. "RIFT 06". */
  code: string
  name: string
  /** Which procedural three.js garment to mount on the client. */
  model: GarmentModel
  category: 'Outerwear' | 'Knitwear' | 'Tops' | 'Bottoms' | 'Headwear'
  series: string
  colorName: string
  /** Base cloth colour (hex). */
  color: string
  /** Shelf glow tint when idle (hex). */
  accent: string
  price: number
  currency: 'NGN'
  sizes: string[]
  sizeSet: SizeSet
  description: string
  details: string[]
  inStock: boolean
}

export interface OrderLineInput {
  slug: string
  size: string
  quantity: number
}

export interface OrderLine {
  slug: string
  code: string
  name: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Booking {
  id: string
  status: 'requested'
  createdAt: string
  customer: {
    name: string
    email: string
    phone: string
  }
  appointment: {
    /** ISO date, YYYY-MM-DD. */
    date: string
    /** 24-hour HH:MM, West Africa Time. */
    time: string
    timezone: string
  }
  /** The piece they want to see, when they picked one. */
  piece: { slug: string; code: string; name: string } | null
  note: string | null
}

export interface BookingResponse {
  booking: Booking
  message: string
}

export interface Order {
  id: string
  status: 'received'
  createdAt: string
  customer: {
    name: string | null
    email: string | null
    note: string | null
  }
  items: OrderLine[]
  subtotal: number
  currency: 'NGN'
}
