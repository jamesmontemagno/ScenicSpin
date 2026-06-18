# Squad Decisions

## Active Decisions

### 2026-06-18T01:32:36-07:00 — Pivot to general laptop-bike scenic rides website
**Decision:** PedalScape/ScenicSpin is a website for people using any indoor bike with any laptop or screen, not a Peloton-specific hack.
**Rationale:** Optimize for broad accessibility, affordability, and simple web playback. Avoid relying on unsupported Peloton device behavior.
**References:** Neo, Trinity, Tank, Morpheus

### 2026-06-18T01:41:05-07:00 — MVP is a dependency-free static web app
**Decision:** Use plain HTML, CSS, and JavaScript at the repository root with curated route metadata, YouTube-nocookie embeds, source-link fallbacks, large controls, responsive cards, search/filtering, and fullscreen-capable playback.
**Rationale:** Keeps the MVP browser-first, low setup, and easy to validate before choosing richer hosting or playback integrations.
**References:** Trinity

### 2026-06-18T02:28:28-07:00 — Prioritize no-login local personalization and PWA feel
**Decision:** Keep the MVP no-login while supporting local-first features such as favorites, playlists, recent rides, preferences, favicon/manifest, and installable/app-like UX.
**Rationale:** Local personalization is a product differentiator and preserves a simple, privacy-friendly MVP.
**References:** Neo, Trinity, Switch

### 2026-06-18T03:43:50-07:00 — Local-first roadmap after PWA MVP
**Decision:** Priority order is P0 Playwright regression tests and Reset local data; P1 stale route cleanup, service-worker update UX, export/import local data; P2 custom playlists and install polish.
**Rationale:** Stabilize the app before expanding local data workflows.
**References:** Switch, Trinity, Neo

### 2026-06-18T04:01:39-07:00 — Candidate route promotion rubric and batching plan
**Decision:** Use a two-gate promotion model: metadata triage first, then human review before production. Review statuses are candidate, needs-human-review, reviewed-pass, promoted, rejected, and deferred with reasons where needed. Promote small batches of strongest routes.
**Rationale:** Keeps visible catalog quality high while preserving rejected/deferred evidence for future sourcing.
**References:** Neo, Tank, Trinity, Switch, routes/candidate-backlog.json, routes/catalog.json

### 2026-06-18T04:18:13-07:00 — Add social share OG image to polish queue
**Decision:** Add a polish item for a static social preview image plus Open Graph/Twitter metadata.
**Rationale:** Shared links should render attractively on social platforms.
**References:** Trinity

### 2026-06-18T04:46:32-07:00 — Use pragmatic video-quality signals for promotion
**Decision:** Treat roughly 30-minute duration, no ads, high visual quality, and high view count as strong positive curation signals, while still checking source legitimacy, embed playback, and legal/platform safety.
**Rationale:** Gives Tank and reviewers practical promotion heuristics without dropping safety checks.
**References:** Tank, Neo

### 2026-06-18T04:51:33-07:00 — Hide candidate backlog by default and add reviewer workflow
**Decision:** Candidate backlog should stay hidden unless review mode is active. Add a better review workflow where Scott can mark yes/no/defer and export/copy decisions back to the team.
**Rationale:** JSON review is not an acceptable human workflow, and unreviewed backlog should not appear public by default.
**References:** Trinity, Tank, Neo

### 2026-06-18T04:51:37-07:00 — Do not prioritize YouTube lazy-loading yet
**Decision:** Keep the privacy caveat, but do not treat lazy-loading YouTube iframes as a near-term blocker.
**Rationale:** Scott is not currently worried about this optimization.
**References:** Neo, Trinity

### 2026-06-18T05:26:31-07:00 — Route chicklets are curated decision signals
**Decision:** Badges/chicklets should communicate concrete curated facts such as quality, primary duration, audio type when known, source/embed confidence, route style, and suitability. Avoid vague badges and internal review text.
**Rationale:** Riders need enough useful detail to make an educated choice.
**References:** Trinity, Switch, Tank

### 2026-06-18T05:55:22-07:00 — Use more parallelism and involve underused Squad members
**Decision:** Prefer parallel routing for independent work and intentionally involve underused members when their charter fits.
**Rationale:** Scott directed the team to consider whether any Squad members are underused and emphasized that parallelism is key. Current routing recommendation: Trinity for UI, Morpheus for PWA/local/offline, Switch for validation, Tank for sourcing, Rai for safety/platform, Ralph for backlog watch, Scribe for decisions/logs.
**References:** User directive, Neo

### 2026-06-18T01:22:57-07:00 — Content sourcing taxonomy
**Decision:** Separate streaming/embedding sources, subscription or licensed route apps/vendors, owned/self-hosted files, and app alternatives.
**Rationale:** Keeps sourcing useful while avoiding ToS/copyright pitfalls.
**References:** Tank

## Superseded / Historical Decisions

### 2026-06-18T01:22:26-07:00 — Peloton-specific minimal playback screen
**Status:** Superseded by the general laptop-bike website pivot.
**Historical value:** The browser-first, large-control, fallback-friendly UX principles still apply, but Peloton-specific assumptions should not drive the product.
**References:** Trinity, Morpheus

### 2026-06-18T01:23:35-07:00 — Platform-safe Peloton video display paths
**Status:** Superseded by the general website pivot.
**Historical value:** Avoid unsupported device hacks; keep official/legitimate playback paths and fallback links in mind.
**References:** Morpheus

## Governance

- All meaningful changes require team consensus.
- Document architectural/product decisions here.
- Keep histories focused on agent work; keep this file focused on direction.
