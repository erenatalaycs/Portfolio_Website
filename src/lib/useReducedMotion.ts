// src/lib/useReducedMotion.ts
//
// Reactive prefers-reduced-motion: reduce hook. Reactive because users can
// toggle reduced motion mid-session (especially on macOS / iOS).
//
// Source: 01-RESEARCH.md Pattern 8

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(notify: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', notify);
  return () => mql.removeEventListener('change', notify);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
