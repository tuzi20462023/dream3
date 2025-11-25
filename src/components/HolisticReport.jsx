import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, MeshTransmissionMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

import AuroraBackground from './AuroraBackground'

export default function HolisticReport({ onBack, prismPosition }) {
    const groupRef = useRef()

    // Animation phases
    const [phase, setPhase] = useState(0)
    
    // Position config
    // 强制推远，不要贴脸。Z=-10 是一个比较舒服的展示距离
    const startPos = [0, 0, -10]

    useEffect(() => {
        // Phase 0: Initial (Invisible)
        // Phase 1: Frame Scan (0.5s)
        // Phase 2: Glass Material Fade In (1.0s)
        // Phase 3: Content Typewriter (1.5s+)

        const t1 = setTimeout(() => setPhase(1), 100)
        const t2 = setTimeout(() => setPhase(2), 600)
        const t3 = setTimeout(() => setPhase(3), 1200)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
        }
    }, [])

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Gentle floating
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
            groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.01
        }
    })

    return (
        <group ref={groupRef} position={startPos}>

            {/* 1. Aurora Fluid Core (The Soul Energy) */}
            {/* Placed slightly behind the glass */}
            <motion.group
                initial={{ scale: 0.8, opacity: 0 }} // Start slightly smaller and invisible
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }} // Slower, smoother fade in
            >
                <AuroraBackground 
                    position={[0, 0, -0.5]} // Push further back behind glass
                    width={16} // Slightly larger to cover edges
                    height={9} 
                    scale={[1, 1, 1]}
                />
            </motion.group>

            {/* 2. Main Glass Frame (The Crystal Container) */}
            <motion.group
                initial={{ scale: 0.6, opacity: 0 }} // Start smaller
                animate={{ scale: 0.8, opacity: 1 }} // End at 0.8 scale (not too huge)
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            >
                <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>

                    {/* The Glass Slab */}
                    <mesh>
                        <boxGeometry args={[14, 8, 0.5]} /> {/* Thicker glass for more refraction */}
                        <MeshTransmissionMaterial
                            backside
                            backsideThickness={1}
                            thickness={0.5}
                            chromaticAberration={0.5} // High aberration for "prism" feel
                            anisotropy={0.5}
                            ior={1.8} // High refractive index (Crystal-like)
                            color="#eefeff"
                            roughness={0.2} // Increased roughness for softer light
                            distortion={0.4} // Distort the fluid behind it
                            distortionScale={0.5}
                            temporalDistortion={0.1}
                            background={new THREE.Color('#000000')}
                            transmission={phase >= 2 ? 1 : 0} 
                            opacity={phase >= 2 ? 1 : 0}
                            transparent
                        />
                    </mesh>

                    {/* Glowing Border / Frame */}
                    <mesh>
                        <boxGeometry args={[14.05, 8.05, 0.45]} />
                        <meshBasicMaterial
                            color="#aaddff"
                            wireframe={true}
                            transparent
                            opacity={phase >= 1 ? 0.3 : 0}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>

                    {/* HTML Overlay Content */}
                    <Html transform position={[0, 0, 0.3]} distanceFactor={10} occlude="blending">
                        <div style={{
                            width: '1000px',
                            height: '600px',
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'Montserrat, sans-serif',
                            color: 'white',
                            padding: '40px',
                            pointerEvents: 'none',
                            opacity: phase >= 3 ? 1 : 0,
                            transition: 'opacity 1s ease',
                            // Add a subtle gradient behind text to ensure readability against bright fluid
                            background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, transparent 80%)'
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.2)',
                                paddingBottom: '20px',
                                marginBottom: '40px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '10px', height: '10px', background: '#aaddff', borderRadius: '50%', boxShadow: '0 0 10px #aaddff' }} />
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '0.2em', fontWeight: 400 }}>SOUL ARCHETYPE ANALYSIS</h2>
                                </div>
                                <div style={{ fontFamily: 'monospace', opacity: 0.6 }}>
                                    ID: 8492-ALPHA // SYNC: 98%
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ display: 'flex', flex: 1, gap: '60px' }}>
                                {/* Left: Text Content */}
                                <div style={{ flex: 1 }}>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={phase >= 3 ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.8 }}
                                        style={{
                                            fontSize: '4.5rem',
                                            fontFamily: 'Cormorant Garamond, serif',
                                            margin: '0 0 20px 0',
                                            textShadow: '0 0 20px rgba(170, 221, 255, 0.5)'
                                        }}
                                    >
                                        The Seeker
                                    </motion.h1>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={phase >= 3 ? { opacity: 0.8 } : {}}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        style={{
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8,
                                            maxWidth: '90%'
                                        }}
                                    >
                                        Your subconscious structure indicates a profound readiness for transformation. The recurring motif of "Flight" suggests you are detaching from old limitations and seeking a higher vantage point.
                                    </motion.p>

                                    <div style={{ marginTop: '50px', display: 'flex', gap: '15px' }}>
                                        {['#FREEDOM', '#CLARITY', '#ASCENSION'].map((tag, i) => (
                                            <motion.span
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={phase >= 3 ? { opacity: 1, scale: 1 } : {}}
                                                transition={{ delay: 1.0 + i * 0.2 }}
                                                style={{
                                                    border: '1px solid rgba(170, 221, 255, 0.3)',
                                                    background: 'rgba(170, 221, 255, 0.05)',
                                                    padding: '8px 20px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.1em',
                                                    color: '#aaddff'
                                                }}
                                            >
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Data Viz */}
                                <div style={{ width: '300px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {[
                                        { label: "LUCIDITY", val: 85 },
                                        { label: "DEPTH", val: 92 },
                                        { label: "CHAOS", val: 30 }
                                    ].map((item, i) => (
                                        <div key={i} style={{ marginBottom: '30px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', letterSpacing: '0.1em', opacity: 0.7 }}>
                                                <span>{item.label}</span>
                                                <span>{item.val}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={phase >= 3 ? { width: `${item.val}%` } : {}}
                                                    transition={{ duration: 1.5, delay: 0.8 + i * 0.2, ease: "easeOut" }}
                                                    style={{ height: '100%', background: '#aaddff', boxShadow: '0 0 10px #aaddff' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Html>
                </Float>
            </motion.group>

            {/* Close Button (Floating below) */}
            <group position={[0, -5, 0]}>
                <Html transform>
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 2.0 }}
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            padding: '15px 40px',
                            fontFamily: 'Montserrat',
                            fontSize: '0.9rem',
                            letterSpacing: '0.2em',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => {
                            e.target.style.background = 'rgba(255,255,255,0.1)'
                            e.target.style.borderColor = 'white'
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'transparent'
                            e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                        }}
                    >
                        Close Analysis
                    </motion.button>
                </Html>
            </group>
        </group>
    )
}