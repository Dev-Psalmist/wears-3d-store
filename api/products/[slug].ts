import type { VercelRequest, VercelResponse } from '@vercel/node'
import { findProduct, products } from '../../server/products.js'

/**
 * GET /api/products/[slug]
 * Returns one product plus its neighbours (used for the carousel peek on the detail page).
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

  const rawSlug = req.query.slug
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug
  if (!slug) {
    res.status(400).json({ error: 'A product slug is required.' })
    return
  }

  const product = findProduct(String(slug))
  if (!product) {
    res.status(404).json({ error: 'Product not found', slug })
    return
  }

  const index = products.findIndex((p) => p.slug === product.slug)
  const prev = products[(index - 1 + products.length) % products.length]
  const next = products[(index + 1) % products.length]

  res.status(200).json({
    product,
    neighbours: {
      prev: { slug: prev.slug, code: prev.code, name: prev.name, color: prev.color, accent: prev.accent },
      next: { slug: next.slug, code: next.code, name: next.name, color: next.color, accent: next.accent },
    },
  })
}
