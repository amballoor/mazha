# CLAUDE.md — Mazha Watch

## Project Overview

**Mazha Watch** (മഴ = rain in Malayalam) is a hyperlocal rainfall monitoring web app for
Amballoor Panchayat, Ernakulam district, Kerala. It displays live and historical rainfall
data for 12 ward-level locations, sourced from a publicly shared Google Sheet.

**Primary audience:** Local residents, panchayat officials, farmers — skews 50+ age group.
Accessibility, legibility, and simplicity are top priorities above visual complexity.

**Deployment:** GitHub Pages (static site, no server)
**Working directory:** `d:\Rainwatch Web App`

---

## Tech Stack

| Layer            | Choice                                        |
|------------------|-----------------------------------------------|
| Framework        | React 18 + Vite                               |
| Language         | TypeScript (strict mode)                      |
| UI components    | ShadCN/UI                                     |
| Styling          | Tailwind CSS (bundled with ShadCN)            |
| Data fetching    | TanStack Query (React Query v5)               |
| Data source      | Google Sheets — publicly shared CSV endpoint  |
| Routing          | React Router v6                               |
| Deployment       | GitHub Pages via `gh-pages`                   |

**State management:** No global store for v1. TanStack Query owns all server state
(cached sheet data); local UI state (tab selection, etc.) uses `useState` only.

---

## MCP Servers

Three MCP servers are configured for this project:

1. **Figma MCP** — Fetch wireframes and design context directly into the session.
   - Always invoke the `/figma-use` skill before calling `use_figma`.
   - The Figma file contains wireframes for all screens. Fetch before implementing any UI.

2. **ShadCN MCP** — Browse ShadCN component docs and source before implementing.
   - Always check ShadCN MCP first; prefer existing primitives over custom HTML.

3. **Google Sheets MCP / fetch** — Access the publicly shared rainfall data sheet.
   - Fallback: fetch the published CSV URL directly with the browser `fetch()` API.

### Three-Stage Design → Code Workflow (mandatory for every screen)

**Stage 1 — Wireframe to HiFi in Figma**
1. Fetch the lo-fi wireframe from Figma MCP
2. Query ShadCN MCP to identify matching component primitives
3. Use Figma MCP (`use_figma`) to recreate the wireframe as a HiFi design using ShadCN
   component patterns and the project's Tailwind tokens
3b. Extract variable collections (colors, spacing) and text styles from the HiFi frame
    and bind them back — the design must be token-driven before approval.
    **Text styles are mandatory on every text node.** Apply the named text style via
    `node.textStyleId` (look up with `figma.getLocalTextStyles()`). Never use a bare
    font-size variable binding on an unstyled text node — always apply the style first,
    then bind the color fill via a variable.
4. Present the HiFi design for approval before writing any code

**Stage 2 — Design Review (human checkpoint)**
- Do not proceed to code until the HiFi Figma design is approved

**Stage 3 — Design to Code**
- Fetch the approved HiFi design from Figma MCP
- Implement in React + TypeScript + Tailwind, matching design 1:1
- Use only ShadCN primitives — no custom UI unless ShadCN has no equivalent

---

## 12 Monitoring Locations

Single source of truth: `src/data/locations.ts`. Never hardcode location names inline.

| #  | Display Name      | URL Slug           |
|----|-------------------|--------------------|
| 1  | Amballor Kavu     | `amballor-kavu`    |
| 2  | Arayankavu        | `arayankavu`       |
| 3  | Erattamavu        | `erattamavu`       |
| 4  | Kadapuram         | `kadapuram`        |
| 5  | Keechery          | `keechery`         |
| 6  | Mampuzha          | `mampuzha`         |
| 7  | Maxwell           | `maxwell`          |
| 8  | Millunkal         | `millunkal`        |
| 9  | Parpacode         | `parpacode`        |
| 10 | Punchapadam       | `punchapadam`      |
| 11 | Puthuvassery      | `puthuvassery`     |
| 12 | Vidangara Temple  | `vidangara-temple` |

---

## Project Structure

```
d:\Rainwatch Web App\
├── public/
├── src/
│   ├── components/
│   │   ├── ui/          # ShadCN generated — treat as read-only
│   │   └── ...          # Feature components added as needed
│   ├── data/
│   │   └── locations.ts # Location name + slug constants
│   ├── hooks/
│   │   └── useRainfallData.ts  # TanStack Query hook — all data access here
│   ├── lib/
│   │   ├── sheetParser.ts      # CSV string → typed records
│   │   └── utils.ts            # ShadCN cn() helper
│   ├── pages/           # One file per route
│   ├── types/
│   │   └── rainfall.ts  # Core types
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
├── tailwind.config.ts
└── CLAUDE.md
```

---

## Data Handling

### Google Sheet Schema
> **TODO:** Finalise column names once the sheet is set up. Expected structure:
```
Timestamp | Location | Rainfall_mm
```
Update `src/lib/sheetParser.ts` and `src/types/rainfall.ts` once confirmed.

### Fetch Pattern
- Publish Google Sheet as CSV (File → Share → Publish to web → CSV)
- Store the URL in `VITE_SHEET_CSV_URL` environment variable
- Wrap in `useRainfallData` hook using TanStack Query:
  - `staleTime: Infinity` — data never auto-refetches
  - Manual refresh: `queryClient.invalidateQueries(['rainfall'])` on button tap
- Parse CSV → typed records inside `sheetParser.ts` — keep components dumb

