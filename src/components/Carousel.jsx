import React, { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, Text } from '@react-three/drei'
import * as THREE from 'three'
import DreamParticles from "./DreamParticles";

function CarouselItem({ dream, index, scrollOffset, totalItems, onClick, onHover }) {
    const group = useRef()
    const textGroup = useRef()
    const [hovered, setHovered] = useState(false)

    // Configuration
    const spacing = 4 // Distance between items
    const baseZ = -5 // Step 2: Push everything back
    const width = spacing * (totalItems - 1)

    useFrame((state, delta) => {
        if (!group.current) return

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

        // 3. Rotation Y: Rotate inwards based on side
        // Left side (dist < 0) rotates right (+), Right side rotates left (-)
        group.current.rotation.y = -dist * 0.05

        // 4. Scale: Center is largest
        const targetScale = THREE.MathUtils.lerp(1.2, 0.8, Math.min(Math.abs(dist) * 0.1, 1))
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
                <DreamParticles
                    dreamData={dream}
                    isGalleryItem={true}
                    active={hovered}
                    scale={1} // Scale handled by parent group
                />
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
