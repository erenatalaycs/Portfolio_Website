// src/3d/ScenePostprocessing.test.tsx
//
// Tier-flip state-machine tests. Mocks drei <PerformanceMonitor> and
// <PostFX> so jsdom can render without WebGL (CLAUDE.md "Don't try to
// unit-test 3D scenes in jsdom").
//
// Source: 04-RESEARCH.md § Validation Architecture > Wave 0 Gaps

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ScenePostprocessing } from './ScenePostprocessing';

type Handler = () => void;

// Mutable handler bag captured from the mocked <PerformanceMonitor> on
// every render. Reset in beforeEach so tests don't share state.
const captured: {
  onIncline?: Handler;
  onDecline?: Handler;
  onFallback?: Handler;
} = {};

vi.mock('@react-three/drei', () => ({
  PerformanceMonitor: (props: {
    onIncline?: Handler;
    onDecline?: Handler;
    onFallback?: Handler;
  }) => {
    captured.onIncline = props.onIncline;
    captured.onDecline = props.onDecline;
    captured.onFallback = props.onFallback;
    return <div data-testid="perf-monitor" />;
  },
}));

vi.mock('./PostFX', () => ({
  PostFX: () => <div data-testid="post-fx" />,
}));

beforeEach(() => {
  captured.onIncline = undefined;
  captured.onDecline = undefined;
  captured.onFallback = undefined;
});

describe('ScenePostprocessing', () => {
  it('renders PerformanceMonitor and starts on high tier (PostFX visible)', async () => {
    render(<ScenePostprocessing />);
    expect(screen.getByTestId('perf-monitor')).toBeInTheDocument();
    // PostFX is lazy-loaded; await its appearance (Suspense flush).
    expect(await screen.findByTestId('post-fx')).toBeInTheDocument();
  });

  it('onDecline flips tier to low and unmounts PostFX', async () => {
    render(<ScenePostprocessing />);
    await screen.findByTestId('post-fx');
    expect(captured.onDecline).toBeDefined();
    await act(async () => {
      captured.onDecline?.();
    });
    expect(screen.queryByTestId('post-fx')).not.toBeInTheDocument();
  });

  it('onFallback locks tier to low (oscillation guard)', async () => {
    render(<ScenePostprocessing />);
    await screen.findByTestId('post-fx');
    expect(captured.onFallback).toBeDefined();
    await act(async () => {
      captured.onFallback?.();
    });
    expect(screen.queryByTestId('post-fx')).not.toBeInTheDocument();
  });

  it('onIncline brings tier back to high after a decline', async () => {
    render(<ScenePostprocessing />);
    await screen.findByTestId('post-fx');
    await act(async () => {
      captured.onDecline?.();
    });
    expect(screen.queryByTestId('post-fx')).not.toBeInTheDocument();
    await act(async () => {
      captured.onIncline?.();
    });
    expect(await screen.findByTestId('post-fx')).toBeInTheDocument();
  });
});
