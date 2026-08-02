# Handoff: Sonar — Call Center Analytics App

## Overview
Sonar is a 3-pane analytics chat app for call center intelligence. It sits on top of a Databricks pipeline that ingests WAV call recordings, transcribes them, and labels them via LLM prompts (Claude Opus/Sonnet): call drivers, sentiment (1–5), escalation/risk flags, QA rubric checks. Users (supervisors, managers, QA analysts, directors) query this labeled corpus conversationally: "primary call drivers last week" → "which categories had low sentiment" → "which agents" → "pull the call bodies."

Target implementation: **Databricks React SPA** (Databricks Apps). Dark theme default with light mode toggle.

## About the Design Files
`Sonar.dc.html` (with `support.js`) in this bundle is a **design reference created in HTML** — a working prototype showing intended look and behavior, NOT production code to copy directly. The task is to **recreate this design in your React codebase** using your established patterns and libraries (e.g. Vite + React, your state library of choice, your charting library). All styling in the prototype is inline; extract the design tokens below into your styling system (CSS variables / Tailwind config / styled-components theme).

Open `Sonar.dc.html` in a browser to see and interact with the live prototype.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and interactions are final intent. Recreate pixel-perfectly. All *data* is canned/fake — replace with real queries against your gold tables (e.g. `sonar.gold.calls_labeled`).

## Layout (app shell)
Full-viewport flex row, `overflow:hidden`, 13px base font:

1. **Left pane** — fixed `256px`, `--panel` bg, `1px --border` right edge. Column: brand header → workspace switcher → New conversation + search → scrollable history → user footer.
2. **Center pane** — `flex:1; min-width:0`. Column: 50px top bar → scrollable message area → composer.
3. **Right pane** — `clamp(300px, 30vw, 400px)`, `--panel` bg, `1px --border` left edge. Collapsible (toggle in top bar). Column: tab strip → scrollable tab content.
4. **Settings modal** — overlay `rgba(0,0,0,.55)`, centered 680×480 card, own 180px left nav.

## Design Tokens

### Colors — dark (default)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#09090b` | app background |
| `--panel` | `#0d0d10` | side panes, cards |
| `--panel2` | `#131317` | inputs, user bubbles, subheaders |
| `--raise` | `#17171c` | active tab bg, avatars |
| `--border` | `#1e1e24` | default borders/dividers |
| `--border2` | `#2b2b33` | emphasized borders, hover borders |
| `--text` | `#f2f2f4` | primary text; also chart bar fill |
| `--muted` | `#8e8e98` | secondary text |
| `--faint` | `#5c5c66` | tertiary/labels |
| `--inv` | `#ffffff` | primary buttons, logo tile, toggle-on |
| `--invtext` | `#0a0a0c` | text on `--inv` |
| `--hover` | `rgba(255,255,255,.05)` | hover fill |
| `--good` | `#6ee7a0` | positive |
| `--warn` | `#eec87e` | watch/warning |
| `--bad` | `#f38585` | low sentiment/negative |
| `--track` | `#1d1d23` | bar-chart track |

### Colors — light (`html[data-theme="light"]`)
`--bg #f5f5f6`, `--panel #ffffff`, `--panel2 #f0f0f2`, `--raise #e9e9ec`, `--border #e4e4e8`, `--border2 #d3d3da`, `--text #16161a`, `--muted #6d6d78`, `--faint #9d9da6`, `--inv #131316`, `--invtext #ffffff`, `--hover rgba(0,0,0,.045)`, `--good #1a9e57`, `--warn #a5720e`, `--bad #c94343`, `--track #e6e6ea`.

The accent is **monochrome white/black** (`--inv`) — no colored accent. Semantic colors (good/warn/bad) are reserved for data only.

### Typography
- **UI**: IBM Plex Sans (400/500/600/700), Google Fonts.
- **Metrics/IDs/code**: IBM Plex Mono (400/500/600) — all numbers, call IDs, scores, deltas, statuses.
- Scale: base 13px; 10–11px uppercase labels (`letter-spacing:.06–.08em`, weight 600, `--faint`); 12–12.5px secondary; 13.5px chat text (line-height 1.62); 14px pane titles; 17px report title; 21px empty-state headline.

### Spacing & shape
- Radii: 7–8px small controls, 9–10px cards, 12px composer, 14px modal, 20px pill chips, `14px 14px 4px 14px` user bubble.
- Card padding 11–14px; pane gutters 12–16px; chat column `max-width:720px` centered, 18px gap between messages.
- Scrollbars: 8px, thumb `--border2`, transparent track.

