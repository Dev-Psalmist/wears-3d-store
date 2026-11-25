import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Garment } from './garments'
import type { GarmentModel } from '../lib/types'

interface StudioProps {
  /** Cool rim light tint. */
  cool?: string
  /** Warm rim light tint. */
  warm?: string
  intensity?: number
}

/**
 * Three-point studio rig: a soft cone from above, a cool rim and a warm rim.
 * No shadow maps — the dark backdrop and contact glows do the work instead.
 */
export function Studio({ cool = '#6C8BFF', warm = '#FF7A3C', intensity = 1 }: StudioProps) {
  return (
    <>
      <ambientLight intensity={0.34 * intensity} />
      <hemisphereLight args={['#e6eeff', '#0a0a0c', 0.5 * intensity]} />
      <spotLight
        position={[0.4, 4.4, 2.6]}
        angle={0.58}
        penumbra={1}
        intensity={85 * intensity}
        distance={16}
        decay={2}
        color="#fff5ea"
      />
      <directionalLight position={[-2.6, 2.4, 1.8]} intensity={1.15 * intensity} color="#cbd8ff" />
      <pointLight position={[-2.3, 1.15, -1.5]} intensity={16 * intensity} color={cool} distance={8} decay={2} />
      <pointLight position={[2.4, 0.85, -1.3]} intensity={12 * intensity} color={warm} distance={8} decay={2} />
    </>
  )
}

interface FloatingProductProps {
  model: GarmentModel
  color: string
  hovered?: boolean
  /** Phase offset so the ten tiles never bob in sync. */
  phase?: number
  baseY?: number
}

/** Slow idle float + a small turn toward the viewer on hover. */
export function FloatingProduct({ model, color, hovered = false, phase = 0, baseY = 0.075 }: FloatingProductProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const group = ref.current
    if (!group) return
    const t = state.clock.elapsedTime
    const targetYaw = hovered ? 0.52 : 0.16
    const yaw = targetYaw + Math.sin(t * 0.32 + phase) * 0.16
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yaw, 2.4, delta)
    const bob = Math.sin(t * 0.85 + phase) * 0.011
    const lift = hovered ? 0.035 : 0
    group.position.y = THREE.MathUtils.damp(group.position.y, baseY + bob + lift, 3.2, delta)
  })

  return (
    <group ref={ref} position={[0, baseY, 0]}>
      <Garment model={model} color={color} />
    </group>
  )
}
