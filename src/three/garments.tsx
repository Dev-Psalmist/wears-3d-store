import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { brimGeometry, limbGeometry, panelGeometry, profile, sweepGeometry } from './geometry'
import { clothProps, ribProps, shade, tint } from './materials'
import type { GarmentModel } from '../lib/types'

/**
 * Ten procedurally-built garments. Every piece is generated from sweeps and panels
 * at runtime — no meshes, textures or images are loaded from disk.
 */

function useGeo<T extends THREE.BufferGeometry>(make: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useMemo(make, deps)
  useEffect(() => () => geo.dispose(), [geo])
  return geo
}

const UP = Math.PI / 2

interface SleeveProps {
  color: string
  side: -1 | 1
  position: [number, number, number]
  length: number
  /** Radius at the shoulder. */
  start: number
  /** Radius at the cuff. */
  end: number
  angle?: number
  cuff?: boolean
  ripple?: { amp: number; freq: number }
  bend?: number
}

function Sleeve({ color, side, position, length, start, end, angle = 2.25, cuff = true, ripple, bend = 0.02 }: SleeveProps) {
  const geo = useGeo(
    () =>
      sweepGeometry({
        height: length,
        radial: 20,
        steps: 16,
        power: 2.2,
        width: (t) => start + (end - start) * t,
        depth: (t) => (start + (end - start) * t) * 0.94,
        shiftZ: bend ? (t) => Math.sin(t * Math.PI * 0.85) * bend : undefined,
        capTop: true,
        capBottom: true,
        ripple,
      }),
    [length, start, end, bend, ripple?.amp, ripple?.freq],
  )

  return (
    <group position={position} rotation={[0, 0, side * -angle]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial {...clothProps(color)} />
      </mesh>
      {cuff && (
        <mesh position={[0, length - 0.012, 0]} rotation={[UP, 0, 0]}>
          <torusGeometry args={[end * 0.97, Math.max(0.016, end * 0.17), 8, 26]} />
          <meshStandardMaterial {...ribProps(shade(color, 0.74))} />
        </mesh>
      )}
    </group>
  )
}

/** Short band of ribbing, sitting just proud of the garment surface. */
function HemBand({ color, y, width, depth, height = 0.045, power = 2.9, ripple }: {
  color: string
  y: number
  width: number
  depth: number
  height?: number
  power?: number
  ripple?: { amp: number; freq: number }
}) {
  const geo = useGeo(
    () =>
      sweepGeometry({
        height,
        width: width * 1.012,
        depth: depth * 1.012,
        power,
        radial: 28,
        steps: 3,
        capTop: false,
        capBottom: false,
        ripple,
      }),
    [width, depth, height, power, ripple?.amp, ripple?.freq],
  )
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshStandardMaterial {...ribProps(shade(color, 0.76))} />
    </mesh>
  )
}

