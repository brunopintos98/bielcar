# Agentic Workflow Overview

## What It Is

This project uses an **agentic AI workflow** to accelerate development while maintaining strict control over code quality, security, and operational safety. The system is built on Anthropic's Claude Code and consists of **19 specialist subagents** (each defined as a constrained YAML-frontmatter prompt with explicit read/write permissions, tool allowlists, forbidden zones, and mandatory human checkpoints) plus **4 slash commands** for lifecycle operations.

A single repo can hold several **stacks** of mixed types: React Native (`type: rn`), React web (`type: web`), Node backend (`type: node`). Most projects have exactly one, rooted at the repo root. `policy` routes each task to the stack-qualified specialist based on which stack the task targets. Stacks are declared in `.claude/agent-config.yaml`, which `/calibrate` populates by scanning the repo.

Routing is **auto-driven** by Claude Code: the main session reads the user's request, dispatches to the mandatory-first `policy` subagent for triage, and delegates onward to the specialist that `policy` recommends. Enforcement comes from `PreToolUse` and `SubagentStop` hooks in `.claude/settings.json` that block `Edit`/`Write`/`Bash` until the policy subagent has triaged the session.

Subagents are **not autonomous software**. They are structured role definitions that constrain AI-assisted development to well-defined boundaries. Every material change requires explicit human approval before it is applied to the codebase.

---

## Why We Use It

| Concern | Without agentic controls | With agentic controls |
|---------|--------------------------|----------------------|
| **Scope creep** | AI modifies files across unrelated subsystems | Each agent has a declared write scope; cross-boundary changes are blocked |
| **Unreviewed changes** | Edits applied before engineer can assess impact | All agents must list planned changes and **stop for approval** before editing |
| **Security exposure** | Secrets, tokens, or signing keys accidentally modified | Environment files, keystores, and credentials are classified as restricted or forbidden |
| **Native platform risk** | iOS/Android config changes silently break builds | Native agents flag every change as high-risk and require explicit approval |
| **Inconsistent code** | Mixed JavaScript/TypeScript, untyped APIs | TypeScript-first policy enforced when `typescript_first: true`; otherwise agents match the repo's existing conventions |

---

## Security Safeguards

### Credential and Secret Protection

- **Environment files** (`.env`, `.env.staging`, `.env.production`) are
  classified as **restricted** — agents can read them for context but cannot
  modify them without explicit approval.
- **Signing keys** (`*.keystore`, iOS provisioning profiles) are **forbidden** —
  no agent can write to them under any circumstance.
- **Firebase configuration** (`GoogleService-Info.plist`, `google-services.json`)
  is restricted and requires human review for any modification.
- A dedicated **Security Agent** audits the codebase for hard-coded secrets,
  insecure token handling, unencrypted PII storage, and dependency
  vulnerabilities.

### Token and Authentication Safety

- Auth token handling (`accessToken`, `refreshToken`, `idToken`) is isolated to
  specific restricted files. Agents that touch these files must declare the
  change and wait for approval.
- Agents are explicitly instructed to never log or expose tokens, even in error
  messages or debug output.
- Network requests enforce HTTPS. The Security Agent flags any relaxation of
  transport security (iOS ATS, Android network security config).

### Dependency Security

- The **Security Agent** runs `npm`/`yarn` audit and surfaces findings; it is
  read-only and hands vulnerabilities off to the **Dependencies Agent** (agent
  `55`), which owns the bump + verify loop.
- `package.json` is classified as a restricted path and listed in
  `review_required_paths` — every dependency change is planned, stopped for
  explicit approval, then verified against lint / typecheck / unit tests before
  being accepted.
- Lock files (`yarn.lock`, `package-lock.json`) are forbidden from direct agent
  modification. The Dependencies Agent runs `yarn upgrade <pkg>@<version>` and
  lets yarn regenerate the lockfile, preventing supply-chain tampering via
  hand-edited lock contents.

---

## Stability Safeguards

### Domain Isolation

The codebase is divided into ownership domains, **per stack type**. Each agent owns a specific layer within its stack and is **forbidden** from writing to adjacent layers OR into other stacks:

**React Native (`type: rn`):**

| Agent | Owns | Cannot write to |
|-------|------|-----------------|
| ts-feature (30) | RN screens, components, hooks, utilities | Redux store, API layer, navigation config, other stacks |
| state (31) | Redux slices, store configuration | API endpoints, UI components, navigation, other stacks |
| navigation (32) | Navigator definitions, route types | Redux, API, UI components, other stacks |
| api-networking (33) | RTK Query endpoints, request/response types | Redux slices, UI, navigation, other stacks |

**React Web (`type: web`):**

| Agent | Owns | Cannot write to |
|-------|------|-----------------|
| web-feature (70) | React web components, pages, hooks, styles | Web routing, web state, web API, other stacks |
| web-state (71) | Redux / Zustand / Jotai / TanStack Query caches | Web UI, web routing, web API, other stacks |
| web-routing (72) | Next file-router, React Router, TanStack Router, Remix routes | Web UI, web state, web API, other stacks |
| web-api (73) | Web data-fetching client (RTK Query / TanStack / SWR / fetch) | Web UI, web state, web routing, other stacks |

**Node Backend (`type: node`):**

| Agent | Owns | Cannot write to |
|-------|------|-----------------|
| node-api (80) | Routes, controllers, middleware, request validators | ORM schema, migrations, DB queries, other stacks |
| node-data (81) | ORM schema, migrations, queries, seeds | Routes, middleware, validators, other stacks |

This isolation prevents a change in one layer from silently breaking another AND prevents cross-stack writes from sneaking through. When cross-layer or cross-stack work is needed, agents list the out-of-scope requirements in the PLAN's `Contracts produced` / `Contracts consumed` blocks and defer to the responsible specialist via the `.claude/handoffs/` dropbox.

### Mandatory Human Checkpoints

Every agent that modifies code follows a strict protocol:

1. **Read** the current state of affected files.
2. **Plan** — list every file to create or modify, with interfaces and types.
3. **Stop** — present the plan and wait for the engineer to say "proceed."
4. **Implement** — apply changes only after approval.
5. **Verify** — run linting, type checking, and tests; report results.

No code is written until the engineer has reviewed and approved the plan.

### Type Safety

All new source files must be TypeScript (`.ts`/`.tsx`). This is enforced at the
policy level across all agents. Typed interfaces are required for API
request/response payloads, Redux state, navigation parameters, and component
props. The `any` type is prohibited.

### Automated Verification

After every change, agents run the project's standard verification suite:

- **ESLint** for code quality and consistency
- **TypeScript compiler** (`tsc --noEmit`) for type correctness
- **Jest** for unit test regression

Changes that fail any of these checks are flagged before the engineer proceeds.

---

## Compliance and Governance

### Auditability

- Every agent session begins with a **Policy Agent** that establishes ground
  rules and confirms the engineer understands restricted/forbidden boundaries.
- Agent definitions are version-controlled alongside application source code.
  Changes to agent permissions are visible in git history and get the same
  scrutiny as code changes.
- The agent configuration file (`agent-config.yaml`) serves as a single source
  of truth for all path restrictions, commands, and policies. Every change to
  it is a reviewable diff in one place.
- There is **one decision ledger per task** at
  `.claude/change-log/<TASK-KEY>.md` (task key inferred from the active
  branch via `git rev-parse --abbrev-ref HEAD`; non-task branches fall back
  to `branch-<slug>.md`, detached HEAD to `NOTASK.md`). Every writer-agent
  session that mutates files for that task appends a new `## Session N`
  block to the same file — the ledger grows across sessions and specialists.
  Each session block contains the verbatim approved PLAN (including the
  three reasoning fields: strongest alternative considered, load-bearing
  assumption, falsifying observation), each plan revision (with what changed
  and what it teaches), each in-scope adjustment, and a final verification
  block. Ledgers are **committed by default** — they are the durable audit
  trail of the entire task's work, not of any single session. To exclude
  an individual ledger (e.g. one that accidentally captured a secret), add
  a specific entry to `.gitignore`. The earlier per-day file-mutation hook
  was removed in favor of this richer per-task record.
- Cross-specialist TypeScript contracts are persisted under
  [.claude/handoffs/](../handoffs/) so a later session can read what an
  earlier specialist agreed to produce or consume — hand-offs don't decay to
  free-text notes.

### Tiered Review Requirements

Changes are subject to escalating review based on risk:

| Risk tier | Scope | Requirement |
|-----------|-------|-------------|
| Standard | Application source | The agent's normal plan → approve → implement loop |
| Elevated | Root config, entry points, toolchain files, `package.json` | Agent must name the blast radius in its PLAN and get an explicit OK on the diff |
| High | Native code (`ios/`, `android/`), CI/CD, deploy config, environment files | Agent must stop, show the exact change, and get an explicit OK before writing — never bundled with other work |

### Separation of Concerns

- **Subagent definitions** (`.claude/agents/*.md`) and **slash commands** (`.claude/commands/*.md`) define the baseline safety rules and routing behavior. They are portable across projects — change them deliberately, per `.claude/MAINTENANCE.md`, not as a side effect of feature work.
- **Agent config** (`.claude/agent-config.yaml`) is project-calibrated. `/calibrate` and `/recalibrate` own edits here; everything project-specific (paths, commands, restricted files) lives in this one file.
- **Hook enforcement** (`.claude/settings.json`) is what makes the routing contract real rather than advisory. Opting out is documented in `.claude/MAINTENANCE.md`.
- This separation is what lets the harness be copied into the next project and still be correct after one `/calibrate` run.

