// src/content/identity.test.ts
//
// Phase 4 CTC-03 — guard the four optional live-profile fields shipped by
// Plan 04-03. These tests pin the runtime presence of `tryHackMeUrl` /
// `tryHackMeHandle` / `hackTheBoxUrl` / `hackTheBoxHandle` for the
// `volvoxkill` handle Eren supplied at execution time. If a future change
// re-removes the fields, this test fails loudly so the live-profile UX
// regresses visibly rather than silently.
//
// Source: 04-03-PLAN.md Task 1 + STATE.md "Phase 4 Human Decisions Captured"

import { describe, it, expect } from 'vitest';
import { identity } from './identity';

describe('identity (Phase 4 CTC-03 live profiles)', () => {
  it('exposes a TryHackMe profile URL pointing at the canonical TryHackMe domain', () => {
    expect(identity.tryHackMeUrl).toMatch(/^https:\/\/tryhackme\.com\//);
  });

  it('exposes a TryHackMe handle of `volvoxkill`', () => {
    expect(identity.tryHackMeHandle).toBe('volvoxkill');
  });

  it('exposes a HackTheBox profile URL pointing at the canonical HackTheBox domain', () => {
    expect(identity.hackTheBoxUrl).toMatch(/^https:\/\/app\.hackthebox\.com\//);
  });

  it('exposes a HackTheBox handle of `volvoxkill`', () => {
    expect(identity.hackTheBoxHandle).toBe('volvoxkill');
  });
});
