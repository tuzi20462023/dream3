// ... (Keep existing imports)
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import { dreams as staticDreams } from './data/dreams'
import SoulPrism from './components/SoulPrism'
import HolisticReport from './components/HolisticReport'
import Carousel from './components/Carousel'

// Fixed Background Stardust
function Stardust() {
  const count = 3000
  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Sphere distribution
      const r = 40 + Math.random() * 60 // Distant shell
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      scales[i] = Math.random()
    }
    return [positions, scales]
  }, [])

  const ref = useRef()
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.01 // Slow rotation
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#88ccff"
        sizeAttenuation
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const DreamModal = ({ dream, onClose }) => {
  if (!dream) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'auto'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          color: 'white',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        <h2 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '2rem',
          marginBottom: '10px',
          letterSpacing: '0.1em'
        }}>
          {dream.title}
        </h2>
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '30px',
          fontSize: '0.9rem',
          letterSpacing: '0.05em'
        }}>
          {dream.date}
        </div>
        <p style={{
          lineHeight: '1.8',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.1rem',
          marginBottom: '40px'
        }}>
          {dream.description || "No description available for this dream."}
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {dream.keywords && dream.keywords.map((kw, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '5px 15px',
              borderRadius: '15px',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              #{kw}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// HUD Component - Brute Force Approach (Most Stable)
function SoulPrismHUD({ viewMode, setViewMode, prismRef, charging, onClick }) {
  const { camera } = useThree()
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    if (viewMode === 'analysis') {
      setShowReport(true)
    } else {
      setShowReport(false)
    }
  }, [viewMode])

  // Force prism to stay in front of camera every frame
  useFrame(() => {
    if (prismRef.current && viewMode === 'timeline') {
      // Calculate position in world space relative to camera
      const offset = new THREE.Vector3(6.15, -2.4, -8) // Right-bottom corner
      offset.applyQuaternion(camera.quaternion)
      prismRef.current.position.copy(camera.position).add(offset)

      // Make prism face the camera
      prismRef.current.lookAt(camera.position)
    }
  })

  return (
    <group ref={prismRef}>
      <SoulPrism
        active={viewMode === 'timeline'}
        charging={charging}
        onClick={onClick}
      />

      {/* The Report spawns from the Prism */}
      <AnimatePresence>
        {showReport && (
          <HolisticReport onBack={() => setViewMode('timeline')} />
        )}
      </AnimatePresence>
    </group>
  )
}

// ... (Keep existing imports)
import { useDrag } from '@use-gesture/react'

// ... (Keep Stardust, DreamModal, SoulPrismHUD)

function WorldGroup({ children }) {
  const group = useRef()

  // Physics state
  const targetRotation = useRef([0, 0])
  const currentRotation = useRef([0, 0])

  const bind = useDrag(({ delta: [dx, dy], active, dragging }) => {
    // Sensitivity
    const speed = 0.005

    // Update target
    // Drag Y -> Rotate X (Pitch)
    // Drag X -> Rotate Y (Yaw)
    targetRotation.current[0] += dy * speed
    targetRotation.current[1] += dx * speed

    // Clamp Pitch (X): -30 deg to +60 deg
    // -30 deg = -0.52 rad
    // +60 deg = 1.05 rad
    targetRotation.current[0] = Math.max(-0.52, Math.min(1.05, targetRotation.current[0]))

    // Clamp Yaw (Y): -45 deg to +45 deg
    // -45 deg = -0.78 rad
    // +45 deg = 0.78 rad
    targetRotation.current[1] = Math.max(-0.78, Math.min(0.78, targetRotation.current[1]))
  })

  useFrame((state, delta) => {
    // Damping / Lerp
    // Smoothly interpolate current rotation to target
    const damp = 5 * delta
    currentRotation.current[0] = THREE.MathUtils.lerp(currentRotation.current[0], targetRotation.current[0], damp)
    currentRotation.current[1] = THREE.MathUtils.lerp(currentRotation.current[1], targetRotation.current[1], damp)

    if (group.current) {
      group.current.rotation.x = currentRotation.current[0]
      group.current.rotation.y = currentRotation.current[1]
    }
  })

  return (
    <group ref={group} {...bind()}>
      {/* Invisible Hit Plane for Dragging */}
      {/* Must be large enough to cover the screen and facing the camera */}
      <mesh visible={false} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
      </mesh>
      {children}
    </group>
  )
}

const GalleryScene = ({ onBack, dreams }) => {
  const [selectedDream, setSelectedDream] = useState(null)
  const [viewMode, setViewMode] = useState('timeline')
  const [charging, setCharging] = useState(false)
  const activeDreams = dreams || staticDreams
  const prismRef = useRef()

  const handlePrismClick = () => {
    if (charging) return
    setCharging(true)

    // Charge and transition
    setTimeout(() => {
      setViewMode('analysis')
      setCharging(false)
    }, 1000)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>

      {/* Darken Overlay for Analysis Mode */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)',
        pointerEvents: 'none',
        opacity: viewMode === 'analysis' ? 1 : 0,
        transition: 'opacity 1s ease',
        zIndex: 5
      }} />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      >
        <color attach="background" args={['#050505']} />

        <SoulPrismHUD
          viewMode={viewMode}
          setViewMode={setViewMode}
          prismRef={prismRef}
          charging={charging}
          onClick={handlePrismClick}
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} radius={0.6} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={viewMode === 'analysis' ? 10 : 2} height={480} />
        </EffectComposer>

        {/* Carousel Logic with Volumetric Inspection */}
        {viewMode === 'timeline' && (
          <ScrollControls
            horizontal
            damping={0.2}
            pages={Math.max(2, activeDreams.length / 2)}
            distance={1}
            infinite={false}
          >
            <WorldGroup>
              <Stardust />
              <Carousel dreams={activeDreams} onSelectDream={setSelectedDream} />
            </WorldGroup>
          </ScrollControls>
        )}

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 10, 5]} intensity={0.5} color="#ccccff" />
        <pointLight position={[0, 0, 0]} intensity={1} color="#ffffff" distance={20} />

      </Canvas>

      {viewMode === 'timeline' && (
        <div style={{ position: 'absolute', top: '2.5rem', left: '3rem', zIndex: 1000 }}>
          <button
            onClick={onBack}
            className="gallery-back-btn"
            style={{
              background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase', letterSpacing: '0.2em',
              fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8
            }}
          >
            <span>←</span> BACK
          </button>
        </div>
      )}

      {/* Footer Hint */}
      {viewMode === 'timeline' && (
        <div style={{
          position: 'absolute', bottom: '3rem', width: '100%', textAlign: 'center',
          color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem',
          pointerEvents: 'none', letterSpacing: '0.4em', textTransform: 'uppercase'
        }}>
          Drag to Rotate • Scroll to Explore
        </div>
      )}

      <AnimatePresence>
        {selectedDream && (
          <DreamModal dream={selectedDream} onClose={() => setSelectedDream(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryScene
