import * as THREE from 'three'

/**
 * Procedural garment geometry.
 *
 * Every garment is built from "sweeps": a superellipse cross-section lofted along Y
 * with width/depth profiles. That gives soft, cloth-like volumes with rounded
 * shoulders and hems without any external model files.
 */

export type ProfileFn = (t: number) => number

/** Piecewise smoothstep interpolation between keyframes, e.g. [[0, 0.3], [1, 0.4]]. */
export function profile(keys: Array<[number, number]>): ProfileFn {
  return (t: number) => {
    const x = Math.min(1, Math.max(0, t))
    for (let i = 0; i < keys.length - 1; i += 1) {
      const [t0, v0] = keys[i]
      const [t1, v1] = keys[i + 1]
      if (x <= t1) {
        const span = t1 - t0
        const k = span === 0 ? 0 : (x - t0) / span
        const s = k * k * (3 - 2 * k)
        return v0 + (v1 - v0) * s
      }
    }
    return keys[keys.length - 1][1]
  }
}

function superellipse(angle: number, w: number, d: number, power: number): [number, number] {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const p = 2 / power
  return [
    Math.sign(c) * Math.pow(Math.abs(c), p) * w,
    Math.sign(s) * Math.pow(Math.abs(s), p) * d,
  ]
}

export interface SweepOptions {
  /** Total height along +Y from the local origin. */
  height: number
  /** Half-width, constant or a profile of t (0 = bottom, 1 = top). */
  width: number | ProfileFn
  /** Half-depth. Defaults to the width profile. */
  depth?: number | ProfileFn
  radial?: number
  steps?: number
  /** 2 = ellipse, higher = boxier (3.2 is a good cloth torso). */
  power?: number
  capTop?: boolean
  capBottom?: boolean
  shiftX?: ProfileFn
  shiftZ?: ProfileFn
  /** Radial fluting — used for knit ribs and puffer baffles. */
  ripple?: { amp: number; freq: number }
}

export function sweepGeometry(options: SweepOptions): THREE.BufferGeometry {
  const radial = options.radial ?? 26
  const steps = options.steps ?? 22
  const power = options.power ?? 2.8
  const widthFn: ProfileFn =
    typeof options.width === 'function' ? options.width : () => options.width as number
  const depthFn: ProfileFn =
    typeof options.depth === 'function'
      ? options.depth
      : typeof options.depth === 'number'
        ? () => options.depth as number
        : widthFn
  const shiftX = options.shiftX ?? (() => 0)
  const shiftZ = options.shiftZ ?? (() => 0)

  const cols = radial + 1
  const rows = steps + 1
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i < rows; i += 1) {
    const t = i / steps
    const y = t * options.height
    const w = widthFn(t)
    const d = depthFn(t)
    const cx = shiftX(t)
    const cz = shiftZ(t)
    for (let j = 0; j < cols; j += 1) {
      const a = (j / radial) * Math.PI * 2
      const k = options.ripple ? 1 + options.ripple.amp * Math.cos(options.ripple.freq * a) : 1
      const [x, z] = superellipse(a, w * k, d * k, power)
      positions.push(x + cx, y, z + cz)
      uvs.push(j / radial, t)
    }
  }

  for (let i = 0; i < steps; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * cols + j
      const b = a + 1
      const c = a + cols
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const addCap = (t: number, flip: boolean) => {
    const y = t * options.height
    const w = widthFn(t)
    const d = depthFn(t)
    const cx = shiftX(t)
    const cz = shiftZ(t)
    const centerIndex = positions.length / 3
    positions.push(cx, y, cz)
    uvs.push(0.5, 0.5)
    const ringStart = positions.length / 3
    for (let j = 0; j < cols; j += 1) {
      const a = (j / radial) * Math.PI * 2
      const k = options.ripple ? 1 + options.ripple.amp * Math.cos(options.ripple.freq * a) : 1
      const [x, z] = superellipse(a, w * 0.999 * k, d * 0.999 * k, power)
      positions.push(x + cx, y, z + cz)
      uvs.push(j / radial, 0.5)
    }
    for (let j = 0; j < radial; j += 1) {
      const p0 = ringStart + j
      const p1 = ringStart + j + 1
      if (flip) indices.push(centerIndex, p1, p0)
      else indices.push(centerIndex, p0, p1)
    }
  }

  if (options.capTop) addCap(1, false)
  if (options.capBottom) addCap(0, true)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/** A tapered tube used for sleeves, legs and drawcords. */
export function limbGeometry(
  length: number,
  startRadius: number,
  endRadius: number,
  options: { radial?: number; steps?: number; bend?: number } = {},
): THREE.BufferGeometry {
  const { radial = 18, steps = 12, bend = 0 } = options
  return sweepGeometry({
    height: length,
    radial,
    steps,
    power: 2.2,
    width: (t) => startRadius + (endRadius - startRadius) * t,
    depth: (t) => (startRadius + (endRadius - startRadius) * t) * 0.92,
    shiftZ: bend ? (t) => Math.sin(t * Math.PI) * bend : undefined,
    capTop: true,
    capBottom: true,
  })
}

/** Simple torus ring, used for ribbed collars, cuffs and hems. */
export function ribGeometry(radius: number, tube: number, arc = Math.PI * 2): THREE.BufferGeometry {
  return new THREE.TorusGeometry(radius, tube, 10, 40, arc)
}

/** Rounded rectangle path, centred on the origin. */
export function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  const radius = Math.min(r, w / 2, h / 2)
  shape.moveTo(x + radius, y)
  shape.lineTo(x + w - radius, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + radius)
  shape.lineTo(x + w, y + h - radius)
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  shape.lineTo(x + radius, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

/** Extruded, softly bevelled panel — pockets, plackets, brims, lapels. */
export function panelGeometry(w: number, h: number, r: number, depth = 0.02, bevel = 0.01): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/** Half-disc used for a cap brim. */
export function brimGeometry(radius: number, thickness = 0.022): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 40, 1, false, -Math.PI / 2, Math.PI)
  geometry.computeVertexNormals()
  return geometry
}
