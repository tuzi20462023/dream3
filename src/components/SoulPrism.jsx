import React, { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Environment, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

// --- Sub-Component: Light Rays (God Rays) ---
function LightRays({ active }) {
  const groupRef = useRef()

  // Create 8 rays
  const rays = useMemo(() => {
    return new Array(8).fill(0).map((_, i) => ({
      rotation: [0, (i / 8) * Math.PI * 2, 0],
      scale: [0.2 + Math.random() * 0.5, 1 + Math.random(), 1],
      speed: 0.2 + Math.random() * 0.3
    }))
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate the whole group slowly
      groupRef.current.rotation.y += delta * 0.1

      // Animate individual rays if needed (e.g. pulsing)
      // For now, simple rotation is enough for "majestic" feel
    }
  })

  return (
    <group ref={groupRef}>
      {rays.map((ray, i) => (
        <mesh key={i} rotation={ray.rotation} position={[0, 0, 0]}>
          {/* Long, thin planes radiating out */}
          <planeGeometry args={[1, 8]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            uniforms={{
              uColor: { value: new THREE.Color('#aaddff') },
              uOpacity: { value: active ? 0.6 : 0.0 } // Fade in/out
            }}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform vec3 uColor;
              uniform float uOpacity;
              varying vec2 vUv;
              void main() {
                // Beam shape: fade out at edges and top/bottom
                float beam = smoothstep(0.0, 0.5, vUv.x) * (1.0 - smoothstep(0.5, 1.0, vUv.x));
                float fade = 1.0 - vUv.y; // Fade out as it goes up/out
                
                // Noise/Texture could be added here for "dusty" look
                
                gl_FragColor = vec4(uColor, beam * fade * uOpacity);
              }
            `}
          />
        </mesh>
      ))}
    </group>
  )
}

// --- Sub-Component: Core Flare (Hot Center) ---
function CoreFlare({ active }) {
  return (
    <Billboard follow={true}>
      <mesh scale={active ? 3 : 0}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png')} // Use a standard glow texture or procedural
        />
      </mesh>
    </Billboard>
  )
}

// Procedural Flare Shader (if texture fails or for more control)
const FlareMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uOpacity: { value: 0 }
  },
  vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        varying vec2 vUv;
        uniform float uOpacity;
        void main() {
            vec2 center = vec2(0.5);
            float dist = distance(vUv, center);
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            glow = pow(glow, 3.0); // Sharp falloff
            gl_FragColor = vec4(1.0, 1.0, 1.0, glow * uOpacity);
        }
    `
}


const SoulPrism = forwardRef(({ onClick, active, position, charging }, ref) => {
  const meshRef = useRef()
  const coreRef = useRef()
  const ringRef = useRef()

  // Animation State
  const timer = useRef(0)

  useFrame((state, delta) => {
    // 根据 charging 状态调整速度因子
    const speedMultiplier = charging ? 15.0 : 1.0;

    // Timer logic for sequencing
    if (charging) {
      timer.current += delta
    } else {
      timer.current = 0
    }

    // Sequence Thresholds
    const showBeam = timer.current > 1.0 // Beam/Glow starts after 1.0s
    const showPanel = timer.current > 1.2 // Panel starts after 1.2s

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2 * speedMultiplier
      meshRef.current.rotation.y += delta * 0.3 * speedMultiplier
    }
    if (coreRef.current) {
      const t = state.clock.elapsedTime
      // 蓄力时核心剧烈脉动
      const pulseSpeed = charging ? 20 : 3;
      const baseScale = charging ? 1.2 : 0.8;
      const scale = baseScale + Math.sin(t * pulseSpeed) * 0.1

      coreRef.current.scale.set(scale, scale, scale)
      coreRef.current.rotation.z -= delta * 0.5 * speedMultiplier
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2
      ringRef.current.rotation.z += delta * 0.2 * speedMultiplier
      ringRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2
    }

    // Animate Glow (Atmosphere)
    if (glowRef.current) {
      const targetScale = showBeam ? 1.2 : 0 // Expand to size
      const currentScale = THREE.MathUtils.lerp(glowRef.current.scale.x, targetScale, delta * 2)
      glowRef.current.scale.setScalar(currentScale)

      // Pulse opacity
      const targetOpacity = showBeam ? 1.0 : 0.0
      glowRef.current.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(glowRef.current.material.uniforms.uOpacity.value, targetOpacity, delta * 2)
    }

    // Animate Mist Panel
    if (mistRef.current) {
      // Mist condenses: opacity goes 0 -> 1, noise scale changes
      const targetOpacity = showPanel ? 1.0 : 0.0
      mistRef.current.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(mistRef.current.material.uniforms.uOpacity.value, targetOpacity, delta * 2)
      mistRef.current.material.uniforms.uTime.value += delta
    }
  })

  const glowRef = useRef()
  const mistRef = useRef()

  // Calculate beam active state for child components
  const isBeamActive = charging && timer.current > 1.0

  return (
    <group position={position} ref={ref}>
      {/* 蓄力时环境光增强，营造高光过曝感 */}
      <Environment preset="city" environmentIntensity={charging ? 5.0 : 1.5} />

      <Float speed={charging ? 10 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group
          onClick={onClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
          scale={active ? 0.55 : 0} // Reduced scale from 0.7 to 0.55
        >
          {/* 钻石外壳 - 璀璨效果 */}
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.2, 0]} />
            <MeshTransmissionMaterial
              backside
              backsideThickness={1}
              thickness={0.5}
              roughness={0}
              transmission={1}
              ior={2.4} // 钻石折射率
              chromaticAberration={1.5} // 强火彩
              anisotropy={0.5}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.1}
              color="#eefeff" // 极淡的冰蓝色，保持高亮
              background={new THREE.Color('#000000')}
            />
          </mesh>

          {/* 内核高亮线框 - 确保轮廓 */}
          <mesh ref={coreRef} scale={0.6}>
            <octahedronGeometry args={[0.8, 2]} />
            <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.6} />
          </mesh>

          {/* 核心光球 - 像灵魂的火种 */}
          <mesh scale={0.25}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>

          {/* 外部光环 - 增加神圣感 */}
          <mesh ref={ringRef} scale={1.8}>
            <torusGeometry args={[1, 0.01, 16, 100]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        </group>
      </Float>

      {/* Text moved to BOTTOM with tight gap (y=-0.9) for classic label look */}
      {/* Switched to 3D Text to prevent HTML overlay drifting/scrolling issues */}
      {active && !charging && (
        <group position={[0, -0.9, 0]}>
            <Text
                font="https://cdn.jsdelivr.net/npm/@openfonts/noto-serif-sc_chinese-simplified@1.44.2/files/noto-serif-sc-chinese-simplified-400.woff"
                fontSize={0.18}
                color="white"
                anchorX="center"
                anchorY="top"
                letterSpacing={0.3}
                fillOpacity={0.95}
                // Tone mapping false allows bloom to pick it up as glow
                toneMapped={false} 
                characters="凝结信念"
            >
                凝 • 结
            </Text>
            <Text
                font="https://cdn.jsdelivr.net/npm/@openfonts/noto-serif-sc_chinese-simplified@1.44.2/files/noto-serif-sc-chinese-simplified-400.woff"
                fontSize={0.10}
                position={[0, -0.22, 0]} // Spacing below first line
                color="white"
                anchorX="center"
                anchorY="top"
                letterSpacing={0.1}
                fillOpacity={0.8}
                characters="凝结信念"
            >
                信 • 念
            </Text>
        </group>
      )}

      {/* 1. Premium Volumetric Glow (The "Aura") */}
      {/* High poly sphere for smooth gradient */}
      <mesh ref={glowRef} position={[0, 0, 0]} scale={[0, 0, 0]}>
        <sphereGeometry args={[3.5, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide} // Render inside to look volumetric
          uniforms={{
            uOpacity: { value: 0.0 },
            uColor: { value: new THREE.Color('#88ccff') },
            uCoreColor: { value: new THREE.Color('#ffffff') }
          }}
          vertexShader={`
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `}
          fragmentShader={`
                uniform float uOpacity;
                uniform vec3 uColor;
                uniform vec3 uCoreColor;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Fresnel effect: Bright at edges, but we want volumetric feel
                    // Dot product of view direction (0,0,1 in view space) and normal
                    float viewDot = dot(vNormal, vec3(0, 0, 1.0));
                    
                    // Soft, wide glow
                    float intensity = pow(0.6 - viewDot, 2.5);
                    
                    // Clamp to avoid artifacts
                    intensity = clamp(intensity, 0.0, 1.0);
                    
                    // Gradient color: White center -> Blue edge
                    vec3 finalColor = mix(uColor, uCoreColor, intensity * 0.5);
                    
                    gl_FragColor = vec4(finalColor, intensity * uOpacity);
                }
            `}
        />
      </mesh>

      {/* 2. Light Rays (God Rays) */}
      <LightRays active={isBeamActive} />

      {/* 3. Core Flare (Hot Center) */}
      {/* Only show when glowing to add "punch" */}
      {isBeamActive && (
        <mesh scale={4}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={{ uOpacity: { value: 1.0 } }}
            vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
            fragmentShader={`
                    varying vec2 vUv;
                    uniform float uOpacity;
                    void main() {
                        float d = distance(vUv, vec2(0.5));
                        float glow = 1.0 - smoothstep(0.0, 0.5, d);
                        glow = pow(glow, 2.0);
                        gl_FragColor = vec4(1.0, 1.0, 1.0, glow * uOpacity);
                    }
                `}
          />
        </mesh>
      )}

      {/* 4. Mist Panel (Condensing Light) */}
      <mesh ref={mistRef} position={[0, 3.5, 0]} scale={[1, 1, 1]}>
        <planeGeometry args={[4, 2.5, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uOpacity: { value: 0.0 },
            uColor: { value: new THREE.Color('#bfeeff') }
          }}
          vertexShader={`
                varying vec2 vUv;
                uniform float uTime;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    // Gentle wave
                    pos.z += sin(uv.x * 5.0 + uTime) * 0.1;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `}
          fragmentShader={`
                uniform float uTime;
                uniform float uOpacity;
                uniform vec3 uColor;
                varying vec2 vUv;
                
                // Simple noise function
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }
                
                void main() {
                    // Mist effect
                    float noise = random(vUv + uTime * 0.1);
                    
                    // Gradient from bottom to top (forming)
                    float gradient = smoothstep(0.0, 1.0, vUv.y);
                    
                    // Edges fade out
                    float edges = smoothstep(0.0, 0.2, vUv.x) * (1.0 - smoothstep(0.8, 1.0, vUv.x));
                    edges *= smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));
                    
                    float alpha = (noise * 0.3 + 0.4) * edges * uOpacity;
                    
                    gl_FragColor = vec4(uColor, alpha);
                }
            `}
        />
      </mesh>
    </group>
  )
})

export default SoulPrism