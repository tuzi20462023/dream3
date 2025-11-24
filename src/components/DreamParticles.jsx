import { useMemo, useRef } from 'react'
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
        uOpacity: 1.0,
        uBrightness: 1.0,
        uTime: 0.0,
        uDispersion: 1.0,
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

const DreamParticles = () => {
    // Load a sample texture (using a placeholder for now)
    // You can replace this with any image URL
    const texture = useTexture('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80')

    // Default values based on user preference
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

    const { size, density, displacementStrength, threshold, randomness, edgeSoftness, opacity, brightness, dispersion, curlStrength, jitter, mouseRadius, mouseStrength, mouseDisp, dispersionZone } = controls

    // Generate particles
    const particles = useMemo(() => {
        const count = density * density
        const positions = new Float32Array(count * 3)
        const uvs = new Float32Array(count * 2)
        const randoms = new Float32Array(count * 3)

        for (let i = 0; i < density; i++) {
            for (let j = 0; j < density; j++) {
                const index = (i * density + j)

                // Normalized coordinates (0 to 1)
                const u = j / (density - 1)
                const v = i / (density - 1)

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
    }, [density])

    const materialRef = useRef()

    // Mouse tracking
    const mouse = useRef(new THREE.Vector2(0, 0))
    const { viewport } = useThree()

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

            // Smooth mouse movement
            const targetX = (state.mouse.x * viewport.width) / 2
            const targetY = (state.mouse.y * viewport.height) / 2
            mouse.current.x += (targetX - mouse.current.x) * 0.1
            mouse.current.y += (targetY - mouse.current.y) * 0.1

            materialRef.current.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y)
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
            <particleMaterial
                ref={materialRef}
                uTexture={texture}
                uSize={size}
                uDisplacementStrength={displacementStrength}
                uThreshold={threshold}
                uRandomness={randomness}
                uEdgeSoftness={edgeSoftness}
                uOpacity={opacity}
                uBrightness={brightness}
                uDispersion={dispersion}
                uCurlStrength={curlStrength}
                uJitter={jitter}
                uMouse={new THREE.Vector2(0, 0)}
                uMouseRadius={mouseRadius}
                uMouseStrength={mouseStrength}
                uMouseDisp={mouseDisp}
                uDispersionZone={dispersionZone}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default DreamParticles