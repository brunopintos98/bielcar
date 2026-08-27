# Agent Calibration & Recalibration

## What is calibration?

Calibration tunes `.claude/agent-config.yaml` to match this project's actual folder structure, commands, and toolchain. `agent-config.yaml` is the only file in `.claude/` that is allowed to know project-specific facts — every subagent reads its paths, commands, and path policies from there instead of hard-coding them. Calibration is what puts the right facts in it.

**Calibration edits `agent-config.yaml` only. It never edits product code, subagent definitions, hooks, or settings.**

Two slash commands drive the process:

| Command | When to run |
|---------|-------------|
| `/calibrate` | Once, when `.claude/` first lands in a project — or after a wholesale restructure |
| `/recalibrate` | Every time the project's structure drifts from `agent-config.yaml` (see triggers below) |

Both walk through a scan → propose → STOP → apply flow. Nothing is written until you say "proceed".

---

## A) When to run `/calibrate`

- `.claude/` was just copied into the project
- The project has been renamed or restructured wholesale
- The repo gained (or lost) a whole codebase — e.g. a `backend/` directory appeared next to the site

**Pre-requisite:** none beyond being in the project root.

---

## B) How to run `/calibrate`

1. Open Claude Code in the project root.
2. Type `/calibrate` and press enter.
3. The command scans the project and proposes changes to `.claude/agent-config.yaml` (and nothing else).
4. Review the proposed changes — especially the `commands:` block and the `typescript_first:` flag.
5. Say **"proceed"** to apply.
6. The command commits the change, if the project is under git.

The detailed workflow lives in the command body itself: [.claude/commands/calibrate.md](commands/calibrate.md).

---

## C) When to run `/recalibrate`

Run `/recalibrate` when any of these happen:

- New top-level folder added (e.g. `src/`, `assets/`, `components/`)
- The project gained a toolchain it didn't have — package.json, a bundler, TypeScript (this usually flips `typescript_first:` too)
- New route group or major page group added
- New state management pattern introduced
- New CI provider added, or existing workflows significantly changed
- TypeScript config changes (`tsconfig.json` paths, strict settings)
- New testing framework or test directory structure
- Migration from one library to another (e.g. static HTML → Vite, Redux → Zustand)

A stale config is not harmless: `policy` globs every declared path on every task and reports misses, so drift shows up as noise on unrelated work.

---

## D) How to run `/recalibrate`

1. Open Claude Code in the project root.
2. Type `/recalibrate` and press enter.
3. Review the diff proposal → say **"proceed"**.
4. The command commits the change with a message like `chore: recalibrate agent-config after <reason>`.

The detailed workflow lives in the command body itself: [.claude/commands/recalibrate.md](commands/recalibrate.md).

---

## E) What changes during calibration

| Artifact | Should change? |
|----------|---------------|
| `.claude/agent-config.yaml` | **Yes** — stacks, paths, commands, path policies, `typescript_first` |
| `.claude/agents/**` | No |
| `.claude/commands/**` | No |
| `.claude/settings.json` | No |
| `SETUP.md`, `CALIBRATION.md`, `MAINTENANCE.md` | No |

---

## F) What must NOT change during calibration

| Artifact | Must NOT change |
|----------|----------------|
| `.claude/agents/**` | Never — subagent definitions are edited deliberately, per MAINTENANCE.md |
| `.claude/commands/**` | Never — same |
| `.claude/settings.json` | Never — hooks + permissions are edited deliberately |
| Any product/source code | Never — calibration does not touch the app |
| `package.json`, `tsconfig.json`, etc. | Never |
| Any application logic | Never |

If a calibration run surfaces the need for a new subagent, or a change to a subagent's description or scope, that's out of scope for `/calibrate` and `/recalibrate` — make the change deliberately, following [MAINTENANCE.md](MAINTENANCE.md).
