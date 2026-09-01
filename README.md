# 🏌️ Putter

*The productivity toolbox for people who'd rather not manage five different apps to manage their day.*

> Yes, we know. "Putter" sounds like golf. We made peace with that. There's a whole trademark investigation about it in the project docs, if you're into lore.

## What is this, actually?

Putter is a calm, all-in-one home for tasks, habits, routines, focus time, and eventually a lot more — built for people who feel scattered across five different apps and want one private, judgment-free place instead. No ads. No tracking. No account required. Open source under AGPL-3.0, which means even if this project vanished tomorrow, your copy keeps working and the code stays available forever.

It's local-first: your data lives on your device in IndexedDB, not on someone else's server. It's a PWA, so it installs like a real app without an app store in the way. And it's designed from day one to be *modular* — new tools get added as self-contained packages, not bolted-on hacks, so the whole thing can grow for years without turning into spaghetti.

This is also, honestly, a hobby/learning project. There's a whole team of AI-simulated ex-FAANG executives "advising" on it (see `Putter-Virtual-Team-Roster.md` in the planning docs if you want to meet them), a mentorship journal tracking every real decision, and zero venture capital anywhere in sight. Just someone learning to vibe-code a real thing, one honest commit at a time.

## Status: early days, foundation-only

Right now, this is scaffolding — a working monorepo, a shared core package (event bus, entity types, a Dexie-backed repository layer), the real design tokens wired up, tests passing, CI running. **There is no actual Task Manager, Habit Tracker, or anything else you could use yet.** That's next. If you're watching this repo hoping to use it today: not yet, but soon-ish, and the [build roadmap](../Putter-Build-Roadmap.md) shows exactly what's coming and in what order.

## Tech stack

- **React + TypeScript + Vite** — the app shell
- **pnpm workspaces** — monorepo, no extra orchestration tooling (yet — see the Architecture doc for why, and when that might change)
- **Dexie.js (IndexedDB)** — local-first data, no backend for the core product
- **Tailwind CSS v4** — styling, driven by real design tokens, not ad-hoc values
- **Vitest** — testing
- **vite-plugin-pwa** — installability, offline support
- **GitHub Actions** — CI (lint, typecheck, test, build on every push)

## Getting started

```bash
git clone <this-repo-url>
cd putter-app
pnpm install
pnpm dev
```

Then open whatever localhost URL Vite prints. You'll see a plain page confirming the foundation is wired up — genuinely not much to look at yet, and that's expected.

Useful commands:

```bash
pnpm dev         # start the dev server
pnpm build       # typecheck + production build
pnpm test        # run the test suite
pnpm lint        # run ESLint
pnpm typecheck   # TypeScript checking only, no build
```

## Project structure

```
putter-app/
├─ apps/
│  └─ web/          # the app shell — routing, layout, the Today view
├─ packages/
│  └─ core/          # shared entity types, event bus, repository base class
├─ .github/workflows/ # CI
├─ CHANGELOG.md       # what shipped, when
├─ KNOWN-ISSUES.md    # what's broken/incomplete and why, until it's fixed
```

More tool packages (`packages/tool-tasks`, `packages/tool-habits`, ...) land here one at a time as the [build roadmap](../Putter-Build-Roadmap.md) progresses.

## Why AGPL-3.0?

Specifically because of the network clause: if anyone (including a future paid version of this project) runs a modified version of this code as a network service, the source has to be made available to that service's users. It's the same license family behind Nextcloud and Mastodon, chosen so this can never quietly become "open source in name only."

## Contributing

Not soliciting contributors yet — this is a one-person learning project in its earliest days. But it's built to be genuinely extensible (see the manifest pattern in `packages/core`), and the license means the door is architecturally and legally open for that to change later.

## License

AGPL-3.0. See `LICENSE`. (One honest note, tracked in `KNOWN-ISSUES.md`: the copyright line still has a placeholder name — needs a real one before this repo ever goes public.)
