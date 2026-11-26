import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Shelf } from './Shelf'
import { Studio } from './Studio'
import { Wear } from './Wear'
import type { Product } from '../lib/types'

export interface DragState {
  active: boolean
  lastX: number
  lastY: number
  yaw: number
  pitch: number
  velocity: number
}

/** Frames the stage so the shelf + garment always fit, whatever the container aspect. */
function FramedCamera({ width = 2.15, height = 1.62, fov = 30 }: { width?: number; height?: number; fov?: number }) {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = Math.max(0.45, size.width / Math.max(1, size.height))
    const vFov = (fov * Math.PI) / 180
    const dH = height / 2 / Math.tan(vFov / 2)
    const dW = width / 2 / (Math.tan(vFov / 2) * aspect)
    const d = Math.max(dH, dW)
    camera.position.set(0, 0.52, d)
    camera.lookAt(0, 0.47, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, width, height, fov])

  return null
}

function DragGroup({ drag, product }: { drag: React.MutableRefObject<DragState>; product: Product }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const group = ref.current
    if (!group) return
    const d = drag.current
    const step = Math.min(delta, 0.05)

    if (!d.active) {
      d.yaw += step * 0.24 + d.velocity
      d.velocity *= Math.pow(0.06, step)
    }

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, d.yaw, 9, step)
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, d.pitch, 9, step)
    group.position.y = 0.11 + Math.sin(state.clock.elapsedTime * 0.7) * 0.018
  })

  return (
    <group ref={ref} position={[0, 0.11, 0]}>
      <Wear product={product} maxHeight={1.04} maxWidth={1.34} bulge={0.2} />
    </group>
  )
}

interface ProductStageProps {
  product: Product
  className?: string
}

/**
 * The detail stage: a big, slowly auto-rotating garment above an ember-lit glass shelf.
 * Drag anywhere on the stage to tilt and spin it; release to keep the momentum.
 */
export function ProductStage({ product, className }: ProductStageProps) {
  const drag = useRef<DragState>({ active: false, lastX: 0, lastY: 0, yaw: 0.4, pitch: 0, velocity: 0 })
  const [dragging, setDragging] = useState(false)

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current.active = true
    drag.current.lastX = event.clientX
    drag.current.lastY = event.clientY
    drag.current.velocity = 0
    setDragging(true)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active) return
    const dx = event.clientX - d.lastX
    const dy = event.clientY - d.lastY
    d.lastX = event.clientX
    d.lastY = event.clientY
    d.yaw += dx * 0.0075
    d.pitch = THREE.MathUtils.clamp(d.pitch + dy * 0.0042, -0.5, 0.55)
    d.velocity = dx * 0.0018
  }

  const endDrag = () => {
    drag.current.active = false
    setDragging(false)
  }

  return (
    <div
      className={`relative h-full w-full touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'} ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      data-testid="product-stage"
    >
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ position: [0, 0.52, 3.2], fov: 30, near: 0.1, far: 50 }}
        style={{ background: 'transparent' }}
      >
        <FramedCamera />
        <Studio intensity={1.12} cool="#7A6BFF" warm="#FF6B2C" />
        <Shelf color="#FF6B2C" active bloom width={1.8} depth={0.72} />
        <DragGroup drag={drag} product={product} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.52} luminanceSmoothing={0.28} mipmapBlur radius={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
