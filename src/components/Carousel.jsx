import React, { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import DreamParticles from "./DreamParticles";

// Organic Dust Beam Component
function DustBeam({ start, end, active }) {
    const pointsRef = useRef()
    const timeActive = useRef(0)

    // Generate particles along the path
    const { positions, randomness } = useMemo(() => {
        const count = 60 // Number of dust motes per beam
        const positions = new Float32Array(count * 3)
        const randomness = new Float32Array(count * 3)

        const curve = new THREE.LineCurve3(start, end)

        for (let i = 0; i < count; i++) {
            const t = i / (count - 1)
            const point = curve.getPoint(t)

            positions[i * 3] = point.x
            positions[i * 3 + 1] = point.y
            positions[i * 3 + 2] = point.z

            // Random scatter offsets
            randomness[i * 3] = (Math.random() - 0.5) * 0.5
            randomness[i * 3 + 1] = (Math.random() - 0.5) * 0.5
            randomness[i * 3 + 2] = (Math.random() - 0.5) * 0.5
        }

        return { positions, randomness }
    }, [start, end])

    useFrame((state, delta) => {
        if (!active) {
            timeActive.current = 0
            return
        }
        timeActive.current += delta

        if (pointsRef.current) {
            pointsRef.current.material.uniforms.uTime.value += delta

            // Fade out logic: 
            // 0s - 2.5s: Full Opacity
            // 2.5s - 3.0s: Fade to 0
            const fadeStart = 2.5
            const fadeDuration = 0.5
            let opacity = 1.0

            if (timeActive.current > fadeStart) {
                opacity = 1.0 - Math.min((timeActive.current - fadeStart) / fadeDuration, 1.0)
            }

            pointsRef.current.material.uniforms.uGlobalOpacity.value = opacity
        }
    })

    if (!active) return null

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={randomness.length / 3}
                    array={randomness}
                    itemSize={3}
                />
            </bufferGeometry>
            <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color('#bfeeff') }, // Paler, dusty blue
                    uStart: { value: start },
                    uEnd: { value: end },
                    uGlobalOpacity: { value: 1.0 }
                }}
                vertexShader={`
                    uniform float uTime;
                    uniform vec3 uStart;
                    uniform vec3 uEnd;
                    attribute vec3 aRandom;
                    varying float vAlpha;
                    
                    void main() {
                        // Calculate progress along the line based on time and original position
                        
                        float t = distance(position, uStart) / distance(uStart, uEnd);
                        
                        // Flow animation: particles move from start to end
                        float flowSpeed = 1.5;
                        
                        float phase = fract(t + uTime * 0.5); 
                        
                        // Lerp position based on phase
                        vec3 currentPos = mix(uStart, uEnd, phase);
                        
                        // Add organic noise/turbulence
                        // Wiggle based on time and phase
                        float wiggle = sin(phase * 10.0 + uTime * 5.0) * 0.1;
                        currentPos += aRandom + vec3(wiggle, wiggle, 0.0);
                        
                        vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        
                        // Size attenuation
                        gl_PointSize = (4.0 + sin(uTime * 10.0 + t * 20.0)) * (10.0 / -mvPosition.z);
                        
                        // Fade in/out at ends
                        vAlpha = smoothstep(0.0, 0.2, phase) * (1.0 - smoothstep(0.8, 1.0, phase));
                    }
                `}
                fragmentShader={`
                    uniform vec3 uColor;
                    uniform float uGlobalOpacity;
                    varying float vAlpha;
                    
                    void main() {
                        // Soft circular particle
                        vec2 coord = gl_PointCoord - vec2(0.5);
                        float dist = length(coord);
                        if(dist > 0.5) discard;
                        
                        float core = 1.0 - smoothstep(0.0, 0.5, dist);
                        
                        gl_FragColor = vec4(uColor, vAlpha * core * 0.8 * uGlobalOpacity);
                    }
                `}
            />
        </points>
    )
}

