import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

import AuroraBackground from './AuroraBackground'

// --- SHADERS ---

// 1. Particle Cloud Shader (The Abstract Soul)
// Uses Point Cloud with Noise movement and Mouse interaction (via uniforms)
const particleVertexShader = `
uniform float uTime;
uniform vec3 uMouse; // Mouse position in 3D space
uniform float uHover; // Hover intensity (0 to 1)

attribute float aSize;
attribute float aSpeed;
attribute vec3 aRandom; // Random vector for individualized noise

varying vec3 vColor;
varying float vAlpha;

// Simplex noise function (simplified)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vec3 pos = position;

  // 1. Organic Noise Movement (Breathing)
  // Each particle moves slightly based on noise and time
  float noiseVal = snoise(pos * 0.5 + uTime * 0.2 * aSpeed);
  pos += normalize(pos) * noiseVal * 0.5;

  // 2. Mouse Interaction / Force Field
  // If mouse is close, push particles away or pull them (Abstract interaction)
  // Distance from mouse to particle (assuming mouse is projected to z=0 plane mostly)
  // Simple "Repel" effect
  float dist = distance(pos.xy, uMouse.xy);
  float force = smoothstep(1.5, 0.0, dist) * uHover; // Radius reduced from 3.0 to 1.5
  pos += normalize(pos - vec3(uMouse.xy, 0.0)) * force * 1.0; // Reduced force strength slightly

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation
  gl_PointSize = aSize * (50.0 / -mvPosition.z); 

  // Color calculation - EXPANDED BLUE RANGE & REDUCED WHITE HIGHLIGHT
  // Palette: Deep Ocean Blue -> Cyan -> Soft Violet
  vec3 color1 = vec3(0.0, 0.4, 1.0); // Deep Blue (Base)
  vec3 color2 = vec3(0.0, 1.0, 0.9); // Bright Cyan (Mid)
  vec3 color3 = vec3(0.8, 0.4, 1.0); // Soft Violet (Highlights) - No pure white
  
  // Noise drives the color transition - expanding the blue/cyan dominance
  float mixVal = smoothstep(-3.0, 3.0, pos.y + noiseVal * 1.5); 
  vColor = mix(color1, color2, mixVal);
  vColor = mix(vColor, color3, force * 0.5); // Interaction adds violet, not white

  // Alpha calculation - REDUCED OPACITY to prevent center glare
  // Base alpha is lower (0.5 max instead of 0.8)
  vAlpha = 0.5 - smoothstep(0.0, 6.0, length(pos)); 
  vAlpha *= (0.5 + 0.5 * aRandom.x); // Variation
}
`

const particleFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  
  // Ultra-soft bokeh edge
  float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
  
  if (alpha < 0.005) discard;

  gl_FragColor = vec4(vColor, alpha);
}
`

// --- COMPONENTS ---

function SoulCloud({ mousePos }) {
    const meshRef = useRef()
    const materialRef = useRef()
    
    // Generate Particles
    const particleCount = 3500 // Reduced for better performance and less lag
    const { positions, sizes, speeds, randoms } = useMemo(() => {
        const positions = []
        const sizes = []
        const speeds = []
        const randoms = []
        
        for (let i = 0; i < particleCount; i++) {
            // Distribution: Hollowed Sphere / Shell to reduce center density
            // r goes from 1.5 to 5.0 (avoiding the 0-1.5 center zone)
            const r = 1.5 + 3.5 * Math.pow(Math.random(), 2); 
            const theta = Math.random() * 2 * Math.PI
            const phi = Math.acos(2 * Math.random() - 1)
            
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)
            
            positions.push(x, y, z)
            sizes.push(Math.random() * 10.0 + 5.0) // Even larger bokeh
            speeds.push(Math.random() * 0.5 + 0.5)
            randoms.push(Math.random(), Math.random(), Math.random())
        }
        
        return {
            positions: new Float32Array(positions),
            sizes: new Float32Array(sizes),
            speeds: new Float32Array(speeds),
            randoms: new Float32Array(randoms)
        }
    }, [])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            // Smoothly interpolate mouse uniform
            materialRef.current.uniforms.uMouse.value.lerp(new THREE.Vector3(mousePos.x * 5, mousePos.y * 5, 0), 0.1)
            materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uHover.value, 1.0, 0.1)
        }
        if (meshRef.current) {
            // Slow global rotation
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }
    })

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3() },
        uHover: { value: 0 }
    }), [])

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
                <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-aRandom" args={[randoms, 3]} />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

function FloatingLabel({ text, position, delay, align = 'left' }) {
    return (
        <Html position={position} center transform distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <motion.div
                initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                animate={{ 
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0 
                }}
                transition={{
                    duration: 2.0,
                    delay: delay, 
                    ease: "easeOut"
                }}
                style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'rgba(255,255,255,0.8)',
                    textAlign: align,
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 10px rgba(255,255,255,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: align === 'right' ? 'flex-end' : 'flex-start'
                }}
            >
                {/* Thin connection line simulation */}
                <div style={{ 
                    width: '40px', 
                    height: '1px', 
                    background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5))',
                    marginBottom: '5px',
                    alignSelf: align === 'right' ? 'flex-end' : 'flex-start'
                }} />
                
                <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{text}</span>
            </motion.div>
        </Html>
    )
}


export default function HolisticReport({ onBack, prismPosition }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [mounted, setMounted] = useState(false)
    const { viewport } = useThree()

    // Track mount state to ensure animations play
    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Track mouse for interaction
    useEffect(() => {
        const handleMove = (e) => {
            // Normalize to -1 to 1
            setMousePos({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            })
        }
        window.addEventListener('mousemove', handleMove)
        return () => window.removeEventListener('mousemove', handleMove)
    }, [])

    return (
        <group position={[0, 0, -5]}>
            
            {/* Background Haze / Fog - Scaled up significantly to envelop the view in blue/violet */}
            <AuroraBackground position={[0, 0, -15]} width={50} height={30} opacity={0.2} />

            {/* 1. Abstract Soul Cloud (The Core) */}
            <SoulCloud mousePos={mousePos} />

                        {/* 2. Decentralized Text Layout (Echoes of Light) */}
                        
                        {/* Title - Drifting top left */}
                        <Html position={[-3, 2, 0]} transform distanceFactor={8} style={{ pointerEvents: 'none' }} zIndexRange={[1000, 0]}>
                            <motion.div
                                key="title-text"
                                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                                animate={mounted ? {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    textShadow: ['0 0 40px rgba(0,0,0,0.8)', '0 0 50px rgba(0,0,0,0.8)'] // Dark pulsing shadow backing
                                } : {}}
                                transition={{
                                    duration: 3, // Slow, majestic entry
                                    delay: 0.5,
                                    ease: "easeOut"
                                }}
                                style={{ textAlign: 'left' }}
                            >
                                <h2 style={{ 
                                    fontFamily: 'Montserrat', 
                                    fontSize: '0.8rem', 
                                    letterSpacing: '0.4em', 
                                    color: 'rgba(255,255,255,0.6)',
                                    margin: 0,
                                    textShadow: '0 0 10px rgba(0,0,0,0.8)' // Strong black shadow for contrast
                                }}>ARCHETYPE</h2>
                                <h1 style={{ 
                                    fontFamily: 'Cormorant Garamond', 
                                    fontSize: '5rem', // Slightly larger
                                    fontWeight: 300, 
                                    fontStyle: 'italic',
                                    color: 'white',
                                    margin: 0,
                                    // Layered shadows: Strong black backdrop + Subtle colored glow
                                    textShadow: '0 0 30px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,1)' 
                                }}>The Seeker</h1>
                            </motion.div>
                        </Html>
            
                        {/* Description - Drifting bottom right */}
                        <Html position={[3, -1.5, 0]} transform distanceFactor={8} style={{ pointerEvents: 'none' }} zIndexRange={[1000, 0]}>
                            <motion.div
                                key="description-text"
                                initial={{ opacity: 0, x: 20 }}
                                animate={mounted ? { opacity: 0.9, x: 0 } : {}}
                                transition={{ duration: 2.5, delay: 1.0, ease: "easeOut" }}
                                style={{ 
                                    width: '350px', 
                                    fontFamily: 'Montserrat', 
                                    fontSize: '0.9rem', 
                                    lineHeight: '1.8',
                                    color: '#e0e0ff', // Slight blue tint for readability
                                    textAlign: 'right',
                                    textShadow: '0 0 20px rgba(0,0,0,0.9)' // Heavy shadow
                                }}
                            >
                                <p>
                                    "Flight" reveals a spirit detaching from the mundane. 
                                    Ascending towards clarity through the abstract fog of the subconscious.
                                </p>
                            </motion.div>
                        </Html>
            
                        {/* Floating Attribute Labels - Orbiting the cloud */}
                        {/* Static positions after entry for readability */}
                        <FloatingLabel text="Lucidity 85%" position={[-3.5, 0.5, 0]} delay={1.5} align="right" />
                        <FloatingLabel text="Chaos 30%" position={[3.5, 1.5, 0]} delay={1.8} align="left" />
                        <FloatingLabel text="Depth 92%" position={[0, -3.0, 0]} delay={2.1} align="center" />
            
                        {/* Close Interaction - Subtle bottom center */}
                        <Html position={[0, -4.0, 0]} center transform zIndexRange={[1000, 0]}>
                            <motion.button
                                key="close-button"
                                initial={{ opacity: 0 }}
                                animate={mounted ? { opacity: 0.7 } : {}}
                                whileHover={{ opacity: 1, scale: 1.1, letterSpacing: '0.4em', textShadow: '0 0 20px white' }}
                                transition={{ duration: 2, delay: 2.5 }}
                                onClick={onBack}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.3em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'Montserrat',
                                    cursor: 'pointer',
                                    padding: '20px',
                                    textShadow: '0 0 10px black'
                                }}
                            >
                                Close Vision
                            </motion.button>
                        </Html>
        </group>
    )
}
