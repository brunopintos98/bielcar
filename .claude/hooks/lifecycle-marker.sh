#!/usr/bin/env bash
# .claude/hooks/lifecycle-marker.sh
#
# UserPromptSubmit hook. When the operator submits a known lifecycle slash
# command (/calibrate, /recalibrate, /map, /start-task), pre-create
# the policy session marker at $CLAUDE_PROJECT_DIR/.claude/.policy-ran so the
# command's constrained Bash/Edit steps aren't blocked by policy-gate.sh.
#
# These commands have a known-safe workflow and don't need policy triage of
# their own actions — the real triage happens on the next user turn, when the
# operator describes actual engineering work, per CLAUDE.md's session-routing
# directive.
#
# Always exits 0 (non-blocking). Never echoes the prompt or any payload field.
set -euo pipefail

INPUT="$(cat)"

if ! command -v python3 > /dev/null 2>&1; then
  # No python3 — be safe and do nothing. The gate stays in force, which just
  # means the user sees the old "delegate to policy first" path. Not an error.
  exit 0
fi

PROMPT="$(
  printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
p = d.get("prompt") or ""
sys.stdout.write(p)
' 2>/dev/null || printf '')"

# Strip leading whitespace, then take the first token (up to first space/newline).
TRIMMED="${PROMPT#"${PROMPT%%[![:space:]]*}"}"
FIRST_TOKEN="${TRIMMED%%[[:space:]]*}"

case "$FIRST_TOKEN" in
  /calibrate|/recalibrate|/map|/start-task)
    if [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
      mkdir -p "${CLAUDE_PROJECT_DIR}/.claude"
      touch "${CLAUDE_PROJECT_DIR}/.claude/.policy-ran"
    fi
    ;;
esac

exit 0
