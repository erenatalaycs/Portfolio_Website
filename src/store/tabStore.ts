// src/store/tabStore.ts
//
// Single global store for the active monitor tab on the ultrawide
// Hacker-Simulator-style center monitor. Replaces the Phase 2/3 three-
// monitor mapping (left=projects, center=identity, right=writeups) with
// a single monitor whose surface cycles through five tabs via a
// terminal-style tab bar inside the <Html transform> overlay.
//
// Tab IDs match the Phase 3 deep-link contract (`?focus=…`) so existing
// inbound links keep resolving:
//   whoami   ← `?focus=whoami` or `?focus=about` (Phase 3 alias)
//   projects ← `?focus=projects`
//   writeups ← `?focus=writeups` or `?focus=writeups/<slug>`
//   certs    ← `?focus=certs`        (new — not in Phase 3 alias table)
//   contact  ← `?focus=contact`      (new — not in Phase 3 alias table)
//
// FocusController (Task 3) syncs activeTab ↔ URL. This store does NOT
// own the URL; it owns the in-memory active tab.
//
// zustand: chosen because R3F's <Canvas> creates its own React tree
// (Fiber renderer) and React Context across that boundary is awkward
// (CLAUDE.md "stack" note). zustand store is read identically from DOM
// (text shell, tab bar) and from inside Canvas (FocusController) with
// the same hook.

import { create } from 'zustand';

export type MonitorTab = 'whoami' | 'projects' | 'writeups' | 'certs' | 'contact';

export const MONITOR_TABS: ReadonlyArray<MonitorTab> = [
  'whoami',
  'projects',
  'writeups',
  'certs',
  'contact',
];

interface TabState {
  activeTab: MonitorTab;
  setActiveTab: (tab: MonitorTab) => void;
}

export const useTabStore = create<TabState>((set) => ({
  activeTab: 'whoami',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
