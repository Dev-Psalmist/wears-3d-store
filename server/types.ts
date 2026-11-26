/**
 * Shared domain types for the OG Stores footwear storefront.
 * Imported by the Vercel serverless functions (never bundled into the client).
 */
export type GarmentModel =
  | 'hoodie' | 'tee' | 'bomber' | 'trousers' | 'cap'
  | 'joggers' | 'shirt' | 'puffer' | 'knit' | 'coat'

export type SizeSet = 'apparel' | 'headwear'

export type ProductCategory =
  | 'Canvas' | 'Sneakers' | 'Running' | 'High-tops' | 'Slip-ons'
  | 'Loafers' | 'Oxford' | 'Derby' | 'Formal' | 'Boots'

export interface Product {
  id: string
  slug: string
  code: string
  name: string
  /** Retained for compatibility with the previous catalogue contract. */
  model: GarmentModel
  category: ProductCategory
  series: string
  colorName: string
  color: string
  accent: string
  /** Static, openly licensed product photograph. */
  imageUrl: string
  imageCredit: string
  imageLicense: string
  imageSourceUrl: string
  price: number
  currency: 'NGN'
  sizes: string[]
  sizeSet: SizeSet
  description: string
  details: string[]
  inStock: boolean
}

export interface OrderLineInput { slug: string; size: string; quantity: number }
export interface OrderLine {
  slug: string; code: string; name: string; size: string
  quantity: number; unitPrice: number; lineTotal: number
}
export interface Booking {
  id: string
  status: 'requested'
  createdAt: string
  customer: { name: string; email: string; phone: string }
  appointment: { date: string; time: string; timezone: string }
  piece: { slug: string; code: string; name: string } | null
  note: string | null
}
export interface BookingResponse { booking: Booking; message: string }
export interface Order {
  id: string
  status: 'received'
  createdAt: string
  customer: { name: string | null; email: string | null; note: string | null }
  items: OrderLine[]
  subtotal: number
  currency: string
}
