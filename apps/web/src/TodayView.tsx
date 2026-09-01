import { toolRegistry } from '@putter/core'

/**
 * Renders every registered tool's Today widget by iterating the shared
 * registry — the app shell never hardcodes which tools exist (Product Plan
 * §8a). With zero tools registered (true until M1), this renders a plain
 * empty state instead of crashing, which is exactly what M0's validation
 * gate requires.
 */
function TodayView() {
  const tools = toolRegistry.getAll()

  if (tools.length === 0) {
    return (
      <p className="text-ink-soft">
        Nothing registered yet — Task Manager lands in M1.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {tools.map((tool) => {
        const Widget = tool.TodayWidget
        return (
          <section key={tool.id} className="rounded-lg border border-taupe bg-card p-4">
            <h2 className="font-display text-lg text-ink">{tool.displayName}</h2>
            {Widget ? <Widget /> : <p className="text-ink-soft text-sm">No Today widget yet.</p>}
          </section>
        )
      })}
    </div>
  )
}

export default TodayView
