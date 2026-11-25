import * as THREE from 'three'

/**
 * Material helpers — all textures are generated at runtime, so the storefront
 * ships with zero image assets.
 */

let fabricNormal: THREE.Texture | null = null
let glowSprite: THREE.Texture | null = null

/** Small tileable woven-fabric normal map built from value noise + a weave grid. */
export function getFabricNormalTexture(): THREE.Texture {
  if (fabricNormal) return fabricNormal

  const size = 128
  const heights = new Float32Array(size * size)

  // value noise, 3 octaves
  const octave = (freq: number, amp: number) => {
    const grid = new Float32Array(freq * freq)
    for (let i = 0; i < grid.length; i += 1) grid[i] = Math.random()
    const sample = (x: number, y: number) => {
      const gx = (x * freq) % freq
      const gy = (y * freq) % freq
      const x0 = Math.floor(gx)
      const y0 = Math.floor(gy)
      const x1 = (x0 + 1) % freq
      const y1 = (y0 + 1) % freq
      const fx = gx - x0
      const fy = gy - y0
      const sx = fx * fx * (3 - 2 * fx)
      const sy = fy * fy * (3 - 2 * fy)
      const a = grid[y0 * freq + x0]
      const b = grid[y0 * freq + x1]
      const c = grid[y1 * freq + x0]
      const d = grid[y1 * freq + x1]
      return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy
    }
    return (x: number, y: number) => sample(x, y) * amp
  }

  const n1 = octave(8, 0.6)
  const n2 = octave(16, 0.3)
  const n3 = octave(32, 0.1)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size
      const v = y / size
      // fine weave: two out-of-phase sine grids
      const weave =
        0.5 +
        0.25 * Math.sin(u * Math.PI * 2 * 32) * Math.sin(v * Math.PI * 2 * 32) +
        0.25 * Math.sin((u + v) * Math.PI * 2 * 16)
      heights[y * size + x] = n1(u, v) + n2(u, v) + n3(u, v) + weave * 0.35
    }
  }

  const data = new Uint8Array(size * size * 4)
  const strength = 2.2
  const at = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength
      const nx = -dx
      const ny = -dy
      const nz = 1
      const len = Math.hypot(nx, ny, nz) || 1
      const i = (y * size + x) * 4
      data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255)
      data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255)
      data[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255)
      data[i + 3] = 255
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  fabricNormal = texture
  return texture
}

/** Soft radial falloff used for shelf glow pools (additive blending). */
export function getGlowTexture(): THREE.Texture {
  if (glowSprite) return glowSprite
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.72)')
  gradient.addColorStop(0.42, 'rgba(255,255,255,0.26)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.06)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  glowSprite = texture
  return texture
}

const normalScale = new THREE.Vector2(0.35, 0.35)

/** Props for a PBR cloth material (sheen is what sells fabric under spotlights). */
export function clothProps(color: string, options: { roughness?: number; sheen?: number; normalScale?: number } = {}) {
  const base = new THREE.Color(color)
  const sheenColor = base.clone().lerp(new THREE.Color('#ffffff'), 0.6)
  return {
    color,
    roughness: options.roughness ?? 0.84,
    metalness: 0.02,
    sheen: options.sheen ?? 1,
    sheenRoughness: 0.62,
    sheenColor,
    normalMap: getFabricNormalTexture(),
    normalScale: normalScale.clone().multiplyScalar(options.normalScale ?? 1),
    side: THREE.DoubleSide,
    envMapIntensity: 0.55,
  }
}

/** Ribbed knit/cuff material — slightly rougher, no sheen highlight. */
export function ribProps(color: string) {
  return {
    color,
    roughness: 0.95,
    metalness: 0,
    normalMap: getFabricNormalTexture(),
    normalScale: normalScale.clone().multiplyScalar(1.4),
    side: THREE.DoubleSide,
    envMapIntensity: 0.4,
  }
}

/** Darker shade of a cloth colour, used for inner collars and shadows. */
export function shade(color: string, amount = 0.45): string {
  return new THREE.Color(color).multiplyScalar(amount).getStyle()
}

/** Slightly lighter shade, used for highlights and trims. */
export function tint(color: string, amount = 0.18): string {
  return new THREE.Color(color).lerp(new THREE.Color('#ffffff'), amount).getStyle()
}
