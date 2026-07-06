import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireframeSphere() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = clock.elapsedTime * 0.07
    meshRef.current.rotation.y = clock.elapsedTime * 0.11
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.2, 2]} />
      <meshBasicMaterial color="#B8912C" wireframe transparent opacity={0.16} />
    </mesh>
  )
}

function SceneBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <WireframeSphere />
      </Suspense>
    </Canvas>
  )
}

export default SceneBackground
