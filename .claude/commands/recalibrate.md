---
description: Recalibrate .claude/agent-config.yaml after a structural change — new source directory, new state slice, new API endpoint group, toolchain change, CI change, or major refactor.
argument-hint: (no args — interactive)
allowed-tools: Read, Write, Edit, Bash, Task, Grep, Glob
---

# /recalibrate — update agent-config.yaml after structural changes

Run when the project's structure has drifted from `.claude/agent-config.yaml`. For first-time calibration, use `/calibrate` instead.

## When to run

- New top-level folder added (e.g. `src/`, `assets/`, `components/`)
- The project gained a toolchain it didn't have (package.json, a bundler, TypeScript) — this usually also flips `typescript_first:`
- New route group, page group, or major screen group added
- New state management pattern introduced
- New API endpoint group or data layer
- New CI provider or significantly changed workflows
- New testing framework or test directory structure
- Migration from one library to another (e.g. Redux → Zustand, static HTML → Vite)

If a whole new stack appears (a `backend/` directory next to the existing site, say), `/recalibrate` can add it — but if the repo layout changed fundamentally, re-run `/calibrate` instead.

## Rules (read before proceeding)

You may ONLY modify:
- `.claude/agent-config.yaml`

You must NEVER modify:
- `.claude/agents/**`
- `.claude/commands/**`
- Any product/source code
- Any config files outside `.claude/`

## Step 1 — diff

Compare the current project against `agent-config.yaml` AND against the last architecture snapshot at `.claude/map/LAST.md` (if it exists — written by `/map`). The snapshot catches drift that `agent-config.yaml` alone misses, like a new module that still resolves under an existing `paths:` entry but wasn't there when the map was last taken.

- If `.claude/map/LAST.md` exists, summarize what's changed since that snapshot — new/removed directories, pages, state, endpoints.
- Are there codebases in the repo that are missing from `stacks:` (or stacks pointing at directories that no longer exist)?
- For each stack, has its `package.json` gained or lost a framework-indicator dep (e.g. switched from Express to Fastify, or gained Vite where there was none)? Re-run the detection from `/calibrate` Step 1a–1b and flag drift.
- New directories inside a stack that aren't listed in that stack's `paths:`?
- Do all declared `paths:` still resolve? A path that no longer exists makes `policy` report a preflight miss on every task.
- New restricted files not in `restricted_paths` (new `.env*`, deploy config, signing files)?
- Commands that have changed (package-manager switch, new script names)? Newly available commands that were previously omitted (e.g. a `lint` script now exists) — add them. Commands that no longer work — remove them rather than leave them broken.
- Should `typescript_first:` flip? (See `/calibrate` Step 1g — it tracks whether a TS toolchain exists.)
- Routing / navigation structure changed?
- State management changed (new library added; e.g. TanStack Query added on top of Redux)?
- API layer changed?
- Is there now a product-requirements directory that isn't registered under `requirements:` (or vice versa)? Same detection rules as `/calibrate` Step 1h.
- If `.claude/map/LAST.md` does not exist, recommend the operator run `/map` first so future `/recalibrate` runs have a baseline to diff against.

## Step 2 — propose updates

For each finding, describe exactly what you will add/change/remove in `agent-config.yaml`. Include stack prefixes.

## Step 3 — STOP. Wait for the operator to say "proceed".

## Step 4 — apply

Edit `.claude/agent-config.yaml`. Nothing else.

## Step 5 — report

- List all changes made.
- Flag any agent scopes that may need review (e.g. a newly added stack's forbidden paths may conflict with an existing specialist's ownership).
- Recommend if a new subagent should be created (out of scope for this command — see `.claude/MAINTENANCE.md`).

## Step 6 — commit (only if this repo is a git repo)

Stage only `.claude/agent-config.yaml`. Commit with message: `"chore: recalibrate agent-config after <short reason>"`. If the project isn't under git, say so and skip.

See [.claude/CALIBRATION.md](../CALIBRATION.md) for governance context.
