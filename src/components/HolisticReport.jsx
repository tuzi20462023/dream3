import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, MeshTransmissionMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// 3D 全息徽章（核心信念的具象化）
function BeliefCore() {
    const ref = useRef()
    useFrame((state, delta) => {
        if(ref.current) {
            ref.current.rotation.x += delta * 0.2
            ref.current.rotation.y += delta * 0.5
            // 呼吸
            const s = 1 + Math.sin(state.clock.elapsedTime) * 0.05
            ref.current.scale.set(s, s, s)
        }
    })

    return (
        <group ref={ref}>
            {/* 核心几何体 */}
            <mesh>
                <dodecahedronGeometry args={[1.5, 0]} />
                <MeshTransmissionMaterial 
                    backside
                    backsideThickness={2}
                    thickness={0.5}
                    chromaticAberration={1}
                    anisotropy={0.5}
                    ior={1.5}
                    color="#aaddff"
                    distortion={0.5}
                />
            </mesh>
            {/* 围绕的环 */}
            <mesh rotation={[Math.PI/3, 0, 0]}>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="white" transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI/3, 0, 0]}>
                <torusGeometry args={[1.8, 0.02, 16, 100]} />
                <meshBasicMaterial color="white" transparent opacity={0.2} />
            </mesh>
        </group>
    )
}

export default function HolisticReport({ onBack }) {
  return (
    <group position={[100, 100, 40]}> {/* 放在远离画廊的地方 */}
        
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            <BeliefCore />
        </Float>

        {/* 使用 HTML 渲染极简 UI 面板 */}
        <Html transform position={[0, 0, 0]} distanceFactor={15}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '40px',
                    width: '900px',
                    height: '500px',
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'white',
                    pointerEvents: 'none' // 让鼠标穿透去交互 3D
                }}
            >
                {/* 左侧：数据面板 */}
                <div style={{
                    flex: 1,
                    background: 'rgba(10, 10, 20, 0.6)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    pointerEvents: 'auto'
                }}>
                    <div>
                        <h4 style={{ margin: 0, opacity: 0.5, letterSpacing: '0.2em', fontSize: '0.8rem' }}>SOUL ANALYSIS</h4>
                        <h1 style={{ margin: '10px 0 20px 0', fontSize: '2.5rem', fontFamily: 'Cormorant Garamond, serif' }}>The Seeker</h1>
                        <p style={{ lineHeight: 1.6, opacity: 0.8, fontSize: '1rem' }}>
                            Your dream patterns indicate a profound yearning for the unknown. The recurring motif of "Flight" and "Crystal Structures" suggests you are currently restructuring your core belief system.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['#FREEDOM', '#CLARITY', '#ASCENSION'].map(tag => (
                            <span key={tag} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: '100px',
                                fontSize: '0.7rem',
                                letterSpacing: '0.1em'
                            }}>{tag}</span>
                        ))}
                    </div>
                </div>

                {/* 右侧：能量指标 */}
                <div style={{
                    width: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {[
                        { label: "Lucidity", val: "85%" },
                        { label: "Emotional Depth", val: "92%" },
                        { label: "Abstraction", val: "64%" }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '20px',
                            pointerEvents: 'auto'
                        }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.1em', marginBottom: '5px' }}>{item.label.toUpperCase()}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 300 }}>{item.val}</div>
                            {/* 简单的进度条 */}
                            <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '10px' }}>
                                <div style={{ width: item.val, height: '100%', background: 'white' }}></div>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={onBack}
                        style={{
                            marginTop: 'auto',
                            background: 'white',
                            color: 'black',
                            border: 'none',
                            padding: '15px',
                            borderRadius: '100px',
                            fontFamily: 'Montserrat',
                            fontWeight: 600,
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            letterSpacing: '0.1em'
                        }}
                    >
                        RETURN TO FLOW
                    </button>
                </div>

            </motion.div>
        </Html>
    </group>
  )
}