function NeckRing({ color, y, radius, tube = 0.024, depth = 1 }: {
  color: string
  y: number
  radius: number
  tube?: number
  depth?: number
}) {
  return (
    <group>
      <mesh position={[0, y, 0]} rotation={[UP, 0, 0]} scale={[1, depth, 1]}>
        <torusGeometry args={[radius, tube, 10, 40]} />
        <meshStandardMaterial {...ribProps(shade(color, 0.72))} />
      </mesh>
      <mesh position={[0, y + 0.001, 0]} rotation={[-UP, 0, 0]} scale={[1, depth, 1]}>
        <circleGeometry args={[radius * 0.94, 36]} />
        <meshStandardMaterial color={shade(color, 0.22)} roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ tee ---- */

function Tee({ color }: { color: string }) {
  const body = useGeo(
    () =>
      sweepGeometry({
        height: 0.9,
        radial: 30,
        steps: 26,
        power: 2.9,
        width: profile([[0, 0.325], [0.3, 0.335], [0.72, 0.358], [0.9, 0.365], [1, 0.332]]),
        depth: profile([[0, 0.163], [0.45, 0.198], [1, 0.18]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clothProps(color)} />
      </mesh>
      <Sleeve color={color} side={-1} position={[-0.3, 0.845, 0]} length={0.46} start={0.148} end={0.104} />
      <Sleeve color={color} side={1} position={[0.3, 0.845, 0]} length={0.46} start={0.148} end={0.104} />
      <NeckRing color={color} y={0.902} radius={0.124} tube={0.022} depth={1.15} />
      <HemBand color={color} y={0} width={0.325} depth={0.163} height={0.03} />
    </group>
  )
}

/* --------------------------------------------------------------- hoodie ---- */

function Hoodie({ color }: { color: string }) {
  const body = useGeo(
    () =>
      sweepGeometry({
        height: 0.95,
        radial: 30,
        steps: 28,
        power: 3.05,
        width: profile([[0, 0.36], [0.35, 0.375], [0.75, 0.385], [0.94, 0.372], [1, 0.34]]),
        depth: profile([[0, 0.185], [0.5, 0.218], [1, 0.2]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )

  const pocket = useGeo(() => panelGeometry(0.4, 0.17, 0.05, 0.03, 0.014), [])
  const string = useGeo(() => limbGeometry(0.24, 0.0075, 0.0075, { radial: 8, steps: 3 }), [])
  const hood = useGeo(() => new THREE.SphereGeometry(0.235, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.56), [])

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clothProps(color)} />
      </mesh>

      <Sleeve color={color} side={-1} position={[-0.315, 0.875, 0]} length={0.5} start={0.162} end={0.108} />
      <Sleeve color={color} side={1} position={[0.315, 0.875, 0]} length={0.5} start={0.162} end={0.108} />

      {/* hood, sitting behind the neck */}
      <mesh geometry={hood} position={[0, 0.85, -0.055]} rotation={[0.3, 0, 0]} scale={[1.06, 1.02, 1.16]}>
        <meshPhysicalMaterial {...clothProps(shade(color, 0.88))} />
      </mesh>
      <mesh position={[0, 0.965, 0.015]} rotation={[1.28, 0, 0]} scale={[1.05, 1, 1]}>
        <torusGeometry args={[0.185, 0.03, 10, 40]} />
        <meshStandardMaterial {...ribProps(shade(color, 0.7))} />
      </mesh>

      {/* kangaroo pocket */}
      <mesh geometry={pocket} position={[0, 0.3, 0.2]} rotation={[-0.06, 0, 0]}>
        <meshPhysicalMaterial {...clothProps(shade(color, 0.86))} />
      </mesh>

      {/* drawcords + tips */}
      <mesh geometry={string} position={[-0.06, 0.7, 0.17]} rotation={[0.06, 0, 0.04]}>
        <meshStandardMaterial color={tint(color, 0.55)} roughness={0.9} />
      </mesh>
      <mesh geometry={string} position={[0.06, 0.7, 0.17]} rotation={[0.06, 0, -0.04]}>
        <meshStandardMaterial color={tint(color, 0.55)} roughness={0.9} />
      </mesh>
      <mesh position={[-0.062, 0.7, 0.176]}>
        <cylinderGeometry args={[0.012, 0.012, 0.035, 10]} />
        <meshStandardMaterial color="#cfd3d8" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.058, 0.7, 0.176]}>
        <cylinderGeometry args={[0.012, 0.012, 0.035, 10]} />
        <meshStandardMaterial color="#cfd3d8" metalness={0.9} roughness={0.3} />
      </mesh>

      <NeckRing color={color} y={0.935} radius={0.135} tube={0.026} depth={1.1} />
      <HemBand color={color} y={0} width={0.36} depth={0.185} height={0.055} power={3.05} />
    </group>
  )
}

/* --------------------------------------------------------------- bomber ---- */

function Bomber({ color }: { color: string }) {
  const body = useGeo(
    () =>
      sweepGeometry({
        height: 0.72,
        radial: 30,
        steps: 22,
        power: 3.3,
        width: profile([[0, 0.372], [0.45, 0.392], [0.8, 0.378], [1, 0.35]]),
        depth: profile([[0, 0.192], [0.5, 0.212], [1, 0.2]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const zip = useGeo(() => panelGeometry(0.016, 0.6, 0.006, 0.012, 0.004), [])
  const welt = useGeo(() => panelGeometry(0.13, 0.028, 0.012, 0.014, 0.006), [])

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clothProps(color, { roughness: 0.62, sheen: 0.7 })} />
      </mesh>
      <Sleeve color={color} side={-1} position={[-0.31, 0.68, 0]} length={0.46} start={0.158} end={0.102} angle={2.3} />
      <Sleeve color={color} side={1} position={[0.31, 0.68, 0]} length={0.46} start={0.158} end={0.102} angle={2.3} />

      {/* rib collar */}
      <mesh position={[0, 0.722, 0]} rotation={[UP, 0, 0]} scale={[1, 1.12, 1]}>
        <torusGeometry args={[0.158, 0.036, 12, 40]} />
        <meshStandardMaterial {...ribProps(shade(color, 0.68))} />
      </mesh>
      <mesh position={[0, 0.723, 0]} rotation={[-UP, 0, 0]} scale={[1, 1.12, 1]}>
        <circleGeometry args={[0.146, 32]} />
        <meshStandardMaterial color={shade(color, 0.2)} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* zip + pull */}
      <mesh geometry={zip} position={[0, 0.41, 0.212]}>
        <meshStandardMaterial color="#c9ced6" metalness={0.92} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.52, 0.224]}>
        <boxGeometry args={[0.028, 0.05, 0.008]} />
        <meshStandardMaterial color="#d8dde4" metalness={0.9} roughness={0.24} />
      </mesh>

      {/* welt pockets */}
      <mesh geometry={welt} position={[-0.16, 0.3, 0.207]} rotation={[0, 0.1, 0.06]}>
        <meshStandardMaterial {...ribProps(shade(color, 0.72))} />
      </mesh>
      <mesh geometry={welt} position={[0.16, 0.3, 0.207]} rotation={[0, -0.1, -0.06]}>
        <meshStandardMaterial {...ribProps(shade(color, 0.72))} />
      </mesh>

      <HemBand color={color} y={0} width={0.372} depth={0.192} height={0.072} power={3.3} />
    </group>
  )
}

/* ------------------------------------------------------------- trousers ---- */

function Trousers({ color }: { color: string }) {
  const hips = useGeo(
    () =>
      sweepGeometry({
        height: 0.3,
        radial: 28,
        steps: 8,
        power: 3.1,
        width: profile([[0, 0.302], [0.55, 0.318], [1, 0.3]]),
        depth: profile([[0, 0.176], [1, 0.192]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const leg = useGeo(
    () =>
      sweepGeometry({
        height: 0.7,
        radial: 20,
        steps: 14,
        power: 2.35,
        width: (t) => 0.118 + 0.04 * t,
        depth: (t) => 0.112 + 0.036 * t,
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const fly = useGeo(() => panelGeometry(0.022, 0.19, 0.008, 0.012, 0.004), [])
  const loop = useGeo(() => new THREE.BoxGeometry(0.022, 0.085, 0.014), [])

  return (
    <group>
      <mesh geometry={hips} position={[0, 0.68, 0]}>
        <meshPhysicalMaterial {...clothProps(color)} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.147, 0.02, 0]} rotation={[0, 0, side * 0.022]}>
          <mesh geometry={leg}>
            <meshPhysicalMaterial {...clothProps(color)} />
          </mesh>
          <mesh position={[0, 0.004, 0]} rotation={[UP, 0, 0]} scale={[1, 0.96, 1]}>
            <torusGeometry args={[0.118, 0.011, 8, 28]} />
            <meshStandardMaterial {...ribProps(shade(color, 0.66))} />
          </mesh>
        </group>
      ))}

      {/* waistband */}
      <HemBand color={color} y={0.93} width={0.305} depth={0.186} height={0.055} power={3.1} />

      {/* fly + belt loops */}
      <mesh geometry={fly} position={[0, 0.84, 0.192]}>
        <meshStandardMaterial {...ribProps(shade(color, 0.68))} />
      </mesh>
      {[-0.2, -0.07, 0.07, 0.2].map((x) => (
        <mesh key={x} geometry={loop} position={[x, 0.955, 0.183]} rotation={[0, Math.atan2(x, 0.18) * 0.5, 0]}>
          <meshStandardMaterial {...ribProps(shade(color, 0.7))} />
        </mesh>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------- joggers ---- */

function Joggers({ color }: { color: string }) {
  const hips = useGeo(
    () =>
      sweepGeometry({
        height: 0.28,
        radial: 28,
        steps: 8,
        power: 3.0,
        width: profile([[0, 0.3], [0.6, 0.312], [1, 0.296]]),
        depth: profile([[0, 0.174], [1, 0.188]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const leg = useGeo(
    () =>
      sweepGeometry({
        height: 0.72,
        radial: 22,
        steps: 16,
        power: 2.4,
        width: (t) => 0.098 + 0.055 * Math.pow(t, 0.75),
        depth: (t) => 0.094 + 0.05 * Math.pow(t, 0.75),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const cord = useGeo(() => limbGeometry(0.14, 0.007, 0.007, { radial: 8, steps: 3 }), [])

  return (
    <group>
      <mesh geometry={hips} position={[0, 0.66, 0]}>
        <meshPhysicalMaterial {...clothProps(color)} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.142, 0.02, 0]} rotation={[0, 0, side * 0.035]}>
          <mesh geometry={leg}>
            <meshPhysicalMaterial {...clothProps(color)} />
          </mesh>
          {/* ankle rib */}
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.102, 0.094, 0.07, 24, 1, true]} />
            <meshStandardMaterial {...ribProps(shade(color, 0.72))} />
          </mesh>
        </group>
      ))}

      <HemBand color={color} y={0.91} width={0.3} depth={0.18} height={0.05} power={3.0} />
      <mesh geometry={cord} position={[-0.05, 0.82, 0.176]} rotation={[0, 0, 0.08]}>
        <meshStandardMaterial color={tint(color, 0.5)} roughness={0.9} />
      </mesh>
      <mesh geometry={cord} position={[0.05, 0.82, 0.176]} rotation={[0, 0, -0.08]}>
        <meshStandardMaterial color={tint(color, 0.5)} roughness={0.9} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ cap ---- */

function Cap({ color }: { color: string }) {
  const dome = useGeo(() => new THREE.SphereGeometry(0.3, 36, 22, 0, Math.PI * 2, 0, Math.PI * 0.54), [])
  const brim = useGeo(() => brimGeometry(0.3, 0.02), [])
  const button = useGeo(() => new THREE.SphereGeometry(0.028, 16, 12), [])

  return (
    <group position={[0, 0.04, 0]} scale={1.32}>
      <mesh geometry={dome} position={[0, 0.11, 0]} scale={[1, 0.95, 1.06]}>
        <meshPhysicalMaterial {...clothProps(color, { roughness: 0.9 })} />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <cylinderGeometry args={[0.301, 0.297, 0.075, 36, 1, true]} />
        <meshStandardMaterial {...ribProps(shade(color, 0.82))} />
      </mesh>
      <mesh geometry={brim} position={[0, 0.072, 0.075]} scale={[1.04, 1, 1.18]}>
        <meshPhysicalMaterial {...clothProps(shade(color, 0.9), { roughness: 0.86 })} />
      </mesh>
      <mesh geometry={button} position={[0, 0.4, 0]}>
        <meshStandardMaterial {...ribProps(shade(color, 0.7))} />
      </mesh>
      {/* front seam panels */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.115, 0.27, 0.19]} rotation={[0, side * 0.55, 0]}>
          <boxGeometry args={[0.006, 0.24, 0.05]} />
          <meshStandardMaterial {...ribProps(shade(color, 0.72))} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- shirt ---- */

function Shirt({ color }: { color: string }) {
  const body = useGeo(
    () =>
      sweepGeometry({
        height: 0.94,
        radial: 30,
        steps: 26,
        power: 3.15,
        width: profile([[0, 0.342], [0.4, 0.35], [0.8, 0.365], [1, 0.34]]),
        depth: profile([[0, 0.172], [0.5, 0.202], [1, 0.188]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const placket = useGeo(() => panelGeometry(0.055, 0.86, 0.014, 0.014, 0.006), [])
  const collar = useGeo(() => panelGeometry(0.115, 0.13, 0.018, 0.016, 0.008), [])
  const button = useGeo(() => new THREE.SphereGeometry(0.014, 12, 10), [])

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clothProps(color, { roughness: 0.78 })} />
      </mesh>
      <Sleeve color={color} side={-1} position={[-0.305, 0.87, 0]} length={0.5} start={0.15} end={0.106} angle={2.28} />
      <Sleeve color={color} side={1} position={[0.305, 0.87, 0]} length={0.5} start={0.15} end={0.106} angle={2.28} />

      <mesh geometry={placket} position={[0, 0.44, 0.196]}>
        <meshStandardMaterial {...ribProps(tint(color, 0.1))} />
      </mesh>
      {[0.72, 0.58, 0.44, 0.3, 0.16].map((y) => (
        <mesh key={y} geometry={button} position={[0, y, 0.213]}>
          <meshStandardMaterial color="#efe9dd" roughness={0.55} />
        </mesh>
      ))}

      <mesh position={[0, 0.945, 0]} rotation={[UP, 0, 0]} scale={[1, 1.1, 1]}>
        <torusGeometry args={[0.132, 0.02, 8, 36]} />
        <meshStandardMaterial {...ribProps(shade(color, 0.8))} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={collar}
          position={[side * 0.072, 0.905, 0.128]}
          rotation={[0.42, side * -0.42, side * 0.22]}
        >
          <meshPhysicalMaterial {...clothProps(tint(color, 0.06), { roughness: 0.75 })} />
        </mesh>
      ))}
      <HemBand color={color} y={0} width={0.342} depth={0.172} height={0.03} power={3.15} />
    </group>
  )
}

/* --------------------------------------------------------------- puffer ---- */

function Puffer({ color }: { color: string }) {
  const core = useGeo(
    () =>
      sweepGeometry({
        height: 0.9,
        radial: 26,
        steps: 16,
        power: 2.8,
        width: profile([[0, 0.3], [0.5, 0.32], [1, 0.28]]),
        depth: profile([[0, 0.16], [0.5, 0.175], [1, 0.155]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const baffle = useGeo(() => new THREE.TorusGeometry(0.315, 0.082, 10, 40), [])
  const zip = useGeo(() => panelGeometry(0.016, 0.82, 0.006, 0.012, 0.004), [])
  const collar = useGeo(
    () =>
      sweepGeometry({
        height: 0.16,
        radial: 26,
        steps: 6,
        power: 2.8,
        width: profile([[0, 0.235], [1, 0.225]]),
        depth: profile([[0, 0.135], [1, 0.13]]),
        capTop: false,
        capBottom: false,
      }),
    [],
  )

  return (
    <group>
      <mesh geometry={core}>
        <meshPhysicalMaterial {...clothProps(shade(color, 0.55), { roughness: 0.7 })} />
      </mesh>

      {[0.17, 0.345, 0.52, 0.695, 0.865].map((y) => (
        <mesh key={y} geometry={baffle} position={[0, y, 0]} rotation={[UP, 0, 0]} scale={[1, 0.62, 1]}>
          <meshPhysicalMaterial {...clothProps(color, { roughness: 0.55, sheen: 0.8 })} />
        </mesh>
      ))}

      <Sleeve color={color} side={-1} position={[-0.3, 0.8, 0]} length={0.5} start={0.165} end={0.105} angle={2.2} ripple={{ amp: 0.09, freq: 14 }} />
      <Sleeve color={color} side={1} position={[0.3, 0.8, 0]} length={0.5} start={0.165} end={0.105} angle={2.2} ripple={{ amp: 0.09, freq: 14 }} />

      <mesh geometry={collar} position={[0, 0.88, 0]}>
        <meshPhysicalMaterial {...clothProps(color, { roughness: 0.55 })} />
      </mesh>

      <mesh geometry={zip} position={[0, 0.5, 0.185]}>
        <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ----------------------------------------------------------------- knit ---- */

function Knit({ color }: { color: string }) {
  const body = useGeo(
    () =>
      sweepGeometry({
        height: 0.92,
        radial: 96,
        steps: 26,
        power: 2.7,
        width: profile([[0, 0.345], [0.5, 0.362], [0.9, 0.35], [1, 0.32]]),
        depth: profile([[0, 0.178], [0.5, 0.198], [1, 0.182]]),
        capTop: true,
        capBottom: true,
        ripple: { amp: 0.022, freq: 22 },
      }),
    [],
  )

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clothProps(color, { roughness: 0.94, sheen: 1 })} />
      </mesh>
      <Sleeve color={color} side={-1} position={[-0.3, 0.855, 0]} length={0.52} start={0.158} end={0.104} angle={2.32} ripple={{ amp: 0.03, freq: 16 }} />
      <Sleeve color={color} side={1} position={[0.3, 0.855, 0]} length={0.52} start={0.158} end={0.104} angle={2.32} ripple={{ amp: 0.03, freq: 16 }} />
      <NeckRing color={color} y={0.922} radius={0.128} tube={0.032} depth={1.12} />
      <HemBand color={color} y={0} width={0.345} depth={0.178} height={0.075} power={2.7} ripple={{ amp: 0.03, freq: 22 }} />
    </group>
  )
}

/* ----------------------------------------------------------------- coat ---- */

function Coat({ color }: { color: string }) {
  const body = useGeo(
    () =>
      sweepGeometry({
        height: 1.06,
        radial: 30,
        steps: 30,
        power: 3.2,
        width: profile([[0, 0.385], [0.25, 0.4], [0.6, 0.408], [0.88, 0.39], [1, 0.33]]),
        depth: profile([[0, 0.196], [0.5, 0.222], [1, 0.2]]),
        capTop: true,
        capBottom: true,
      }),
    [],
  )
  const lapel = useGeo(() => panelGeometry(0.14, 0.3, 0.02, 0.02, 0.008), [])
  const belt = useGeo(
    () =>
      sweepGeometry({
        height: 0.075,
        width: 0.412,
        depth: 0.226,
        power: 3.2,
        radial: 30,
        steps: 3,
        capTop: false,
        capBottom: false,
      }),
    [],
  )
  const buckle = useGeo(() => new THREE.BoxGeometry(0.075, 0.05, 0.014), [])

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clothProps(color, { roughness: 0.88 })} />
      </mesh>
      <Sleeve color={color} side={-1} position={[-0.335, 0.94, 0]} length={0.6} start={0.168} end={0.11} angle={2.34} />
      <Sleeve color={color} side={1} position={[0.335, 0.94, 0]} length={0.6} start={0.168} end={0.11} angle={2.34} />

      {/* lapels */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={lapel} position={[side * 0.105, 0.86, 0.185]} rotation={[-0.12, side * 0.32, side * 0.18]}>
          <meshPhysicalMaterial {...clothProps(tint(color, 0.05), { roughness: 0.85 })} />
        </mesh>
      ))}

      {/* centre opening */}
      <mesh position={[0, 0.5, 0.216]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.008, 0.72, 0.008]} />
        <meshStandardMaterial color={shade(color, 0.35)} roughness={0.9} />
      </mesh>

      {/* belt */}
      <mesh geometry={belt} position={[0, 0.46, 0]}>
        <meshStandardMaterial {...ribProps(shade(color, 0.82))} />
      </mesh>
      <mesh geometry={buckle} position={[0, 0.46, 0.228]}>
        <meshStandardMaterial color="#b9bec7" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* collar band */}
      <mesh position={[0, 1.055, 0]} rotation={[UP, 0, 0]} scale={[1, 1.12, 1]}>
        <torusGeometry args={[0.148, 0.032, 10, 40]} />
        <meshStandardMaterial {...ribProps(shade(color, 0.75))} />
      </mesh>
      <mesh position={[0, 1.056, 0]} rotation={[-UP, 0, 0]} scale={[1, 1.12, 1]}>
        <circleGeometry args={[0.136, 32]} />
        <meshStandardMaterial color={shade(color, 0.2)} roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------- dispatch ---- */

export function Garment({ model, color }: { model: GarmentModel; color: string }) {
  switch (model) {
    case 'hoodie':
      return <Hoodie color={color} />
    case 'tee':
      return <Tee color={color} />
    case 'bomber':
      return <Bomber color={color} />
    case 'trousers':
      return <Trousers color={color} />
    case 'joggers':
      return <Joggers color={color} />
    case 'cap':
      return <Cap color={color} />
    case 'shirt':
      return <Shirt color={color} />
    case 'puffer':
      return <Puffer color={color} />
    case 'knit':
      return <Knit color={color} />
    case 'coat':
      return <Coat color={color} />
    default:
      return <Tee color={color} />
  }
}

/** Rough visual height per model, used to frame the detail camera. */
export function garmentHeight(model: GarmentModel): number {
  switch (model) {
    case 'coat':
      return 1.16
    case 'cap':
      return 0.6
    case 'bomber':
      return 0.95
    default:
      return 1.02
  }
}
