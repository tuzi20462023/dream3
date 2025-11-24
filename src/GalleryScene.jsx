import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, Text, useScroll, Float, Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import DreamParticles from './components/DreamParticles'
import { dreams as staticDreams } from './data/dreams'
import SoulPrism from './components/SoulPrism'
import HolisticReport from './components/HolisticReport'

function Stardust() {
  const count = 2000
  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      scales[i] = Math.random()
    }
    return [positions, scales]
  }, [])

  const ref = useRef()
  useFrame((state, delta) => {
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
        <bufferAttribute
          attach="attributes-scale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
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
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.5
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
          active={hovered}
          scale={scale}
        />
      </group>

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

function GalleryControls({ totalWidth, children, enabled, autoScroll }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const [speed, setSpeed] = useState(2.0)

  useFrame((state, delta) => {
    if (controlsRef.current) {
      // Only auto-drift if autoScroll is true
      if (autoScroll) {
          const move = speed * delta
          if (camera.position.x < totalWidth) {
            camera.position.x += move
            controlsRef.current.target.x += move
          }
      }
      controlsRef.current.update()
    }
  })

  return (
    <group>
      <AutoScrollContext.Provider value={setSpeed}>
        <OrbitControls
          ref={controlsRef}
          enabled={enabled}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          enablePan={true}
          zoomSpeed={0.5}
          makeDefault
        />
        {children}
      </AutoScrollContext.Provider>
    </group>
  )
}

const AutoScrollContext = React.createContext(null)

function GalleryContent({ dreams, onSelectDream }) {
  const layout = useMemo(() => {
    return dreams.map((_, i) => ({
      x: i * 15,
      y: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 10,
      scale: 0.8 + Math.random() * 0.4
    }))
  }, [dreams.length])

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
          onHover={(hovering) => setSpeed && setSpeed(hovering ? 0.0 : 2.0)}
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

function Rig({ viewMode, setViewMode }) {
    const { camera, controls } = useThree()
    const targetPos = useRef(new THREE.Vector3(0, 0, 30))
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        if (viewMode === 'analysis') {
            setIsTransitioning(true)
            // Camera Position: In front of the report
            targetPos.current.set(100, 100, 55) // Closer Z for better view
            // Look At: The report center
            targetLookAt.current.set(100, 100, 40)
        } else {
            setIsTransitioning(true)
            targetPos.current.set(0, 0, 30)
            targetLookAt.current.set(0, 0, 0)
        }
    }, [viewMode])

    useFrame((state, delta) => {
        if (isTransitioning) {
            // Lerp Position
            state.camera.position.lerp(targetPos.current, delta * 1.5)
            
            // Lerp Controls Target
            if (state.controls) {
                state.controls.target.lerp(targetLookAt.current, delta * 1.5)
                state.controls.update()
            } else {
                state.camera.lookAt(targetLookAt.current)
            }

            if (state.camera.position.distanceTo(targetPos.current) < 0.5) {
                setIsTransitioning(false)
            }
        } else if (viewMode === 'analysis') {
            // Maintain lookAt in analysis mode
             if (state.controls) {
                state.controls.target.copy(targetLookAt.current)
                state.controls.update()
            }
        }
    })

    return null
}

function SoulPrismRig({ viewMode, setViewMode, prismRef, charging, onClick }) {
    const { camera } = useThree()
    const vec = new THREE.Vector3()

    useFrame(() => {
        if (viewMode !== 'timeline') return

        const offset = new THREE.Vector3(5, -3.5, -12)
        offset.applyQuaternion(camera.quaternion)
        
        if (prismRef.current) {
             prismRef.current.position.copy(camera.position).add(offset)
        }
    })

    return (
        <SoulPrism 
            ref={prismRef}
            active={viewMode === 'timeline'} 
            charging={charging}
            onClick={onClick} 
        />
    )
}

function DataStream({ dreams, prismRef, viewMode, charging }) {
    const { camera } = useThree()
    const particles = useRef()
    const count = 120 
    const dummy = useMemo(() => new THREE.Object3D(), [])
    
    const particleState = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            active: false,
            dreamIndex: 0,
            progress: 0,
            speed: 0,
            offset: new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15 + 5,
                (Math.random() - 0.5) * 10
            )
        }))
    }, [])

    const dreamLayout = useMemo(() => {
        return dreams.map((_, i) => ({
             x: i * 15,
             y: 0, 
             z: 0 
        }))
    }, [dreams.length])

    React.useLayoutEffect(() => {
        if (particles.current) {
            dummy.scale.set(0, 0, 0)
            dummy.updateMatrix()
            for (let i = 0; i < count; i++) {
                particles.current.setMatrixAt(i, dummy.matrix)
            }
            particles.current.instanceMatrix.needsUpdate = true
        }
    }, [])

    useFrame((state, delta) => {
        if (viewMode !== 'timeline' || !prismRef.current || !particles.current) return
        
        const prismPos = prismRef.current.position

        particleState.forEach((p, i) => {
            if (!p.active) {
                const spawnChance = charging ? 1.0 : 0.02;
                
                if (Math.random() < spawnChance) {
                    const visibleIndex = Math.floor((camera.position.x + Math.random() * 40 - 20) / 15)
                    const safeIndex = Math.max(0, Math.min(visibleIndex, dreams.length - 1))
                    
                    p.active = true
                    p.dreamIndex = safeIndex
                    p.progress = 0
                    p.speed = charging ? (2.0 + Math.random()) : (0.3 + Math.random() * 0.4)
                }
            } else {
                p.progress += delta * p.speed
                
                if (p.progress >= 1) {
                    p.active = false
                    dummy.scale.set(0,0,0)
                } else {
                    const startX = dreamLayout[p.dreamIndex].x
                    const startY = dreamLayout[p.dreamIndex].y
                    const startZ = dreamLayout[p.dreamIndex].z
                    
                    const t = p.progress
                    const invT = 1 - t
                    
                    const midX = (startX + prismPos.x) / 2
                    const midY = (startY + prismPos.y) / 2
                    const midZ = (startZ + prismPos.z) / 2
                    
                    const offsetFactor = charging ? 0.2 : 1.0;

                    const cpX = midX + p.offset.x * offsetFactor
                    const cpY = midY + p.offset.y * offsetFactor
                    const cpZ = midZ + p.offset.z * offsetFactor
                    
                    const x = (invT * invT * startX) + (2 * invT * t * cpX) + (t * t * prismPos.x)
                    const y = (invT * invT * startY) + (2 * invT * t * cpY) + (t * t * prismPos.y)
                    const z = (invT * invT * startZ) + (2 * invT * t * cpZ) + (t * t * prismPos.z)
                    
                    dummy.position.set(x, y, z)
                    
                    const s = Math.sin(t * Math.PI) * (charging ? 0.1 : 0.06)
                    dummy.scale.set(s, s, s)
                    dummy.lookAt(prismPos)
                }
                
                dummy.updateMatrix()
                particles.current.setMatrixAt(i, dummy.matrix)
            }
        })
        particles.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={particles} args={[null, null, count]}>
             <sphereGeometry args={[1, 4, 4]} />
             <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={charging ? 0.8 : 0.15} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false} 
            />
        </instancedMesh>
    )
}

