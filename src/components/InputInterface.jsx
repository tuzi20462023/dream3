import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InputInterface.css'

// 简单的 SVG 图标组件
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

export default function InputInterface({ appState, setAppState, onDreamGenerated, onEnterDream }) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [localDreamData, setLocalDreamData] = useState(null) // Keep local copy for display

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      console.log("Recording started...")
    } else {
      console.log("Recording stopped.")
      setInput("I was flying over a city made of crystal, and the sky was filled with geometric auroras...") 
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setAppState('processing')
    
    // 模拟 AI 生成过程
    setTimeout(() => {
        const data = {
            imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop", // 占位图：星云/幻想风格
            keywords: ["Freedom", "Clarity", "Ascension"],
            analysis: "This dream suggests a desire to transcend current limitations and view your life from a higher perspective."
        }
        setLocalDreamData(data)
        onDreamGenerated(data)
    }, 2000)
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
            <h1 className="title">Dream Journal</h1>
            <p className="subtitle">Materialize your subconscious</p>
            
            <form onSubmit={handleSubmit} className="input-group">
              <input 
                type="text" 
                className="dream-input"
                placeholder="Describe your dream..."
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
                title="Voice Input"
              >
                <MicIcon />
              </motion.button>
              
              {input && (
                <motion.button 
                  className="submit-btn"
                  onClick={handleSubmit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Materialize
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
                <p>Weaving dream threads...</p>
            </motion.div>
        )}

        {/* STEP 3: PREVIEW */}
        {appState === 'preview' && localDreamData && (
            <motion.div
                key="preview-card"
                className="glass-card preview-mode"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
                <div className="preview-image-container">
                    <img src={localDreamData.imageUrl} alt="Dream visualization" className="preview-image" />
                    <div className="overlay-gradient"></div>
                </div>
                
                <div className="preview-content">
                    <div className="keywords">
                        {localDreamData.keywords.map((kw, i) => (
                            <span key={i} className="keyword-chip">{kw}</span>
                        ))}
                    </div>
                    <p className="analysis-text">{localDreamData.analysis}</p>
                </div>

                <motion.button 
                  className="submit-btn primary-action"
                  onClick={onEnterDream}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enter Dreamscape
                </motion.button>
            </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
