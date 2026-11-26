import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { formatNaira } from '../lib/money'

interface ProductTileProps { product: Product; index: number }

/** Static product photograph tile for the footwear collection. */
export function ProductTile({ product }: ProductTileProps) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block outline-none"
      aria-label={`${product.code} — ${product.name}, ${formatNaira(product.price)}`}
      data-testid="product-tile"
      data-slug={product.slug}
    >
      <div className="relative aspect-[1/1.02] w-full overflow-hidden bg-white/[0.035]">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          referrerPolicy="no-referrer"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[0.03]" />
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-white/[0.07] pt-2.5">
        <span className="text-[10px] font-medium tracking-[0.3em] text-bone/85 transition-colors duration-300 group-hover:text-ember">
          {product.code}
        </span>
        <span className="text-[10px] tracking-[0.16em] text-ash">{formatNaira(product.price)}</span>
      </div>
      <p className="mt-1 truncate text-[11px] tracking-[0.02em] text-ash/60 transition-colors duration-300 group-hover:text-ash">
        {product.name}
      </p>
      <p className="mt-1 text-[8px] uppercase tracking-[0.24em] text-ash/40">{product.category}</p>
    </Link>
  )
}
