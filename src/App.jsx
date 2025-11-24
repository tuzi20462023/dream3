import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Suspense, useState } from 'react'
import Scene from './Scene'
import InputInterface from './components/InputInterface'

function App() {
  const [appState, setAppState] = useState('input') // input, processing, preview, immersed
  const [dreamData, setDreamData] = useState(null)

  const handleDreamGenerated = (data) => {
    setDreamData(data)
    setAppState('preview')
  }

  const handleEnterDream = () => {
    setAppState('immersed')
  }

  return (
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
          <Scene appState={appState} dreamData={dreamData} />
        </Suspense>
      </Canvas>

      <InputInterface 
        appState={appState} 
        setAppState={setAppState}
        onDreamGenerated={handleDreamGenerated}
        onEnterDream={handleEnterDream}
      />
    </>
  )
}

export default App
