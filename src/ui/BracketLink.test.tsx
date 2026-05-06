// src/ui/BracketLink.test.tsx
//
// Coverage for the additive Phase 2 props (as / active / onClick / aria*) and
// verification that Phase 1's anchor contract is preserved verbatim.
//
// Source: 02-RESEARCH.md Pattern 6; 02-UI-SPEC.md § View toggle (D-09)

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { BracketLink } from './BracketLink';

describe('BracketLink', () => {
  describe('default (as="a") — Phase 1 contract preserved', () => {
    it('renders <a href> with bracketed children', () => {
      render(<BracketLink href="/about">about</BracketLink>);
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/about');
      expect(link.textContent).toBe('[about]');
    });

    it('external prop adds target="_blank" + rel="noopener noreferrer"', () => {
      render(
        <BracketLink href="https://github.com/x" external>
          GitHub
        </BracketLink>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('download prop adds download attribute', () => {
      render(
        <BracketLink href="/cv.pdf" download="cv.pdf">
          CV
        </BracketLink>,
      );
      expect(screen.getByRole('link')).toHaveAttribute('download', 'cv.pdf');
    });

    it('inner span carries text-accent by default', () => {
      render(<BracketLink href="/x">x</BracketLink>);
      const inner = screen.getByText('x');
      expect(inner.className).toContain('text-accent');
    });
  });

  describe('as="button" — Phase 2 toggle-button form', () => {
    it('renders a <button type="button"> instead of an <a>', () => {
      render(
        <BracketLink as="button" onClick={() => {}}>
          3d
        </BracketLink>,
      );
      const btn = screen.getByRole('button');
      expect(btn.tagName).toBe('BUTTON');
      expect(btn).toHaveAttribute('type', 'button');
      expect(btn.textContent).toBe('[3d]');
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(
        <BracketLink as="button" onClick={onClick}>
          text
        </BracketLink>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('aria-label is forwarded to the button element', () => {
      render(
        <BracketLink as="button" onClick={() => {}} ariaLabel="Dismiss notification">
          ×
        </BracketLink>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('aria-pressed is forwarded for toggle-button pattern', () => {
      render(
        <BracketLink as="button" onClick={() => {}} ariaPressed={true}>
          3d
        </BracketLink>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('active prop — persistent inversion', () => {
    it('active=true gives wrapper bg-accent + text-bg classes', () => {
      render(
        <BracketLink as="button" onClick={() => {}} active>
          3d
        </BracketLink>,
      );
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('bg-accent');
      expect(btn.className).toContain('text-bg');
    });

    it('active=true flips inner span to text-bg', () => {
      render(
        <BracketLink as="button" onClick={() => {}} active>
          3d
        </BracketLink>,
      );
      const inner = screen.getByText('3d');
      expect(inner.className).toContain('text-bg');
    });

    it('active=false (default) keeps inner span text-accent', () => {
      render(
        <BracketLink as="button" onClick={() => {}}>
          text
        </BracketLink>,
      );
      const inner = screen.getByText('text');
      expect(inner.className).toContain('text-accent');
    });
  });
});
