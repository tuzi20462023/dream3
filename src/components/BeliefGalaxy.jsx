import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Billboard, Html } from '@react-three/drei'
import * as THREE from 'three'

// 模拟的信念数据
const BELIEFS = [
  { id: 1, name: "FREEDOM", color: "#44aaff", size: 1.5, position: [0, 0, 0], desc: "Your core driver is a need for unrestricted expression." },
  { id: 2, name: "HARMONY", color: "#ffaaee", size: 1.0, position: [-4, 2, -2], desc: "You seek balance in chaotic environments." },
  { id: 3, name: "MYSTERY", color: "#aa44ff", size: 0.8, position: [3, -2, 1], desc: "The unknown fascinates rather than frightens you." },
]

function BeliefStar({ data, onClick, isSelected }) {
  const mesh = useRef()
  
  useFrame((state) => {
    if (mesh.current) {
        // 恒星表面的波动（通过缩放模拟）
        const s = data.size + Math.sin(state.clock.elapsedTime * 2 + data.id) * 0.05
        mesh.current.scale.set(s, s, s)
    }
  })

  return (
    <group position={data.position}>
      {/* 恒星本体 */}
      <mesh ref={mesh} onClick={(e) => { e.stopPropagation(); onClick(data) }}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={data.color} />
        {/* 外发光辉光 */}
        <mesh scale={1.2}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshBasicMaterial color={data.color} transparent opacity={0.3} side={THREE.BackSide} />
        </mesh>
      </mesh>
      
      {/* 恒星名字 */}
      <Billboard position={[0, data.size + 0.5, 0]}>
        <Text fontSize={0.3} color="white" outlineWidth={0.01} outlineColor="black">
            {data.name}
        </Text>
      </Billboard>

      {/* 选中时的详细信息 */}
      {isSelected && (
        <Html position={[1.5, 0, 0]} center transform distanceFactor={10}>
            <div style={{
                background: 'rgba(20, 20, 30, 0.7)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '250px',
                color: 'white',
                fontFamily: 'Montserrat, sans-serif'
            }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: data.color }}>{data.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.8 }}>{data.desc}</p>
            </div>
        </Html>
      )}
    </group>
  )
}

function ConstellationLines() {
    // 简单的连接线，模拟星座
    return (
        <group>
            <line>
                <bufferGeometry>
                    <float32BufferAttribute attach="attributes-position" count={2} array={new Float32Array([0,0,0, -4,2,-2])} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial color="white" transparent opacity={0.1} />
            </line>
            <line>
                <bufferGeometry>
                    <float32BufferAttribute attach="attributes-position" count={2} array={new Float32Array([0,0,0, 3,-2,1])} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial color="white" transparent opacity={0.1} />
            </line>
        </group>
    )
}

export default function BeliefGalaxy({ visible }) {
  const [selected, setSelected] = useState(null)

  return (
    <group visible={visible}>
      {/* 核心恒星系统 */}
      {BELIEFS.map(b => (
          <BeliefStar 
            key={b.id} 
            data={b} 
            isSelected={selected?.id === b.id}
            onClick={setSelected} 
          />
      ))}
      
      <ConstellationLines />

      {/* 漂浮的文字碎片（原来的梦境变成星尘） */}
      <StardustSystem />
    </group>
  )
}

function StardustSystem() {
    const count = 200
    const mesh = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])
    
    // 随机分布在恒星周围
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            pos: [
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ],
            speed: Math.random() * 0.2
        }))
    }, [])
    
    useFrame((state) => {
        if (!mesh.current) return
        particles.forEach((p, i) => {
            dummy.position.set(
                p.pos[0] + Math.sin(state.clock.elapsedTime * p.speed + i) * 0.5,
                p.pos[1] + Math.cos(state.clock.elapsedTime * p.speed + i) * 0.5,
                p.pos[2]
            )
            dummy.scale.set(0.05, 0.05, 0.05)
            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[1, 4, 4]} />
            <meshBasicMaterial color="white" transparent opacity={0.3} />
        </instancedMesh>
    )
}
