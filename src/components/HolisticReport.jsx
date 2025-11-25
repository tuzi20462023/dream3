import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

import AuroraBackground from './AuroraBackground'

export default function HolisticReport({ onBack, prismPosition }) {
    const groupRef = useRef()

    // Animation phases
    const [phase, setPhase] = useState(0)
    
    // Position config: Push back to Z=-10 for cinematic view
    const startPos = [0, 0, -10]

    useEffect(() => {
        // Phase Sequence
        const t1 = setTimeout(() => setPhase(1), 100) // Start
        const t2 = setTimeout(() => setPhase(2), 500) // Crystal Form
        const t3 = setTimeout(() => setPhase(3), 1500) // Content Manifest

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
        }
    }, [])

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Very slow, majestic floating
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.03
            groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.02
        }
    })

    return (
        <group ref={groupRef} position={startPos}>

            {/* 1. The Soul Nebula (Fluid Core) - Slightly different tint to match Prismatic theme */}
            <motion.group
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 3.0, ease: "easeInOut" }}
            >
                <AuroraBackground 
                    position={[0, 0, -1]} 
                    width={18} 
                    height={10} 
                    scale={[1, 1, 1]}
                />
            </motion.group>

            {/* 2. The Prismatic Monolith (Glass Container) */}
            <motion.group
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
            >
                <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.2}>

                    {/* The Prismatic Glass Slab */}
                    <mesh>
                        {/* Rounded Box for smoother light refraction */}
                        <boxGeometry args={[14, 8, 0.5]} />
                        <MeshTransmissionMaterial
                            backside
                            backsideThickness={2.0}
                            thickness={0.5}
                            chromaticAberration={2.0} // MAX PRISM
                            anisotropy={1.0}
                            ior={1.8}
                            color="#eefeff" // White/Ice base
                            roughness={0.0} // Perfectly smooth like liquid
                            distortion={0.8} // Liquid distortion
                            distortionScale={0.5}
                            temporalDistortion={0.2} // Moving water effect
                            background={new THREE.Color('#050014')}
                            transmission={phase >= 2 ? 1 : 0} 
                            opacity={phase >= 2 ? 1 : 0}
                            transparent
                        />
                    </mesh>

                    {/* 3. Floating Holographic Data (The Prismatic Interface) */}
                    <Html transform position={[0, 0, 0.26]} distanceFactor={10} occlude="blending">
                        <div style={{
                            width: '1100px',
                            height: '650px',
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'Montserrat, sans-serif',
                            color: 'white',
                            padding: '50px',
                            pointerEvents: 'none',
                            opacity: phase >= 3 ? 1 : 0,
                            transition: 'opacity 1s ease',
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.02) 0%, transparent 70%)', // Subtle glow center
                        }}>
                            
                            {/* Header: Tech/Prism Style */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(0, 255, 255, 0.3)', // Cyan tint border
                                paddingBottom: '20px',
                                marginBottom: '40px',
                                boxShadow: '0 10px 20px -10px rgba(0, 255, 255, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {/* Rotating Prism Icon */}
                                    <div style={{ 
                                        width: '12px', 
                                        height: '12px', 
                                        background: 'cyan', 
                                        transform: 'rotate(45deg)', 
                                        boxShadow: '0 0 15px cyan' 
                                    }} />
                                    <h2 style={{ 
                                        margin: 0, 
                                        fontSize: '1.2rem', 
                                        letterSpacing: '0.4em', 
                                        fontWeight: 600, 
                                        textTransform: 'uppercase',
                                        background: 'linear-gradient(90deg, #fff, #00ffff)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                                    }}>
                                        Soul Archetype
                                    </h2>
                                </div>
                                
                                {/* Status Indicator instead of ID */}
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '10px', 
                                    alignItems: 'center',
                                    fontSize: '0.8rem',
                                    color: 'rgba(0, 255, 255, 0.7)',
                                    letterSpacing: '0.2em'
                                }}>
                                    <span>ANALYSIS COMPLETE</span>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0f0', boxShadow: '0 0 10px #0f0' }} />
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ display: 'flex', flex: 1, gap: '80px' }}>
                                
                                {/* Left: Content - Holographic Text */}
                                <div style={{ flex: 1.2 }}> 
                                    <h1 style={{
                                            fontSize: '5.5rem',
                                            margin: '0 0 20px 0',
                                            fontWeight: 800, // Bolder
                                            letterSpacing: '-0.02em',
                                            // Prismatic Gradient Text
                                            background: 'linear-gradient(135deg, #ffffff 0%, #00ffff 50%, #ff00ff 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.4))'
                                        }}
                                    >
                                        The Seeker
                                    </h1>

                                    <p style={{
                                            fontSize: '1.3rem',
                                            lineHeight: 1.7,
                                            maxWidth: '95%',
                                            color: 'rgba(230, 240, 255, 0.9)',
                                            fontWeight: 300,
                                            textShadow: '0 0 10px rgba(0, 100, 255, 0.3)'
                                        }}
                                    >
                                        Your subconscious structure indicates a profound readiness for transformation. The recurring motif of <span style={{color:'#00ffff', fontWeight:500}}>"Flight"</span> suggests you are detaching from old limitations to embrace the unknown.
                                    </p>

                                    <div style={{ marginTop: '60px', display: 'flex', gap: '20px' }}>
                                        {['#FREEDOM', '#CLARITY', '#ASCENSION'].map((tag, i) => (
                                            <span
                                                key={tag}
                                                style={{
                                                    border: '1px solid rgba(0, 255, 255, 0.3)',
                                                    padding: '10px 24px',
                                                    borderRadius: '4px', // Tech corners
                                                    fontSize: '0.75rem',
                                                    letterSpacing: '0.2em',
                                                    color: '#00ffff',
                                                    background: 'rgba(0, 255, 255, 0.05)',
                                                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Data Viz - Floating Energy Rings */}
                                <div style={{ 
                                    width: '300px', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center',
                                    gap: '40px' 
                                }}>
                                    {[
                                        { label: "LUCIDITY", val: 85, color: '#00ffff' }, // Cyan
                                        { label: "DEPTH", val: 92, color: '#ff00ff' },    // Magenta
                                        { label: "CHAOS", val: 30, color: '#ffff00' }     // Yellow
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            {/* Ring Container */}
                                            <div style={{ 
                                                width: '70px', 
                                                height: '70px', 
                                                position: 'relative',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center' 
                                            }}>
                                                {/* Outer Glow Ring */}
                                                <div style={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    border: `2px solid ${item.color}`,
                                                    opacity: 0.3,
                                                    boxShadow: `0 0 20px ${item.color}`
                                                }} />
                                                
                                                {/* Inner Value Ring (Simulated) */}
                                                <div style={{
                                                    position: 'absolute',
                                                    width: `${item.val}%`,
                                                    height: `${item.val}%`,
                                                    borderRadius: '50%',
                                                    border: `2px solid ${item.color}`,
                                                    opacity: 0.8,
                                                    boxShadow: `inset 0 0 10px ${item.color}`
                                                }} />

                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{item.val}%</span>
                                            </div>

                                            {/* Label */}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ 
                                                    fontSize: '0.9rem', 
                                                    letterSpacing: '0.2em', 
                                                    color: item.color,
                                                    fontWeight: 600,
                                                    textShadow: `0 0 10px ${item.color}`
                                                }}>
                                                    {item.label}
                                                </span>
                                                <div style={{ 
                                                    width: '100px', 
                                                    height: '2px', 
                                                    background: `linear-gradient(90deg, ${item.color}, transparent)`,
                                                    marginTop: '5px',
                                                    opacity: 0.5
                                                }} />
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
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '15px 50px',
                            fontFamily: 'Montserrat',
                            fontSize: '0.9rem',
                            letterSpacing: '0.3em',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(5px)',
                            borderRadius: '30px',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
                        }}
                        onMouseEnter={e => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.borderColor = '#00ffff'
                            e.target.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.5)'
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'rgba(0,0,0,0.5)'
                            e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                            e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.2)'
                        }}
                    >
                        Close Interface
                    </button>
                </Html>
            </group>
        </group>
    )
}