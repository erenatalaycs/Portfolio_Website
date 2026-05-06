// src/lib/useQueryParams.ts
//
// Reads URL query params (?view=text|3d&focus=projects&...) reactively.
// Subscribes to native popstate AND a custom 'qpchange' event we dispatch on
// programmatic updates so all consumers stay in sync. No React Router.
//
// Source: 01-RESEARCH.md Pattern 4; react.dev/reference/react/useSyncExternalStore

import { useSyncExternalStore } from 'react';

let cached: { search: string; params: URLSearchParams } | null = null;

function getCachedSnapshot(): URLSearchParams {
  const search = window.location.search;
  if (cached && cached.search === search) return cached.params;
  cached = { search, params: new URLSearchParams(search) };
  return cached.params;
}

function getServerSnapshot(): URLSearchParams {
  // No SSR in Phase 1, but useSyncExternalStore requires this in React 19.
  return new URLSearchParams();
}

function subscribe(notify: () => void): () => void {
  window.addEventListener('popstate', notify);
  window.addEventListener('qpchange', notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener('qpchange', notify);
  };
}

export function useQueryParams(): URLSearchParams {
  return useSyncExternalStore(subscribe, getCachedSnapshot, getServerSnapshot);
}

/**
 * Update query params via history.replaceState and notify all useQueryParams() consumers.
 * Pass null as a value to remove a key.
 */
export function setQueryParams(updates: Record<string, string | null>): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, '', url.toString());
  // Bust the cache so getCachedSnapshot returns fresh params on next read.
  cached = null;
  window.dispatchEvent(new Event('qpchange'));
}
