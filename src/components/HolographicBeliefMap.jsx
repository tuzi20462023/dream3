import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line, Billboard, Float } from '@react-three/drei'
import * as THREE from 'three'

const beliefs = [
    { id: 1, label: "Freedom", position: [3, 2, 0], color: "#ffaa00", size: 0.3 },
    { id: 2, label: "Anxiety", position: [-3, 0, 1], color: "#ff0055", size: 0.25 },
    { id: 3, label: "Creativity", position: [0, 3, -1], color: "#00aaff", size: 0.35 },
    { id: 4, label: "Nostalgia", position: [2, -2, 1], color: "#aa00ff", size: 0.2 },
    { id: 5, label: "Nature", position: [-2, -2, -2], color: "#00ffaa", size: 0.25 },
    { id: 6, label: "Unknown", position: [0, 0, 3], color: "#ffffff", size: 0.15 },
]

const connections = [
    [0, 2], // Freedom - Creativity
    [1, 3], // Anxiety - Nostalgia
    [2, 4], // Creativity - Nature
    [0, 4], // Freedom - Nature
    [1, 5], // Anxiety - Unknown
    [3, 5], // Nostalgia - Unknown
]

function BeliefNode({ position, color, size, label }) {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime()
            // Pulse scale
            const s = size + Math.sin(t * 2 + position[0]) * 0.05
            meshRef.current.scale.setScalar(s)
        }
    })

    return (
        <group position={position}>
            {/* Glowing Core */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>

            {/* Outer Glow (Fake Volumetric) */}
            <mesh scale={[2, 2, 2]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide} // Invert for soft edge effect if needed, or just simple transparent sphere
                    depthWrite={false}
                />
            </mesh>

            {/* Label */}
            <Billboard position={[0, 0.5, 0]}>
                <Text
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    {label}
                </Text>
            </Billboard>
        </group>
    )
}

function ConnectionLines() {
    const points = useMemo(() => {
        return connections.map(([startIdx, endIdx]) => {
            const start = new THREE.Vector3(...beliefs[startIdx].position)
            const end = new THREE.Vector3(...beliefs[endIdx].position)
            return [start, end]
        })
    }, [])

    return (
        <group>
            {points.map((segment, i) => (
                <Line
                    key={i}
                    points={segment}
                    color="white"
                    opacity={0.2}
                    transparent
                    lineWidth={1}
                />
            ))}
        </group>
    )
}

export default function HolographicBeliefMap() {
    const groupRef = useRef()

    useFrame((state) => {
        if (groupRef.current) {
            // Slow rotation of the entire constellation
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={groupRef}>
                {beliefs.map((b, i) => (
                    <BeliefNode key={i} {...b} />
                ))}
                <ConnectionLines />
            </group>
        </Float>
    )
}
