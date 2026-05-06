// src/ui/ContextLossBar.test.tsx
//
// Coverage for the four key behaviours of the context-loss info bar:
//   1. Renders the UI-SPEC body copy on mount.
//   2. Auto-dismisses after 8000ms (vi fake timers).
//   3. [×] click dismisses immediately.
//   4. [retry 3D] click triggers window.location.assign with the right path.
//
// Source: 02-UI-SPEC.md § Context-loss info bar (D-13); § <ContextLossBar>
//         layout; 02-CONTEXT.md D-13, D-14

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ContextLossBar } from './ContextLossBar';

describe('ContextLossBar', () => {
  describe('on mount', () => {
    it('renders the verbatim UI-SPEC body copy', () => {
      render(<ContextLossBar />);
      expect(
        screen.getByText("3D scene unavailable on this device. You're on the text shell."),
      ).toBeInTheDocument();
    });

    it('renders [!] warn glyph as decorative (aria-hidden)', () => {
      const { container } = render(<ContextLossBar />);
      const warnGlyph = container.querySelector('span[aria-hidden="true"]');
      expect(warnGlyph?.textContent).toBe('[!]');
    });

    it('exposes role="status" with aria-live="polite" for screen readers', () => {
      render(<ContextLossBar />);
      const bar = screen.getByRole('status');
      expect(bar).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('auto-dismiss timer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-dismisses after 8000ms', () => {
      render(<ContextLossBar />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not dismiss before 8000ms', () => {
      render(<ContextLossBar />);
      act(() => {
        vi.advanceTimersByTime(7999);
      });
      expect(screen.queryByRole('status')).toBeInTheDocument();
    });
  });

  describe('manual dismiss via [×]', () => {
    it('clicking [×] removes the bar immediately', () => {
      render(<ContextLossBar />);
      const dismissBtn = screen.getByRole('button', { name: 'Dismiss notification' });
      fireEvent.click(dismissBtn);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('[retry 3D] reload', () => {
    it('clicking [retry 3D] calls window.location.assign with pathname + "?view=3d"', () => {
      const assignSpy = vi.fn();
      // Replace window.location with a controllable stub. Use Object.defineProperty
      // because window.location is a non-writable getter on jsdom.
      const original = window.location;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...original, pathname: '/Portfolio_Website/', assign: assignSpy },
      });

      try {
        render(<ContextLossBar />);
        const retry = screen.getByRole('link', { name: /retry 3D/i });
        fireEvent.click(retry);
        expect(assignSpy).toHaveBeenCalledWith('/Portfolio_Website/?view=3d');
      } finally {
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: original,
        });
      }
    });
  });
});
