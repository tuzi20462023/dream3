import React, { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'

const SoulPrism = forwardRef(({ onClick, active, position, charging }, ref) => {
  const meshRef = useRef()
  const coreRef = useRef()
  const ringRef = useRef()
  
  useFrame((state, delta) => {
    // 根据 charging 状态调整速度因子
    const speedMultiplier = charging ? 15.0 : 1.0;
    
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
  })

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
      
      <group position={[0, -2.2, 0]} visible={active}>
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
    </group>
  )
})

export default SoulPrism