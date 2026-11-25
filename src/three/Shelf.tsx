import { useMemo } from 'react'
import * as THREE from 'three'
import { getGlowTexture } from './materials'

interface ShelfProps {
  /** Idle glow tint (usually the product accent). */
  color: string
  /** When true the shelf burns ember-orange. */
  active?: boolean
  width?: number
  depth?: number
  /** Extra emissive punch for the detail stage (feeds the bloom pass). */
  bloom?: boolean
  /** Soft halo behind the product. */
  halo?: boolean
}

/**
 * A thin glass shelf with an emissive under-edge and an additive glow pool.
 * The "bloom" is faked with additive gradients so the gallery stays cheap,
 * and doubled with a real bloom pass on the detail page.
 */
export function Shelf({ color, active = false, width = 1.5, depth = 0.62, bloom = false, halo = true }: ShelfProps) {
  const glow = getGlowTexture()
  const glowColor = active ? '#FF6B2C' : color
  const stripColor = useMemo(() => {
    const c = new THREE.Color(glowColor)
    return bloom ? c.multiplyScalar(2.6) : c
  }, [glowColor, bloom])

  const edgeOpacity = active ? 1 : 0.7

  return (
    <group>
      {/* glass slab */}
      <mesh>
        <boxGeometry args={[width, 0.018, depth]} />
        <meshPhysicalMaterial
          color="#c6d2ea"
          transparent
          opacity={0.16}
          roughness={0.04}
          metalness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.03}
          ior={1.46}
          reflectivity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* bright front edge of the glass */}
      <mesh position={[0, 0.0095, depth / 2]}>
        <boxGeometry args={[width, 0.0035, 0.004]} />
        <meshBasicMaterial color="#e8eeff" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* emissive under-strip */}
      <mesh position={[0, -0.0135, depth / 2 - 0.012]}>
        <boxGeometry args={[width * 0.985, 0.005, 0.012]} />
        <meshBasicMaterial color={stripColor} transparent opacity={edgeOpacity} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.008, 0]}>
        <boxGeometry args={[width * 0.99, 0.004, depth * 0.99]} />
        <meshBasicMaterial color={stripColor} transparent opacity={active ? 0.55 : 0.24} toneMapped={false} />
      </mesh>

      {/* glow pool underneath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0.02]}>
        <planeGeometry args={[width * 1.85, depth * 2.6]} />
        <meshBasicMaterial
          map={glow}
          color={stripColor}
          transparent
          opacity={active ? 0.95 : 0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* soft halo behind the garment */}
      {halo && (
        <mesh position={[0, 0.42, -0.55]}>
          <planeGeometry args={[width * 1.25, width * 1.05]} />
          <meshBasicMaterial
            map={glow}
            color={stripColor}
            transparent
            opacity={active ? 0.3 : 0.13}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      <pointLight
        position={[0, -0.1, 0.18]}
        color={glowColor}
        intensity={active ? 5 : 1.6}
        distance={2.4}
        decay={2}
      />
    </group>
  )
}
