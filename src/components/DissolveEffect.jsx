import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;
  varying float vNoise;
  varying float vAlpha;
  varying float vLife;

  // Pseudo-random function
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Calculate noise
    float noiseVal = random(uv + 0.1); 
    vNoise = noiseVal;

    // Organic Dissolve & Diffusion
    // No spirals, no tunnels. Just pure, elegant entropy.
    
    float startDelay = noiseVal * 0.3; // More varied start times
    float localProgress = smoothstep(startDelay, 1.0, uProgress);

    if (localProgress > 0.0) {
        float t = localProgress;
        
        // 1. Initial Explosion (The "Pop")
        // Moves outward from center, but not too far initially
        vec3 centerDir = normalize(pos); // Direction from center
        // If pos is (0,0,0) handle it
        if (length(pos) < 0.001) centerDir = vec3(0.0, 0.0, 1.0);

        // 2. Drift (The "Cloud")
        // Particles drift based on their original UVs + Noise
        // This preserves the "shape" slightly while expanding, like smoke
        
        float expansion = t * t * 40.0; // Wide expansion
        
        // Pure radial expansion + random scatter
        pos.x += (uv.x - 0.5) * expansion;
        pos.y += (uv.y - 0.5) * expansion;
        
        // Add organic turbulence
        // Use sin/cos with different frequencies to create "eddies" without global rotation
        float turbulence = t * 10.0;
        pos.x += sin(uv.y * 10.0 + uTime) * turbulence * noiseVal;
        pos.y += cos(uv.x * 10.0 + uTime) * turbulence * noiseVal;
        
        // Z-Axis: Depth without "Tunnel"
        // Particles drift forward/backward randomly to create volume
        pos.z += (noiseVal - 0.5) * expansion * 2.0; 
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    // Start slightly larger, then shrink to dust
    float baseSize = 4.0; 
    float twinkle = 1.0 + sin(uTime * 15.0 + noiseVal * 100.0) * 0.5; 
    
    gl_PointSize = baseSize * twinkle * (1.0 - localProgress * 0.3) * (50.0 / -mvPosition.z);
    
    // Fade alpha
    // Smooth fade out as they drift away
    vAlpha = 1.0 - smoothstep(0.5, 1.5, localProgress);
    vLife = 1.0 - localProgress;
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vNoise;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Soft particle shape
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if(dist > 0.5) discard;
    
    // Soft core
    float core = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Color grading: Keep it natural but ethereal
    vec3 finalColor = texColor.rgb;
    
    // Add subtle shimmer based on noise
    finalColor += vec3(0.2) * vNoise;

    gl_FragColor = vec4(finalColor, texColor.a * vAlpha * 0.8); 
  }
`

const DissolveEffect = ({ transitionData, onComplete }) => {
  const pointsRef = useRef()
  const { camera, size } = useThree()

  // Load the captured texture
  const texture = useMemo(() => {
    if (!transitionData?.texture) return null
    return new THREE.TextureLoader().load(transitionData.texture)
  }, [transitionData])

  // Calculate 3D position and size from 2D DOM rect
  const { position, scale, geometry } = useMemo(() => {
    if (!transitionData) return { position: [0, 0, 0], scale: [1, 1, 1], geometry: null }

    const { x, y, width, height } = transitionData

    // Center point in pixels
    const cx = x + width / 2
    const cy = y + height / 2

    // Normalize (-1 to 1)
    const nx = (cx / size.width) * 2 - 1
    const ny = -(cy / size.height) * 2 + 1

    // Project to 3D plane. 
    const planeZ = 0
    const dist = camera.position.z - planeZ

    // Calculate visible height at plane distance
    const vH = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist
    const vW = vH * (size.width / size.height)

    // World position
    const wx = (nx * vW) / 2
    const wy = (ny * vH) / 2

    // World scale
    const wWidth = (width / size.width) * vW
    const wHeight = (height / size.height) * vH

    // Generate Particle Geometry
    // High density for "Dust" look
    const density = 150
    const count = density * density
    const positions = new Float32Array(count * 3)
    const uvs = new Float32Array(count * 2)

    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const index = (i * density + j)

        const u = j / (density - 1)
        const v = i / (density - 1)

        // Plane from -0.5 to 0.5
        positions[index * 3] = (u - 0.5)
        positions[index * 3 + 1] = (v - 0.5)
        positions[index * 3 + 2] = 0

        uvs[index * 2] = u
        uvs[index * 2 + 1] = v
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    return {
      position: [wx, wy, planeZ],
      scale: [wWidth, wHeight, 1],
      geometry: geo
    }
  }, [transitionData, camera, size])

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }), [texture])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Animate progress
      // Elegant, slow speed
      const speed = 0.5
      pointsRef.current.material.uniforms.uProgress.value += delta * speed
      pointsRef.current.material.uniforms.uTime.value += delta

      if (pointsRef.current.material.uniforms.uProgress.value >= 2.0) {
        if (onComplete) onComplete()
      }
    }
  })

  if (!texture || !geometry) return null

  return (
    <points ref={pointsRef} position={position} scale={scale} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default DissolveEffect
