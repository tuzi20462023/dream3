import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import DreamParticles from './components/DreamParticles'
import DissolveEffect from './components/DissolveEffect'

const Scene = ({ appState, dreamData, transitionData, onTransitionComplete }) => {
    const [isTransitioning, setIsTransitioning] = useState(false)

    // When transitionData arrives, we are transitioning
    // Note: purely visual state, appState is already 'immersed'

    return (
        <>
            <OrbitControls 
                makeDefault 
                enableZoom={true} 
                enablePan={false}
                // 在输入模式下限制旋转，营造背景氛围
                autoRotate={appState !== 'immersed'}
                autoRotateSpeed={0.5}
            />
            
            <DreamParticles appState={appState} dreamData={dreamData} />

            {transitionData && (
                <DissolveEffect 
                    transitionData={transitionData} 
                    onComplete={() => {
                        console.log("Dissolve complete")
                        if (onTransitionComplete) onTransitionComplete()
                    }} 
                />
            )}
        </>
    )
}

export default Scene
