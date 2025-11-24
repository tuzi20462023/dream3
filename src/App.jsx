import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Suspense } from 'react'
import Scene from './Scene'

function App() {
  return (
    <>
      <Leva
        collapsed={false}
        theme={{
          colors: {
            elevation1: 'rgba(0,0,0,0.5)', // Transparent background
            elevation2: '#1a1a1a',
            elevation3: '#2a2a2a',
            accent1: '#ffffff', // White accents
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
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI Layer will go here */}
      <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
        {/* Placeholder for UI */}
      </div>
    </>
  )
}

export default App
