# Feature Research

**Domain:** Junior cybersecurity analyst portfolio website (3D hacker workstation, terminal aesthetic, GitHub Pages, UK job market)
**Researched:** 2026-05-06
**Confidence:** HIGH for content/sections (multiple converging sources: Artem Polynko, Cyber Security District, FolioX, surveyed live portfolios). MEDIUM for cliches/anti-features (synthesised from cyber branding guidance + general design wisdom). MEDIUM for accessibility specifics on 3D scenes (WCAG 2.2 generally settled, R3F-specific patterns less codified).

## Summary

A junior cyber portfolio is **content-led, not coding-led**. Unlike a developer portfolio (where the site itself is often the work), here the site is a *vehicle* for evidence: certifications earned, labs built, write-ups published, profiles on TryHackMe/HackTheBox. Recruiters skim in 10 seconds for: name, role label, location, CV link, contact, GitHub, LinkedIn. Hiring managers go deeper into write-ups and lab evidence.

The 3D scene is a differentiator, **not a substitute for the content**. The dual-audience constraint (recruiter skimmers + technical hiring managers) means every piece of content must be reachable in two ways: through the immersive 3D path *and* through a fast 2D path. Anti-features cluster around three failures: (1) cyber clichés (Matrix rain, padlock motif, fake hacker GIFs), (2) overstating skills for a junior (claiming "ethical hacker" or "pentester" when the evidence is TryHackMe rooms), and (3) form-over-function (unreadable green-on-black, gimmicks that block the CV).

## Feature Landscape

### Table Stakes (Recruiters/Hiring Managers Expect These)

Missing any of these and the visitor either bounces or silently downgrades the candidate. These are the minimum viable bar for a 2026 cyber portfolio.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Name + role label above the fold** | Recruiter must know "who, what" in <5 seconds. "Eren Atalay — Junior Cybersecurity Analyst" | LOW | Must be in 2D fallback AND visible immediately in 3D (not hidden behind a load) |
| **CV / resume PDF download** | Recruiters need the document for ATS, sharing internally, and offline reference | LOW | Single button, direct link to `cv.pdf` in repo. Filename should be `Eren-Atalay-CV.pdf` for readability when downloaded |
| **Direct contact email** | The single most important conversion action. Must be obfuscated against scrapers but trivial for humans | LOW | Either JS-rendered `mailto:`, image, or static form-handler (Formspree, Web3Forms). Avoid `<a href="mailto:">` in raw HTML |
| **LinkedIn link** | Recruiters live in LinkedIn. They will click through to validate identity, see endorsements, message you | LOW | External link with `rel="noopener"` and `target="_blank"` |
| **GitHub link** | Cyber managers verify code quality, README discipline, commit history. Empty/abandoned GitHub = red flag | LOW | Pin 3-5 best repos on the GitHub profile itself; portfolio links to the profile |
| **About / bio section** | Establishes the person behind the candidate, location (UK), career arc (CS grad → currently QA → seeking cyber) | LOW | 2-4 sentences, honest framing — junior breaking into cyber, not "experienced pentester" |
| **Education** | Junior candidates lean on this; UK recruiters expect to see degree + institution + year | LOW | Degree, institution, graduation year, relevant coursework (e.g. "Network Security", "Cryptography") |
| **Certifications section** | Cyber is cert-heavy. Even "in progress" entries (CompTIA Security+, BTL1, Google Cybersecurity Cert) signal commitment | LOW | List with issuer, date, credential ID/badge link if available. Mark "in progress" honestly |
| **Skills section (tools, not buzzwords)** | Recruiters keyword-search; hiring managers want specifics. "Wireshark, Nmap, Burp Suite, Splunk, Linux, Python" beats "expert in cybersecurity" | LOW | Group by category (Network, Offensive, Defensive, Scripting, OS). Avoid % bars or star ratings — they look childish for technical roles |
| **Projects / labs section** | The single most important content area. Demonstrates *applied* skill | MEDIUM | 3-5 projects minimum. Each: title, tools used, what was done, what was learned, link to write-up/repo |
| **CTF / lab write-ups** | The cyber-specific equivalent of "shipped products". Methodology > points scored | MEDIUM | Even 2-3 well-written write-ups beat a long list of completions. Include screenshots of tool output, redacted where appropriate |
| **Public CTF profile links** | TryHackMe, HackTheBox profiles are *verifiable* third-party evidence. Some recruiters check ranks/streaks | LOW | Link out to public profile pages. Optionally embed live badge widgets |
| **Responsive / mobile usable** | Recruiters often open links from LinkedIn on phones. A broken-on-mobile site is a hard fail | MEDIUM | 2D fallback handles this; 3D may degrade or auto-fall-back on mobile |
| **Fast first paint (skim path)** | Recruiters give 10 seconds. If 3D is still loading, they're gone | MEDIUM | 2D fallback or skim panel must render in <2s. Lazy-load 3D after the skim path is interactive |
| **Decent SEO basics** | Recruiters Google "Eren Atalay cybersecurity" — own the first result | LOW | `<title>`, meta description, OpenGraph image, JSON-LD `Person` schema, sitemap, semantic HTML |
| **Accessibility floor** | Some recruiters use assistive tech; UK public sector applications may screen for it. Also: cyber = trust, and an inaccessible site signals carelessness | MEDIUM | `prefers-reduced-motion` honoured, keyboard-navigable, alt text, ARIA on 3D canvas with text equivalent |
| **HTTPS + clean security headers** | A cyber candidate's own site failing basic security hygiene is humiliating | LOW | GitHub Pages gives HTTPS free. Add CSP via `<meta>` tag, no inline scripts where avoidable |
| **No broken links / dead images** | Care signal. A cyber person who can't keep a 5-page site working raises questions | LOW | Pre-deploy link check |
| **Copyright/last-updated footer** | Signals the site is alive, not abandoned in 2022 | LOW | Year auto-updated; "last updated" optional but useful |