function CarouselItem({ dream, index, scrollOffset, totalItems, onClick, onHover, charging, prismRef }) {
    const group = useRef()
    const textGroup = useRef()
    const [hovered, setHovered] = useState(false)
    const [worldPos, setWorldPos] = useState(new THREE.Vector3())

    // Configuration
    const spacing = 12
    const baseZ = -8
    const retreatZ = -15 // Retreat position when charging
    // Use .woff instead of .woff2 as Three.js Text component (troika-three-text) has better support for it
    const fontUrl = "https://cdn.jsdelivr.net/npm/@openfonts/noto-serif-sc_chinese-simplified@1.44.2/files/noto-serif-sc-chinese-simplified-400.woff"

    // Track previous offset to calculate directional velocity
    const lastOffset = useRef(scrollOffset.offset)

    useFrame((state, delta) => {
        if (!group.current) return

        // Update world position for beam
        group.current.getWorldPosition(worldPos)

        // Calculate directional scroll velocity
        const currentOffset = scrollOffset.offset
        const scrollDelta = currentOffset - lastOffset.current
        lastOffset.current = currentOffset

        // Tilt strength multiplier
        const tiltStrength = 40.0
        const dynamicTilt = -scrollDelta * tiltStrength

        // Core Scroll Logic
        const currentScroll = scrollOffset.offset * (totalItems - 1)
        const offset = index - currentScroll

        // Calculate distance from center (in units of items)
        const dist = offset * spacing

        // 1. Position X: Linear scroll
        // If charging, we could freeze X, but let's just let it be for now (user said "auto-scroll stops", usually implies manual scroll stops too or just visual freeze)
        // To visually freeze, we'd need to stop updating X based on scroll. 
        // But scrollOffset is driven by ScrollControls. 
        // Let's just let them retreat.
        group.current.position.x = dist

        // 2. Position Z: Parabolic curve + Base Depth + Retreat
        // Smoothly interpolate Z
        const targetBaseZ = charging ? retreatZ : baseZ
        const curveZ = -Math.pow(Math.abs(dist), 1.5) * 0.1
        const targetZ = targetBaseZ + curveZ

        // Lerp to target Z for smooth retreat
        // Faster retreat for 3s ritual
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, delta * 1.5)

        // 3. Scale
        const targetScale = THREE.MathUtils.lerp(0.9, 0.6, Math.min(Math.abs(dist) * 0.1, 1))
        const finalScale = hovered ? targetScale * 1.1 : targetScale
        group.current.scale.setScalar(finalScale)

        // Text handling
        if (textGroup.current) {
            textGroup.current.position.y = -3.5
            textGroup.current.lookAt(state.camera.position)
            const opacity = 1 - Math.min(Math.abs(dist) * 0.1, 1)
            textGroup.current.visible = opacity > 0.1 && !charging // Hide text when charging
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
        <>
            <group ref={group}>
                <group
                    onClick={(e) => {
                        e.stopPropagation()
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
                        lockZ={false}
                    >
                        <DreamParticles
                            dreamData={dream}
                            isGalleryItem={true}
                            active={hovered}
                            scale={1}
                        />
                    </Billboard>
                </group>

                <group ref={textGroup}>
                    <Text
                        font={fontUrl}
                        fontSize={0.5}
                        color={hovered ? "#ffffff" : "#aaaaaa"}
                        anchorX="center"
                        anchorY="middle"
                        fillOpacity={hovered ? 1 : 0.7}
                        // Specify known characters to ensure they are generated in the SDF if not automatically handled
                        characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,./<>?水晶之城霓虹森林深海飞行金色荒漠宇宙阶梯纯净透视易碎赛博共生迷幻失重深渊静谧辉煌孤独永恒飞升无限维度凝结信念自由焦虑创造怀旧自然未知探寻者梦境原型"
                    >
                        {dream.title}
                    </Text>
                    <Text
                        font={fontUrl}
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

            {/* Energy Beam */}
            {charging && prismRef && prismRef.current && (
                <DustBeam
                    start={worldPos}
                    end={prismRef.current.position}
                    active={charging}
                />
            )}
        </>
    )
}

export default function Carousel({ dreams, onSelectDream, charging, prismRef }) {
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
                    charging={charging}
                    prismRef={prismRef}
                />
            ))}
        </group>
    )
}
