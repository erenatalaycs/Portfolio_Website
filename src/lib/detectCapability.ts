// src/lib/detectCapability.ts
//
// Synchronous capability heuristic for Phase 2 (3D-02). One-shot — no
// matchMedia subscription, no re-runs. Per D-12, this runs every page
// load fresh; no client-side caching layer. Per D-03, hardware-only
// checks; no NetworkInformation API (Safari doesn't expose it).
//
// Returns { pass: boolean; reasons: string[] }. The reasons array is for
// dev-only debugging and (later) Plan 07 OPSEC checklist; never exposed
// to end users. DEV-gated console.debug logs the reasons during local
// testing only — production build strips the entire branch via Vite's
// import.meta.env.DEV dead-code elimination.
//
// Source: 02-CONTEXT.md D-01 (tablet handling), D-02 (?view=3d bypass —
// consumed by App.tsx, NOT this file), D-03 (no network check);
// 02-RESEARCH.md Pattern 2 (canonical 2026 implementation)

export interface CapabilityResult {
  pass: boolean;
  reasons: string[];
}

export function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

export function isIpad(): boolean {
  // iPadOS 13+ advertises as 'Macintosh' UA — must use maxTouchPoints to
  // disambiguate from a real Mac. Source:
  //   https://developer.apple.com/forums/thread/119186
  //   https://www.aworkinprogress.dev/detect-iPad-from-Mac
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (ua.includes('iPad')) return true;
  if (
    navigator.platform === 'MacIntel' &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  ) {
    return true;
  }
  return false;
}

export function isAndroidTablet(): boolean {
  // Android tablets typically OMIT 'Mobile' in their UA; phones include it.
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return ua.includes('Android') && !ua.includes('Mobile');
}

export function isPhone(): boolean {
  // Phone = mobile UA AND NOT tablet (D-01 — modern tablets pass through
  // to 3D shell).
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent;
  if (isIpad() || isAndroidTablet()) return false;
  return /Mobi|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectCapability(): CapabilityResult {
  const reasons: string[] = [];

  if (!hasWebGL2()) reasons.push('no-webgl2');
  if (prefersReducedMotion()) reasons.push('reduced-motion');
  if (isPhone()) reasons.push('phone');

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof deviceMemory === 'number' && deviceMemory < 4) reasons.push('low-memory');

  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    reasons.push('low-concurrency');
  }

  const result: CapabilityResult = { pass: reasons.length === 0, reasons };

  // DEV-only logging — stripped at build time by Vite's dead-code
  // elimination on import.meta.env.DEV. Production console emits nothing
  // about UA / hardware (security_context "no UA fingerprinting in prod").
  if (import.meta.env.DEV) {
    console.debug('[detectCapability]', result);
  }

  return result;
}
