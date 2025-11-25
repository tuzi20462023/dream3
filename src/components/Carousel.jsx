import React, { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import DreamParticles from "./DreamParticles";

function CarouselItem({ dream, index, scrollOffset, totalItems, onClick, onHover }) {
    const group = useRef()
    const textGroup = useRef()
    const [hovered, setHovered] = useState(false)

    // Configuration
    const spacing = 12 // Slightly more compact
    const baseZ = -18 // Step 4: Push back even further for a "distant galaxy" feel
    const width = spacing * (totalItems - 1)

    // Track previous offset to calculate directional velocity
    const lastOffset = useRef(scrollOffset.offset)

    useFrame((state, delta) => {
        if (!group.current) return

        // Calculate directional scroll velocity
        const currentOffset = scrollOffset.offset
        const scrollDelta = currentOffset - lastOffset.current
        lastOffset.current = currentOffset

        // Tilt strength multiplier
        const tiltStrength = 40.0
        const dynamicTilt = -scrollDelta * tiltStrength

        // Step 3: Core Scroll Logic
        const currentScroll = scrollOffset.offset * (totalItems - 1)
        const offset = index - currentScroll

        // Calculate distance from center (in units of items)
        const dist = offset * spacing

        // 1. Position X: Linear scroll
        group.current.position.x = dist

        // 2. Position Z: Parabolic curve (further = deeper) + Base Depth
        // -Math.pow(Math.abs(dist), 1.5) * 0.1 creates the curve
        group.current.position.z = baseZ - Math.pow(Math.abs(dist), 1.5) * 0.1

        // 3. Scale: Center is largest but not overwhelming
        // Reduced from 1.2->0.8 to 0.9->0.6 for a more delicate look
        const targetScale = THREE.MathUtils.lerp(0.9, 0.6, Math.min(Math.abs(dist) * 0.1, 1))
        const finalScale = hovered ? targetScale * 1.1 : targetScale

        group.current.scale.setScalar(finalScale)

        // Pass opacity to children (requires custom handling in DreamParticles)
        // For now, we can just fade the text group
        if (textGroup.current) {
            textGroup.current.position.y = -3.5
            textGroup.current.lookAt(state.camera.position) // Always face camera

            // Fade text based on distance
            const opacity = 1 - Math.min(Math.abs(dist) * 0.1, 1)
            textGroup.current.visible = opacity > 0.1
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
        <group ref={group}>
            <group
                onClick={(e) => {
                    e.stopPropagation()
                    // Only allow clicking if close to center? Or any visible?
                    // Let's allow any, but maybe scroll to it?
                    onClick(dream)
                }}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                style={{ cursor: 'pointer' }}
            >
                <Billboard
                    follow={true}
                    lockX={false}
                    lockY={false}
                    lockZ={false} // Lock the rotation on the z axis (default=false)
                >
                    <DreamParticles
                        dreamData={dream}
                        isGalleryItem={true}
                        active={hovered}
                        scale={1} // Scale handled by parent group
                    />
                </Billboard>
            </group>

            <group ref={textGroup}>
                <Text
                    fontSize={0.5}
                    color={hovered ? "#ffffff" : "#aaaaaa"}
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={hovered ? 1 : 0.7}
                >
                    {dream.title.toUpperCase()}
                </Text>
                <Text
                    fontSize={0.2}
                    position={[0, -0.4, 0]}
                    color={hovered ? "#cccccc" : "#666666"}
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.1}
                >
                    {dream.date}
                </Text>
            </group>
        </group>
    )
}

export default function Carousel({ dreams, onSelectDream }) {
    const scroll = useScroll()
    const [hovering, setHovering] = useState(false)

    return (
        <group>
            {dreams.map((dream, i) => (
                <CarouselItem
                    key={dream.id}
                    dream={dream}
                    index={i}
                    scrollOffset={scroll}
                    totalItems={dreams.length}
                    onClick={onSelectDream}
                    onHover={setHovering}
                />
            ))}
        </group>
    )
}
