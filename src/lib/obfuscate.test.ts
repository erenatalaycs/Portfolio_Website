// src/lib/obfuscate.test.ts
//
// Tests for the rot13 + decodeEmail pair. Round-trip is verified by encoding
// a known plaintext via `btoa(rot13(plaintext))` (the same pipeline
// scripts/encode-email.mjs uses) and checking decodeEmail reverses it.
// Source: 01-03-PLAN.md Task 2 Step 2.2

import { describe, expect, it } from 'vitest';
import { rot13, decodeEmail } from './obfuscate';

describe('rot13', () => {
  it('rotates lowercase letters by 13 (a → n, b → o, …)', () => {
    expect(rot13('a')).toBe('n');
    expect(rot13('n')).toBe('a');
    expect(rot13('hello')).toBe('uryyb');
  });

  it('rotates uppercase letters by 13 (A → N, B → O, …)', () => {
    expect(rot13('A')).toBe('N');
    expect(rot13('HELLO')).toBe('URYYB');
  });

  it('passes non-alphabet characters through unchanged', () => {
    expect(rot13('eren@example.com')).toBe('rera@rknzcyr.pbz');
  });

  it('is an involution (rot13(rot13(s)) === s)', () => {
    const inputs = ['eren@example.com', 'Hello, World! 1234', '', 'AbC.dEf+1@x.y'];
    for (const s of inputs) {
      expect(rot13(rot13(s))).toBe(s);
    }
  });
});

describe('decodeEmail', () => {
  it('round-trips a known plaintext through rot13+base64', () => {
    const plaintext = 'eren@example.com';
    // Encode the way scripts/encode-email.mjs does:
    const encoded = btoa(rot13(plaintext));
    expect(decodeEmail(encoded)).toBe(plaintext);
  });

  it('round-trips an empty string', () => {
    const encoded = btoa(rot13(''));
    expect(decodeEmail(encoded)).toBe('');
  });

  it('does not mutate the encoded input', () => {
    const encoded = btoa(rot13('user@host.tld'));
    const before = encoded;
    decodeEmail(encoded);
    expect(encoded).toBe(before);
  });
});
