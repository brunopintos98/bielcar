#!/usr/bin/env bash
# .claude/hooks/policy-gate.sh
#
# PreToolUse gate for Edit / Write / MultiEdit / Bash. Blocks these tools
# until the `policy` subagent has run for this session — the marker at
# $CLAUDE_PROJECT_DIR/.claude/.policy-ran is created by a SubagentStop hook
# that matches the `policy` agent (see settings.json).
#
# Project-scoping: writes whose target is OUTSIDE $CLAUDE_PROJECT_DIR are
# allowed to pass through (e.g. plan-mode writes to ~/.claude/plans/*.md).
# The gate only governs work that touches this project.
#
# Bash commands are not project-scoped here because classifying a shell
# command as in/out of project requires parsing the command, which is
# fragile. Bash stays gated; that matches the harness's existing intent.

set -euo pipefail

INPUT="$(cat)"

# Prefer precise JSON parsing via python3 (ships with macOS, typical on Linux).
# If python3 is absent, fall through to the unconditional marker check — the
# safe default (block rather than leak).
if command -v python3 > /dev/null 2>&1; then
  FILE_PATH="$(
    printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
tool = d.get("tool_name", "")
tinp = d.get("tool_input") or {}
if tool in ("Edit", "Write", "MultiEdit"):
    fp = tinp.get("file_path") or ""
    sys.stdout.write(fp)
' 2>/dev/null || printf '')"

  if [[ -n "$FILE_PATH" && -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    case "$FILE_PATH" in
      "${CLAUDE_PROJECT_DIR}"/*) ;;   # inside project — enforce marker below
      "${CLAUDE_PROJECT_DIR}")   ;;   # (edge case; same path) — enforce
      *) exit 0 ;;                    # outside project — allow
    esac
  fi
fi

if [[ ! -f "${CLAUDE_PROJECT_DIR:-}/.claude/.policy-ran" ]]; then
  printf 'BLOCKED: the `policy` subagent has not run this session. Before any Edit/Write/Bash, delegate to the `policy` subagent (Task tool) first — it will triage the request and return RECOMMENDED NEXT AGENT. See root CLAUDE.md for the routing contract.\n' >&2
  exit 2
fi

exit 0
