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

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Noise
    float noiseVal = random(uv + 0.1);
    vNoise = noiseVal;

    // 1. Initial "Loose" State (Base Jitter)
    // Significantly increased to break the "square" shape completely
    float jitterAmp = 0.8; // Doubled jitter to scatter particles beyond card bounds
    pos.x += (random(uv + 0.2) - 0.5) * jitterAmp; 
    pos.y += (random(uv + 0.3) - 0.5) * jitterAmp;
    pos.z += (random(uv + 0.4) - 0.5) * 6.0; // Even deeper Z jitter

    // 2. Explosion Logic
    // Use standard smoothstep for elegant, linear drift
    float localProgress = smoothstep(0.0, 1.0, uProgress);
    
    if (localProgress > 0.0) {
        // Expansion direction: Radial from center + Random bias
        // Use raw position for direction to keep it natural
        vec3 dir = normalize(pos); 
        
        // Add random variation to direction so they don't all travel in straight lines
        dir.x += (noiseVal - 0.5) * 0.5;
        dir.y += (noiseVal - 0.5) * 0.5;
        dir = normalize(dir);

        // Explosion distance
        float dist = localProgress * 20.0; // Wide explosion
        
        // Linear movement without curl
        pos += dir * dist * noiseVal;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // 3. Particle Size
    // Start large, shrink over time
    float baseSize = 5.0; // Smaller base size
    float sizeFade = 1.0 - localProgress * 0.5; // Fade size slower
    gl_PointSize = baseSize * sizeFade * (50.0 / -mvPosition.z);
    
    // 4. Alpha Fade
    // Start fading later, end later (keep visible longer)
    vAlpha = 1.0 - smoothstep(0.5, 1.5, localProgress);
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
    
    // Color grading
    vec3 finalColor = texColor.rgb;
    
    // Add shimmer
    finalColor += vec3(0.3) * vNoise; // Increased shimmer

    // CRITICAL FIX: Boost alpha
    // The source texture might be a transparent glass card.
    // We overwrite the texture alpha to ensure particles are visible.
    // Use the texture's luminance to keep text brighter if needed, but ensure base visibility.
    float baseAlpha = 0.8; 
    
    gl_FragColor = vec4(finalColor, baseAlpha * vAlpha); 
  }
`

const DissolveEffect = ({ transitionData, onComplete }) => {
  const pointsRef = useRef()
  const { camera, size } = useThree()

  // Load the captured texture
  const texture = useMemo(() => {
    if (!transitionData?.texture) {
        // Fallback: Create a 1x1 white pixel texture if capture failed
        const data = new Uint8Array([255, 255, 255, 255]);
        const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
        tex.needsUpdate = true;
        return tex;
    }
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
    const density = 80
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
      const speed = 0.2
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
