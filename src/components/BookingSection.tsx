import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { createBooking } from '../lib/api'
import { useProducts } from '../lib/useProducts'
import { formatNaira } from '../lib/money'
import { BRAND } from '../lib/site'

/** yyyy-mm-dd for tomorrow, in local time — the earliest sensible fitting. */
function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00']

interface Field {
  id: string
  label: string
  type: string
  placeholder: string
  required?: boolean
  autoComplete?: string
}

const FIELDS: Field[] = [
  { id: 'name', label: 'Full name', type: 'text', placeholder: 'Ada Obi', required: true, autoComplete: 'name' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com', required: true, autoComplete: 'email' },
  { id: 'phone', label: 'Phone / WhatsApp', type: 'tel', placeholder: '+234 906 565 6710', required: true, autoComplete: 'tel' },
]

/**
 * Studio booking. Posts to POST /api/bookings, which validates the request and
 * returns a reference the guest can quote on WhatsApp.
 */
export function BookingSection() {
  const { data } = useProducts()
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    date: tomorrow(),
    time: '13:00',
    piece: '',
    note: '',
  })
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [reference, setReference] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pieces = useMemo(() => data?.products ?? [], [data])

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError(null)
    try {
      const response = await createBooking({
        name: values.name,
        email: values.email,
        phone: values.phone,
        date: values.date,
        time: values.time,
        piece: values.piece || null,
        note: values.note || null,
      })
      setReference(response.booking.id)
      setState('done')
    } catch (err) {
      setError((err as Error).message)
      setState('idle')
    }
  }

  const fieldClass =
    'w-full border border-white/12 bg-white/[0.02] px-3.5 py-3 text-[12px] text-bone outline-none transition-colors placeholder:text-ash/40 focus:border-ember/60'

  return (
    <section id="booking" className="relative mt-24 px-5 md:px-9">
      <div className="mx-auto grid max-w-[1680px] gap-12 border-t border-white/[0.07] pt-12 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.34em] text-ash">Booking</p>
          <h2 className="mt-6 max-w-md font-serif text-[clamp(26px,3.2vw,42px)] leading-[1.14] text-bone/90">
            Book a private fitting at the <span className="italic text-ember/90">studio.</span>
          </h2>
          <p className="mt-5 max-w-md text-[12px] leading-[1.9] text-ash">
            Forty-five minutes, one guest, the full Series 01 rail. Tell us when suits you and which piece you want to
            try — we confirm every request by email or WhatsApp within one working day.
          </p>

          <dl className="mt-9 grid gap-5 text-[12px] sm:grid-cols-2">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${BRAND.email}`}
                  className="text-bone/90 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
                >
                  {BRAND.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Phone / WhatsApp</dt>
              <dd className="mt-1">
                <a
                  href={`tel:${BRAND.phone}`}
                  className="text-bone/90 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember"
                >
                  {BRAND.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Studio</dt>
              <dd className="mt-1 text-bone/90">{BRAND.location}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.3em] text-ash/60">Hours</dt>
              <dd className="mt-1 text-bone/90">{BRAND.hours}</dd>
            </div>
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative border border-white/[0.09] bg-white/[0.015] p-5 md:p-7"
        >
          {state === 'done' ? (
            <div data-testid="booking-success">
              <p className="text-[9px] uppercase tracking-[0.34em] text-ember">Request received</p>
              <p className="mt-4 font-serif text-[24px] leading-[1.2] text-bone/90">
                We&rsquo;ll see you at the studio.
              </p>
              <p className="mt-4 text-[12px] leading-[1.85] text-ash">
                {values.date} at {values.time} (WAT)
                {values.piece ? ` — ${pieces.find((p) => p.slug === values.piece)?.code ?? values.piece}` : ''}. A
                confirmation goes to {values.email}.
              </p>
              <p className="mt-6 border border-white/10 px-3.5 py-3 text-[11px] tracking-[0.16em] text-bone/85">
                Reference <span className="text-ember">{reference}</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-[9px] uppercase tracking-[0.3em]">
                <a
                  href={`https://wa.me/${BRAND.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello OG Stores, I booked a fitting (${reference}) for ${values.date} at ${values.time}.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/15 px-4 py-2.5 text-bone transition-colors hover:border-ember/60"
                >
                  Message on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setState('idle')
                    setReference(null)
                  }}
                  className="px-1 py-2.5 text-ash transition-colors hover:text-bone"
                >
                  Book another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" data-testid="booking-form">
              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <label
                    key={field.id}
                    className={`block ${field.id === 'phone' ? 'sm:col-span-2' : ''}`}
                  >
                    <span className="text-[9px] uppercase tracking-[0.3em] text-ash/70">
                      {field.label}
                      {field.required && <span className="text-ember"> *</span>}
                    </span>
                    <input
                      className={`mt-2 ${fieldClass}`}
                      type={field.type}
                      name={field.id}
                      value={values[field.id as 'name' | 'email' | 'phone']}
                      onChange={set(field.id as 'name' | 'email' | 'phone')}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      required={field.required}
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-ash/70">
                    Date<span className="text-ember"> *</span>
                  </span>
                  <input
                    className={`mt-2 ${fieldClass}`}
                    type="date"
                    name="date"
                    value={values.date}
                    min={tomorrow()}
                    onChange={set('date')}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-ash/70">
                    Time (WAT)<span className="text-ember"> *</span>
                  </span>
                  <select className={`mt-2 ${fieldClass}`} name="time" value={values.time} onChange={set('time')}>
                    {TIMES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-ash/70">Piece to try</span>
                  <select className={`mt-2 ${fieldClass}`} name="piece" value={values.piece} onChange={set('piece')}>
                    <option value="">Anything from Series 01</option>
                    {pieces.map((product) => (
                      <option key={product.slug} value={product.slug}>
                        {product.code} — {product.name} ({formatNaira(product.price)})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-[9px] uppercase tracking-[0.3em] text-ash/70">Notes</span>
                <textarea
                  className={`mt-2 min-h-[84px] resize-y ${fieldClass}`}
                  name="note"
                  value={values.note}
                  onChange={set('note')}
                  placeholder="Sizes, alterations, who is coming with you…"
                />
              </label>

              {error && (
                <p className="border border-ember/40 bg-ember/[0.06] px-3.5 py-3 text-[11px] leading-relaxed text-ember/90" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'sending'}
                className="group flex w-full items-center justify-center gap-3 bg-ember px-5 py-3.5 text-[10px] uppercase tracking-[0.34em] text-ink transition-colors hover:bg-[#FF7F45] disabled:opacity-60"
              >
                {state === 'sending' ? 'Sending' : 'Request fitting'}
                <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>
              <p className="text-[10px] leading-relaxed text-ash/50">
                No payment is taken here. We reply within one working day, {BRAND.hours.toLowerCase()}.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
