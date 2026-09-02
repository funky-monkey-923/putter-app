import { toolRegistry } from '@putter/core';
import type { ToolManifest } from '@putter/core';
import FocusTimerToday from './FocusTimerToday';
import FocusTimerView from './FocusTimerView';
import './db'; // ensures the schema is registered even if nothing else imports it first

export const focusManifest: ToolManifest = {
  id: 'focus',
  displayName: 'Focus Timer',
  category: 'rhythm',
  TodayWidget: FocusTimerToday,
  FullView: FocusTimerView,
};

/**
 * Registers Focus Timer with the shared registry — called once from the
 * app shell's entry point, before the first render (see main.tsx).
 */
export function registerFocusTool(): void {
  toolRegistry.register(focusManifest);
}
