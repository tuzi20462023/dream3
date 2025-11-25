import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, MeshTransmissionMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

import HolographicBeliefMap from './HolographicBeliefMap'

export default function HolisticReport({ onBack, prismPosition }) {
    const groupRef = useRef()

    // 初始位置：在棱镜上方一点点
    const startPos = prismPosition ? [prismPosition.x, prismPosition.y + 2, prismPosition.z] : [0, 0, 0]

    useFrame((state, delta) => {
        if (groupRef.current) {
            // 简单的浮动
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
        }
    })

    return (
        <group ref={groupRef} position={startPos}>
            {/* Holographic Map Background */}
            <motion.group
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                position={[0, 2, -3]} // Positioned behind and slightly above center
            >
                <HolographicBeliefMap />
            </motion.group>

            {/* 向上展开的动画容器 */}
            <motion.group
                initial={{ scale: 0, y: -5 }}
                animate={{ scale: 0.8, y: 4 }} // 最终悬浮在棱镜上方 4 单位
                transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
            >
                {/* ... existing Float and Glass Panel ... */}
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>

                    {/* 3D 玻璃基座 (Monolith) */}
                    <mesh>
                        <boxGeometry args={[14, 8, 0.5]} /> {/* 宽14, 高8, 厚0.5 */}
                        <MeshTransmissionMaterial
                            backside
                            backsideThickness={2}
                            thickness={1}
                            chromaticAberration={0.5}
                            anisotropy={0.5}
                            ior={1.5}
                            color="#ffffff"
                            roughness={0.1}
                            distortion={0.2}
                            background={new THREE.Color('#000000')}
                        />
                    </mesh>

                    {/* 边框发光 */}
                    <mesh>
                        <boxGeometry args={[14.1, 8.1, 0.4]} />
                        <meshBasicMaterial color="#aaddff" wireframe={true} transparent opacity={0.1} />
                    </mesh>

                    {/* 嵌入的 HTML 内容 */}
                    {/* transform 属性让 DOM 随 3D 变换 */}
                    <Html transform position={[0, 0, 0.3]} distanceFactor={10} occlude="blending">
                        <div style={{
                            width: '1000px',
                            height: '600px',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '40px',
                            fontFamily: 'Montserrat, sans-serif',
                            color: 'white',
                            padding: '40px',
                            // 不再需要复杂的背景，因为背后有 3D 玻璃
                            // 但加一点点渐变增强可读性
                            background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)',
                            pointerEvents: 'none'
                        }}>
                            {/* 左侧：数据面板 */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                textAlign: 'left'
                            }}>
                                <h4 style={{ margin: 0, opacity: 0.7, letterSpacing: '0.3em', fontSize: '1rem', color: '#aaddff' }}>SOUL ARCHETYPE</h4>
                                <h1 style={{ margin: '10px 0 30px 0', fontSize: '5rem', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1 }}>The Seeker</h1>
                                <p style={{ lineHeight: 1.8, opacity: 0.9, fontSize: '1.2rem', maxWidth: '90%' }}>
                                    Your subconscious is currently restructuring its core belief system. The recurring motif of "Flight" suggests a readiness to detach from old limitations.
                                </p>

                                <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                                    {['#FREEDOM', '#CLARITY', '#ASCENSION'].map(tag => (
                                        <span key={tag} style={{
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            padding: '10px 20px',
                                            borderRadius: '100px',
                                            fontSize: '0.8rem',
                                            letterSpacing: '0.1em'
                                        }}>{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* 右侧：图表 */}
                            <div style={{
                                width: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '30px',
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                paddingLeft: '40px'
                            }}>
                                {[
                                    { label: "Lucidity", val: "85%" },
                                    { label: "Depth", val: "92%" },
                                    { label: "Chaos", val: "30%" }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', opacity: 0.6, fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                                            <span>{item.label.toUpperCase()}</span>
                                            <span>{item.val}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: item.val }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                                                style={{ height: '100%', background: 'white', borderRadius: '2px' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Html>
                </Float>
            </motion.group>

            {/* 连接棱镜的光束 */}
            <motion.mesh
                position={[0, 0, 0]} // 棱镜中心
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.5 }}
                transition={{ duration: 0.5 }}
            >
                <cylinderGeometry args={[0.1, 0.05, 4, 16]} /> {/* 高度4，连接到上方 */}
                <meshBasicMaterial color="#aaddff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
            </motion.mesh>

            {/* 底部关闭按钮 - 放在 3D 空间中比较方便交互 */}
            <group position={[0, -1, 1]}>
                <Html transform>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '12px 30px',
                            borderRadius: '100px',
                            fontFamily: 'Montserrat',
                            fontSize: '0.8rem',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            marginTop: '20px'
                        }}
                    >
                        CLOSE REPORT
                    </button>
                </Html>
            </group>
        </group>
    )
}