import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ensurePersistentStorage } from './storage'
import './index.css'

registerSW({ immediate: true })

ensurePersistentStorage().then((persisted) => {
  if (!persisted) {
    // M5's polish pass turns this into a real UI nudge to export/backup data.
    console.warn('[Putter] Persistent storage was not granted — data could be evicted under storage pressure.')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
