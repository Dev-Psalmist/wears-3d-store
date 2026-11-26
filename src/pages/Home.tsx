import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ProductTile } from '../components/ProductTile'
import { BookingSection } from '../components/BookingSection'
import { BRAND } from '../lib/site'
import { useHashScroll, useProducts } from '../lib/useProducts'

export function Home() {
  const { data, error, loading } = useProducts()
  const location = useLocation()
  useHashScroll(location.hash)

  useEffect(() => {
    document.title = `${BRAND.name} — ${BRAND.tagline}`
  }, [])

  return (
    <main className="relative z-10">
      {/* ---------------------------------------------------------- hero ---- */}
      <section id="top" className="relative px-5 pt-32 md:px-9 md:pt-40">
        <div className="mx-auto max-w-[1680px]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-ember/80" />
            <p className="text-[9px] uppercase tracking-[0.42em] text-ash">Wears / Series 01</p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-5xl text-[clamp(40px,7.4vw,104px)] font-light leading-[0.94] tracking-[-0.035em] text-bone"
          >
            Form,{' '}
            <span className="font-serif italic tracking-[-0.02em] text-bone/80">lit from within.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-9 flex flex-col justify-between gap-7 md:flex-row md:items-end"
          >
            <p className="max-w-md text-[12px] leading-[1.85] tracking-[0.01em] text-ash">
              Ten silhouettes, suspended above glass and lit from below. Every piece is modelled in the browser —
              drag a garment to turn it, and it will keep turning on its own.
            </p>
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-ash/60">
              <span className="hidden h-px w-10 bg-white/15 sm:block" />
              <span>10 pieces / Series 01</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------- gallery ---- */}
      <section id="collection" className="relative mt-14 px-5 md:mt-20 md:px-9">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-6 flex items-baseline justify-between border-b border-white/[0.07] pb-3">
            <p className="text-[9px] uppercase tracking-[0.34em] text-ash">The collection</p>
            <p className="text-[9px] uppercase tracking-[0.28em] text-ash/50">
              {data ? `${String(data.count).padStart(2, '0')} pieces` : 'Loading'}
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[1/1.02] w-full bg-white/[0.03]" />
                  <div className="mt-3 h-2 w-2/3 bg-white/[0.04]" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="border border-white/10 bg-white/[0.02] p-8">
              <p className="text-[9px] uppercase tracking-[0.34em] text-ember">API unavailable</p>
              <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-ash">
                The collection is served by <span className="font-mono text-bone/80">GET /api/products</span> and could
                not be reached. {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 border border-white/15 px-4 py-2 text-[9px] uppercase tracking-[0.3em] text-bone transition-colors hover:border-ember/60"
              >
                Retry
              </button>
            </div>
          )}

          {data && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-12">
              {data.products.map((product, index) => (
                <motion.div
                  key={product.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.03 * index, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductTile product={product} index={index} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- about ---- */}
      <section id="about" className="relative mt-28 px-5 md:px-9">
        <div className="mx-auto grid max-w-[1680px] gap-10 border-t border-white/[0.07] pt-12 md:grid-cols-[0.9fr_1.1fr]">
          <p className="text-[9px] uppercase tracking-[0.34em] text-ash">About</p>
          <div>
            <p className="max-w-2xl font-serif text-[clamp(22px,2.6vw,34px)] leading-[1.28] text-bone/90">
              {BRAND.name} is a small house making a small number of things. Series 01 is ten pieces, drawn once and
              cut slowly.
            </p>
            <p className="mt-6 max-w-xl text-[12px] leading-[1.9] text-ash">
              The collection is shown the way we look at it in the studio: in a dark room, on glass, under a single
              light. Nothing is photographed — each garment is built from geometry and a cloth shader, then lit in real
              time. Move your cursor across a shelf and the light underneath answers.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- faq ---- */}
      <section id="faq" className="relative mt-24 px-5 md:px-9">
        <div className="mx-auto grid max-w-[1680px] gap-10 border-t border-white/[0.07] pt-12 md:grid-cols-[0.9fr_1.1fr]">
          <p className="text-[9px] uppercase tracking-[0.34em] text-ash">FAQ</p>
          <dl className="max-w-2xl divide-y divide-white/[0.07]">
            {[
              {
                q: 'How do the garments look so real?',
                a: 'Every piece is procedural three.js geometry — sweeps, panels and ribbing — shaded with a PBR cloth material (sheen, roughness, a generated fabric normal map) and lit by a three-point studio rig.',
              },
              {
                q: 'What sizes do you run?',
                a: 'Tops, outerwear and bottoms run S to XXL. Headwear is one size with a brass adjuster. Size selection happens on the product page.',
              },
              {
                q: 'Can I rotate the product?',
                a: 'Yes. Drag anywhere on the detail stage to tilt and spin the garment. Release and it keeps its momentum before settling back into a slow auto-rotation.',
              },
              {
                q: 'How do I try a piece on?',
                a: 'Book a fitting below. Pick a date, a time and the piece you want to see; the request is validated by POST /api/bookings and we confirm by email or WhatsApp within one working day.',
              },
              {
                q: 'What currency are the prices in?',
                a: 'Everything is priced in Nigerian naira (NGN). Totals are recalculated server-side by POST /api/orders, so the bag can never be tampered with.',
              },
            ].map((item) => (
              <div key={item.q} className="py-5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-bone/85">{item.q}</dt>
                <dd className="mt-2 text-[12px] leading-[1.85] text-ash">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- booking ---- */}
      <BookingSection />

      {/* ------------------------------------------------------ contacts ---- */}
      <section id="contacts" className="relative mt-24 px-5 md:px-9">
        <div className="mx-auto grid max-w-[1680px] gap-10 border-t border-white/[0.07] pt-12 md:grid-cols-[0.9fr_1.1fr]">
          <p className="text-[9px] uppercase tracking-[0.34em] text-ash">Contacts</p>
          <div className="max-w-xl space-y-6">
            <p className="text-[12px] leading-[1.9] text-ash">
              For fittings, stockists, press and wholesale, reach the studio directly. We answer within one working
              day, {BRAND.hours.toLowerCase()}.
            </p>
            <div className="grid gap-4 text-[12px] sm:grid-cols-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Email</p>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="mt-1 block text-bone/90 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
                >
                  {BRAND.email}
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Phone / WhatsApp</p>
                <a
                  href={`tel:${BRAND.phone}`}
                  className="mt-1 block text-bone/90 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
                >
                  {BRAND.phoneDisplay}
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Studio</p>
                <p className="mt-1 text-bone/90">{BRAND.location} — by appointment</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Hours</p>
                <p className="mt-1 text-bone/90">{BRAND.hours}</p>
              </div>
            </div>
            <a
              href="#booking"
              className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-[9px] uppercase tracking-[0.3em] text-bone transition-colors hover:border-ember/60"
            >
              Book a fitting
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
