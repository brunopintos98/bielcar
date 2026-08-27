---
description: First-time calibration of .claude/agent-config.yaml to match the project's actual folder structure, commands, and toolchain.
argument-hint: (no args — interactive)
allowed-tools: Read, Write, Edit, Bash, Task, Grep, Glob
---

# /calibrate — tune agent-config.yaml to match the real project

This command rewrites `.claude/agent-config.yaml` so every path, command, and framework setting points at the code that actually exists in this repo. Run it once when `.claude/` is first dropped into a project, and again if the project is restructured beyond what `/recalibrate` can patch.

**Pre-requisite:** none beyond being inside the project. This project is a plain single repo — there are no git submodules to attach first.

## Rules (read before proceeding)

You may ONLY modify:
- `.claude/agent-config.yaml`

You must NEVER modify:
- `.claude/agents/**` (the subagent definitions)
- `.claude/commands/**`
- Any product/source code
- Any config files outside `.claude/`

## Step 1 — scan the project and identify each stack

A **stack** is one codebase with its own toolchain. Most projects have exactly one (the repo root). A repo with `frontend/` + `backend/` (or `web/` + `api/`, or an `apps/*` workspace) has one stack per directory.

Find them: look for `package.json` files (excluding `node_modules/`), then fall back to obvious top-level source directories. If the repo has no `package.json` at all, it is a single stack rooted at `./`.

For every stack you identify, do the following.

### 1a — Classify the stack type

Read the stack's `package.json`. Determine `type:` by signal:

| Signal (dep name) | Stack type | Notes |
|---|---|---|
| `react-native` | `rn` | Also expect `ios/` and `android/` siblings |
| `astro` | `web` | `web.framework = astro`. Pages are `.astro` files under `src/pages/` (file-based routing); components under `src/components/`, layouts under `src/layouts/` |
| `next` | `web` | Also check for `app/` vs `pages/` dir to set `web.framework` = `next-app-router` vs `next-pages` |
| `@remix-run/react` | `web` | `web.framework = remix` |
| `vite` + `react-router-dom` | `web` | `web.framework = vite-spa` |
| `vite` alone (no react-router) | `web` | `web.framework = vite-spa`; note the router is TBD |
| `@nestjs/core` | `node` | `node.framework = nestjs` |
| `fastify` | `node` | `node.framework = fastify` |
| `express` | `node` | `node.framework = express` |
| `hono` | `node` | `node.framework = hono` |
| (no match but has `react` + `vite`) | `web` | Fallback — `vite-spa` |
| (no match but has `react-native`) | `rn` | Fallback |
| (no `package.json`, but `.html` files present) | `web` | `web.framework = static-html` — plain multi-page site, no bundler |
| (no match) | `<PLACEHOLDER — unknown>` | Ask the user |

If multiple signals match (e.g. a repo with both `react-native` and `next` — rare), ask the user which one the stack primarily is.

### 1b — Detect stack-specific metadata

Per stack type:

- **rn** — note RN version (`react-native` dep version), iOS bundle IDs (from `Info.plist`), Android flavors (from `build.gradle`), Fastlane lanes.
- **web** — from `package.json` deps:
  - `web.framework`: set above
  - `web.styles`: `tailwindcss` → `tailwind`; `styled-components` → `styled-components`; `@emotion/*` → `emotion`; none of those but `*.module.css` files present → `css-modules`; no toolchain at all but `.css` files present → `plain-css`; else `<PLACEHOLDER — unknown>`
  - `web.state_library`: `@reduxjs/toolkit` → `redux-toolkit`; `zustand` → `zustand`; `jotai` → `jotai`; none of those but `@tanstack/react-query` present → `tanstack-query` (server-only state); none → `none`
  - `web.api_library`: `@reduxjs/toolkit` with any slice using `injectEndpoints` → `rtk-query`; `@tanstack/react-query` → `tanstack-query`; `swr` → `swr`; else → `fetch`
  - `web.deploy`: `.vercel/` present → `vercel`; `netlify.toml` → `netlify`; a Pages workflow under `.github/workflows/` → `github-pages`; else omit
- **node** — from `package.json` deps:
  - `node.framework`: set above
  - `node.orm`: `prisma` → `prisma`; `drizzle-orm` → `drizzle`; `typeorm` → `typeorm`; `kysely` → `kysely`; else → `none`
  - `node.validator`: `zod` → `zod`; `joi` → `joi`; `class-validator` → `class-validator`; else → `none`

### 1c — Resolve paths per stack

Look at the stack's actual directory tree. Populate the stack's `paths:` section with real values, prefixed by the stack's `path:` when it isn't the repo root. For each known key in the stack's schema:

- **rn**: `src`, `features`, `components`, `navigation`, `state` (Redux store dir), `slices`, `api`, `hooks`, `utils`, `styles`, `translations`, `screens`, `tests`, `ios_native`, `android_native`, `ios_fastlane`, `android_fastlane`.
- **web**: `src`, `app` (Next app router only), `pages` (Next pages router only, or the directory holding `.html` pages for `static-html`), `components`, `features`, `routing`, `state`, `api`, `hooks`, `utils`, `styles`, `tests`.
- **node**: `src`, `routes`, `controllers`, `middleware`, `schemas`, `db`, `migrations`, `schema_file`, `utils`, `tests`.

