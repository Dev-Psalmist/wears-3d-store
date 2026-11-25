import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.07] px-5 pb-10 pt-16 md:px-9">
      <div className="mx-auto max-w-[1680px]">
        <p className="max-w-3xl font-serif text-[clamp(26px,3.6vw,46px)] leading-[1.12] tracking-[-0.01em] text-bone/90">
          Explore the collection. <span className="italic text-ember/90">Select a silhouette.</span>
        </p>

        <div className="mt-14 grid gap-10 border-t border-white/[0.07] pt-10 text-[11px] text-ash md:grid-cols-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-bone/70">Mantle</p>
            <p className="mt-3 max-w-[220px] leading-relaxed text-ash/70">
              Series 01 — ten silhouettes rendered in real time. Built with React, three.js and a small Node API.
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-bone/70">Index</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/" className="transition-colors hover:text-bone">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/#about" className="transition-colors hover:text-bone">
                  About
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="transition-colors hover:text-bone">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/#contacts" className="transition-colors hover:text-bone">
                  Contacts
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-bone/70">Contact</p>
            <ul className="mt-3 space-y-2 text-ash/70">
              <li>
                <a href="mailto:studio@mantle.example" className="transition-colors hover:text-bone">
                  studio@mantle.example
                </a>
              </li>
              <li>+44 20 0000 0000</li>
              <li>London / Lisbon</li>
            </ul>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-bone/70">Series</p>
            <p className="mt-3 text-ash/70">01 / 2026</p>
            <p className="mt-2 text-ash/50">All garments modelled procedurally. No photography.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.07] pt-6 text-[9px] uppercase tracking-[0.28em] text-ash/50 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Mantle Studio</span>
          <span>Form, lit from within.</span>
        </div>
      </div>
    </footer>
  )
}
