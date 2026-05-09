// src/ui/LiveProfiles.test.tsx
//
// Phase 4 CTC-03 — render-variant coverage for <LiveProfiles /> and
// <LiveProfilesShortcut />. Three variants (CONTEXT D-13):
//   1. BOTH platforms set    → list with two rows + shortcut with two links
//   2. ONLY THM set          → list with one row + shortcut with one link
//   3. NEITHER set           → both components return null (no DOM at all)
//
// `vi.mock` swaps the identity module per describe-block. We use
// `vi.hoisted()` so the mock factory can read fixture objects defined
// before module evaluation, then `vi.resetModules()` + dynamic
// `await import('./LiveProfiles')` so each describe-block gets a fresh
// component bound to its own identity fixture.
//
// External BracketLink contract (target="_blank" rel="noopener noreferrer")
// is covered by BracketLink.test.tsx — we don't re-prove it here. We DO
// assert the `external` prop reaches the DOM (target attribute present).
//
// Source: 04-03-PLAN.md Task 2; 04-UI-SPEC.md § Live profiles sub-list

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const fixtures = vi.hoisted(() => ({
  both: {
    name: 'Eren Atalay',
    role: 'x',
    location: 'x',
    github: 'x',
    linkedin: 'x',
    emailEncoded: 'x',
    cvFilename: 'x',
    homeLocationLabel: 'x',
    ogImageFilename: 'x',
    status: 'x',
    tryHackMeUrl: 'https://tryhackme.com/p/volvoxkill',
    tryHackMeHandle: 'volvoxkill',
    hackTheBoxUrl: 'https://app.hackthebox.com/users/1704641',
    hackTheBoxHandle: 'volvoxkill',
  },
  thmOnly: {
    name: 'Eren Atalay',
    role: 'x',
    location: 'x',
    github: 'x',
    linkedin: 'x',
    emailEncoded: 'x',
    cvFilename: 'x',
    homeLocationLabel: 'x',
    ogImageFilename: 'x',
    status: 'x',
    tryHackMeUrl: 'https://tryhackme.com/p/volvoxkill',
    tryHackMeHandle: 'volvoxkill',
    // hackTheBoxUrl deliberately undefined
    // hackTheBoxHandle deliberately undefined
  },
  neither: {
    name: 'Eren Atalay',
    role: 'x',
    location: 'x',
    github: 'x',
    linkedin: 'x',
    emailEncoded: 'x',
    cvFilename: 'x',
    homeLocationLabel: 'x',
    ogImageFilename: 'x',
    status: 'x',
    // all four live-profile fields undefined
  },
  thmUrlNoHandle: {
    name: 'Eren Atalay',
    role: 'x',
    location: 'x',
    github: 'x',
    linkedin: 'x',
    emailEncoded: 'x',
    cvFilename: 'x',
    homeLocationLabel: 'x',
    ogImageFilename: 'x',
    status: 'x',
    tryHackMeUrl: 'https://tryhackme.com/p/volvoxkill',
    // tryHackMeHandle undefined — the row should still render the link, just no @handle
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.doUnmock('../content/identity');
});

describe('LiveProfiles + LiveProfilesShortcut', () => {
  describe('BOTH platforms set', () => {
    it('renders both rows in the sub-list with handle annotations', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.both }));
      const { LiveProfiles } = await import('./LiveProfiles');
      render(<LiveProfiles />);

      // Heading uses TerminalPrompt — the visible text after `$ ` is the command.
      expect(screen.getByText('ls certs/live-profiles/')).toBeInTheDocument();

      // Both BracketLinks rendered as anchors with `external` (target=_blank).
      const thm = screen.getByRole('link', { name: '[TryHackMe profile]' });
      const htb = screen.getByRole('link', { name: '[HackTheBox profile]' });
      expect(thm).toHaveAttribute('href', 'https://tryhackme.com/p/volvoxkill');
      expect(thm).toHaveAttribute('target', '_blank');
      expect(thm).toHaveAttribute('rel', 'noopener noreferrer');
      expect(htb).toHaveAttribute('href', 'https://app.hackthebox.com/users/1704641');
      expect(htb).toHaveAttribute('target', '_blank');
      expect(htb).toHaveAttribute('rel', 'noopener noreferrer');

      // Handle annotations rendered in muted color.
      expect(screen.getAllByText('@volvoxkill')).toHaveLength(2);
    });

    it('renders the shortcut line with both links and a "See also:" lead-in', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.both }));
      const { LiveProfilesShortcut } = await import('./LiveProfiles');
      render(<LiveProfilesShortcut />);

      expect(screen.getByText('See also:')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '[TryHackMe profile]' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '[HackTheBox profile]' })).toBeInTheDocument();
    });
  });

  describe('ONLY TryHackMe set', () => {
    it('renders only the THM row in the sub-list — no HTB row, no empty placeholder', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.thmOnly }));
      const { LiveProfiles } = await import('./LiveProfiles');
      render(<LiveProfiles />);

      // Heading still renders (sitemap-target survives per CONTEXT D-13).
      expect(screen.getByText('ls certs/live-profiles/')).toBeInTheDocument();
      // THM row present.
      expect(screen.getByRole('link', { name: '[TryHackMe profile]' })).toBeInTheDocument();
      // HTB row NOT present.
      expect(screen.queryByRole('link', { name: '[HackTheBox profile]' })).not.toBeInTheDocument();
    });

    it('shortcut renders only the THM link', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.thmOnly }));
      const { LiveProfilesShortcut } = await import('./LiveProfiles');
      render(<LiveProfilesShortcut />);

      expect(screen.getByText('See also:')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '[TryHackMe profile]' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: '[HackTheBox profile]' })).not.toBeInTheDocument();
    });
  });

  describe('NEITHER platform set', () => {
    it('LiveProfiles returns null — no DOM at all', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.neither }));
      const { LiveProfiles } = await import('./LiveProfiles');
      const { container } = render(<LiveProfiles />);
      expect(container.firstChild).toBeNull();
    });

    it('LiveProfilesShortcut returns null — no DOM at all', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.neither }));
      const { LiveProfilesShortcut } = await import('./LiveProfiles');
      const { container } = render(<LiveProfilesShortcut />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('platform URL set without a handle', () => {
    it('still renders the BracketLink but omits the @handle muted span', async () => {
      vi.doMock('../content/identity', () => ({ identity: fixtures.thmUrlNoHandle }));
      const { LiveProfiles } = await import('./LiveProfiles');
      render(<LiveProfiles />);

      expect(screen.getByRole('link', { name: '[TryHackMe profile]' })).toBeInTheDocument();
      // No @handle muted text rendered.
      expect(screen.queryByText(/^@/)).not.toBeInTheDocument();
    });
  });
});
