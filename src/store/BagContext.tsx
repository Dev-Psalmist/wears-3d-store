import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createOrder } from '../lib/api'
import type { Order } from '../lib/types'

export interface BagItem {
  slug: string
  code: string
  name: string
  price: number
  size: string
  color: string
  quantity: number
}

interface BagContextValue {
  items: BagItem[]
  count: number
  subtotal: number
  isOpen: boolean
  openBag: () => void
  closeBag: () => void
  add: (item: Omit<BagItem, 'quantity'>) => void
  remove: (slug: string, size: string) => void
  clear: () => void
  placeOrder: () => Promise<void>
  placing: boolean
  order: Order | null
  error: string | null
  resetOrder: () => void
}

const BagContext = createContext<BagContextValue | null>(null)
const STORAGE_KEY = 'mantle.bag.v1'

function readStorage(): BagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as BagItem[]) : []
  } catch {
    return []
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>(() => (typeof window === 'undefined' ? [] : readStorage()))
  const [isOpen, setIsOpen] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage can be unavailable in private mode — the bag still works in memory */
    }
  }, [items])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const add = useCallback((item: Omit<BagItem, 'quantity'>) => {
    setItems((current) => {
      const index = current.findIndex((line) => line.slug === item.slug && line.size === item.size)
      if (index === -1) return [...current, { ...item, quantity: 1 }]
      const next = [...current]
      next[index] = { ...next[index], quantity: Math.min(10, next[index].quantity + 1) }
      return next
    })
    setOrder(null)
    setError(null)
    setIsOpen(true)
  }, [])

  const remove = useCallback((slug: string, size: string) => {
    setItems((current) => current.filter((line) => !(line.slug === slug && line.size === size)))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const placeOrder = useCallback(async () => {
    if (items.length === 0) return
    setPlacing(true)
    setError(null)
    try {
      const response = await createOrder(
        items.map((line) => ({ slug: line.slug, size: line.size, quantity: line.quantity })),
      )
      setOrder(response.order)
      setItems([])
    } catch (cause) {
      setError((cause as Error).message)
    } finally {
      setPlacing(false)
    }
  }, [items])

  const resetOrder = useCallback(() => setOrder(null), [])

  const value = useMemo<BagContextValue>(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0)
    return {
      items,
      count,
      subtotal,
      isOpen,
      openBag: () => setIsOpen(true),
      closeBag: () => setIsOpen(false),
      add,
      remove,
      clear,
      placeOrder,
      placing,
      order,
      error,
      resetOrder,
    }
  }, [items, isOpen, add, remove, clear, placeOrder, placing, order, error, resetOrder])

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export function useBag(): BagContextValue {
  const context = useContext(BagContext)
  if (!context) throw new Error('useBag must be used inside <BagProvider>')
  return context
}
