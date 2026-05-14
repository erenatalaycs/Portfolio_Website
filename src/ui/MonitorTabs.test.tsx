// src/ui/MonitorTabs.test.tsx
//
// Render contract for the tab bar + content router. The deep content
// (Projects, Certs, WriteupsMonitor, ContactForm, About, Skills) is
// covered by their own tests; here we only assert the tab-bar contract
// itself: roles, ARIA, active state, click → switch.

import { describe, beforeEach, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonitorTabs } from './MonitorTabs';
import { useTabStore } from '../store/tabStore';

describe('<MonitorTabs />', () => {
  beforeEach(() => {
    useTabStore.setState({ activeTab: 'whoami' });
  });

  it('renders a labelled toggle-button group with 5 buttons', () => {
    render(<MonitorTabs />);
    const group = screen.getByRole('group', { name: /monitor sections/i });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show whoami tab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show projects tab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show writeups tab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show certs tab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show contact tab/i })).toBeInTheDocument();
  });

  it('marks the active tab with aria-pressed=true and others with false', () => {
    render(<MonitorTabs />);
    const whoami = screen.getByRole('button', { name: /show whoami tab/i });
    const projects = screen.getByRole('button', { name: /show projects tab/i });
    expect(whoami).toHaveAttribute('aria-pressed', 'true');
    expect(projects).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the whoami panel by default', () => {
    render(<MonitorTabs />);
    // Panel content is labelled by aria-label on a generic div (no role).
    expect(screen.getByLabelText(/whoami content/i)).toBeInTheDocument();
  });

  it('clicking a different tab switches the panel and shifts aria-pressed', () => {
    render(<MonitorTabs />);
    const projectsBtn = screen.getByRole('button', { name: /show projects tab/i });
    fireEvent.click(projectsBtn);
    expect(useTabStore.getState().activeTab).toBe('projects');
    expect(projectsBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(/projects content/i)).toBeInTheDocument();
  });

  it('each tab id is reachable via direct store mutation', () => {
    const { rerender } = render(<MonitorTabs />);
    for (const tab of ['whoami', 'projects', 'writeups', 'certs', 'contact'] as const) {
      useTabStore.setState({ activeTab: tab });
      rerender(<MonitorTabs />);
      expect(screen.getByLabelText(new RegExp(`${tab} content`, 'i'))).toBeInTheDocument();
    }
  });
});
