/**
 * Shared domain types for the MANTLE storefront.
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
  currency: 'USD'
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
  currency: 'USD'
}
