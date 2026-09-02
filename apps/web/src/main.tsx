import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { registerTasksTool } from '@putter/tool-tasks'
import App from './App'
import { ensurePersistentStorage } from './storage'
import './index.css'

registerSW({ immediate: true })

// Every tool registers itself here, before the first render, so the
// manifest registry (and each tool's Dexie schema version) is ready by the
// time <TodayView>/<App> render. M1 adds the first real tool; M2-M4 each
// add one more line here.
registerTasksTool()

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