const GalleryScene = ({ onBack, dreams }) => {
  const [selectedDream, setSelectedDream] = useState(null)
  const [viewMode, setViewMode] = useState('timeline')
  const [charging, setCharging] = useState(false)
  const [flash, setFlash] = useState(false)
  const activeDreams = dreams || staticDreams
  const prismRef = useRef()

  const handlePrismClick = () => {
      if (charging) return // Prevent double click
      setCharging(true)

      // 1. Charge for 1.5 seconds (Spin + Particles rush)
      setTimeout(() => {
          setFlash(true)
          setTimeout(() => {
              setViewMode('analysis')
              setCharging(false)
              setTimeout(() => {
                  setFlash(false)
              }, 500)
          }, 100) 
      }, 1500)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      
      {/* White Flash Overlay */}
      <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'white',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: flash ? 1 : 0,
          transition: 'opacity 0.8s ease-out'
      }} />

      <Canvas
        camera={{ position: [0, 0, 30], fov: 45 }} 
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      >
        <color attach="background" args={['#050505']} />

        <Rig viewMode={viewMode} setViewMode={setViewMode} />
        
        <SoulPrismRig 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            prismRef={prismRef} 
            charging={charging}
            onClick={handlePrismClick}
        />
        
        <DataStream 
            dreams={activeDreams} 
            prismRef={prismRef} 
            viewMode={viewMode} 
            charging={charging} 
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} radius={0.6} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <Stardust />

        <GalleryControls 
            totalWidth={activeDreams.length * 20} 
            enabled={true} 
            autoScroll={viewMode === 'timeline'} 
        />

        <group visible={viewMode === 'timeline'}>
            <Timeline totalWidth={activeDreams.length * 20} />
            <GalleryContent dreams={activeDreams} onSelectDream={setSelectedDream} />
        </group>

        {/* New Holistic Report */}
        <group position={[100, 100, 0]}> 
            {viewMode === 'analysis' && <HolisticReport onBack={() => setViewMode('timeline')} />}
        </group>

        {/* Cinematic Lighting - Simplified */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 10, 5]} intensity={0.5} color="#ccccff" />

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

      <AnimatePresence>
        {selectedDream && (
          <DreamModal dream={selectedDream} onClose={() => setSelectedDream(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryScene