import { db, eventBus } from '@putter/core'
import TodayView from './TodayView'

function App() {
  return (
    <main className="min-h-screen bg-bg font-body text-ink p-8">
      <h1 className="font-display text-3xl text-ink mb-1">Putter</h1>
      <p className="text-ink-soft text-sm mb-6">
        M0 slice 3 — Quiet Morning theme tokens, manifest registry, and the empty Today view.
      </p>
      <p className="text-ink-soft text-xs mb-6">
        Event bus: {eventBus ? 'ready' : 'missing'} · Database: {db.name}
      </p>
      <TodayView />
    </main>
  )
}

export default App
