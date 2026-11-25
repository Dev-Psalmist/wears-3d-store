import { AnimatePresence, motion } from 'framer-motion'
import { useBag } from '../store/BagContext'

export function BagDrawer() {
  const { items, isOpen, closeBag, subtotal, remove, placeOrder, placing, order, error, count } = useBag()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            aria-label="Close bag"
            onClick={closeBag}
            className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0c]/98"
            aria-label="Bag"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.34em] text-ash">Your selection</p>
                <p className="mt-1 text-[12px] uppercase tracking-[0.3em] text-bone">Bag / {String(count).padStart(2, '0')}</p>
              </div>
              <button
                type="button"
                onClick={closeBag}
                className="text-[9px] uppercase tracking-[0.3em] text-ash transition-colors hover:text-bone"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {order && (
                <div className="mt-6 border border-ember/40 bg-ember/[0.07] p-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-ember">Order received</p>
                  <p className="mt-2 font-mono text-[13px] text-bone">{order.id}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ash">
                    Stored by the serverless API. This demo keeps orders in memory — connect a database before taking
                    real payments.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-6 border border-red-500/40 bg-red-500/[0.06] p-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-red-400">Could not place order</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ash">{error}</p>
                </div>
              )}

              {items.length === 0 && !order && (
                <div className="flex h-full flex-col items-start justify-center gap-3 pb-24">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ash">The bag is empty</p>
                  <button
                    type="button"
                    onClick={closeBag}
                    className="text-[10px] uppercase tracking-[0.3em] text-bone underline decoration-ember/60 underline-offset-[6px]"
                  >
                    Explore the collection
                  </button>
                </div>
              )}

              <ul className="divide-y divide-white/[0.06]">
                {items.map((item) => (
                  <li key={`${item.slug}-${item.size}`} className="flex items-start gap-4 py-5">
                    <span
                      className="mt-1 h-9 w-9 shrink-0 rounded-full border border-white/10"
                      style={{ background: `radial-gradient(circle at 35% 30%, ${item.color}, rgba(0,0,0,0.9))` }}
                    />
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-bone">{item.code}</p>
                      <p className="mt-1 text-[11px] text-ash">
                        {item.name} · Size {item.size}
                      </p>
                      <p className="mt-1 text-[11px] text-ash/70">
                        Qty {item.quantity} · ${item.price * item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.slug, item.size)}
                      className="text-[9px] uppercase tracking-[0.24em] text-ash/60 transition-colors hover:text-ember"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] uppercase tracking-[0.3em] text-ash">Subtotal</span>
                <span className="text-[15px] tracking-[0.06em] text-bone">${subtotal} USD</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0 || placing}
                onClick={() => void placeOrder()}
                className="mt-4 w-full border border-ember/70 bg-ember/[0.08] py-3.5 text-[10px] uppercase tracking-[0.34em] text-bone transition-all duration-300 hover:bg-ember hover:text-ink disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-ash/50"
              >
                {placing ? 'Placing order…' : 'Place order'}
              </button>
              <p className="mt-3 text-[9px] leading-relaxed tracking-[0.06em] text-ash/50">
                Demo checkout — no payment is taken. Orders post to <span className="font-mono">POST /api/orders</span>.
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
