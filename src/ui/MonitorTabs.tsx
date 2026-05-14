// src/ui/MonitorTabs.tsx
//
// Tab bar + 5-way content router for the single-ultrawide-monitor scene.
//
// Tab labels: terminal-style bracket buttons (BracketLink as="button" active=…)
//   [ whoami ] [ projects ] [ writeups ] [ certs ] [ contact ]
// Active tab uses BracketLink's `active` prop → bg-accent / text-bg inversion
// (Phase 2 D-09 toggle pattern, same visual language as the 2D shell's
// view-toggle).
//
// Tab content router: pulls from existing single-source-of-truth section
// components — adding new content to src/content/* updates both the text
// shell and this surface automatically (Phase 3 D-04 invariant preserved).
//
//   whoami   → <WhoamiGreeting /> + <About /> + <Skills />
//   projects → <Projects />
//   writeups → <WriteupsMonitor />
//   certs    → <Certs />
//   contact  → <ContactForm /> + <LiveProfilesShortcut />
//
// Tab bar is sticky inside the <MonitorOverlay> scroll container so it
// stays pinned at the top of the monitor as the user scrolls long tab
// content (long projects list, full whoami body). bg-bg on the sticky
// element prevents emissive bleed-through (Phase 3 anti-emissive-bleed
// pattern from CenterMonitorContent).

import { useTabStore, MONITOR_TABS, type MonitorTab } from '../store/tabStore';
import { BracketLink } from './BracketLink';
import { WhoamiGreeting } from './WhoamiGreeting';
import { About } from '../sections/About';
import { Skills } from '../sections/Skills';
import { Projects } from '../sections/Projects';
import { WriteupsMonitor } from './WriteupsMonitor';
import { Certs } from '../sections/Certs';
import { ContactForm } from './ContactForm';
import { LiveProfilesShortcut } from './LiveProfiles';

const TAB_LABELS: Record<MonitorTab, string> = {
  whoami: 'whoami',
  projects: 'projects',
  writeups: 'writeups',
  certs: 'certs',
  contact: 'contact',
};

function TabPanel({ tab }: { tab: MonitorTab }) {
  switch (tab) {
    case 'whoami':
      return (
        <div className="space-y-6">
          <WhoamiGreeting />
          <About />
          <Skills />
        </div>
      );
    case 'projects':
      return <Projects />;
    case 'writeups':
      return <WriteupsMonitor />;
    case 'certs':
      return <Certs />;
    case 'contact':
      return (
        <div className="space-y-6">
          <ContactForm />
          <LiveProfilesShortcut />
        </div>
      );
  }
}

export function MonitorTabs() {
  const activeTab = useTabStore((s) => s.activeTab);
  const setActiveTab = useTabStore((s) => s.setActiveTab);

  return (
    <div className="flex flex-col">
      {/* Toggle-button group, NOT a true ARIA tablist — using role=tablist
          would require role=tab children (the WAI-ARIA "required children"
          constraint Lighthouse audits). We already give each <button> an
          aria-pressed state via BracketLink, which is the correct toggle
          pattern; role=group + aria-label is the parent contract. */}
      <div
        role="group"
        aria-label="Monitor sections"
        className="sticky top-0 bg-bg z-10 flex flex-wrap gap-x-2 gap-y-1 pb-2 border-b border-surface-1"
      >
        {MONITOR_TABS.map((tab) => (
          <BracketLink
            key={tab}
            as="button"
            active={tab === activeTab}
            ariaPressed={tab === activeTab}
            ariaLabel={`Show ${TAB_LABELS[tab]} tab`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </BracketLink>
        ))}
      </div>
      <div aria-label={`${TAB_LABELS[activeTab]} content`} className="mt-2">
        <TabPanel tab={activeTab} />
      </div>
    </div>
  );
}
