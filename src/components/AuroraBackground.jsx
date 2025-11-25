import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from '../shaders/auroraVertex.glsl'
import fragmentShader from '../shaders/auroraFragment.glsl'
import { extend } from '@react-three/fiber'

// Define the shader material
const AuroraMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0.0, // Start invisible to prevent flash
    uResolution: new THREE.Vector2(0, 0),
    uColor1: new THREE.Color('#1a0b2e'), // Deep Indigo
    uColor2: new THREE.Color('#7600f5'), // Electric Violet
    uColor3: new THREE.Color('#00eaff'), // Cyan
    uColor4: new THREE.Color('#ff5500'), // Warm Orange
  },
  vertexShader,
  fragmentShader
)

extend({ AuroraMaterial })

export default function AuroraBackground({ width = 10, height = 10, opacity = 1, ...props }) {
  const materialRef = useRef()
  // Current opacity for smooth interpolation
  const currentOpacity = useRef(0)

  useEffect(() => {
    // Reset internal opacity on mount if needed
    currentOpacity.current = 0
  }, [])

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta
      
      // Smoothly lerp opacity
      // Slower lerp (0.5) for very gentle fade-in
      currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, opacity, delta * 0.5)
      materialRef.current.uOpacity = currentOpacity.current
    }
  })

  return (
    <mesh {...props}>
      <planeGeometry args={[width, height, 32, 32]} />
      <auroraMaterial 
        ref={materialRef} 
        transparent 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </mesh>
  )
}