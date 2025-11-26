import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import './InputInterface.css'
import { generateMockDream } from '../utils/mockDreamGenerator'

// 简单的 SVG 图标组件
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
)

export default function InputInterface({ appState, setAppState, onDreamGenerated, onEnterDream }) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [localDreamData, setLocalDreamData] = useState(null) // Keep local copy for display
  const cardRef = useRef(null)
  const isProcessingRef = useRef(false) // Track processing state synchronously

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      console.log("Recording started...")
    } else {
      console.log("Recording stopped.")
      setInput("我飞过一座水晶构成的城市，天空中充满了几何形状的极光...")
    }
  }

  const handleEnter = async () => {
    // Simply enter the dream state
    // No visual capture needed as we are using a direct particle fade-in
    onEnterDream()
  }

  const generateDream = async (text) => {
    // Prevent multiple simultaneous requests using ref (synchronous check)
    if (isProcessingRef.current) {
      console.log('Already processing, ignoring request')
      return
    }

    isProcessingRef.current = true
    setAppState('processing')

    try {
      const data = await generateMockDream(text)
      // Update dream data and notify parent
      setLocalDreamData(data)
      onDreamGenerated(data)
    } catch (error) {
      console.error("Dream generation failed:", error)
      // On error, restore local dream data and go back to preview if we had data
      if (localDreamData) {
        setAppState('preview')
      } else {
        setAppState('input')
      }
    } finally {
      // Always reset processing flag
      isProcessingRef.current = false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    generateDream(input)
  }

  const handleRegenerate = () => {
    // Prevent regenerate if already processing or no previous input
    if (isProcessingRef.current || !localDreamData?.inputText) {
      console.log('Cannot regenerate:', {
        isProcessing: isProcessingRef.current,
        hasInputText: !!localDreamData?.inputText
      })
      return
    }

    console.log('Regenerating with input:', localDreamData.inputText)
    generateDream(localDreamData.inputText)
  }

  return (
    <div className={`input-overlay ${appState === 'immersed' ? 'hidden' : ''}`}>
      <AnimatePresence mode="wait">

        {/* STEP 1: INPUT */}
        {appState === 'input' && (
          <motion.div
            key="input-card"
            className="glass-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <h1 className="title">梦 境 档 案</h1>
            <p className="subtitle">将 潜 意 识 具 象 化</p>

            <form onSubmit={handleSubmit} className="input-group">
              <input
                type="text"
                className="dream-input"
                placeholder="记 录 你 的 潜 意 识 ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
            </form>

            <div className="controls">
              <motion.button
                className={`icon-btn ${isRecording ? 'recording' : ''}`}
                onClick={handleRecord}
                whileTap={{ scale: 0.9 }}
                title="语音输入"
              >
                <MicIcon />
              </motion.button>

              {input ? (
                <motion.button
                  className="submit-btn"
                  onClick={handleSubmit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  显 化
                </motion.button>
              ) : (
                <motion.button
                  className="gallery-btn"
                  onClick={() => setAppState('gallery')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  whileHover={{ scale: 1.05, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  查 看 画 廊
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: PROCESSING */}
        {appState === 'processing' && (
          <motion.div
            key="processing"
            className="processing-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="spinner"></div>
            <p>正在编织梦境...</p>
          </motion.div>
        )}

        {/* STEP 3: PREVIEW */}
        {appState === 'preview' && localDreamData && (
          <motion.div
            key="preview-card"
            ref={cardRef}
            className="glass-card preview-mode"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="preview-image-container">
              <img 
                src={localDreamData.imageUrl} 
                alt="Dream visualization" 
                className="preview-image" 
                crossOrigin="anonymous" 
              />
              <div className="overlay-gradient"></div>
            </div>

            <div className="preview-content">
              <div className="keywords">
                {localDreamData.keywords.map((kw, i) => (
                  <span key={i} className="keyword-chip">{kw}</span>
                ))}
              </div>
              <p className="analysis-text">{localDreamData.inputText}</p>
              
              <div className="action-buttons">
                <motion.button
                    className="secondary-btn"
                    onClick={handleRegenerate}
                    whileHover={!isProcessingRef.current ? { scale: 1.02 } : {}}
                    whileTap={!isProcessingRef.current ? { scale: 0.95 } : {}}
                    title="重新生成"
                    style={{
                      opacity: appState === 'processing' ? 0.5 : 1,
                      cursor: appState === 'processing' ? 'not-allowed' : 'pointer',
                      pointerEvents: appState === 'processing' ? 'none' : 'auto'
                    }}
                >
                    <RefreshIcon />
                    <span>重新生成</span>
                </motion.button>

                <motion.button
                    className="submit-btn primary-action"
                    onClick={handleEnter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    潜 入 梦 境
                </motion.button>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
