import { OrbitControls } from '@react-three/drei'
import DreamParticles from './components/DreamParticles'

const Scene = ({ appState, dreamData }) => {
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
        </>
    )
}

export default Scene