### CI/CD Protection

- CI/CD and deploy configuration (GitHub Actions workflows, `vercel.json`,
  Fastlane files) is classified as restricted. The Release/CI Agent requires
  explicit approval for every change and recommends validating against a
  staging deploy before production.
- Application source is forbidden from CI/CD agent modification, preventing
  pipeline definitions from silently altering application behavior.

### Data Handling

- The Security Agent audits client-side persistence (Redux Persist, localStorage,
  AsyncStorage) to verify that only approved data categories are stored.
- PII handling is flagged during security reviews. Agents that process user data
  must use explicit TypeScript types — no untyped data flows.

---

## Inventory

### Slash commands (user-triggered lifecycle operations)

| Command | Role | Risk level |
|---------|------|-----------|
| `/calibrate` | First-time tune of `agent-config.yaml` against the repo's real structure | Low (config only) |
| `/recalibrate` | Update `agent-config.yaml` after structural change | Low (config only) |
| `/map` | Read-only architecture report | None (read-only) |
| `/start-task` | Check out (or create) a branch for a unit of work and name its ledger | Low (git checkout only) |

### Specialist subagents (auto-routed via description matching)

| # | Agent | Stack | Role | Risk level |
|---|-------|-------|------|-----------|
| 00 | `policy` | any | **Always-first.** Triage + preflight + target-stack routing + rule enforcement. | None (read-only) |
| 15 | `debug-triage` | any | Diagnose bugs across domains AND stacks. Hard hand-off rules; cross-stack fixes require verbatim acknowledgment. | Medium (broad write scope, enforced guardrails) |
| 17 | `coherence` | any | Read-only integration check after a multi-specialist feature. Verifies hand-off contracts, registrations, cross-stack type parity. | None (read-only) |
| 20 | `test` | any | Write and maintain test files. Runs target stack's configured test command. | Low (test files only) |
| 30 | `ts-feature` | `rn` | Build RN screens, components, hooks. | Low (domain-isolated) |
| 31 | `state` | `rn` | Manage RN Redux store and slices | Low (domain-isolated) |
| 32 | `navigation` | `rn` | Configure React Navigation navigators + route types | Low (domain-isolated) |
| 33 | `api-networking` | `rn` | Define RTK Query endpoints and types (RN client) | Low (domain-isolated) |
| 40 | `ios-native` | `rn` | Modify iOS-specific configuration | High (all changes require approval) |
| 41 | `android-native` | `rn` | Modify Android-specific configuration | High (all changes require approval) |
| 50 | `release-ci` | n/a | Manage CI/CD pipelines and release workflows | High (all changes require explicit approval) |
| 55 | `dependencies` | any | `package.json` bumps + verify loop (per stack) | High (all changes require explicit approval) |
| 60 | `security` | any | Audit codebase across every attached stack. Per-stack-type checklist. | Read-only auditor |
| 70 | `web-feature` | `web` | React web components, pages, hooks. Framework-aware. | Low (domain-isolated) |
| 71 | `web-state` | `web` | Web client state: Redux Toolkit / Zustand / Jotai / TanStack Query | Low (domain-isolated) |
| 72 | `web-routing` | `web` | Web routing: Next file-router / React Router / TanStack / Remix | Low (domain-isolated) |
| 73 | `web-api` | `web` | Web data-fetching client: RTK Query / TanStack / SWR / fetch | Low (domain-isolated) |
| 80 | `node-api` | `node` | Node backend routes / controllers / middleware / validation (Express / Fastify / NestJS / Hono) | Medium (writes app HTTP surface) |
| 81 | `node-data` | `node` | ORM schema / migrations / queries (Prisma / Drizzle / TypeORM / Kysely) | High for schema edits (data loss risk) |

---

## Maintenance and Evolution

Agent definitions are maintained alongside the application. The maintenance model includes:

- **Trigger-based updates** — subagents are revised when dependencies upgrade, architecture changes, or new platform requirements emerge.
- **Calibration process** — when the project structure changes, the `/recalibrate` slash command updates `agent-config.yaml` without touching the subagent definitions or the hook enforcement layer.
- **Deprecation protocol** — subagents no longer needed are formally deprecated, not silently removed.

Full maintenance procedures are documented in [.claude/MAINTENANCE.md](../MAINTENANCE.md).

---

## Summary

The agentic workflow provides three guarantees:

1. **No unsupervised code changes.** Every modification is planned, presented to
   the engineer, and approved before execution.
2. **No cross-boundary side effects.** Domain isolation prevents changes in one
   layer from silently affecting another.
3. **No access to sensitive assets.** Credentials, signing keys, and CI/CD
   pipelines are protected by layered restrictions that agents cannot override.

These controls are version-controlled, auditable, and enforced consistently
regardless of which engineer is operating the AI tooling.