### Motion
- `fadeup`: opacity 0→1 + translateY(6px)→0, .3s ease — new messages, tab content, modal.
- `wave`: scaleY .35→1→.35, 1.2s ease-in-out infinite, staggered `.15s` delays — waveform bars (empty state, thinking avatar).
- `blinkdot`: opacity pulse 1.2s — thinking dots, streaming text cursor.
- `ping`: scale .6→2.2 fading, 2s — live-status dot halo.
- Toggle knob/track: `.15s` transitions.

## Brand: the waveform mark
Logo = rounded square (`--inv` bg, radius 7) containing 5 vertical bars (`--invtext`, 2.5px wide, radius 2, heights 6/13/9/15/5, 2px gap). Reused at smaller scale (3 bars) for the assistant avatar and metric chips; animated (staggered `wave`) for empty state and thinking indicator. Wordmark: "SONAR" 700 weight `letter-spacing:.04em` + "CALL INTELLIGENCE" 10px uppercase `--faint`.

## Screens / Views

### 1. Left pane
- **Brand header**: logo tile + wordmark, padding 14px.
- **Workspace switcher**: bordered row, "CX" 16px square avatar, "Acme CX · Production", ▾ caret. Hover: `--border2` border. (Prototype: non-functional.)
- **New conversation**: full-width `--inv` button, `+` prefix, weight 600, hover opacity .88. Clears active conversation → empty state.
- **Search**: input, `--panel2` bg, live-filters history by title+subtitle.
- **History**: groups Pinned / Today / Yesterday / Earlier this week (uppercase 10px labels). Rows: 5px status dot (`--text` active, `--border2` idle), title (ellipsis, 600 when active), 10.5px subtitle. Active row bg `--hover`; hover same.
- **User footer**: top border; 28px circle avatar "JT", name "Jordan Tate" + role "QA Director"; theme pill (dot + Dark/Light label, click toggles theme); hamburger icon button → opens Settings modal.

### 2. Center pane
- **Top bar** (50px, bottom border): conversation title (ellipsis); status pill "Pipeline live · 1,198 calls this week" with green dot + `ping` halo; right-pane toggle icon button (panel glyph fills when open).
- **Empty state** (no active conversation or no messages): centered, 11vh top pad. 5 animated waveform bars (44px tall, `--text`), headline "Ask Sonar about your calls", subcopy, 4 suggestion pill chips that send that query on click.
- **Messages** (720px column):
  - *User*: right-aligned bubble, `--panel2` bg + border, max-width 78%.
  - *Assistant*: 26px waveform avatar tile + block stack (12px gap). Block types:
    - **Text**: 13.5px/1.62, `pre-wrap`. While streaming, trailing 7×14px `--text` block cursor blinking.
    - **Bar chart card**: bordered card, uppercase title, rows = grid `130px 1fr 74px` (label / track+fill bar 7px tall / mono value right-aligned). Fill color `--text`.
    - **Table card**: bordered, header row uppercase 10.5px, rows hover `--hover`; horizontal scroll with `min-width:460px` rows at narrow widths. Semantic colors on values (e.g. `2.1 / 5` in `--bad`, flag `LOW`).
    - **Agent cards**: full-width rows — 30px circle initials, name+team, right-aligned mono sentiment score (colored) + call count. Click → opens right pane Data tab.
    - **Call chips**: wrapping row of chips — mini 3-bar glyph + mono call ID + "Mon 10:42 · 1.2" subline. Click → opens right pane Transcripts tab.
  - *Thinking indicator*: waveform avatar with animated bars + 3 blinking dots + label that changes ("Querying labeled calls…" → after 900ms "Scoring 1,198 transcripts…").
- **Composer**: rounded 12px bordered bar, borderless input, 34px `--inv` send button with triangle glyph. Enter sends. Below: 10.5px `--faint` disclaimer line.

