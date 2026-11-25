import { useEffect, useState } from 'react'
import { getProducts } from './api'
import type { ProductsResponse } from './types'

let cache: ProductsResponse | null = null
let inflight: Promise<ProductsResponse> | null = null

/** Shared, de-duplicated catalogue fetch. The UI only ever reads from the API. */
export function useProducts() {
  const [data, setData] = useState<ProductsResponse | null>(cache)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let cancelled = false
    setLoading(true)
    inflight = inflight ?? getProducts()
    inflight
      .then((response) => {
        cache = response
        if (!cancelled) {
          setData(response)
          setError(null)
        }
      })
      .catch((cause: Error) => {
        inflight = null
        if (!cancelled) setError(cause.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error, loading }
}

/** Scroll to the hash target after a client-side navigation (e.g. /#about). */
export function useHashScroll(hash: string, enabled = true) {
  useEffect(() => {
    if (!enabled || !hash) return
    const id = hash.replace('#', '')
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [hash, enabled])
}
