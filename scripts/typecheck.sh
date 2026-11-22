#!/usr/bin/env bash
# Typecheck project sources. AGS/gnim ship .ts sources that fail under strict
# tsc; those dependency diagnostics are ignored. Failures under src/ or app.tsx
# are real.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d @girs ]] || [[ ! -e node_modules/ags ]]; then
  echo "hint: run bun run types first (needs ags on PATH)" >&2
  bash "$ROOT/scripts/types.sh"
fi

OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

set +e
bunx tsc --noEmit -p tsconfig.json >"$OUT" 2>&1
tsc_status=$?
set -e

if [[ "$tsc_status" -eq 0 ]]; then
  echo "typecheck ok"
  exit 0
fi

# tsc prints "path(line,col): error TS...." — keep only our sources.
PROJ="$(grep -E '^(src/|app\.tsx)' "$OUT" || true)"
if [[ -n "$PROJ" ]]; then
  printf '%s\n' "$PROJ" >&2
  exit 1
fi

echo "typecheck ok (ignored ags/gnim dependency diagnostics)"
exit 0