### 3. Right pane (tabs: Report / Charts / Transcripts / Data / Saved)
Tab strip: 12px tabs, active = weight 600 + `--raise` bg; inactive `--muted`.
- **Report**: markdown-style rendered report — mono kicker `SONAR-RPT · generated from this conversation`, title "Weekly Call Driver Report", meta line, Summary paragraph, Key findings (– bullets), Recommended actions (numbered, mono numerals), footer buttons "Export .md" (outline) + "Save to library" (filled).
- **Charts**: 3 cards — (a) call volume by day: 7 flex columns, bar heights 62/88/74/67/79/34/22%, weekend bars `--muted`; (b) sentiment by category: 5 label/bar/value rows, bar+value in semantic color; footnote "Scale 1–5, scored per call by the labeling model."; (c) driver mix WoW: label / share% / colored delta rows.
- **Transcripts**: header "Marcus Webb — lowest sentiment" + "3 of 23 calls". Accordion cards per call: header (`--panel2`) with mono call ID, meta (day/time/duration), red mono score, label pill chips ("Cancellation", "Repeat request", "Offer after intent"…). Expanded: speaker turns as `CUST`/`WEBB` mono tags (agent tag in `--bad`) + text, footer "… full transcript in Databricks · CALL-88214.wav". One open at a time; first opens by default.
- **Data**: agent table, grid `1.5fr .7fr .7fr .8fr` (Agent / Sent. / Calls / Esc. rate), numerics mono right-aligned, sentiment colored by threshold (≤2.0 bad, ≤2.3 warn, ≥3.4 good). Footnote defines the slice.
- **Saved**: cards with dot + title, description, mono meta line ("Saved Jul 27 · report · recurring").

### 4. Settings modal
Backdrop click closes; card clicks stop propagation. Left nav (Profile / Appearance / Data pipeline / Labeling prompts + "← Close"). Sections:
- **Profile**: 52px avatar, name/email/role, read-only fields (Display name, Role, Default time window).
- **Appearance**: two theme preview cards (mini dark/light swatch with 3-bar glyph; selected = `--text` 1.5px border; clicking applies theme live) + 2 toggle rows (34×19 pill, knob slides 2px↔17px, on = `--inv` track).
- **Data pipeline**: 4 status rows — WAV ingest (S3 → Autoloader · 15-min trigger, HEALTHY), Transcription (Whisper batch · GPU cluster, HEALTHY), Labeling — Claude Opus (Prompt set v14 · 12 labels per call, RUNNING), Gold tables (sonar.gold.calls_labeled · Delta, LAG 12m warn). Dot + mono status, colored.
- **Labeling prompts**: 4 cards — prompt name, model badge (OPUS/SONNET mono pill), description.

## Interactions & Behavior
- **Send flow**: user msg appended → thinking indicator (~1.7s, label swaps at 900ms) → assistant reply streams ~3 chars/24ms with block cursor → a bar-chart block appends on completion. Auto-scroll to bottom throughout. In production: stream tokens from your LLM endpoint; render structured blocks (charts/tables/agents/chips) from tool-call results.
- **New conversation** from empty state: first send creates a history entry titled from the query (truncated 34 chars).
- **Deep links**: agent card click → Data tab (opens right pane if closed); call chip click → Transcripts tab.
- **Right pane toggle**: instant show/hide; center pane reflows (`flex:1`).
- **Theme**: sets `data-theme="light"` on `<html>`; everything is driven by the CSS variables. Persist per-user in production.
- **Search**: case-insensitive substring on title+subtitle; empty groups hidden.
- **Hover states**: rows/cards `--hover` bg or `--border2` border; filled buttons opacity .88; tabs brighten to `--text`.

## State Management
Prototype state (map to your store):
- `theme: 'dark'|'light'`, `rightOpen: bool`, `activeTab: 'report'|'charts'|'transcripts'|'data'|'saved'`
- `convs: {id → {title, sub, when, pinned, messages[]}}`, `activeId`, `searchQ`
- `draft`, `thinking: bool`, `thinkingLabel`
- `showSettings: bool`, `settingsTab`, `openTranscript: id|null`, toggle flags
- Message shape: `{isUser, text}` or `{isAssistant, blocks: [{isText|isBars|isTable|isAgents|isChips, …}]}` — treat blocks as your structured-answer schema from the agent.

Data fetching (production): agent endpoint (chat + tool calls over gold tables), conversation persistence, transcript fetch by call ID, saved-items CRUD, pipeline health endpoint.

## Assets
No external images. The waveform mark is pure divs (spec above) — rebuild as an inline SVG component. Fonts from Google Fonts (IBM Plex Sans + IBM Plex Mono); self-host if the app runs inside a restricted network.

## Files
- `Sonar.dc.html` — the full interactive prototype (markup + logic + seeded demo data). Open in a browser.
- `support.js` — prototype runtime only (renders the .dc.html format). Not part of the design; do not port.
