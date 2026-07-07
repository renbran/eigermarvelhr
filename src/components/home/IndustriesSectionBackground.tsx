import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleCloud({ gold }: { gold: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const count = 180
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 9
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = clock.elapsedTime * 0.03
    pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.015) * 0.08
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={gold ? 'var(--color-gold-200)' : 'var(--color-accent-8)'}
        size={0.055}
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  )
}

function IndustryCanvas({ gold }: { gold: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ParticleCloud gold={gold} />
      </Suspense>
    </Canvas>
  )
}

export default IndustryCanvas