### Core Types (`src/types/rainfall.ts`)
```ts
type RainfallRecord = {
  timestamp: Date;
  location: string;   // must match a display name in locations.ts exactly
  rainfallMm: number;
};

type TimeRange = 'day' | 'week' | 'month';

type RainfallStatus = 'none' | 'light' | 'moderate' | 'heavy';
```

---

## Design System

### Accessibility Rules (50+ primary audience — non-negotiable)
- **Minimum font size:** 16px body, 18px card labels. Never go below 16px anywhere.
- **Touch targets:** 48×48px minimum for every tappable element.
- **Color contrast:** WCAG AA (4.5:1 text, 3:1 UI components).
- **Status = text + color:** Never communicate state through color alone.
- **No tiny icons without labels:** Every icon needs visible text or `aria-label`.
- **Prefer cards over dense tables:** Scannable at a glance beats information density.
- **Large, thumb-friendly buttons:** Primary actions must be easy to hit one-handed.

### ShadCN Usage Rules
- Install: `npx shadcn@latest add <component>` — never copy-paste component source
- Generated files land in `src/components/ui/` — treat as read-only
- Extend via Tailwind classes on wrappers, not by editing `ui/` files

### Figma Design System — Parallel Workflow
- **Always maintain a "Design System" page in Figma** alongside screen frames.
- **Reuse before creating:** Before adding any new shape, component, or style to a screen,
  search the design system page first. Only create a new element if no matching one exists.
- When a new reusable element IS created during screen work, promote it to the design system
  page immediately — never leave it stranded inside a screen frame.
- Variable collections and text styles defined on the design system page are the single source
  of truth for colors, spacing, and typography across all Figma frames.
- **Always use auto-layout when creating components.** Every component and its internal
  containers must use `layoutMode = 'HORIZONTAL'` or `'VERTICAL'` with explicit sizing modes.
  Never use absolute x/y positioning for children that have a structural relationship —
  auto-layout ensures text overrides and content changes don't break the layout in instances.
- **Apply named text styles — never bare variable bindings on text.** Every text node
  in a HiFi screen or component must have a named text style assigned via `node.textStyleId`.
  The correct order:
  1. `figma.getLocalTextStyles()` → find the matching style by name
  2. `node.textStyleId = style.id` — applies family, weight, size, line-height, tracking
  3. Bind the color fill to a color variable as a separate step
  Do NOT set a font-size variable (`setBoundVariable('fontSize', ...)`) on a text node
  that has no `textStyleId` — this produces unstyled text with a fragile loose binding.
- **Screens contain instances only — never raw structural frames.** Before placing any
  UI element on a screen (nav bars, buttons, cards, section headers), first create it as
  a COMPONENT on the Design System page, then place an instance on the screen. The only
  exception is a transparent alignment wrapper with no visual identity of its own. If you
  catch yourself creating a FRAME directly on a screen that has fills, text, or a distinct
  visual role — stop, extract it as a component first.

---

## Development Commands

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run deploy    # Deploy to GitHub Pages (gh-pages -d dist)
```

**Vite config for GitHub Pages** — set `base` to match the repo name:
```ts
// vite.config.ts
base: '/mazha-watch/',  // update if repo name differs
```

---

## Token Efficiency — Working with Claude Code

### Scoped context
- Read only the specific files needed for the current task
- Use `Grep` to find the exact lines before reading entire files
- Never ask Claude to "read all files" — point it to the specific file or hook

### Batch related changes
- Group all changes to one feature in a single session (types + hook + component + page)
- Avoid short back-and-forth sessions that re-establish context each time

### Figma MCP — targeted fetches
- Use `get_node_xml` / `get_selected_nodes_xml` for a single component, not
  `get_project_xml` for the whole file unless the full layout is needed
- Zoom into the relevant frame in Figma before asking Claude to fetch context

### ShadCN MCP — name the component
- Always request a specific component by name rather than browsing the full library

### CLAUDE.md as context anchor
- Start every new session: "read CLAUDE.md first"
- This avoids re-explaining the project, stack, and workflow each time

### Checkpoint before large tasks
- For any task touching > 3 files, ask Claude to plan first before implementing

---

## Implementation Checklist for New Features

1. Read CLAUDE.md at the start of every new session
2. Follow the three-stage workflow: wireframe → HiFi approval → code (never skip Stage 2)
3. Check ShadCN MCP for matching primitives before writing any custom component
4. Define types in `src/types/` before implementing logic
5. All data access goes through `useRainfallData` — never fetch inline in components
6. Write Tailwind mobile-first (`sm:` / `md:` / `lg:` for larger breakpoints)
7. Verify: touch target ≥ 48px, contrast ≥ 4.5:1, status conveyed in text + color
8. Figma text nodes: look up a named text style with `figma.getLocalTextStyles()`,
   assign `node.textStyleId = style.id`, then bind the color fill separately —
   never use a lone font-size variable on an unstyled text node.

---

## Open TODOs

- [ ] Finalise Google Sheet column schema → update `sheetParser.ts` and types
- [ ] Confirm `VITE_SHEET_CSV_URL` (published CSV link from Google Sheets)
- [ ] Confirm `vite.config.ts` `base` path matches GitHub Pages repo name
- [ ] Decide chart library: ShadCN Chart (Recharts wrapper) vs direct Recharts
- [ ] Confirm whether Malayalam script labels are needed alongside English transliterations
