import type { VercelRequest, VercelResponse } from '@vercel/node'
import { products } from '../../server/products'

/**
 * GET /api/products
 * Returns the full catalogue plus facet counts used by the storefront UI.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS')
    res.status(405).json({ error: 'Method not allowed', method: req.method })
    return
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  res.status(200).json({
    series: 'Series 01',
    count: products.length,
    categories,
    products,
  })
}
