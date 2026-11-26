import { useId } from 'react'

interface BrandMarkProps {
  /** Emblem size in pixels. */
  size?: number
  /** Show the "OG STORES" wordmark next to the emblem. */
  wordmark?: boolean
  className?: string
}

/**
 * OG Stores identity.
 *
 * The emblem is a seal: an ember ring (the O) holding a bone G — an interlocked
 * monogram that reads at 16px and at 160px. Pure geometry, no font dependency, so it
 * renders identically in the header, the footer and the favicon.
 */
export function BrandMark({ size = 34, wordmark = true, className = '' }: BrandMarkProps) {
  const id = useId().replace(/:/g, '')
  const ring = `og-ring-${id}`
  const glow = `og-glow-${id}`

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        role="img"
        aria-label="OG Stores"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9A5C" />
            <stop offset="55%" stopColor="#FF6B2C" />
            <stop offset="100%" stopColor="#D93E10" />
          </linearGradient>
          <radialGradient id={glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* soft ember halo behind the seal */}
        <circle cx="22" cy="22" r="21" fill={`url(#${glow})`} />

        {/* the O */}
        <circle cx="22" cy="22" r="15.6" fill="none" stroke={`url(#${ring})`} strokeWidth="1.7" />

        {/* the G, nested inside the O */}
        <path
          d="M28.9 17.2 A8.4 8.4 0 1 0 29.6 25.6 L29.6 22 L25.3 22"
          fill="none"
          stroke="#E9E5DC"
          strokeWidth="2.1"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* ember tick on the base, like a stitch mark */}
        <path d="M16.5 33.4 H27.5" stroke={`url(#${ring})`} strokeWidth="1.1" strokeLinecap="round" />
      </svg>

      {wordmark && (
        <span className="flex items-baseline gap-[7px]">
          <span className="text-[12px] font-medium uppercase tracking-[0.44em] text-bone">OG</span>
          <span className="h-[9px] w-px translate-y-[1px] bg-ember/70" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-[0.34em] text-ash">Stores</span>
        </span>
      )}
    </span>
  )
}
