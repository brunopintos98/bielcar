---
description: Prep development for a task — check the working tree is clean, check out (or create) the task branch, and note the requirements path so the next specialist knows where to look.
argument-hint: <task-key-or-slug> (e.g., SITE-12 or hero-carousel)
allowed-tools: Read, Bash, Task
---

# /start-task — prep a branch for a unit of work

Takes a task key or slug (e.g. `SITE-12`, `hero-carousel`), checks out a branch named after it, and hands off to the normal `policy` → specialist routing. There is no external issue tracker in this project — the task name is whatever you type, and it becomes both the branch name and the decision-ledger filename.

## Step 1 — read agent-config.yaml

Read `.claude/agent-config.yaml`. Build the list of `stacks:` entries with their alias and `path:`. If the `stacks:` map is empty (`stacks: {}`), STOP and tell the operator: "agent-config.yaml has no stacks configured — run `/calibrate` first."

## Step 2 — pick the target stack

- If exactly one stack is defined: use it silently. Report which path you'll operate in.
- If more than one stack is defined: list each as `<alias> → <path>`, then ask the operator which one. Default to the first stack in the map if the operator just confirms without naming one.
- The chosen stack's `path:` is the directory the rest of this command operates in. For a single-stack project rooted at the repo, that path is `./`.

## Step 3 — pre-checkout safety

In the chosen path:

1. Run `git -C <path> rev-parse --is-inside-work-tree`. If it fails, this isn't a git repo — print `(not a git repo — skipping branch checkout)` and jump to Step 5. Do NOT run `git init` on your own; offer it and let the operator decide.
2. Run `git -C <path> status --porcelain`. If output is non-empty, STOP and tell the operator the working tree has uncommitted changes — they must commit or stash before `/start-task` can proceed. Do not auto-stash.
3. If a remote named `origin` exists (`git -C <path> remote`), run `git -C <path> fetch --all --prune` to refresh remote refs. Skip silently if there is no remote.

## Step 4 — checkout the branch

The branch name is the argument verbatim (e.g. `SITE-12`, `hero-carousel`). Resolve which form of checkout to use:

- If the branch exists on `origin` (`git -C <path> ls-remote --exit-code --heads origin <NAME>` returns 0):
  ```
  git -C <path> checkout <NAME>
  git -C <path> pull --ff-only
  ```
- Else if the branch exists locally (`git -C <path> show-ref --quiet --verify refs/heads/<NAME>` returns 0):
  ```
  git -C <path> checkout <NAME>
  ```
- Else (new branch) — create it off whatever HEAD currently points at (typically `main`):
  ```
  git -C <path> checkout -b <NAME>
  ```

Report which form ran and the resulting `git -C <path> rev-parse --abbrev-ref HEAD` so the operator can confirm.

## Step 5 — note the requirements path for the next specialist

Read `.claude/agent-config.yaml` and resolve the requirements path for the chosen stack, in this order:

1. **Stack-scoped (preferred)** — if `stacks.<chosen-stack>.requirements.path` is set, use that.
2. **Top-level fallback** — else if a top-level `requirements.path` is set, use that.
3. **Not configured** — else, print `(no requirements path configured for stack '<chosen-stack>')` and proceed silently.

When a path resolves, print:

```
(requirements path for <chosen-stack>: <resolved-path> — the next specialist will search it for context related to <NAME>)
```

`/start-task` does NOT glob the requirements directory itself. The responsible specialist agent searches the path when planning, using the task name and task-related keywords as search terms. The integration is optional, never blocking.

## Step 6 — hand off

Print a final summary:

```
Checked out <NAME> in <path>.
Ledger for this work will be .claude/change-log/<NAME>.md (or branch-<slug>.md).
Ready — tell me what you want to build and I'll route through the appropriate specialist.
```

## Rules

- This command does NOT commit anything. It only checks out a branch and prints context.
- Do NOT touch the working tree beyond `git fetch` / `git checkout` / `git pull --ff-only`.
- If any git command fails (auth, network, ref conflict), STOP and report. Do not run destructive cleanup.
- Branch name = the argument verbatim. Do not lowercase, do not prefix.

## When to use vs not

Use `/start-task <name>` at the start of a new unit of work. After it returns, describe the work — the appropriate specialist (`web-feature`, `ts-feature`, `node-api`, etc.) will be auto-routed via `policy` as usual.

Don't use it for a one-line fix on the branch you're already on — just describe the work directly.
