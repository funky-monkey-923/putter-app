# Changelog

All notable changes to Putter get logged here, roughly following [Keep a Changelog](https://keepachangelog.com/) conventions. Version numbers stay at `0.0.0` across every `package.json` until there's an actual first release worth calling `0.1.0` — before that point, dated entries under "Unreleased" are the real record of progress, not a semver number nobody's using yet.

## [Unreleased]

### Added
- **M0 slice 3** (2026-09-01) — Manifest registry (`ManifestRegistry`, `toolRegistry`), tested with zero tools registered. Quiet Morning theme tokens wired into Tailwind v4, matching the real values from the Design Direction doc. 13 passing Vitest tests covering the event bus, registry, and Dexie repository. ESLint (flat config) with real, fixed findings (unused-arg convention, justified `any` usages in the event bus documented inline). GitHub Actions CI workflow (lint → typecheck → test → build on every push).
- **M0 slice 2** (2026-09-01) — Real `packages/core`: shared entity type, versioned event bus, Dexie-backed repository base class including unused-for-now sync-hook stubs (`pushChanges`/`pullChanges`) for a future sync connector. PWA config via `vite-plugin-pwa` (manifest, service worker). `navigator.storage.persist()` handling.
- **M0 slice 1** (2026-09-01) — Initial pnpm workspace: `apps/web` (blank Vite + React + TypeScript) and `packages/core` (placeholder). First commit, first working `pnpm dev`.

### Known gaps
See `KNOWN-ISSUES.md` for the full, maintained list. As of this entry: fonts aren't self-hosted yet, PWA manifest has no real icons yet.
