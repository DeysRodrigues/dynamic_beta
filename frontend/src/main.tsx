import './index.css';   
import './theme.css';   



import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


import App from './App.tsx'
import { resumeSession } from './sync/connection'

// Picks the account back up, if one was signed in. The app does not wait for it.
resumeSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
