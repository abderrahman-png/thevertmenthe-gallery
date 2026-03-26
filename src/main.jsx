import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Gallery3D.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
