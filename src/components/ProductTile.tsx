import { useState } from 'react'
import { Link } from 'react-router-dom'
import { View } from '@react-three/drei'
import { Shelf } from '../three/Shelf'
import { FloatingProduct, Studio } from '../three/Studio'
import type { Product } from '../lib/types'

interface ProductTileProps {
  product: Product
  index: number
}

/**
 * A single shelf in the 5x2 gallery. The <View> is a plain DOM div that the shared
 * canvas tracks; hovering the tile drives the ember glow.
 */
export function ProductTile({ product, index }: ProductTileProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${product.code} — ${product.name}, $${product.price}`}
      data-testid="product-tile"
      data-slug={product.slug}
    >
      <div className="relative aspect-[1/1.02] w-full">
        <View className="absolute inset-0" index={index + 1}>
          <Studio intensity={0.95} />
          <Shelf color={product.accent} active={hovered} />
          <FloatingProduct product={product} hovered={hovered} phase={index * 1.73} />
        </View>
        <span
          className={`pointer-events-none absolute inset-x-4 bottom-3 h-px transition-opacity duration-500 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'linear-gradient(90deg, transparent, #FF6B2C, transparent)' }}
        />
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-white/[0.07] pt-2.5">
        <span className="text-[10px] font-medium tracking-[0.3em] text-bone/85 transition-colors duration-300 group-hover:text-ember">
          {product.code}
        </span>
        <span className="text-[10px] tracking-[0.16em] text-ash">${product.price}</span>
      </div>
      <p className="mt-1 truncate text-[11px] tracking-[0.02em] text-ash/60 transition-colors duration-300 group-hover:text-ash">
        {product.name}
      </p>
    </Link>
  )
}
