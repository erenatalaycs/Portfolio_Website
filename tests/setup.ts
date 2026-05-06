// tests/setup.ts
//
// Vitest global setup. jsdom does not ship matchMedia, so we provide a
// controllable polyfill that the useReducedMotion hook test can drive
// (flip `matches` value mid-test, dispatch `change` to listeners).
//
// Source: 01-03-PLAN.md Task 1 Step 1.3; jsdom-issue/tracker note that
//   matchMedia is intentionally unimplemented; the standard workaround is a
//   per-test polyfill keyed on the query string.

import { afterEach, vi } from 'vitest';

type MqlListener = (e: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: MqlListener | null;
  _listeners: Set<MqlListener>;
  addEventListener: (type: 'change', cb: MqlListener) => void;
  removeEventListener: (type: 'change', cb: MqlListener) => void;
  addListener: (cb: MqlListener) => void; // legacy
  removeListener: (cb: MqlListener) => void; // legacy
  dispatchEvent: (e: Event) => boolean;
}

const mqlRegistry = new Map<string, MockMediaQueryList>();

function createMql(query: string): MockMediaQueryList {
  const listeners = new Set<MqlListener>();
  const mql: MockMediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    _listeners: listeners,
    addEventListener: (_t, cb) => listeners.add(cb),
    removeEventListener: (_t, cb) => listeners.delete(cb),
    addListener: (cb) => listeners.add(cb),
    removeListener: (cb) => listeners.delete(cb),
    dispatchEvent: () => true,
  };
  return mql;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => {
    let mql = mqlRegistry.get(query);
    if (!mql) {
      mql = createMql(query);
      mqlRegistry.set(query, mql);
    }
    return mql;
  }),
});

/** Test helper: set the reduced-motion query result and notify listeners. */
export function __setReducedMotion(matches: boolean): void {
  const query = '(prefers-reduced-motion: reduce)';
  let mql = mqlRegistry.get(query);
  if (!mql) {
    mql = createMql(query);
    mqlRegistry.set(query, mql);
  }
  mql.matches = matches;
  const evt = { matches, media: query } as MediaQueryListEvent;
  mql._listeners.forEach((cb) => cb(evt));
}

afterEach(() => {
  // Reset URL between tests
  window.history.replaceState(null, '', '/');
  // Reset matchMedia state
  mqlRegistry.clear();
});
