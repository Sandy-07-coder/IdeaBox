import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { initZoomNormalizer } from './utils/zoomNormalizer'

// Apply OS-scaling correction before first render so there is no layout shift.
// See src/utils/zoomNormalizer.js for full documentation.
// Disable via URL: ?disableZoomFix=1
initZoomNormalizer()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
