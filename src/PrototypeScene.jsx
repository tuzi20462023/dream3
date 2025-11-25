import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import HolisticReport from './components/HolisticReport'

// A dedicated scene to perfect the "Crystallized Soul Nebula" look
export default function PrototypeScene() {
    const [showReport, setShowReport] = useState(true)

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
            <Canvas gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
                
                {/* 1. Camera Setup */}
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
                <OrbitControls enableZoom={true} enablePan={true} />

                {/* 2. Lighting Environment - CRITICAL for Glass */}
                {/* Glass needs something to reflect. 'city' or 'studio' are good. */}
                {/* We dim it significantly so it doesn't wash out the nebula */}
                <Environment preset="city" environmentIntensity={0.5} />
                
                <ambientLight intensity={0.2} color="#4433aa" />
                <pointLight position={[10, 10, 10]} intensity={1} color="#aaddff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffaaee" />

                {/* 3. The Subject */}
                {showReport && (
                    <group>
                        {/* We put it at (0,0,0) for the prototype, ignoring the 'z-10' logic for now to inspect it close up */}
                        {/* But HolisticReport has internal positioning logic (z=-10). 
                            Let's wrap it to offset that if needed, or just let it be. 
                            Since HolisticReport forces position to [0,0,-10], 
                            we should move camera closer or adjust the component.
                            Actually, let's just let it spawn at -10 and look at it.
                        */}
                        <HolisticReport onBack={() => setShowReport(false)} />
                    </group>
                )}

                {/* 4. Post Processing */}
                <EffectComposer disableNormalPass>
                    {/* Strong Bloom to make the nebula glow through the glass */}
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.0} radius={0.5} />
                </EffectComposer>

            </Canvas>

            {/* Debug UI */}
            <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 1000 }}>
                <h1>Crystal Prototype</h1>
                <button onClick={() => setShowReport(!showReport)}>
                    Toggle Report
                </button>
                <p>Use Mouse to Rotate/Zoom</p>
            </div>
        </div>
    )
}