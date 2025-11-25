import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from '../shaders/auroraVertex.glsl'
import fragmentShader from '../shaders/auroraFragment.glsl'
import { extend } from '@react-three/fiber'

// Define the shader material with "Soul Nebula" Palette
const AuroraMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0.0,
    uResolution: new THREE.Vector2(0, 0),
    // Palette: Deep Indigo Base -> Electric Violet -> Deep Cyan -> Warm Peach
    uColor1: new THREE.Color('#050014'), // Deepest Indigo (Almost Black)
    uColor2: new THREE.Color('#4600b0'), // Deep Violet
    uColor3: new THREE.Color('#0066cc'), // Deep Ocean Blue/Cyan
    uColor4: new THREE.Color('#ffaa88'), // Soft Warm Peach/White Highlight
  },
  vertexShader,
  fragmentShader
)

extend({ AuroraMaterial })

export default function AuroraBackground({ width = 14, height = 8, opacity = 1, ...props }) {
  const materialRef = useRef()
  const currentOpacity = useRef(0)

  useEffect(() => {
    currentOpacity.current = 0
  }, [])

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta
      currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, opacity, delta * 0.8)
      materialRef.current.uOpacity = currentOpacity.current
    }
  })

  return (
    <mesh {...props}>
      {/* Plane must be larger than the glass to accommodate the vignette fade */}
      <planeGeometry args={[width * 1.2, height * 1.2, 64, 64]} /> 
      <auroraMaterial 
        ref={materialRef} 
        transparent 
        blending={THREE.NormalBlending} 
        depthWrite={false}
      />
    </mesh>
  )
}