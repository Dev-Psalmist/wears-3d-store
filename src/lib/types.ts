/**
 * Client-side mirror of the API contract in /server/types.ts.
 * Kept as a separate file so the browser bundle never touches server code.
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
  code: string
  name: string
  model: GarmentModel
  category: 'Outerwear' | 'Knitwear' | 'Tops' | 'Bottoms' | 'Headwear'
  series: string
  colorName: string
  color: string
  accent: string
  price: number
  currency: 'NGN'
  sizes: string[]
  sizeSet: SizeSet
  description: string
  details: string[]
  inStock: boolean
}

export interface ProductsResponse {
  series: string
  count: number
  categories: string[]
  products: Product[]
}

export interface Neighbour {
  slug: string
  code: string
  name: string
  color: string
  accent: string
}

export interface ProductResponse {
  product: Product
  neighbours: { prev: Neighbour; next: Neighbour }
}

export interface BookingRequest {
  name: string
  email: string
  phone: string
  date: string
  time: string
  piece?: string | null
  note?: string | null
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

export interface BookingResponse {
  booking: Booking
  message: string
}

export interface OrderLineInput {
  slug: string
  size: string
  quantity: number
}

export interface Order {
  id: string
  status: string
  createdAt: string
  items: Array<{
    slug: string
    code: string
    name: string
    size: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  subtotal: number
  currency: string
}

export interface OrderResponse {
  order: Order
  message: string
}
