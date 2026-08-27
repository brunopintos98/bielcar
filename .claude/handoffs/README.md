# Hand-off contracts

This directory is the coordination layer between specialist subagents. When a feature touches more than one specialist's domain (e.g. `ts-feature` + `api-networking` + `state`), the TypeScript interfaces each specialist produces and consumes are persisted here as an explicit contract rather than a free-text note that decays.

## Why

Without a persisted contract, a later session for a consuming specialist has no way to read what the producing specialist agreed to. Types diverge, screens reference slice shapes that don't exist, and the project silently loses coherence — exactly the failure mode this harness is meant to prevent.

## Writing a hand-off file

Agent that produces or consumes a cross-specialist contract writes `<feature-slug>.md` to this directory **after** the user approves the PLAN. One file per feature, amended if the contract evolves.

Format:

```markdown
# Handoff: <feature name>

_Created by <agent> on <YYYY-MM-DD>. Consumers read this before editing related files._

## Contracts

### <InterfaceName>

- **Producer:** <specialist>
- **Consumers:** <specialist, specialist>
- **Defined in:** <file path inside the product code>
- **Status:** `proposed` | `approved`
- **Strongest alternative considered:** <one sentence naming the design that was rejected and why>
- **Load-bearing assumption:** <one sentence naming what must be true for this contract shape to be right>
- **Falsifying observation:** <one sentence naming what would make this shape wrong (a behavior, a load condition, a downstream consequence)>
- **Shape:**
  ```ts
  interface InterfaceName {
    // …
  }
  ```

### <NextInterface>
...
```

The three reasoning fields are not optional. If any of them is `n/a` or empty, the contract isn't ready to be written down — the producing agent should STOP and ask the user to clarify before persisting the handoff. The fields make later sessions auditable: a consumer that reads the file knows not just *what* shape was agreed, but *why* this shape and not another, *what assumption* it depends on, and *what observation* should trigger a revision.

`status: proposed` means "the producer plans to create this but it doesn't exist yet." `status: approved` means "the producer has shipped this and it's live in the codebase."

## Reading a hand-off file

Every writer agent starts its READ phase by globbing `.claude/handoffs/*.md`. If any file lists a contract this task consumes, the agent MUST:

1. Treat the shape as load-bearing — do not silently diverge from it.
2. If the task requires an amendment (field added/renamed/typed differently), propose the amendment in its own PLAN's `Contracts consumed` section as `status: amendment-proposed` and stop for approval.

## Lifecycle

- Hand-off files persist across sessions. They are committed to the repo so later sessions and reviewers can read them.
- When a feature is shipped and the contracts have stabilized, the producer may delete the file or move it to an archived/ subdirectory. Either way, document the resolution in the commit message.
- Do not let stale `proposed` entries accumulate. If a contract is abandoned, remove the file in the same PR that abandons the work.

## Who writes here

Today: `ts-feature`, `state`, `navigation`, `api-networking`, `debug-triage`. Each has `.claude/handoffs/**/*.md` in its write scope.

Slash commands (`/map`, `/calibrate`, `/recalibrate`) do not write here — they may read.
