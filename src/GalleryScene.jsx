import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, Text, useScroll, Float, Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import DreamParticles from './components/DreamParticles'
import { dreams } from './data/dreams'

function Stardust() {
  const count = 2000
  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100 // Increased spread for larger camera distance
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      scales[i] = Math.random()
    }
    return [positions, scales]
  }, [])

  const ref = useRef()
  useFrame((state, delta) => {
    // Slow rotation of the entire universe
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02
      ref.current.rotation.x += delta * 0.01
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
        <bufferAttribute // Although pointsMaterial uses size, we can use this for shader if we upgrade later
          attach="attributes-scale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1} // Slightly larger stars
        color="white"
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function DreamItem({ dream, position, scale, index, onClick, onHover }) {
  const group = useRef()
  const textGroup = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (group.current) {
      // Subtle float animation
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.5

      // Hover scale effect
      const targetScale = hovered ? 1.2 : 1.0
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    onHover(true)
  }

  const handlePointerOut = (e) => {
    setHovered(false)
    onHover(false)
  }

  return (
    <group position={position}>
      {/* Connecting Line to Timeline (optional, maybe just a subtle vertical line?) */}
      <mesh position={[0, -position[1] - 8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, Math.abs(-position[1] - 8), 4]} />
        <meshBasicMaterial color="white" transparent opacity={0.05} />
      </mesh>

      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation()
          onClick(dream)
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        style={{ cursor: 'pointer' }}
      >
        <DreamParticles
          dreamData={dream}
          isGalleryItem={true}
          active={hovered} // Use hovered state to boost brightness/scale if needed
          scale={scale} // Use random scale
        />
      </group>

      {/* Text Label */}
      <group ref={textGroup} position={[0, -2.5, 0]}>
        <Text
          fontSize={0.6}
          color={hovered ? "#ffffff" : "#888888"}
          anchorX="center"
          anchorY="middle"
          fillOpacity={hovered ? 1 : 0.6}
        >
          {dream.title.toUpperCase()}
        </Text>
        <Text
          fontSize={0.25}
          position={[0, -0.5, 0]}
          color={hovered ? "#aaaaaa" : "#555555"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          fillOpacity={hovered ? 0.9 : 0.4}
        >
          {dream.date}
        </Text>
      </group>
    </group>
  )
}

function Timeline({ totalWidth }) {
  return (
    <mesh position={[totalWidth / 2 - 10, -8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[totalWidth + 50, 0.05]} />
      <meshBasicMaterial color="white" transparent opacity={0.1} />
    </mesh>
  )
}

function GalleryControls({ totalWidth, children }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const [speed, setSpeed] = useState(2.0) // Base speed

  useFrame((state, delta) => {
    if (controlsRef.current) {
      // Auto drift
      // We move both the camera and the target to simulate "moving forward" along the timeline
      const move = speed * delta

      // Only drift if we haven't reached the end
      if (camera.position.x < totalWidth) {
        camera.position.x += move
        controlsRef.current.target.x += move
      }

      controlsRef.current.update()
    }
  })

  return (
    <group>
      <AutoScrollContext.Provider value={setSpeed}>
        {/* We render children here so they can access the context if needed, 
                 but actually GalleryContent is a sibling in the usage below. 
                 We need to restructure slightly or hoist the state. 
                 
                 Actually, let's use a simple context or just prop drilling if possible, 
                 but children are deep. 
                 Let's use a simple global variable or state in parent?
                 For now, let's just make the rig handle the movement and expose a way to change speed.
             */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 4} // Limit vertical rotation to avoid going under floor
          maxPolarAngle={Math.PI / 1.5}
          enablePan={true} // Allow user to slide manually (Right click usually)
          zoomSpeed={0.5}
        />
        {children}
      </AutoScrollContext.Provider>
    </group>
  )
}

// Simple context to control scroll speed
const AutoScrollContext = React.createContext(null)

function GalleryContent({ onSelectDream }) {
  // Generate random positions once
  const layout = useMemo(() => {
    return dreams.map((_, i) => ({
      x: i * 15, // Consistent X gap (Timeline)
      y: (Math.random() - 0.5) * 12, // Random Y spread
      z: (Math.random() - 0.5) * 10, // Random Z depth
      scale: 0.8 + Math.random() * 0.4 // Random scale variation
    }))
  }, [])

  // We need to access the context provided by GalleryControls
  // BUT GalleryControls needs to wrap GalleryContent for this to work.
  // Let's fix the nesting in GalleryScene.

  const setSpeed = React.useContext(AutoScrollContext)

  return (
    <>
      {dreams.map((dream, i) => (
        <DreamItem
          key={dream.id}
          dream={dream}
          position={[layout[i].x, layout[i].y, layout[i].z]}
          scale={layout[i].scale}
          index={i}
          onClick={onSelectDream}
          onHover={(hovering) => setSpeed && setSpeed(hovering ? 0.0 : 2.0)} // Stop/Slow on hover
        />
      ))}
    </>
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

const GalleryScene = ({ onBack }) => {
  const [selectedDream, setSelectedDream] = useState(null)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 45 }} // Camera Z adjusted to 30
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      >
        <color attach="background" args={['#050505']} />

        {/* Post Processing for that "Dreamy" Look */}
        <EffectComposer disableNormalPass>
          <Bloom
            luminanceThreshold={0.2}
            mipmapBlur
            intensity={0.8}
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Background Universe */}
        <Stardust />

        <GalleryControls totalWidth={dreams.length * 20}>
          <Timeline totalWidth={dreams.length * 20} />
          <GalleryContent onSelectDream={setSelectedDream} />
        </GalleryControls>

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#4444ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />

      </Canvas>

      {/* Elegant UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '2.5rem',
        left: '3rem',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}>
        <button
          onClick={onBack}
          className="gallery-back-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: 0.8,
            transition: 'opacity 0.3s'
          }}
          onMouseOver={(e) => e.target.style.opacity = 1}
          onMouseOut={(e) => e.target.style.opacity = 0.8}
        >
          <span>←</span> BACK
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '3rem',
        width: '100%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '0.7rem',
        pointerEvents: 'none',
        letterSpacing: '0.4em',
        textTransform: 'uppercase'
      }}>
        Scroll to Explore Memory
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDream && (
          <DreamModal dream={selectedDream} onClose={() => setSelectedDream(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryScene
