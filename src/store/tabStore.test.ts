// src/store/tabStore.test.ts
//
// Unit tests for the monitor tab zustand store.
//
// zustand stores in vitest are shared across tests by default. Each test
// resets to the initial state before running so order-independence holds.

import { beforeEach, describe, expect, it } from 'vitest';
import { MONITOR_TABS, useTabStore, type MonitorTab } from './tabStore';

describe('tabStore', () => {
  beforeEach(() => {
    useTabStore.setState({ activeTab: 'whoami' });
  });

  it('defaults to whoami', () => {
    expect(useTabStore.getState().activeTab).toBe('whoami');
  });

  it('setActiveTab switches the active tab', () => {
    useTabStore.getState().setActiveTab('projects');
    expect(useTabStore.getState().activeTab).toBe('projects');
  });

  it('MONITOR_TABS contains exactly the five known tab ids in order', () => {
    expect(MONITOR_TABS).toEqual<MonitorTab[]>([
      'whoami',
      'projects',
      'writeups',
      'certs',
      'contact',
    ]);
  });

  it('every MONITOR_TABS id is accepted by setActiveTab', () => {
    for (const tab of MONITOR_TABS) {
      useTabStore.getState().setActiveTab(tab);
      expect(useTabStore.getState().activeTab).toBe(tab);
    }
  });
});
