import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getProducts } from '../lib/api'
import { BrandMark } from './BrandMark'
import type { Product } from '../lib/types'
import { useBag } from '../store/BagContext'

const NAV = [
  { label: 'Home', hash: '#top' },
  { label: 'About', hash: '#about' },
  { label: 'FAQ', hash: '#faq' },
  { label: 'Booking', hash: '#booking' },
  { label: 'Contacts', hash: '#contacts' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [catalogue, setCatalogue] = useState<Product[] | null>(null)
  const { count, openBag } = useBag()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!searchOpen || catalogue) return
    let cancelled = false
    getProducts()
      .then((response) => {
        if (!cancelled) setCatalogue(response.products)
      })
      .catch(() => setCatalogue([]))
    return () => {
      cancelled = true
    }
  }, [searchOpen, catalogue])

  const goTo = (hash: string) => {
    if (location.pathname !== '/') {
      navigate(`/${hash}`)
      return
    }
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? 'border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1680px] items-center justify-between px-5 md:px-9">
          <Link to="/" className="group flex items-center" aria-label="OG Stores home">
            <BrandMark size={30} className="transition-opacity duration-500 group-hover:opacity-85" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.hash}
                onClick={(event) => {
                  event.preventDefault()
                  goTo(item.hash)
                }}
                className="text-[10px] uppercase tracking-[0.3em] text-ash transition-colors duration-300 hover:text-bone"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[9px] uppercase tracking-[0.26em] text-bone/80 transition-colors duration-300 hover:border-white/35 hover:text-bone md:px-4"
              aria-label="Search the collection"
            >
              <SearchIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              type="button"
              onClick={openBag}
              className="flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[9px] uppercase tracking-[0.26em] text-bone/80 transition-colors duration-300 hover:border-ember/60 hover:text-bone"
              aria-label={`Open bag, ${count} items`}
            >
              <span className="hidden sm:inline">Bag</span>
              <span className={`tabular-nums ${count > 0 ? 'text-ember' : 'text-ash'}`}>
                {String(count).padStart(2, '0')}
              </span>
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} products={catalogue} />
    </>
  )
}

function SearchOverlay({ open, onClose, products }: { open: boolean; onClose: () => void; products: Product[] | null }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(timer)
    }
    setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    if (!products) return []
    const q = query.trim().toLowerCase()
    if (!q) return products.slice(0, 6)
    return products.filter((product) =>
      [product.code, product.name, product.category, product.colorName].join(' ').toLowerCase().includes(q),
    )
  }, [products, query])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center px-5 pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl border border-white/10 bg-[#0b0b0d]/95 p-5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <SearchIcon className="h-4 w-4 text-ash" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search silhouettes, codes, colourways"
                className="w-full bg-transparent text-sm tracking-[0.02em] text-bone outline-none placeholder:text-ash/50"
              />
              <button
                type="button"
                onClick={onClose}
                className="text-[9px] uppercase tracking-[0.3em] text-ash transition-colors hover:text-bone"
              >
                Esc
              </button>
            </div>
            <ul className="mt-3 max-h-[46vh] overflow-auto">
              {results.map((product) => (
                <li key={product.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      navigate(`/product/${product.slug}`)
                    }}
                    className="group flex w-full items-center justify-between gap-4 px-1 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: product.color }} />
                      <span className="text-[11px] uppercase tracking-[0.26em] text-bone/90">{product.code}</span>
                      <span className="text-[11px] text-ash/70">{product.name}</span>
                    </span>
                    <span className="text-[11px] text-ash">${product.price}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-1 py-6 text-[11px] uppercase tracking-[0.24em] text-ash/60">No silhouettes found</li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  )
}
