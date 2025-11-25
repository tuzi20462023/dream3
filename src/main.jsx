import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode disabled temporarily to prevent WebGL context loss from double-mounting
createRoot(document.getElementById('root')).render(
  <App />
)
