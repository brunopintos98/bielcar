# Decision ledgers

There is **one ledger per task**, named `<TASK-KEY>.md` (e.g. `SITE-12.md`). Every writer-agent session that mutates files for that task appends a new `## Session N` block to the same file. The ledger grows as the work on the task progresses across sessions, branches, and specialists.

Filename rules (agents resolve these from `git -C <stack-path> rev-parse --abbrev-ref HEAD`):

- Branch matches `^[A-Z][A-Z0-9]+-\d+$` → `<TASK-KEY>.md`.
- Otherwise (feature branches without a task key) → `branch-<slugified-branch-name>.md` (lowercase alphanumerics + hyphens; non-alphanumerics replaced with `-`).
- Detached HEAD or no resolvable branch → `NOTASK.md`.

## File shape

```markdown
# Decision ledger — SITE-12

> Append-only ledger of every writer-agent session that touches this task. Each `## Session N` block is one session. Earlier blocks are never edited; later blocks supersede earlier ones.

---

## Session 1 — ts-feature on `frontend` (started 2026-05-05T14:23:01Z)

\`\`\`yaml
agent: ts-feature
stack: frontend
session_started_utc: 2026-05-05T14:23:01Z
session_ended_utc: 2026-05-05T14:48:33Z
final_status: completed
handoff_slug: profile-screen
files_written:
  - frontend/src/features/Profile/index.tsx
  - frontend/src/features/Profile/styles.ts
\`\`\`

### 1. Initial approved PLAN — 2026-05-05T14:25:11Z

[verbatim PLAN, including the three reasoning fields]

**Approval token:** "proceed"

### 2. Verification — 2026-05-05T14:48:00Z

- lint: pass
- typecheck: pass
- unit_test: 14 pass

---

## Session 2 — state on `frontend` (started 2026-05-06T09:11:42Z)

…
```

The leading `---` separates one session block from the next. Decision-block numbering restarts at `1` inside each session.

## Block types within a session

- **`Initial approved PLAN`** — the first block of every session, written immediately after the user says "proceed" at the first STOP. Captures the verbatim PLAN, including the three reasoning fields the writer agent had to articulate (strongest alternative considered, load-bearing assumption, falsifying observation), the Contracts produced/consumed blocks, and the approval token.
- **`Plan revision`** — fired when, mid-implementation, the agent discovers the existing plan won't work and proposes a revised one. Records trigger, what changed, what this teaches, and the fresh approval token.
- **`Implementation adjustment`** — an in-scope correction the agent makes on its own authority without re-approval (typecheck failure, lint error, typo within an already-approved file). Marked `No re-approval (in scope)` with a `What this teaches` field. If the agent can't articulate a lesson, the change isn't in-scope; the agent is expected to STOP and propose a revision instead.
- **`Verification`** — the last block of every session, written after VERIFY runs. Lists each verification command and its result. Followed by the session's metadata being closed out (`session_ended_utc`, `final_status`, `files_written`, `handoff_slug`).

If a session is abandoned, handed off, or otherwise interrupted before VERIFY, the agent still writes a final block describing why and closes out the session metadata (`final_status: abandoned` or `handed-off`).

## Why these are committed

Ledgers are committed by default. They are how a future engineer or reviewer can answer "why did we do it this way, what did we try first, and what made the original plan wrong" — for the entire span of the task, across every session. The ledger should show the friction. If a session went smoothly, its block is short. If it didn't, its block is long. Earlier blocks are never edited to tidy the sequence. A clean-looking ledger after a hard session is a defect.

Per-agent ledger format and the rules around `Plan revision` vs. `Implementation adjustment` are in each writer agent's `## Decision ledger` section under `.claude/agents/`. The `coherence` agent walks the task's ledger across sessions and cross-checks it against `git diff` after a multi-specialist feature.
