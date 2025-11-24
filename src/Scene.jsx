import { OrbitControls } from '@react-three/drei'
import DreamParticles from './components/DreamParticles'

const Scene = () => {
    return (
        <>
            <OrbitControls makeDefault />
            <DreamParticles />
        </>
    )
}

export default Scene
