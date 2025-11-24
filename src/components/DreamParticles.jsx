import { useMemo, useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useControls, button } from 'leva'
import vertexShader from '../shaders/particleVertex.glsl'
import fragmentShader from '../shaders/particleFragment.glsl'

// Create the custom shader material
const ParticleMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uDisplacementStrength: 0.0,
        uSize: 0.1,
        uThreshold: 0.0,
        uRandomness: 0.0,
        uEdgeSoftness: 0.0,
        uOpacity: 0.0, // Start invisible
        uBrightness: 1.0,
        uTime: 0.0,
        uDispersion: 2.0, // Start dispersed
        uCurlStrength: 0.5,
        uJitter: 0.1,
        uMouse: new THREE.Vector2(0, 0),
        uMouseRadius: 2.0,
        uMouseStrength: 2.0,
        uMouseDisp: 2.0,
        uDispersionZone: 0.3,
    },
    vertexShader,
    fragmentShader
)

// Extend so we can use it in JSX
import { extend } from '@react-three/fiber'
extend({ ParticleMaterial })

const DreamParticles = ({ appState, dreamData, isGalleryItem = false }) => {
    // Default placeholder texture
    const defaultUrl = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80'
    // Use texture from dreamData if available, otherwise default
    const textureUrl = dreamData?.imageUrl || defaultUrl

    // Load texture
    const texture = useTexture(textureUrl)

    // Update texture when url changes
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uTexture = texture
        }
    }, [texture])

    // Default values
    const defaults = {
        size: 0.33,
        density: 400,
        displacementStrength: 3.4,
        threshold: 0.10,
        randomness: 0.00,
        edgeSoftness: 0.11,
        opacity: 0.87,
        brightness: 1.95,
        dispersion: 0.80,
        curlStrength: 0.14,
        jitter: 0.07,
        mouseRadius: 1.70,
        mouseStrength: 0.1,
        mouseDisp: 0.8,
        dispersionZone: 0.23
    }

    const [controls, set] = useControls('Particles', () => ({
        size: { value: defaults.size, min: 0.01, max: 2.0, step: 0.01 },
        density: { value: defaults.density, min: 32, max: 1024, step: 16, label: 'Density (Sqrt)' },
        displacementStrength: { value: defaults.displacementStrength, min: 0.0, max: 10.0 },
        threshold: { value: defaults.threshold, min: 0.0, max: 1.0 },
        randomness: { value: defaults.randomness, min: 0.0, max: 5.0, label: 'Scatter' },
        edgeSoftness: { value: defaults.edgeSoftness, min: 0.0, max: 1.0, label: 'Vignette' },
        opacity: { value: defaults.opacity, min: 0.0, max: 1.0, label: 'Opacity' },
        brightness: { value: defaults.brightness, min: 0.0, max: 5.0, label: 'Brightness' },
        dispersion: { value: defaults.dispersion, min: 0.0, max: 5.0, label: 'Dispersion' },
        curlStrength: { value: defaults.curlStrength, min: 0.0, max: 2.0, label: 'Flow' },
        jitter: { value: defaults.jitter, min: 0.0, max: 1.0, label: 'Jitter' },
        mouseRadius: { value: defaults.mouseRadius, min: 0.0, max: 5.0, label: 'Mouse Radius' },
        mouseStrength: { value: defaults.mouseStrength, min: 0.0, max: 10.0, label: 'Mouse Force' },
        mouseDisp: { value: defaults.mouseDisp, min: -5.0, max: 5.0, label: 'Mouse Bulge' },
        dispersionZone: { value: defaults.dispersionZone, min: 0.0, max: 1.0, label: 'Clear Zone' },
        'Reset Defaults': button(() => set(defaults))
    }))

    // Use refs for animation values to avoid re-renders
    const targetOpacity = useRef(0)
    const targetDispersion = useRef(2.0)

    // Update targets based on appState
    useEffect(() => {
        let timeoutId;

        if (appState === 'immersed') {
            // Start by hiding or keeping background subtle to let the explosion shine
            // Setting to 0.0 makes it fade out first, then fade in (dramatic effect)
            targetOpacity.current = 0.0;

            // Force immediate blackout of previous background for clean stage
            if (materialRef.current) {
                materialRef.current.uOpacity = 0.0;
            }

            // Wait for the card explosion to expand before revealing the nebula
            timeoutId = setTimeout(() => {
                targetOpacity.current = controls.opacity;
                targetDispersion.current = controls.dispersion;
            }, 600); // 0.6s delay - almost immediate overlap

        } else if (isGalleryItem) {
            targetOpacity.current = controls.opacity;
            targetDispersion.current = controls.dispersion;
        } else {
            // In input/preview mode, keep particles subtle in background
            targetOpacity.current = 0.6;
            targetDispersion.current = 0.8; // Use default dispersion for HD look
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [appState, controls.opacity, controls.dispersion, isGalleryItem])

    // Determine effective density
    // If gallery item, use lower density for performance (e.g. 128x128 = 16k particles)
    // Otherwise use the Leva control value (default 400x400 = 160k particles)
    const effectiveDensity = isGalleryItem ? 128 : controls.density

    // Generate particles
    const particles = useMemo(() => {
        const count = effectiveDensity * effectiveDensity
        const positions = new Float32Array(count * 3)
        const uvs = new Float32Array(count * 2)
        const randoms = new Float32Array(count * 3)

        for (let i = 0; i < effectiveDensity; i++) {
            for (let j = 0; j < effectiveDensity; j++) {
                const index = (i * effectiveDensity + j)

                // Normalized coordinates (0 to 1)
                const u = j / (effectiveDensity - 1)
                const v = i / (effectiveDensity - 1)

                // Center the plane
                const x = (u - 0.5) * 10 // Width 10
                const y = (v - 0.5) * 10 // Height 10
                const z = 0

                positions[index * 3] = x
                positions[index * 3 + 1] = y
                positions[index * 3 + 2] = z

                uvs[index * 2] = u
                uvs[index * 2 + 1] = v

                // Random offsets for scatter effect
                randoms[index * 3] = (Math.random() - 0.5) // x
                randoms[index * 3 + 1] = (Math.random() - 0.5) // y
                randoms[index * 3 + 2] = (Math.random() - 0.5) // z
            }
        }

        return { positions, uvs, randoms }
    }, [effectiveDensity])

    const materialRef = useRef()
    const mouse = useRef(new THREE.Vector2(0, 0))
    const { viewport } = useThree()

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime

            // Smooth mouse movement
            const targetX = (state.mouse.x * viewport.width) / 2
            const targetY = (state.mouse.y * viewport.height) / 2
            mouse.current.x += (targetX - mouse.current.x) * 0.1
            mouse.current.y += (targetY - mouse.current.y) * 0.1
            materialRef.current.uMouse.set(mouse.current.x, mouse.current.y)

            // ANIMATION TRANSITIONS
            // Lerp current values towards targets

            // Dynamic speed: Slow fade-in for immersed state, fast for others
            let lerpSpeed = 2.0 * delta;
            if (appState === 'immersed' && materialRef.current.uOpacity < targetOpacity.current) {
                lerpSpeed = 0.3 * delta; // Very slow fade-in (approx 3-4 seconds to full)
            }

            // Opacity
            materialRef.current.uOpacity = THREE.MathUtils.lerp(
                materialRef.current.uOpacity,
                targetOpacity.current,
                lerpSpeed
            )

            // Dispersion
            materialRef.current.uDispersion = THREE.MathUtils.lerp(
                materialRef.current.uDispersion,
                targetDispersion.current,
                lerpSpeed
            )

            // Sync other controls
            materialRef.current.uSize = controls.size
            materialRef.current.uDisplacementStrength = controls.displacementStrength
            materialRef.current.uThreshold = controls.threshold
            // ... (other uniforms are synced if needed, but for performance we can just set them if changed in Leva)
            // Syncing Leva values that we don't animate automatically
            materialRef.current.uRandomness = controls.randomness
            materialRef.current.uEdgeSoftness = controls.edgeSoftness
            materialRef.current.uBrightness = controls.brightness
            materialRef.current.uCurlStrength = controls.curlStrength
            materialRef.current.uJitter = controls.jitter
            materialRef.current.uMouseRadius = controls.mouseRadius
            materialRef.current.uMouseStrength = controls.mouseStrength
            materialRef.current.uMouseDisp = controls.mouseDisp
            materialRef.current.uDispersionZone = controls.dispersionZone
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-uv"
                    count={particles.uvs.length / 2}
                    array={particles.uvs}
                    itemSize={2}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={particles.randoms.length / 3}
                    array={particles.randoms}
                    itemSize={3}
                />
            </bufferGeometry>
            {/* Note: We pass props to particleMaterial, but useFrame updates them for animation */}
            <particleMaterial
                ref={materialRef}
                uTexture={texture}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default DreamParticles