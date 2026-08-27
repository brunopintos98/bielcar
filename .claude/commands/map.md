---
description: Produce a concise architecture map. With no args, a project-wide report (folder structure, nav, state, API, native, high-risk files, anomalies) persisted to .claude/map/LAST.md so /recalibrate can diff against it. With an area argument (e.g. "/map photo upload"), a focused trace of just the screens / slices / endpoints / contracts touching that area — no snapshot write.
argument-hint: [optional area, e.g. photo upload]
allowed-tools: Read, Grep, Glob, Task, Write
---

# /map — architecture report (persisted) or feature-area trace

This command has **two modes**, selected by whether `$ARGUMENTS` is empty:

- **Empty args → full-project mode.** Produces a structured map of the entire codebase and persists it to `.claude/map/LAST.md` (plus a dated copy). This is what `/recalibrate` diffs against to detect drift.
- **Non-empty args → feature-area mode.** Treats `$ARGUMENTS` as a natural-language area description (e.g. `photo upload`, `auth flow`, `itinerary screen`). Produces a focused, read-only trace of only the code that touches that area. Does NOT write a snapshot — full-project sweeps remain the single source of truth for the persisted map.

## Step 1 — read the canonical config

Read `.claude/agent-config.yaml`. All paths in the output below use the config's `stacks:` and `paths:` sections — never hard-code.

## Step 2a — feature-area mode (if `$ARGUMENTS` is non-empty)

Skip the full-project sweep below. Instead:

1. **Identify the area.** Restate the user's area in one sentence so the trace stays focused (e.g. `$ARGUMENTS = "photo upload"` → "user-uploaded photos: capture/select, upload, persist, render").
2. **Locate entry points.** Grep across each attached stack (`stacks.<alias>.path` + `paths.src`) for the area's likely surface — screen names, route paths, slice keys, endpoint URLs, schema entities, native modules. Cast a wide net first, then narrow.
3. **Produce a focused trace** with these sections (omit any that don't apply to the area):
   - **Surface area** — 1-paragraph plain-English summary of what the feature does and where it lives.
   - **Screens / routes** — files in `paths.features` / `paths.routing` that render or own this area's UI.
   - **State** — slices / stores / atoms / RTK Query endpoints involved (key + file).
   - **API / data layer** — endpoints called (RN/web side) and routes handled (node side), with their files. For node stacks, include schema entities and migrations that pertain.
   - **Native touchpoints** — only if this area depends on iOS/Android code outside `paths.src`.
   - **Cross-stack contracts** — any `.claude/handoffs/*.md` files whose producer/consumer matches this area.
   - **Open questions / risks** — anomalies specific to this area (dead code, divergent shapes between producer/consumer, missing types, TODOs).
4. **No writes.** Feature-area mode is purely read-only — do not touch `.claude/map/`.
5. **Stop here.** Skip Step 2b and Step 3.

## Step 2b — full-project mode (if `$ARGUMENTS` is empty)

Output clean markdown with these sections. The structure is **per-stack** — for each attached entry under `stacks:` in `agent-config.yaml`, produce the relevant subsections based on the stack's `type`. Then finish with cross-cutting sections (high-risk files, anomalies).

### Per-stack sections

For each `stacks.<alias>` in `agent-config.yaml`, emit a top-level heading `## Stack: <alias> (type: <rn|web|node>)` followed by:

1. **FOLDER STRUCTURE** — every top-level directory under `stacks.<alias>.path` and every subdirectory under the stack's `paths.src`. Note folders not listed in `paths:`.

2. (rn only) **NAVIGATION MAP** — trace from `stacks.<alias>.navigation.root_navigator`. List every stack / screen / file.

2'. (web only) **ROUTING MAP** — trace from `stacks.<alias>.routing.entry`. For Next app-router, walk the `app/` tree. For Next pages-router, walk `pages/`. For React Router / Remix / TanStack, walk the router config.

3. (rn + web) **STATE SHAPE** — every slice / store / atom, its key, and its state shape. For RN, include RTK Query slices. For web, note which `web.state_library` is in use (if `tanstack-query`, there are no persistent client-state slices — say so).

4. (rn + web) **API SURFACE** — every endpoint / query / mutation, its URL / queryKey, and the defining file. Note `web.api_library` for web stacks.

4'. (node only) **ROUTE SURFACE** — every HTTP route registered, its method + path + handler file, and which middleware/validators apply.

4''. (node only) **DATA LAYER** — tables/entities in the schema, migrations present, and query/repository functions by entity. Note `node.orm`.

5. (rn only) **NATIVE TOUCHPOINTS** — files outside `paths.src` that RN code directly depends on.

### Cross-cutting sections (one each, not per stack)

6. **HIGH-RISK FILES** — files from `restricted_paths` and `review_required_paths` that currently exist, across all stacks.

7. **CROSS-STACK CONTRACTS** — summarize each `.claude/handoffs/*.md` file: feature name, producer stack, consumer stacks, contract status. Flag any with `status: proposed` older than a week (likely abandoned or stale).

8. **ANOMALIES** — flag anything unexpected:
   - `.js` / `.jsx` files under any stack's `paths.src` that should be `.ts` / `.tsx` — only when `typescript_first: true`; skip this check otherwise.
   - Dead code, orphaned slices, unreferenced routes.
   - Missing type definitions.
   - Config mismatches between `agent-config.yaml` and actual code (including framework-detection drift — e.g. `stacks.<alias>.web.framework: next-app-router` but no `app/` directory exists).
   - Placeholder values (`<PLACEHOLDER`) still in `agent-config.yaml` — name the specific fields.

## Step 3 — persist the snapshot (full-project mode only)

Write the report to `.claude/map/LAST.md`. Overwrite any existing file there. Also write a timestamped copy to `.claude/map/<YYYY-MM-DD>.md` so the history survives.

These are the ONLY writes this command is allowed to perform — and only when running in full-project mode. Feature-area mode does not write to `.claude/map/`.

## Rules

- Analysis is READ-ONLY — no `Edit` or `Bash` that mutates source. The only writes (full-project mode only) are the snapshot files under `.claude/map/`.
- Do NOT propose fixes. Only report.
- If the map reveals structural issues, list them under a "Recommended Actions" appendix — defer fixes to the appropriate specialist subagent.

## Hand-off

After the report, if actionable findings exist, the main thread should delegate to specialists:
- `.js`/`.jsx` migration candidates (only when `typescript_first: true`) → `ts-feature` / `web-feature`
- Orphaned Redux slices → `state`
- Unreferenced routes → `navigation`
- Dead API endpoints → `api-networking`
- Native config drift → `ios-native` / `android-native`
- Restricted-file issues → `security` + appropriate specialist
