import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

/**
 * One WebGL context for the whole gallery. Each product tile mounts a drei <View>,
 * which renders its own scene into a scissored region of this fixed, click-through canvas.
 */
export function GalleryCanvas() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.46, 3.05], fov: 32, near: 0.1, far: 40, rotation: [-0.0135, 0, 0] }}
    >
      <View.Port />
    </Canvas>
  )
}
