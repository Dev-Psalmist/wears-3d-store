import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProduct } from '../lib/api'
import { formatNaira } from '../lib/money'
import type { ProductResponse } from '../lib/types'
import { useBag } from '../store/BagContext'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { add } = useBag()
  const [data, setData] = useState<ProductResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState('')

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setData(null)
    setError(null)
    setSize('')
    getProduct(slug)
      .then((response) => {
        if (cancelled) return
        setData(response)
        document.title = `OG Stores — ${response.product.code} ${response.product.name}`
      })
      .catch((cause: Error) => { if (!cancelled) setError(cause.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [slug])

  if (loading) return (
    <main className="relative z-10 flex min-h-[70vh] items-center justify-center px-5 pt-24">
      <p className="text-[9px] uppercase tracking-[0.4em] text-ash">Loading footwear…</p>
    </main>
  )

  if (error || !data) return (
    <main className="relative z-10 flex min-h-[70vh] flex-col items-start justify-center gap-5 px-5 pt-24 md:px-9">
      <p className="text-[9px] uppercase tracking-[0.34em] text-ember">Not found</p>
      <p className="max-w-lg text-[12px] leading-relaxed text-ash">{error ?? 'That shoe is not in the collection.'}</p>
      <Link to="/" className="border border-white/15 px-5 py-3 text-[9px] uppercase tracking-[0.3em] text-bone transition-colors hover:border-ember/60">
        Back to collection
      </Link>
    </main>
  )

  const { product, neighbours } = data
  const addToBag = () => {
    if (!size) return
    add({ slug: product.slug, code: product.code, name: product.name, price: product.price, size, color: product.color })
  }

  return (
    <main className="relative z-10 pt-24 md:pt-28">
      <div className="mx-auto max-w-[1680px] px-5 md:px-9">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <Link to="/" className="group inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.32em] text-ash transition-colors hover:text-bone" data-testid="back-to-collection">
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</span>
            Collection
          </Link>
          <p className="text-[9px] uppercase tracking-[0.3em] text-ash/60">{product.series} / {product.category}</p>
        </motion.div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.42fr_0.58fr] lg:gap-14">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="relative flex min-h-[340px] h-[54vh] w-full items-center justify-center overflow-hidden bg-white/[0.025] md:h-[64vh] lg:h-[74vh]">
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" decoding="async" referrerPolicy="no-referrer" />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.025]" />
              <span className="absolute bottom-4 left-4 text-[8px] uppercase tracking-[0.28em] text-ash/60">Product photograph · static view</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => navigate(`/product/${neighbours.prev.slug}`)} className="border border-white/10 px-3 py-3 text-left transition-colors hover:border-ember/50">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-ash/60">Previous</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-bone">{neighbours.prev.name}</span>
              </button>
              <button type="button" onClick={() => navigate(`/product/${neighbours.next.slug}`)} className="border border-white/10 px-3 py-3 text-left transition-colors hover:border-ember/50">
                <span className="block text-[8px] uppercase tracking-[0.25em] text-ash/60">Next</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-bone">{neighbours.next.name}</span>
              </button>
            </div>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="lg:pt-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-ember">{product.code}</p>
            <h1 className="mt-4 text-[clamp(30px,3.4vw,48px)] font-light leading-[1.02] tracking-[-0.02em] text-bone">{product.name}</h1>
            <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-ash">{product.colorName} / {product.category}</p>
            <p className="mt-7 max-w-md text-[12px] leading-[1.95] text-ash">{product.description}</p>

            <div className="mt-8 flex items-baseline justify-between border-t border-white/[0.07] pt-5">
              <span className="text-[9px] uppercase tracking-[0.3em] text-ash">Price</span>
              <span className="text-[17px] tracking-[0.05em] text-bone">{formatNaira(product.price)} <span className="text-[9px] uppercase tracking-[0.2em] text-ash">NGN</span></span>
            </div>

            <div className="mt-5">
              <label htmlFor="size" className="text-[9px] uppercase tracking-[0.3em] text-ash">Select shoe size (EU)</label>
              <div className="relative mt-2">
                <select id="size" value={size} onChange={(event) => setSize(event.target.value)} data-testid="size-select"
                  className="w-full appearance-none border border-white/15 bg-transparent px-4 py-3 pr-10 text-[11px] uppercase tracking-[0.22em] text-bone outline-none transition-colors duration-300 hover:border-white/30 focus:border-ember/60">
                  <option value="" className="bg-[#0a0a0c] text-ash">Select EU shoe size</option>
                  {product.sizes.map((option) => <option key={option} value={option} className="bg-[#0a0a0c] text-bone">{option}</option>)}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-ash" aria-hidden="true">▾</span>
              </div>
            </div>

            <button type="button" onClick={addToBag} disabled={!size} data-testid="add-to-bag"
              className="mt-4 w-full border border-ember/70 bg-ember/[0.07] py-4 text-[10px] uppercase tracking-[0.36em] text-bone transition-all duration-300 hover:bg-ember hover:text-ink disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-ash/45">
              {size ? 'Add to bag' : 'Select a size'}
            </button>
            <p className="mt-3 text-[9px] uppercase tracking-[0.24em] text-ash/45">{size ? 'Ships in 2–4 working days' : 'Choose a size to continue'}</p>

            <ul className="mt-9 space-y-3 border-t border-white/[0.07] pt-6">
              {product.details.map((detail) => <li key={detail} className="flex items-start gap-3 text-[11px] leading-relaxed text-ash"><span className="mt-[7px] h-px w-4 shrink-0 bg-ember/60" />{detail}</li>)}
            </ul>

            <div className="mt-8 border-t border-white/[0.07] pt-5 text-[9px] leading-relaxed text-ash/50">
              <p>Image credit: {product.imageCredit}</p>
              <p>Licence: {product.imageLicense}</p>
              <a href={product.imageSourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block underline underline-offset-4 hover:text-bone">View original image and licence</a>
              <p className="mt-3">Photograph is a visual product reference. Confirm final product specifications and colour before purchase.</p>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  )
}
