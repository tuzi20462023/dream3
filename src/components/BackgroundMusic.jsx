import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BackgroundMusic({ appState }) {
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [volume, setVolume] = useState(0.5)

    const [status, setStatus] = useState('loading') // loading, ready, playing, error

    // Auto-play when entering preview, immersed, or gallery state
    useEffect(() => {
        if (appState === 'preview' || appState === 'immersed' || appState === 'gallery') {
            setIsPlaying(true)
            setHasInteracted(true)
        }
    }, [appState])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        audio.volume = volume

        const handleCanPlay = () => setStatus('ready')
        const handleError = (e) => {
            console.error("Audio Error:", e)
            setStatus('error')
        }
        const handlePlay = () => setStatus('playing')
        const handlePause = () => setStatus('paused')

        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)

        // Attempt autoplay
        audio.play().catch(() => {
            // Autoplay failed, expected
        })

        return () => {
            audio.removeEventListener('canplay', handleCanPlay)
            audio.removeEventListener('error', handleError)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
        }
    }, [])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying && audio.paused) {
            // Only play if audio is currently paused
            audio.play().catch(e => {
                console.error("Play failed:", e)
                setStatus('error')
            })
        } else if (!isPlaying && !audio.paused) {
            // Only pause if audio is currently playing
            audio.pause()
        }
    }, [isPlaying])

    const togglePlay = () => {
        setHasInteracted(true)
        setIsPlaying(!isPlaying)
    }

    const toggleMute = (e) => {
        e.stopPropagation()
        setIsMuted(!isMuted)
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Montserrat, sans-serif'
        }}>
            <audio
                ref={audioRef}
                src="/bgm.mp3"
                loop
                preload="auto"
                muted={isMuted}
            />

            <button
                onClick={togglePlay}
                style={{
                    // ... (keep existing style)
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.3s ease'
                }}
            >
                {isPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                    </svg>
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            {/* ... (keep mute button) */}
            {hasInteracted && (
                <button
                    onClick={toggleMute}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.5)',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {isMuted ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    ) : (
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '12px' }}>
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '2px', background: 'currentColor' }} />
                            <motion.div animate={{ height: [8, 12, 6] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ width: '2px', background: 'currentColor' }} />
                            <motion.div animate={{ height: [2, 10, 5] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ width: '2px', background: 'currentColor' }} />
                        </div>
                    )}
                </button>
            )}
        </div>
    )
}
