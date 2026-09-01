# Known Issues

A running log of things we've noticed but haven't fixed yet — separate from GitHub Issues (which tracks actual work items) because this is specifically for "known, deliberately deferred, not forgotten" gaps. Each entry gets moved to a ~~struck-through~~ resolved state (with the fixing commit/date) rather than deleted, so the history of what was wrong and when it got fixed stays visible.

## Open

### Fonts fall back to system fonts instead of the real Quiet Morning typefaces
**Since:** M0 slice 3 (2026-09-01)
**Impact:** Low — the app is fully usable, just not visually final. Quicksand/Nunito Sans/Space Mono are referenced by name in the Tailwind theme, but the actual font files aren't bundled yet, so browsers fall back to system rounded/mono fonts.
**Why it's not fixed yet:** self-hosting the real fonts (not a Google Fonts CDN call — required by the no-third-party-requests privacy promise) is real but small work, deliberately deferred past M0's structural goals.
**Planned fix:** before public launch, or whenever it starts bothering us sooner — download the font files, add them to `apps/web/public/fonts/`, wire up `@font-face` rules.

### PWA manifest ships with zero icons
**Since:** M0 slice 2 (2026-09-01)
**Impact:** Low — the app installs fine, but browsers may show a generic icon or a console warning about the manifest's empty `icons` array.
**Why it's not fixed yet:** the real app icon/wordmark is an intentional placeholder across the whole project (see Design Direction doc) — no point designing final icon assets before the brand mark itself is finalized.
**Planned fix:** once a real icon is designed, generate the standard PWA icon size set and add them to the manifest config in `apps/web/vite.config.ts`.

### LICENSE file has a placeholder copyright name
**Since:** this entry (2026-09-01)
**Impact:** None yet — the repo isn't public. But real AGPL-3.0 text needs a real name, not a placeholder, before this repo is ever made public.
**Planned fix:** fill in `[YOUR NAME HERE...]` in `LICENSE` with your actual name (or a pseudonym you're comfortable being publicly associated with the project) — a two-minute edit, just needs a deliberate choice rather than a default.

### CI warns about Node 20 deprecation in the Actions runtime
**Since:** first green CI run, M0 (2026-09-01)
**Impact:** None currently — the build passed. This is GitHub warning that `actions/checkout@v4`, `actions/setup-node@v4`, and `pnpm/action-setup@v4` were built targeting Node 20 as their own internal execution runtime (not the Node version our workflow builds Putter with, which is already pinned to 22), and GitHub is transparently forcing them onto Node 24 in the meantime.
**Why it's not fixed yet:** there's nothing to fix on our side — this is the action maintainers' responsibility, and pinning to `@v4` (a major-version tag) means we'll pick up their runtime updates automatically without us touching the workflow file.
**Planned fix:** none needed unless the warning turns into an actual failure later, which would mean re-pinning to a newer action version at that point.

## Resolved

*(Nothing resolved yet — this project is 3 commits old. Future fixes get moved here with the date and commit that fixed them.)*
