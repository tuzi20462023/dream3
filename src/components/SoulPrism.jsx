import React, { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'

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
    const showBeam = timer.current > 1.5 // Beam starts after 1.5s
    const showPanel = timer.current > 2.0 // Panel starts after 2.0s

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
      const targetScale = showBeam ? 1.5 : 0 // Expand to 1.5x size
      const currentScale = THREE.MathUtils.lerp(glowRef.current.scale.x, targetScale, delta * 2)
      glowRef.current.scale.setScalar(currentScale)
      // Pulse opacity
      glowRef.current.material.uniforms.uOpacity.value = showBeam ? 0.6 : 0.0
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

  return (
    <group position={position} ref={ref}>
      {/* 蓄力时环境光增强，营造高光过曝感 */}
      <Environment preset="city" environmentIntensity={charging ? 5.0 : 1.5} />

      <Float speed={charging ? 10 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group
          onClick={onClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
          scale={active ? 0.7 : 0}
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

      <group position={[0, -2.2, 0]} visible={active && !charging}>
        <Text
          fontSize={0.18}
          color="white"
          letterSpacing={0.2}
          fillOpacity={0.9} // 提高文字亮度
          anchorX="center"
        >
          CRYSTALLIZE
        </Text>
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.12}
          color="white"
          letterSpacing={0.1}
          fillOpacity={0.5}
          anchorX="center"
        >
          BELIEFS
        </Text>
      </group>

      {/* 1. Soft Glow Sphere (The "Aura") */}
      <mesh ref={glowRef} position={[0, 0, 0]} scale={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide} // Render inside to look volumetric
          uniforms={{
            uOpacity: { value: 0.0 },
            uColor: { value: new THREE.Color('#88ccff') }
          }}
          vertexShader={`
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `}
          fragmentShader={`
                uniform float uOpacity;
                uniform vec3 uColor;
                varying vec3 vNormal;
                void main() {
                    // Soft rim glow
                    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(uColor, intensity * uOpacity);
                }
            `}
        />
      </mesh>

      {/* 2. Mist Panel (Condensing Light) */}
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