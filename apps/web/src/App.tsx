import { version as coreVersion } from '@putter/core'

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Putter</h1>
      <p>M0 skeleton is alive. Core package version: {coreVersion}</p>
    </main>
  )
}

export default App
