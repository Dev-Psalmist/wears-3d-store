import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import type { Product } from '../lib/types'

/**
 * Photo-based 3D wear.
 *
 * Each product photo is a transparent cut-out with a matching grayscale depth map
 * (see scripts/process_wears.py). We build a dense plane, push every vertex forward by
 * its depth value, and recompute normals — so a flat product shot becomes a puffed,
 * shaded slab with real parallax. Because it is genuine geometry, dragging spins it a
 * full 360°: you see the front, the silhouette edge, and the mirrored back of the piece.
 */

const SEGMENTS = 120
const DEPTH_RES = 160

function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\/+/, '')}`
}

/** Draw the depth image to a small canvas so we can read it on the CPU. */
function readDepth(image: CanvasImageSource & { width: number; height: number }) {
  const canvas = document.createElement('canvas')
  canvas.width = DEPTH_RES
  canvas.height = DEPTH_RES
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(image, 0, 0, DEPTH_RES, DEPTH_RES)
  return ctx.getImageData(0, 0, DEPTH_RES, DEPTH_RES).data
}

function buildGeometry(
  depth: Uint8ClampedArray,
  aspect: number,
  maxHeight: number,
  maxWidth: number,
  bulge: number,
) {
  let height = maxHeight
  let width = height * aspect
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspect
  }

  const geometry = new THREE.PlaneGeometry(width, height, SEGMENTS, SEGMENTS)
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  const push = bulge * (height / 0.9)

  const at = (x: number, y: number) => {
    const px = Math.min(DEPTH_RES - 1, Math.max(0, x))
    const py = Math.min(DEPTH_RES - 1, Math.max(0, y))
    return depth[(py * DEPTH_RES + px) * 4] / 255
  }

  for (let i = 0; i < position.count; i += 1) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    // bilinear sample; canvas rows run top-down so v is flipped
    const fx = u * (DEPTH_RES - 1)
    const fy = (1 - v) * (DEPTH_RES - 1)
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const tx = fx - x0
    const ty = fy - y0
    const d =
      at(x0, y0) * (1 - tx) * (1 - ty) +
      at(x0 + 1, y0) * tx * (1 - ty) +
      at(x0, y0 + 1) * (1 - tx) * ty +
      at(x0 + 1, y0 + 1) * tx * ty
    position.setZ(i, d * push)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return { geometry, width, height }
}

interface WearMeshProps {
  product: Product
  maxHeight: number
  maxWidth: number
  bulge: number
}

function WearMesh({ product, maxHeight, maxWidth, bulge }: WearMeshProps) {
  const [map, depthTexture] = useLoader(THREE.TextureLoader, [
    assetUrl(product.image),
    assetUrl(product.depth),
  ])

  const built = useMemo(() => {
    const source = depthTexture.image as HTMLImageElement
    const depth = readDepth(source)
    if (!depth) return null
    const aspect = source.width / source.height
    return buildGeometry(depth, aspect, maxHeight, maxWidth, bulge)
  }, [depthTexture, maxHeight, maxWidth, bulge])

  if (!built) return null

  return (
    // Sit the piece on the glass: the geometry is centred, so lift it by half its height.
    <mesh geometry={built.geometry} position={[0, built.height / 2 + 0.012, 0]}>
      <meshStandardMaterial
        map={map}
        alphaTest={0.45}
        side={THREE.DoubleSide}
        roughness={0.86}
        metalness={0.02}
        emissive={'#ffffff'}
        emissiveMap={map}
        emissiveIntensity={0.3}
        envMapIntensity={0.32}
      />
    </mesh>
  )
}

export interface WearProps {
  product: Product
  /** Box the cut-out is fitted into, in world units. */
  maxHeight?: number
  maxWidth?: number
  /** How far the centre of the piece pushes toward the viewer. */
  bulge?: number
}

export function Wear({ product, maxHeight = 0.82, maxWidth = 1.02, bulge = 0.15 }: WearProps) {
  return (
    <Suspense fallback={null}>
      <WearMesh product={product} maxHeight={maxHeight} maxWidth={maxWidth} bulge={bulge} />
    </Suspense>
  )
}
