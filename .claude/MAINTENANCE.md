# Maintenance Guide — editing the agent system itself

Audience: whoever is changing the harness under `.claude/` — the subagent definitions, the slash commands, the hooks. Day-to-day feature work doesn't need this file; it works from the router at the root [CLAUDE.md](../CLAUDE.md) and the slash commands.

This guide covers: the ownership model, maintenance invariants that must be preserved, care levels for different kinds of change, the change checklist, when/how to add a new subagent, and the procedure for opting out of the policy-first hook.

---

## Ownership model

| Layer | What it is | How it changes |
|-------|-----------|----------------|
| `.claude/agents/**` | Subagent definitions (harness) | Deliberate edit, following this guide |
| `.claude/commands/**` | Slash commands (harness) | Deliberate edit, following this guide |
| `.claude/settings.json` | Hooks + Bash allowlist (enforcement) | Deliberate edit — highest care level |
| `.claude/agent-config.yaml` | Project facts (paths, commands, policies) | `/calibrate` and `/recalibrate` own it |
| `CLAUDE.md` (root, router) | The session routing contract | Deliberate edit — it governs every session |
| `.claude/SETUP.md` | How the harness is wired | Deliberate edit |
| `.claude/CALIBRATION.md` | Calibration lifecycle | Deliberate edit |
| `.claude/MAINTENANCE.md` | This file | Deliberate edit |

The line that matters: **`agent-config.yaml` is the only file that knows project-specific facts.** Everything else in `.claude/` is portable — it should be copy-pasteable into the next project and still be correct after one `/calibrate` run.

---

## Maintenance invariants

These must survive every change to the harness:

1. **Agent file format** — every file under `.claude/agents/*.md` starts with YAML frontmatter (`name`, `description`, `tools`, `model`), followed by a body that IS the subagent's system prompt. No `## Canonical prompt` copy/paste fences.
2. **`description` field discipline** — Claude Code auto-routes subagents purely by matching user intent against the `description` field (capped at 1536 chars). Descriptions must be keyword-rich and front-load the agent's intent.
3. **Policy-first enforcement** — the `PreToolUse` + `SubagentStop` hooks in `.claude/settings.json` are the primary mechanism. The router directive in root `CLAUDE.md` is belt-and-suspenders. Turning the gate off is a deliberate decision (see "Opting out" below), not a side effect of another change.
4. **Agent-config.yaml is the single source of truth** — no subagent may hard-code paths or commands. All references go through `.claude/agent-config.yaml`.
5. **Numeric prefixes on agent filenames** encode risk tier / band for human browsing. Claude doesn't use them for routing — the `description` field does. Keep the prefix convention as-is:

   | Band | Purpose | Current occupants |
   |---|---|---|
   | `00` | Policy / triage (single slot) | `policy` |
   | `10s` | Read-heavy or cross-cutting | `debug-triage` (15), `coherence` (17) |
   | `20s` | Tests | `test` (20) |
   | `30s` | React Native writers (stack type `rn`) | `ts-feature` (30), `state` (31), `navigation` (32), `api-networking` (33) |
   | `40s` | Native / HIGH-RISK platform work (RN) | `ios-native` (40), `android-native` (41) |
   | `50s` | CI / release / lifecycle | `release-ci` (50), `dependencies` (55) |
   | `60` | Security auditing (single slot) | `security` (60) |
   | `70s` | React web writers (stack type `web`) | `web-feature` (70), `web-state` (71), `web-routing` (72), `web-api` (73) |
   | `80s` | Node backend writers (stack type `node`) | `node-api` (80), `node-data` (81) |
   | `90+` | Project-specific custom agents | (none shipped) |

   Gaps between numbers (e.g. 15 → 17 → 20) are intentional — they leave room to insert a related specialist without renumbering. Adding a new agent: pick the next free slot in the correct band. Adding support for a new stack type (e.g. Python backend, Go backend): claim a new 10s band starting at 90s.
6. **Domain isolation** — `ts-feature` / `state` / `navigation` / `api-networking` forbid writing into each other's folders. If you add or rename a domain, update every affected agent's Forbidden paths section AND the corresponding `paths:` entry in `agent-config.yaml`.
7. **Path policy is centralized** — `restricted_paths` / `review_required_paths` / `forbidden_paths` live in `agent-config.yaml`, not scattered through agent bodies. An agent body may narrow its own scope further, but it never grants itself access the config denies.
8. **Slash commands delegate to `policy` first** — every slash command body begins with "Step 0 — delegate to policy". This is what lets the `SubagentStop` hook unblock subsequent Edit/Write/Bash inside the command.

---

## Update triggers

Update agent definitions and config when:

