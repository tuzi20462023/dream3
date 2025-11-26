import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Suspense, useState } from 'react'
import Scene from './Scene'
import InputInterface from './components/InputInterface'
import GalleryScene from './GalleryScene'
import BackgroundMusic from './components/BackgroundMusic'
import { dreams as initialDreams } from './data/dreams'

function App() {
  const [appState, setAppState] = useState('input') // input, processing, preview, immersed, gallery
  const [dreamData, setDreamData] = useState(null)
  const [galleryDreams, setGalleryDreams] = useState(initialDreams)

  const handleDreamGenerated = (data) => {
    setDreamData(data)
    setAppState('preview')
  }

  const handleEnterDream = () => {
    setAppState('immersed')

    // Add to gallery if we have valid dream data
    if (dreamData) {
      const newDream = {
        id: Date.now(),
        // 标题只显示日期
        title: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        imageUrl: dreamData.imageUrl,
        // 用户输入保存到 description，点开详情卡片时显示
        description: dreamData.inputText || "无 题 • 梦",
        keywords: dreamData.keywords,
        color: '#ffffff'
      }
      setGalleryDreams(prev => [newDream, ...prev])
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