If a key doesn't apply (e.g. `app` in a pages-router project, or `slices` in a non-Redux project), omit the key rather than set it to an empty placeholder. Add a short `#` comment saying why it's omitted — the `policy` agent globs every declared path and reports misses, so a wrong path is worse than an absent one.

### 1d — Resolve commands per stack

Detect the package manager (`package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm, `bun.lockb` → bun). Populate `commands:` entries with the correct `cd <stack-path>` prefix (omit the prefix when the stack is the repo root) and package-manager invocation:

- `lint` — e.g. `cd frontend && pnpm lint` (fall back to `pnpm eslint .` if no `lint` script exists)
- `typecheck` — `<pm> tsc --noEmit`
- `unit_test` — `<pm> test`
- Stack-specific: `metro_start` for rn; `dev_server` + `build` for web; `dev_server` + `migrate` + `generate` for node.

**Omit any command the project genuinely doesn't have** — do not invent one and do not write a `<PLACEHOLDER>` for it. A `static-html` stack usually has only `dev_server` (e.g. `python3 -m http.server 8000`). Agents skip missing verification steps and say so in their report; a fabricated command fails loudly on every task.

### 1e — Detect navigation / routing / state / api per stack

- **rn** — `navigation:` block (root navigator, stacks, screen definitions, types).
- **web** — `routing:` block (library detected above, entry file at `app/layout.tsx` / `pages/_app.tsx` / `src/main.tsx` as appropriate; omit entirely for `static-html`, where navigation is plain `<a href>`). `state:` block if state_library != `none`. `api:` block.
- **node** — no navigation/state. `api:` describes the route registration entry point (e.g. `backend/src/app.ts` or `backend/src/main.ts`).

### 1f — Global concerns

- List every `.env*` file for the restricted list.
- List CI workflows (`.github/workflows/**`) and deploy config (`vercel.json`, `.vercel/`, `netlify.toml`) — these stay repo-level.
- Note any signing keys / entitlements / service-account JSON for the restricted list.

### 1g — Set the TypeScript-first flag

Set `typescript_first: true` only if at least one stack has a TypeScript toolchain (`tsconfig.json` present, or `typescript` in devDependencies). Otherwise set it to `false` — demanding `.ts` files in a project with no compiler produces code that cannot run. Say which way you set it and why in the proposal.

**Frameworks with their own component file extension** (`.astro`, `.vue`, `.svelte`) need a qualifier, or the rule reads as false: the flag means "typed code, no stray `.js`", NOT "every new file ends in `.ts`". When such a framework is detected, add a `typescript_first_note:` alongside the flag spelling out the split — e.g. for Astro: *"`.astro` for pages, layouts and components; `.ts` for utilities, data modules and endpoints; no new `.js`."* Specialists read that note before applying the rule.

### 1h — Detect a requirements directory (optional)

Look for a directory of product specs / acceptance criteria (`requirements/`, `docs/requirements/`, `specs/`, `product-docs/`). If one plausibly exists, ask the operator: "Is `<path>` a product-requirements / acceptance-criteria directory I should register under `requirements:` so feature/bug/test specialists consult it?" Use the answer to decide.

If none exists, omit the `requirements:` block entirely — it is optional, and the absent key signals "not configured" to downstream agents.

## Step 2 — propose updates to agent-config.yaml

Present the following for the operator's review, one section per stack:

- **Stack alias + path + type** — e.g. `frontend` → path `frontend/`, type `web`.
- **Detected metadata** — for web: framework, styles, state_library, api_library, deploy. For node: framework, orm, validator. For rn: (none beyond type).
- **`paths:` block** — every key → resolved value (omit keys that don't apply to this stack's shape).
- **`commands:` block** — every key → resolved value, with the detected package manager. Call out which standard commands are absent and why.
- **Framework-specific block** (`navigation:` for rn, `routing:` for web, `state:` / `api:` where applicable).
- **Any fields that had to stay as `<PLACEHOLDER — unknown ...>`** because detection failed — call these out explicitly so the operator can fill them in manually or add a detection rule.

Also propose updates to the global settings:

- The `typescript_first:` value from Step 1g.
- New entries for `restricted_paths` matching this project's sensitive files. The shipped list uses `**/` glob prefixes so it usually works as-is, but call out anything not already covered.
- New entries for `review_required_paths` for the same reasoning.
- New entries for `forbidden_paths` if the stack introduces generated artifact directories not already covered (e.g. Remix `build/`, Nest `dist/`).
- The proposed `requirements:` block from Step 1h, if a requirements directory was found.

## Step 3 — STOP. Wait for the operator to say "proceed".

## Step 4 — apply

Edit `.claude/agent-config.yaml`. Do not edit anything else.

## Step 5 — report

- List all changes made.
- List any anomalies (missing configs, unexpected files, etc.).
- Recommend follow-up actions if needed.

## Step 6 — commit (only if this repo is a git repo)

Stage `.claude/agent-config.yaml`. Commit with message: `"chore: calibrate agent-config to project structure"`. If the project isn't under git, say so and skip.

## When to re-run

For structural changes after initial calibration (new folder, new state slice, new API endpoint group, toolchain change, etc.), run `/recalibrate` — not `/calibrate`.

See [.claude/CALIBRATION.md](../CALIBRATION.md) for the full lifecycle and governance context.