| Trigger | What to update |
|---------|---------------|
| A whole new codebase joins the repo (e.g. `backend/` next to the site) | Run `/recalibrate` (or `/calibrate` if the layout changed wholesale) |
| Project gains a toolchain (package.json, bundler, TypeScript) | Run `/recalibrate` — it also flips `typescript_first:` |
| New folder inside a stack | `agent-config.yaml` paths via `/recalibrate`; affected agent scope sections |
| New Redux slice | `.claude/agents/31-state.md` and `agent-config.yaml → state:` |
| New API endpoint group | `.claude/agents/33-api-networking.md` and `agent-config.yaml → api:` |
| New navigation stack | `.claude/agents/32-navigation.md` and `agent-config.yaml → navigation:` |
| New native dependency (pod/gradle) | `.claude/agents/40-ios-native.md` or `41-android-native.md` |
| CI workflow changes | `.claude/agents/50-release-ci.md` |
| New env file | `agent-config.yaml → restricted_paths` (via `/recalibrate`) |
| Testing framework change | `.claude/agents/20-test.md` and `agent-config.yaml → commands` |
| Package rename / rebrand | Run `/recalibrate` |
| Major refactor | Run `/recalibrate` |

---

## Care levels

This is a solo, local project — "review" here means how much deliberation a change deserves before you apply it, not a sign-off from someone else. The tiers still matter: they mark which edits can silently widen what the agents are allowed to do.

### Standard — apply after a normal read-through

- Updating `agent-config.yaml` paths/commands to match new source structure
- Adding new paths to `agent-config.yaml`
- Minor wording in subagent bodies that doesn't change scope

### Deliberate — re-read the diff, and say out loud what it widens

- **Any scope widening** — expanding an agent's WRITE scope (either the body's "What I will write" section OR the `tools` frontmatter)
- **Removing restrictions** — entries removed from `restricted_paths`
- **Removing forbidden paths** — previously forbidden areas made writable
- **Adding a new subagent file** (new numbered definition under `.claude/agents/`)
- **Adding a new slash command** (new file under `.claude/commands/`)
- **Changing hook behavior** in `.claude/settings.json`

### High care — these change what the harness is allowed to do at all

- Changes involving `ios/**` or `android/**` agent scopes (`40-ios-native.md`, `41-android-native.md`)
- Changes involving CI/CD agent scope (`50-release-ci.md`)
- Changes involving env or secrets-related restrictions
- Changes to security agent scope (`60-security.md`)
- Any change to the policy subagent (`00-policy.md`) — it routes everything
- Any change to `.claude/settings.json` hooks — enforcement layer
- Any change that touches the root `CLAUDE.md` router — it governs every session

---

## Agent update checklist

```markdown
## Agent Update Checklist

- [ ] No product code was modified in this PR
- [ ] Frontmatter `name`, `description`, `tools`, `model` present and correct
- [ ] Description is keyword-rich and under 1536 chars
- [ ] `agent-config.yaml` paths still match current project structure
- [ ] `agent-config.yaml` commands are valid
- [ ] All agents reference `agent-config.yaml` for paths/commands
      (no hard-coded paths or commands in agent bodies)
- [ ] READ scope is minimal — agent only reads what it needs
- [ ] WRITE scope is minimal — agent only writes to its domain
- [ ] Forbidden paths are consistent across agents (no overlapping writes)
- [ ] Restricted paths are listed for any sensitive files
- [ ] TypeScript-first rules preserved in every writer agent
- [ ] File-list → STOP → proceed checkpoint present in every writer agent's workflow
- [ ] Hand-off / "Out-of-scope required changes" section present
- [ ] Scope changes have appropriate review level (see Review Requirements above)
- [ ] Hook behavior in `.claude/settings.json` unchanged (or change reviewed separately)
```

---

## Adding a new subagent

If the project grows to need an additional subagent (e.g., dedicated analytics or i18n agent):

1. Create `.claude/agents/NN-<name>.md` with the next available number in the appropriate risk band — see the numbering table under "Maintenance invariants" above.
2. Follow the structure of existing agents:
   - YAML frontmatter: `name`, `description` (keyword-rich), `tools`, `model`
   - Purpose / When to delegate to me
   - What I will read / write / never touch
   - Restricted paths
   - TypeScript-first rules (if writer)
   - Workflow (file list → STOP → proceed)
   - Hand-off / Out-of-scope required changes
3. Update sibling agents' Forbidden paths to exclude the new agent's domain.
4. Update the specialist inventory table in the root `CLAUDE.md` router.
5. Update the inventory in [.claude/agents/Agentic-Workflow-Overview.md](agents/Agentic-Workflow-Overview.md).
6. Treat it as a **deliberate** change (see Care levels).

---

## Adding a new slash command

1. Create `.claude/commands/<name>.md` with frontmatter: `description`, `argument-hint`, `allowed-tools`.
2. Body should start with "Step 0 — delegate to policy first" so the `SubagentStop` hook creates the marker and unblocks subsequent tools.
3. Add the command to the slash-command table in root `CLAUDE.md`.
4. Note it in `.claude/SETUP.md` if it's a lifecycle op.
5. Treat it as a **deliberate** change (see Care levels).

