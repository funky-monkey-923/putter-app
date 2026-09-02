import type { ComponentType } from 'react';

/**
 * Every tool package exports one of these instead of the app shell having
 * tool-specific rendering logic — the shell iterates a registry of these
 * (Product Plan §8a). TodayWidget/CommandWidget are both optional: a tool
 * can ship Zen-only (no CommandWidget) and grow a Command-mode view later
 * without a rewrite, which is exactly what the v1 descope relies on.
 */
export type ToolCategory = 'rhythm' | 'reflect' | 'plan' | 'home';

export interface ToolManifest {
  id: string;
  displayName: string;
  category: ToolCategory;
  TodayWidget?: ComponentType;
  CommandWidget?: ComponentType;
  /**
   * The tool's main/full page — what the nav takes you to. Added for M1
   * (Task Manager needs a real place to live beyond a Today-view summary
   * widget). Optional, like the other views, for the same "grow into it
   * later" reason — a tool could theoretically be Today-widget-only.
   */
  FullView?: ComponentType;
  /**
   * Lets another tool offer "link to an item in this tool" (e.g. Focus
   * Timer linking a session to a task) without importing that tool's
   * package directly — the caller only knows the target tool's string
   * `id` (looked up via `toolRegistry.get(id)`), same loose-coupling
   * convention as everything else in the manifest pattern. Added for M2.
   * Optional: a tool with nothing linkable (or nothing built yet) simply
   * omits it, and callers must treat that as "no picker available," not
   * an error.
   */
  getLinkables?: () => Promise<Array<{ id: string; title: string }>>;
}

export class ManifestRegistry {
  private manifests = new Map<string, ToolManifest>();

  register(manifest: ToolManifest): void {
    this.manifests.set(manifest.id, manifest);
  }

  getAll(): ToolManifest[] {
    return Array.from(this.manifests.values());
  }

  get(id: string): ToolManifest | undefined {
    return this.manifests.get(id);
  }
}

/** The one shared registry instance the app shell renders from. */
export const toolRegistry = new ManifestRegistry();
