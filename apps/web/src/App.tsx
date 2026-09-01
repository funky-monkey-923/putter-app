import { eventBus, db } from '@putter/core'

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Putter</h1>
      <p>M0 slice 2: core package (entity types, event bus, repository, Dexie) is wired up.</p>
      <p>
        Event bus instance: {eventBus ? 'ready' : 'missing'}. Database name: {db.name}.
      </p>
    </main>
  )
}

export default App