### Differentiators (Competitive Advantage for a Junior Cyber Analyst)

These are where a junior portfolio actually moves the needle. The 3D scene is one of these — it should not crowd out the others.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **3D hacker-workstation scene** | Memorable, on-brand, shows technical range (3D isn't trivial). Hiring managers will mention it when forwarding the link internally | HIGH | The whole point is signal — but only if it loads, doesn't crash, and has a 2D escape hatch. A broken 3D scene is *worse* than no 3D scene |
| **2D "skim mode" / "view as text resume" toggle** | Explicitly serves recruiter audience. Demonstrates UX thinking, accessibility care, and respect for their time | MEDIUM | Could be a button in the corner "skim version", or auto-served on slow connections. ATS-friendly text version is bonus |
| **Animated `whoami` terminal greeting** | Sets aesthetic instantly, on-brand for cyber, conveys identity quickly | LOW | Must be readable — type-out is fine but freeze final state long enough to read; respect `prefers-reduced-motion` (skip to final state) |
| **In-depth project/write-up pages with real artifacts** | Lab screenshots (Wireshark captures, Splunk dashboards, Nmap output, Burp request/response). Hiring managers can verify methodology | MEDIUM | Markdown/MDX-rendered. Include diagrams, redacted screenshots, command transcripts. Link to repo for full evidence |
| **Home lab architecture diagram** | A diagram of "my SOC home lab" (pfSense / Kali / AD / Wazuh / Splunk topology) is instantly recognisable as serious | LOW | Even a simple Mermaid or hand-drawn diagram is enough. Caption it: what's running, why |
| **Specific tool callouts on the workstation** | The 3D monitors can themselves *be* the showcase: terminal monitor, Wireshark monitor, Burp monitor, etc. Tools-as-content | MEDIUM | Maps neatly to the workstation metaphor; needs careful UX so each monitor's content is clear |
| **MITRE ATT&CK / NIST mapping in write-ups** | Signals professional vocabulary. "Detected T1110 brute force via Splunk SPL" reads more senior than "stopped a hacker" | LOW | Add a tag/mapping line per write-up. Don't fake it — only map what genuinely applies |
| **Live GitHub repo embeds / commit activity** | Shows the work is *current*, not from 2024 | MEDIUM | GitHub README badges, last-commit timestamps, contribution graph. Avoid full API calls at runtime on a static site (rate limits) |
| **TryHackMe / HackTheBox live badges** | Third-party-verified rank, streak, completion. Updates automatically | LOW | Both platforms publish badge URLs. HTB has SVG badges; TryHackMe has card-style badges |
| **PGP public key + fingerprint** | Niche but distinctive for cyber — shows you actually use the tools you list. Lets technical contacts encrypt mail to you | LOW | Publish key fingerprint + link to keyserver or repo-hosted `.asc`. Only do this if you'll actually maintain the key — a stale key is worse than none |
| **Contact form with reasonable spam protection** | Lower friction than `mailto:` for non-technical recruiters. Static form-handler (Formspree, Web3Forms, Formsubmit) keeps it serverless | MEDIUM | Honeypot field + form-handler is enough; don't add CAPTCHA unless spam is actually a problem |
| **OpenGraph + Twitter card** | When the link is shared on LinkedIn / Slack / Teams, a proper preview card is a professionalism signal | LOW | OG image (1200×630), title, description. Custom image > generic |
| **JSON-LD `Person` schema** | Helps Google build a knowledge panel for "Eren Atalay" — controls the first-impression search result | LOW | One `<script type="application/ld+json">` block. Includes name, jobTitle, sameAs (LinkedIn, GitHub), alumniOf |
| **Tasteful keyboard shortcuts (`?` for help, `g h` go home)** | On-brand for cyber/terminal aesthetic, signals power-user UX awareness, helps screen-reader/keyboard users too | MEDIUM | Don't replace mouse navigation — augment it. Always show a `?` cheat sheet |
| **Subtle Easter egg in `view-source` or `/robots.txt`** | Cyber-culture wink: a comment, an ASCII banner, a secret route. Hiring managers who notice it will smile | LOW | Strictly *subtle*. Not a "hack the planet" GIF. A clean ASCII signature in a comment is plenty |
| **Custom 404 page in terminal style** | Cheap, on-brand, signals care for edge cases | LOW | "command not found: /nonexistent" |
| **Honest "currently learning / next cert" section** | A junior owning their growth path reads more credible than fake seniority. UK hiring is forgiving of juniors who show direction | LOW | "Currently studying for: BTL1 (target: July 2026)" |

### Anti-Features (Common Cyber-Portfolio Mistakes — Do NOT Build)

These are the cluster of well-meaning ideas that backfire on a *cybersecurity* portfolio specifically. The clichés below are documented as cyber-branding antipatterns ([Hiatus Design](https://www.hiatus.design/cybersecurity/what-cliches-should-you-avoid-when-designing-a-cybersecurity-brand)) and confirmed by recruiter-perspective sources.

| Feature | Why Requested / Tempting | Why Problematic | Alternative |
|---------|--------------------------|-----------------|-------------|
| **Matrix-style green code rain background** | "It's the most hacker thing ever" | Documented cyber-branding cliché; feels like 2003 Hollywood, not 2026 SOC. Distracts from content; hurts text contrast | Static terminal aesthetic with restrained green accent; subtle CRT-scanline shader at low opacity at most |
| **Padlock / shield / glowing-binary motifs** | Signals "security" at a glance | Documented cliché; generic stock-photo cyber. Anyone can do it; signals lack of taste | Use specific tooling (terminal prompts, packet captures, log lines) — concrete > symbolic |
| **Fake "hacking in progress" GIFs / fake scrolling exploits** | Looks dynamic | Reads as cosplay; technical hiring managers immediately recognise it as theatre. Active credibility damage | Real terminal output from your *actual* labs (sanitised). One real `nmap` output beats ten fake "hacking" loops |
| **Self-titling as "Ethical Hacker" or "Pentester" (junior)** | Sounds impressive | Recruiters see this constantly from candidates whose evidence is 10 TryHackMe rooms — it actively lowers credibility ([Cyber Security District](https://www.cybersecuritydistrict.com/red-flags-to-avoid-when-hiring-cybersecurity-professionals/)). Senior practitioners notice instantly | Honest title: "Junior Cybersecurity Analyst", "Aspiring SOC Analyst", "Cybersecurity Graduate" |
| **Fake-interactive password prompt that does nothing** | Gimmick: visitor "logs in" to see your CV | Wastes recruiter time (they're skimming!), looks like a toy, and a *security* person putting up a fake login is on-the-nose-bad | Plain CTAs: "View CV", "Contact me". Save the cleverness for write-ups |
| **Type-out animation on every paragraph** | "Terminal feel everywhere" | Slows reading by 5-10×; recruiters bounce. Worst for screen readers | Type-out *only* on the hero greeting; static text everywhere else. Always honour `prefers-reduced-motion` |
| **Pure black + saturated pure green text** | "Authentic terminal" | Fails WCAG AA contrast in many tone combinations; hard on eyes; signals form-over-function | Off-black background (#0d1117 or #0a0e14) + softer green (#7ee787 / #a3be8c) for accent, off-white (#e6edf3) for body text. Aim AA contrast |
| **Skill bars / star ratings ("Python 87%", "★★★☆☆")** | Visual, looks "designed" | Reads as junior/template-y; technical hiring managers find it meaningless ("how is Python 87%?") | Plain tag list. Or better: a skill is shown by a project that *uses* it |
| **Listing every TryHackMe room ever completed** | "More content = more impressive" | Fatigues the reader; signals quantity-over-quality mindset | Curate 3-5 favourites with full write-ups; link to profile for the long tail |
| **Full home address + personal phone number** | "Be reachable" | Doxx risk; spam risk; UK GDPR-irrelevant for self-publication but still a *bad* idea operationally. Recruiters don't need either | City + region only ("London, UK" or "Remote / UK"). Email + LinkedIn DM are sufficient channels |
| **Public personal phone visible to scrapers** | "Recruiters can call directly" | Will be scraped within days; UK recruiters routinely contact via LinkedIn or email first anyway | Provide phone *on the CV PDF* (which the recruiter has to download), not on the public page |
| **"Hire me" pop-up modal** | Conversion-focus | Reads as desperate / aggressive; hostile UX | Persistent but quiet "Contact" link in nav + a clear CTA at the bottom of the page |
| **Auto-playing music / sound effects** | "Immersion" | Universally hated; recruiters often have headphones at desk volume; instant close-tab | Optional ambient sound *behind a clearly-off-by-default toggle*, if at all |
| **Live "system status" or fake security dashboard with random data** | Looks technical | Made-up numbers undermine credibility ("you faked a SOC dashboard?"). Real engineers recognise the fake data instantly | Real dashboards from your real lab (Splunk screenshot from your home setup), clearly labelled "home lab" |
| **Claiming bug bounties / CVEs you don't have** | Easy credibility shortcut | Trivially verifiable (HackerOne, NVD); discovery = end of process | Only list verifiable findings. "0 CVEs (yet)" is fine for a junior |
| **Sensitive screenshots with un-redacted IPs / hashes / employer data** | "Look at this real incident I worked" | Career-ending if from a current/past employer; legal exposure under DPA 2018; instantly disqualifies for any clearance role | Redact with care (black-box overlays, not blurs). Synthetic data from your home lab is safest. Watermark "Home Lab — Synthetic Data" |
| **Untestable claims ("trusted by Fortune 500", "10+ years experience")** | Pads credibility | Junior + summer-2025-grad makes math impossible; recruiter spots immediately | State actual experience honestly; let the projects do the heavy lifting |

## Feature Dependencies

```
3D Hacker Workstation Scene
    └──requires──> 2D Fallback (cannot ship 3D-only)
                       └──requires──> Same content surfaced in 2D
                                             └──requires──> Single source of truth
                                                            for content (markdown/MDX)

CTF Write-ups
    └──requires──> Markdown/MDX rendering pipeline
                       └──requires──> Syntax highlighting for code/terminal blocks
                       └──requires──> Image hosting (in-repo) for screenshots

Recruiter "Skim Mode"
    └──requires──> CV download
    └──requires──> Contact link
    └──requires──> LinkedIn + GitHub above the fold
    └──enhances──> 2D Fallback (skim mode IS the 2D path for recruiters)

Accessibility (prefers-reduced-motion)
    └──requires──> 3D scene has reduced-motion variant (or 2D auto-serve)
    └──requires──> Type-out greeting respects the media query

PGP Key Publication
    └──requires──> A real, maintained PGP key
    └──conflicts──> "Set and forget" — stale key is worse than no key

JSON-LD Person Schema
    └──enhances──> SEO for "Eren Atalay cybersecurity" search

TryHackMe / HTB Badges
    └──enhances──> Skills section (third-party verification)
    └──conflicts──> Listing every completed room (badges replace this)

Easter Egg in view-source
    └──conflicts──> Generic minified-only build (need a readable HTML comment somewhere)
```

### Dependency Notes

- **3D Scene → 2D Fallback:** The fallback is not optional polish; it's the recruiter path. Architecture must keep content in a single source so both paths render the same data.
- **Write-ups → Markdown pipeline:** Write-ups will be the most-edited content. Authoring them in markdown (not hand-coded JSX) keeps the maintenance burden low for a solo maintainer.
- **Skim mode IS the 2D fallback for recruiters:** Don't build them as separate features. The 2D view *is* the recruiter view. Frame it as "Quick view" or "Text version" in the UI to avoid implying it's a downgrade.
- **prefers-reduced-motion:** Touches every animation — type-out greeting, 3D camera idle motion, scroll parallax, hover effects. Build the gate once at the CSS/animation-config level, not per-component.
- **Stale PGP key risk:** Only ship PGP if Eren is going to maintain it. A revoked-but-still-published key reads as careless.

## MVP Definition

### Launch With (v1) — One-Month Scope

The bar for "good enough to send to a UK cyber recruiter":

- [ ] **Hero / landing:** Name, role label ("Junior Cybersecurity Analyst"), location ("UK"), CV download button, contact link, GitHub, LinkedIn — all visible without interaction
- [ ] **2D fallback page:** Full content reachable without 3D. Auto-serves on slow/mobile. Toggleable from 3D
- [ ] **3D hacker workstation:** Desk + monitors scene, drag-to-look, click-to-engage, with `whoami` terminal greeting on the main monitor
- [ ] **About:** 2-4 sentences, honest junior framing, location, career arc
- [ ] **Education:** Degree, institution, year, relevant modules
- [ ] **Certifications:** What's earned + what's in progress (honestly labelled)
- [ ] **Skills:** Tag-list grouped by category (network, offensive, defensive, scripting, OS) — no skill bars
- [ ] **Projects (3-5):** Each with title, tools, what was done, link to write-up/repo
- [ ] **Write-ups (2-3):** Markdown-rendered, with screenshots, MITRE/NIST tags where genuine
- [ ] **CTF profile links:** TryHackMe + HackTheBox profile URLs (live badges if cheap)
- [ ] **Contact:** Obfuscated email + LinkedIn DM link. Optional contact form via Formspree/Web3Forms
- [ ] **CV PDF:** Hosted in repo, named `Eren-Atalay-CV.pdf`, also linked in nav and footer
- [ ] **Accessibility:** `prefers-reduced-motion` honoured; keyboard navigable; alt text on images; semantic HTML; 3D canvas has text equivalent
- [ ] **SEO basics:** `<title>`, meta description, OpenGraph image/card, JSON-LD `Person` schema, sitemap, robots.txt
- [ ] **Mobile usable:** 2D fallback works flawlessly on iOS/Android; 3D either works or auto-falls-back
- [ ] **Custom 404 page:** Terminal-styled, terse
- [ ] **Footer:** Auto-year copyright; "Source on GitHub" link

### Add After Validation (v1.x)

Add once the core is shipped and Eren has 1-2 weeks of recruiter feedback:

- [ ] **More write-ups** — trigger: as Eren completes more rooms / labs (target 5-8 by v1.x)
- [ ] **Home lab architecture diagram** — trigger: when Eren actually builds the home lab (Wazuh + Splunk + Kali + AD)
- [ ] **PGP key publication** — trigger: only if Eren commits to maintaining it
- [ ] **Live TryHackMe / HTB badge widgets** — trigger: if static link-outs aren't enough
- [ ] **Keyboard shortcut overlay (`?` cheat sheet)** — trigger: after main 3D nav is stable
- [ ] **Subtle source-code Easter egg** — trigger: after main build pipeline settles
- [ ] **Recruiter "skim mode" CTA banner on first visit** — trigger: if 3D-load drop-off is observable
- [ ] **"Currently learning" / next-cert tracker** — trigger: low-cost, can ship at any time

### Future Consideration (v2+)

Defer until there's clear value or a triggering event:

- [ ] **Custom domain** — when Eren is ready to spend on it; deferred per PROJECT.md scope
- [ ] **Blog with technical depth (RSS feed)** — once write-ups outgrow the projects section
- [ ] **Light/dark theme toggle** — terminal aesthetic is dark-first; a "light terminal" mode is optional
- [ ] **Multi-language (TR / EN)** — only if targeting Turkish opportunities too
- [ ] **Analytics (privacy-respecting, e.g. Plausible)** — only if Eren wants conversion data
- [ ] **Animated 3D presence on mobile** — likely never; keep 2D on mobile
- [ ] **Interactive lab playground / embedded shell** — high complexity, real security risk on a static site; defer indefinitely

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Name + role + CV download above the fold | HIGH | LOW | **P1** |
| 2D fallback covering all content | HIGH | MEDIUM | **P1** |
| Contact (obfuscated email + LinkedIn) | HIGH | LOW | **P1** |
| Education + certs + skills | HIGH | LOW | **P1** |
| 3-5 projects with detail | HIGH | MEDIUM | **P1** |
| 2-3 CTF/lab write-ups | HIGH | MEDIUM | **P1** |
| 3D hacker workstation scene | HIGH | HIGH | **P1** (defining feature) |
| `whoami` terminal greeting | MEDIUM | LOW | **P1** |
| TryHackMe / HTB profile links | HIGH | LOW | **P1** |
| `prefers-reduced-motion` honoured | HIGH | LOW | **P1** |
| Mobile-usable 2D fallback | HIGH | MEDIUM | **P1** |
| OpenGraph + JSON-LD Person | MEDIUM | LOW | **P1** |
| Custom 404 page | LOW | LOW | **P1** (cheap polish) |
| Honest "currently learning" section | MEDIUM | LOW | **P2** |
| Home lab architecture diagram | HIGH | LOW (once lab exists) | **P2** |
| Live TryHackMe / HTB badges | MEDIUM | LOW | **P2** |
| Contact form via Formspree | MEDIUM | MEDIUM | **P2** |
| Keyboard shortcut overlay | LOW | MEDIUM | **P2** |
| PGP key publication | LOW | LOW | **P2** (only if maintained) |
| Subtle source-code Easter egg | LOW | LOW | **P3** |
| Custom domain | LOW (v1) | LOW | **P3** |
| Blog with RSS | MEDIUM | MEDIUM | **P3** |
| Light theme toggle | LOW | MEDIUM | **P3** |
| Analytics | LOW | LOW | **P3** |

**Priority key:**
- **P1:** Must have for launch — anything missing here breaks the recruiter or hiring-manager path
- **P2:** Should have, add when possible — meaningful uplift but not blocking
- **P3:** Nice to have, future consideration — defer until clear trigger

## Competitor Feature Analysis

Reference points: [Raif Kaya's portfolio](https://raifkaya.nl/) (junior cyber, Netherlands), [Adharv KT's Cyberfolio](https://adharvkt.github.io/portfolio/) (junior, GitHub Pages), and patterns aggregated from [github.com/topics/cybersecurity-portfolio](https://github.com/topics/cybersecurity-portfolio).

| Feature | Raif Kaya (junior, NL) | Adharv KT / GH-topics norm | Our Approach |
|---------|------------------------|----------------------------|--------------|
| Sections | About, Portfolio, Services, Skills, Experiences, Contact | About, Skills, Projects, Certs, Contact | About, Education, Certs, Skills, Projects, Write-ups, Contact (drop "Services" — implies for-hire pen-testing, wrong fit for a job hunt) |
| Tools shown | Burp, Nmap, Wireshark, SQLMap, Acunetix | Variable; often listed as text | Same tool list as Raif + Splunk + Python; surfaced *both* as a text list AND as monitors in the 3D scene |
| CV download | Not visible on Raif's site | Often missing | **P1 must-have** — recruiters need this |
| Skill bars | Yes (30-90% rating) | Common | **Anti-feature** — drop, replace with tag list |
| Contact | LinkedIn + email icons + section | Often a form | Obfuscated email + LinkedIn + optional Formspree form |
| 3D scene | None | Rare; a few 3D dev portfolios exist (no cyber-specific 3D) | **Differentiator** — full hacker workstation, none of the surveyed cyber portfolios attempt this |
| 2D fallback | N/A (not 3D) | N/A | **Differentiator** — built-in skim path for recruiters |
| Write-ups in-site | Project descriptions only | Often link out to Medium / GitHub | Hybrid: short intro on-site + full write-up either on-site (MDX) or linked to repo |
| TryHackMe / HTB | Not prominent | Sometimes embedded | **Link out** + optional badge widget |
| Accessibility | Standard | Mostly absent | **Differentiator** — `prefers-reduced-motion`, keyboard nav, 3D text equivalent |
| Identity claims | "Junior Cyber Security Engineer in search of a Traineeship" — honest | Variable; some self-title as "Ethical Hacker" prematurely | Match Raif's tone — honest junior framing |

**Net takeaway:** the cyber-portfolio baseline is content-heavy but design-light. The competitive opening is a portfolio that (a) has the *right* content (write-ups, real tooling, honest junior framing), (b) presents it with genuine craft (3D + accessibility + SEO), and (c) doesn't fall into the cliché traps that the GitHub-Pages template crowd consistently steps in.

## Sources

- [Artem Polynko — How to Present a Cybersecurity Portfolio](https://artempolynko.com/blog/how-to-present-cybersecurity-portfolio/) — five-section model, recruiter priorities, anti-patterns
- [Cyber Security District — Step-by-Step Guide](https://www.cybersecuritydistrict.com/a-step-by-step-guide-to-building-a-cybersecurity-portfolio/) — section-by-section content
- [Cyber Security District — Red Flags When Hiring](https://www.cybersecuritydistrict.com/red-flags-to-avoid-when-hiring-cybersecurity-professionals/) — recruiter perspective on overstated skills
- [General Assembly — How to Build a Cybersecurity Portfolio](https://generalassemb.ly/blog/how-to-build-a-cybersecurity-portfolio/) — junior-focused guidance
- [FolioX — How to Build a Cybersecurity Portfolio (2026)](https://foliox.me/guides/how-to-build-a-cybersecurity-portfolio) — current-year framing (search snippet only; site returned 403)
- [University at Albany — How to Build a Cybersecurity Portfolio](https://www.albany.edu/cehc/communications/build-cybersecurity-portfolio) — academic perspective
- [BankInfoSecurity — Building a Security Portfolio for Blue Teamers](https://www.bankinfosecurity.com/blogs/building-security-portfolio-even-when-youre-blue-teamer-p-3880) — defensive-side portfolio advice
- [Hiatus Design — Six Cybersecurity Design Clichés to Avoid](https://www.hiatus.design/cybersecurity/what-cliches-should-you-avoid-when-designing-a-cybersecurity-brand) — primary source for anti-features (Matrix rain, padlocks, etc.)
- [National Cybersecurity Alliance — Cyber Resume and LinkedIn Guidance](https://www.staysafeonline.org/articles/how-to-write-a-cyber-resume-and-linkedin-that-gets-results) — recruiter-side expectations
- [LinkedIn — Top Content: How to Create a Cybersecurity Portfolio](https://www.linkedin.com/top-content/career/building-a-personal-portfolio/how-to-create-a-cybersecurity-portfolio/) — LinkedIn's own framing
- [Cyber Security Jobs — LinkedIn Profile Checklist](https://cybersecurityjobs.tech/career-advice/linkedin-profile-checklist-cybersecurity-jobs) — LinkedIn-specific recruiter signals
- [Raif Kaya Portfolio (junior cyber, NL)](https://raifkaya.nl/) — live competitor reference
- [GitHub Topics — cybersecurity-portfolio](https://github.com/topics/cybersecurity-portfolio) — broad junior-portfolio sample
- [za1n177 — Full SOC home lab repo](https://github.com/za1n177/zaini-soc-homelab) — example home-lab content recruiters value
- [JoinHGS UK — How to Start a Cyber Security Analyst Career in 2025](https://www.joinhgs.com/uk/en/insights/blogs/how-to-become-a-cyber-security-analyst-uk) — UK-market grounding
- [Codezeneduversity — SOC Analyst Projects for Freshers](https://codezeneduversity.com/soc-analyst-projects/) — junior-appropriate project ideas
- [Pope Tech — Design Accessible Animation and Movement (2025)](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) — `prefers-reduced-motion` and 3D motion guidance
- [Yale Usability — Animated Content and Timing](https://usability.yale.edu/digital-accessibility/accessibility-resources/accessibility-articles/animated-content-and-timing) — WCAG-aligned animation rules
- [WCAG 3 in Practice (2026 checklist)](https://creativealive.com/wcag-3-practice-2026-accessibility-checklist/) — current-year accessibility framing
- [BOIA — CSS prefers-reduced-motion explainer](https://www.boia.org/blog/what-to-know-about-the-css-prefers-reduced-motion-feature) — implementation specifics
- [VisualCV — TryHackMe on Resume](https://www.visualcv.com/tryhackme-on-resume/) — UK / global recruiter view of TryHackMe
- [Schema.org](https://schema.org/) — JSON-LD `Person` reference for SEO

---
*Feature research for: junior cybersecurity analyst portfolio (3D hacker-workstation, GitHub Pages, UK market)*
*Researched: 2026-05-06*
