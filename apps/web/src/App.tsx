import { useState } from 'react'
import { db, eventBus, toolRegistry } from '@putter/core'
import TodayView from './TodayView'

/**
 * Deliberately not a router library — with one tool (and even at M4's
 * four), a tiny bit of local state is simpler and cheaper than pulling in
 * react-router for what's currently "switch between N known panels."
 * Revisit if/when deep-linking or browser back/forward actually matters
 * (Command mode, M5+) — see Architecture Plan's "match tooling to actual
 * scale" principle, same reasoning as the pnpm-vs-Turborepo call.
 */
type View = 'today' | string;

function App() {
  const [view, setView] = useState<View>('today')
  const tools = toolRegistry.getAll()
  const activeTool = view !== 'today' ? toolRegistry.get(view) : undefined

  return (
    <main className="min-h-screen bg-bg font-body text-ink p-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-ink mb-1">Putter</h1>
        <p className="text-ink-soft text-xs mb-4">
          Event bus: {eventBus ? 'ready' : 'missing'} · Database: {db.name}
        </p>
        <nav className="flex gap-2">
          <button
            onClick={() => setView('today')}
            className={`text-sm rounded px-3 py-1 ${view === 'today' ? 'bg-sage text-white' : 'text-ink-soft border border-taupe'}`}
          >
            Today
          </button>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setView(tool.id)}
              className={`text-sm rounded px-3 py-1 ${view === tool.id ? 'bg-sage text-white' : 'text-ink-soft border border-taupe'}`}
            >
              {tool.displayName}
            </button>
          ))}
        </nav>
      </header>

      {view === 'today' && <TodayView />}
      {activeTool && (activeTool.FullView ? <activeTool.FullView /> : <p className="text-ink-soft">This tool has no full view yet.</p>)}
    </main>
  )
}

export default App
