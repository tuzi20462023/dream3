import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Suspense, useState, useEffect } from 'react'
import Scene from './Scene'
import InputInterface from './components/InputInterface'
import GalleryScene from './GalleryScene'
import BackgroundMusic from './components/BackgroundMusic'
import { dreams as initialDreams } from './data/dreams'
import { dreamStorage } from './utils/dreamStorage'

function App() {
  const [appState, setAppState] = useState('input') // input, processing, preview, immersed, gallery
  const [dreamData, setDreamData] = useState(null)
  const [galleryDreams, setGalleryDreams] = useState([])

  // 初始化时加载保存的梦境，并用预设梦境补足到 5 个
  useEffect(() => {
    const userDreams = dreamStorage.getAllDreams()

    // 转换用户梦境格式
    const formattedUserDreams = userDreams.map(dream => ({
      id: dream.id,
      title: new Date(dream.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      date: new Date(dream.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      imageUrl: dream.imageUrl, // AI 生成的 base64 或预设 URL
      description: dream.inputText || dream.description || "无 题 • 梦",
      keywords: dream.keywords,
      color: '#ffffff',
      isUserCreated: dream.isUserCreated,
      isAIGenerated: dream.isAIGenerated
    }))

    // 如果用户梦境少于 5 个，用系统预设补足
    if (formattedUserDreams.length < 5) {
      const needCount = 5 - formattedUserDreams.length
      const presetDreams = initialDreams.slice(0, needCount).map(dream => ({
        ...dream,
        isUserCreated: false,
        isAIGenerated: false
      }))

      console.log(`🎨 用户梦境 ${formattedUserDreams.length} 个，用预设补充 ${needCount} 个`)
      setGalleryDreams([...formattedUserDreams, ...presetDreams])
    } else {
      // 用户梦境已经够 5 个，只显示用户梦境
      console.log(`✨ 展示 ${formattedUserDreams.length} 个用户梦境`)
      setGalleryDreams(formattedUserDreams)
    }
  }, [])

  const handleDreamGenerated = (data) => {
    setDreamData(data)
    setAppState('preview')
  }

  const handleEnterDream = () => {
    setAppState('immersed')

    // 重新从 localStorage 加载，确保画廊同步最新梦境
    const userDreams = dreamStorage.getAllDreams()

    const formattedUserDreams = userDreams.map(dream => ({
      id: dream.id,
      title: new Date(dream.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      date: new Date(dream.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      imageUrl: dream.imageUrl,
      description: dream.inputText || dream.description || "无 题 • 梦",
      keywords: dream.keywords,
      color: '#ffffff',
      isUserCreated: dream.isUserCreated,
      isAIGenerated: dream.isAIGenerated
    }))

    // 如果少于 5 个，用预设补足
    if (formattedUserDreams.length < 5) {
      const needCount = 5 - formattedUserDreams.length
      const presetDreams = initialDreams.slice(0, needCount).map(dream => ({
        ...dream,
        isUserCreated: false,
        isAIGenerated: false
      }))
      setGalleryDreams([...formattedUserDreams, ...presetDreams])
    } else {
      setGalleryDreams(formattedUserDreams)
    }
  }

  return (
    <>
      {appState === 'gallery' ? (
        <GalleryScene 
            onBack={() => {
                setAppState('input')
            }} 
            dreams={galleryDreams} 
        />
      ) : (
        <>
          <Leva
        collapsed={false}
        theme={{
          colors: {
            elevation1: 'rgba(0,0,0,0.5)',
            elevation2: '#1a1a1a',
            elevation3: '#2a2a2a',
            accent1: '#ffffff',
            accent2: '#cccccc',
            accent3: '#aaaaaa',
            highlight1: '#ffffff',
            highlight2: '#cccccc',
            highlight3: '#aaaaaa',
            vivid1: '#ffffff',
          },
          radii: {
            xs: '2px',
            sm: '4px',
            lg: '8px',
          },
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}>
          <Scene
            appState={appState}
            dreamData={dreamData}
          />
        </Suspense>
      </Canvas>

      <InputInterface
        appState={appState}
        setAppState={setAppState}
        onDreamGenerated={handleDreamGenerated}
        onEnterDream={handleEnterDream}
      />

      {/* Temporary Navigation to Gallery */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        zIndex: 2000
      }}>
        <button
          onClick={() => setAppState('gallery')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontFamily: "'Noto Serif SC', serif",
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '0.9rem'
          }}
        >
          梦 境 回 廊
        </button>
      </div>

        </>
      )}

      {/* BackgroundMusic stays at top level, never unmounts */}
      <BackgroundMusic appState={appState} />
    </>
  )
}

export default App
