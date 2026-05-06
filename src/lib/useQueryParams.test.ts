// src/lib/useQueryParams.test.ts
//
// Tests for the useQueryParams + setQueryParams pair. Runs against jsdom.
// Source: 01-03-PLAN.md Task 1 Step 1.8

import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQueryParams, setQueryParams } from './useQueryParams';

describe('useQueryParams', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('returns URLSearchParams reflecting window.location.search', () => {
    window.history.replaceState(null, '', '/?view=text&focus=projects');
    const { result } = renderHook(() => useQueryParams());
    expect(result.current.get('view')).toBe('text');
    expect(result.current.get('focus')).toBe('projects');
  });

  it('updates when setQueryParams is called', () => {
    window.history.replaceState(null, '', '/');
    const { result } = renderHook(() => useQueryParams());
    expect(result.current.get('focus')).toBeNull();
    act(() => setQueryParams({ focus: 'projects' }));
    expect(result.current.get('focus')).toBe('projects');
  });

  it('removes a key when setQueryParams passes null', () => {
    window.history.replaceState(null, '', '/?focus=projects');
    const { result } = renderHook(() => useQueryParams());
    expect(result.current.get('focus')).toBe('projects');
    act(() => setQueryParams({ focus: null }));
    expect(result.current.get('focus')).toBeNull();
  });

  it('reacts to popstate events', () => {
    window.history.replaceState(null, '', '/');
    const { result } = renderHook(() => useQueryParams());
    act(() => {
      window.history.replaceState(null, '', '/?view=3d');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.get('view')).toBe('3d');
  });
});
