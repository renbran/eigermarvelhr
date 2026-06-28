'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ParticleFieldProps {
  particleCount?: number
  color?: string
  speed?: number
  size?: number
  opacity?: number
}

export function ParticleField({
  particleCount = 80,
  color = '#c9a54a',
  speed = 0.3,
  size = 2.5,
  opacity = 0.4,
}: ParticleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    particles: THREE.Points
    animationId: number
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Only run if not reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Create particles
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities: number[] = []

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15
      velocities.push((Math.random() - 0.5) * speed * 0.01)
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    camera.position.z = 15

    // Animation loop
    let animationId: number
    let time = 0

    function animate() {
      time += 0.005
      const positions = geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        // Gentle floating motion
        positions[i * 3 + 1] += Math.sin(time + i) * 0.001
        positions[i * 3] += Math.cos(time * 0.5 + i * 0.1) * 0.0005
      }

      geometry.attributes.position.needsUpdate = true
      particles.rotation.y += 0.0002
      particles.rotation.x = Math.sin(time * 0.2) * 0.02

      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Resize handler
    function onResize() {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', onResize)

    sceneRef.current = { scene, camera, renderer, particles, animationId }

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      sceneRef.current = null
    }
  }, [particleCount, color, speed, size, opacity])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
