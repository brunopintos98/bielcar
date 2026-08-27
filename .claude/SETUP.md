# Setup — how this agent system is wired

`.claude/` is a self-contained agent harness: a triage router, a set of specialist subagents, a few lifecycle slash commands, and two hooks that enforce the routing contract. It was copied into this project from another codebase and then adapted — there is no upstream template to sync with, so everything in here is yours to edit.

## What's in the box

```
.claude/
├── agent-config.yaml     # the ONE file with project-specific paths, commands, and path policies
├── settings.json         # hooks + Bash permission allowlist
├── agents/               # the subagent definitions (numbered by routing order)
├── commands/             # slash commands: /calibrate /recalibrate /map /start-task
├── hooks/                # policy-gate.sh (blocks writes until `policy` runs), lifecycle-marker.sh
├── change-log/           # decision ledgers, one per task/branch
├── handoffs/             # cross-specialist type contracts
├── reviews/              # scratch space for review output
├── SETUP.md              # this file
├── CALIBRATION.md        # how /calibrate and /recalibrate work
└── MAINTENANCE.md        # how to edit the agents themselves
```

## First run in a new project

1. Drop `.claude/` into the repo root.
2. Run `/calibrate`. It scans the repo, detects the stack type and toolchain, and rewrites `agent-config.yaml` to point at real paths and real commands. Review its proposal, say **proceed**.
3. (Optional) Run `/map` to take an architecture snapshot at `.claude/map/LAST.md`. Later `/recalibrate` runs diff against it.
4. Start working. Describe what you want; `policy` triages it and routes to the right specialist.

## The routing contract

Every session hops through the `policy` subagent before any Edit/Write/Bash. This is enforced by `hooks/policy-gate.sh`, a `PreToolUse` hook that blocks those tools until the marker file `.claude/.policy-ran` exists — created by a `SubagentStop` hook when `policy` finishes.

Two things worth knowing about the gate:

- **The marker is a file on disk, not per-session state.** Once `policy` has run once, the marker persists and the gate stops blocking. Delete `.claude/.policy-ran` when you want to force the routing hop again.
- **Lifecycle commands bypass it.** `hooks/lifecycle-marker.sh` pre-creates the marker when a prompt starts with `/calibrate`, `/recalibrate`, `/map`, or `/start-task`, so those commands' own steps don't trip the gate.

To turn the gate off entirely, remove the `PreToolUse` block from `settings.json`. See MAINTENANCE.md → "Opting out of the policy-first hook".

## Day-to-day loop

```
  describe the work
        │
        ▼
  policy  ──▶ triage report: intent, target stack, affected files,
        │      restricted-path hits, RECOMMENDED NEXT AGENT
        ▼
  specialist  ──▶ READ → PLAN → STOP for approval → IMPLEMENT → VERIFY
        │           (writes a decision ledger under change-log/,
        │            and a handoff contract if the work crosses specialists)
        ▼
  coherence (optional, after a multi-specialist feature)
```

The STOP is real: specialists present a file list and a plan, and wait for you to say "proceed" before writing anything.

## When the project changes shape

- New directory, new toolchain, new library → `/recalibrate`
- Wholesale restructure → `/calibrate` again
- Want to know how something is wired → `/map <area>`

## No external integrations

This harness talks to nothing outside the repo. There is no issue-tracker integration, no design-tool integration, and no telemetry. `/start-task` names a branch and a ledger file; that's the whole of it.
