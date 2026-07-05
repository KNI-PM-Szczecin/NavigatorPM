# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # generate algorithm registry, then start Next.js dev server
npm run build      # generate algorithm registry, then build for production
npm run lint       # run ESLint
npm run generate-algos  # regenerate src/lib/algorithms/registry.ts from discovered algorithm files
```

Admin portal is at `/admin-portal-721` (default credentials: admin / admin123).

## Architecture

**NavigatorPM** is a multi-building indoor navigation system built with Next.js 15 App Router, React 19, TypeScript, SQLite (`better-sqlite3`), and vanilla CSS (no Tailwind or UI library).

### Route groups

- `(public)/` — visitor-facing: building list (`/`) and interactive floor viewer (`/viewer/[id]`)
- `(admin)/admin-portal-721/` — password-protected admin area for buildings, floors, map editor, and security settings
- `api/` — three endpoints: building nodes, raw SVG content, and locale JSON files

### Data layer

SQLite database at `navigator.db` in the project root (WAL mode). The schema lives in `src/lib/db.ts` and initializes on first import. Key tables: `buildings`, `floors`, `nodes`, `translations`, `settings`, `admin`.

- `src/lib/data.ts` — all read/write helpers (synchronous `better-sqlite3` API)
- `src/lib/actions.ts` — Next.js Server Actions used by admin UI (building/floor CRUD, node saving, password change, system reset)

Nodes store their inter-node connections as a JSON array in the `connections` column. Cross-floor connections are stored on both sides via `saveNodesAction()`.

### Pathfinding

Algorithms live in `src/lib/algorithms/` and implement the `NavigationAlgorithm` interface from `types.ts`. Available: A\* (default), Dijkstra, BFS, Greedy.

`scripts/generate-algorithms.mjs` scans the directory and writes `registry.ts` — run automatically by `npm run dev/build`. When adding a new algorithm, create a file in `src/lib/algorithms/` and re-run `npm run generate-algos`.

`src/lib/navigation.ts` exposes `findPath()` which handles multi-floor routing by stitching single-floor paths through connector nodes.

### Internationalization

- Static UI strings: `src/locales/en-US.json` and `pl-PL.json`, served by the `/api/locales/[code]` route
- Entity translations (building/floor/node names): stored in the `translations` table, fetched alongside node data
- `LanguageContext` in `src/context/LanguageContext.tsx` manages the active locale client-side

### State & settings

- `SettingsContext` — persists selected algorithm and light/dark theme in cookies
- `LanguageContext` — persists selected locale in cookies
- Authentication: `admin_session` cookie (httpOnly, `secure` in production), single admin user with bcrypt

### QR navigation

URL format: `/viewer/[floorId]?from=[nodeId]&to=[nodeId]`

The viewer auto-calculates and renders the path when both query params are present.

### Styling

Pure CSS in `src/app/globals.css` using CSS custom properties (`--background`, `--foreground`, `--primary`, etc.). No utility framework. Component-level styles are colocated inline or in the global sheet.