---

## Deprecating an agent

1. Remove the file from `.claude/agents/`.
2. Update every sibling agent that referenced it (forbidden paths, hand-off sections).
3. Update the inventory in root `CLAUDE.md` and [Agentic-Workflow-Overview.md](agents/Agentic-Workflow-Overview.md).
4. Note the removal and the rationale in the commit message.

---

## Model-selection guidance

Subagents carry a tiered model assignment (see each agent's frontmatter). Valid values: `opus`, `sonnet`, `haiku`. Override per-file whenever a specific agent is underperforming.

Current assignment:

| Agent | Model | Why |
|---|---|---|
| `policy` | `opus` | Router brain; needs good classification across every intent |
| `debug-triage` | `opus` | Cross-domain + cross-stack reasoning; often the hardest task in a session |
| `coherence` | `sonnet` | Structured integration check; sonnet is plenty |
| `security` | `opus` | Auditor; broad-surface reasoning across multiple stacks |
| `ios-native` | `opus` | HIGH-RISK; expensive mistakes |
| `android-native` | `opus` | HIGH-RISK; expensive mistakes |
| `release-ci` | `opus` | HIGH-RISK; pipeline correctness |
| `dependencies` | `sonnet` | Structured bump + verify loop |
| `ts-feature` | `sonnet` | Narrow domain; TS component scaffolding |
| `state` | `sonnet` | Structured `createSlice` work |
| `navigation` | `sonnet` | Structural wiring |
| `api-networking` | `sonnet` | Structural + type work |
| `test` | `haiku` | Test scaffolding is boilerplate-heavy |
| `web-feature` | `sonnet` | Framework-aware but conventions are narrow |
| `web-state` | `sonnet` | Library-specific conventions, well-defined |
| `web-routing` | `sonnet` | Framework-specific conventions, well-defined |
| `web-api` | `sonnet` | Library-specific conventions, well-defined |
| `node-api` | `sonnet` | Framework-specific route scaffolding |
| `node-data` | `sonnet` | ORM-specific conventions; schema planning benefits from sonnet's reasoning |

For an opus-everywhere posture, bulk-upgrade:

```sh
# Optional: pin everything to opus for this project
perl -pi -e 's/^model: (sonnet|haiku)/model: opus/' .claude/agents/*.md
```

Or mix-and-match by editing individual frontmatters.

---

## Platform / shell requirements

Hook scripts under `.claude/hooks/` are bash, and the policy-gate hook additionally uses `python3` for JSON parsing of the PreToolUse event payload. Both ship with macOS and with every mainstream Linux distro used for Node / React Native development.

Windows dev boxes need WSL (or Git Bash + a `python3` on `$PATH`). Native Windows cmd/PowerShell is not supported — the hooks won't run and the policy gate will fail closed (blocking all writes) until the shell is fixed. If you need Windows-native support, port `policy-gate.sh` to PowerShell and swap the `command:` entries in `.claude/settings.json` on Windows dev boxes via a local `settings.local.json` override. Track that as a project-side decision.

If `python3` is missing but bash is present, `policy-gate.sh` falls back to its pre-scoping behavior (block every Edit/Write/Bash until policy runs). The scope-to-project-dir optimization is a convenience, not a safety property.

## Opting out of the policy-first hook

The `PreToolUse` + `SubagentStop` hooks in `.claude/settings.json` enforce policy-first across every session. To bypass it (a pure read-only exploration session, a scripted automation context):

- **Ad hoc**: `touch .claude/.policy-ran`. The gate checks for that file, so this removes it until the file is deleted. Add `.claude/.policy-ran` to `.gitignore` so it doesn't get committed.
- **Force the hop back on**: `rm .claude/.policy-ran`. Worth doing at the start of a real work session — the marker is a file, not per-session state, so once `policy` has run once it stays satisfied forever.
- **Permanently** (not recommended): remove the `PreToolUse` hook from `.claude/settings.json`. Policy remains invokable — the contract just stops being enforced.

---

## Recommended cadence

| Activity | When |
|----------|------|
| Re-read agent scopes for accuracy | Whenever an agent misroutes twice in a row |
| Audit `restricted_paths` completeness | After adding any new secret, deploy config, or signing material |
| Re-evaluate agent boundaries | After a major architectural refactor |
| Run `/recalibrate` | Any time the repo layout or toolchain changes |

---

## Invariants for changes to this file

Changes to `MAINTENANCE.md` itself should preserve:

- Clear ownership model table.
- The "agent update PR checklist" section — engineers rely on it.
- The "adding a new subagent" procedure — ensures consistent structure.
- The opt-out-of-hook documentation — it's the escape hatch when the gate gets in the way.
