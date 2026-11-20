#!/usr/bin/env bash
# Add one or more Changie unreleased entries, sleeping between each to avoid
# same-second filename collisions (Kind-YYYYMMDD-HHMMSS.yaml).
# Refuses exact-duplicate bodies already present under .changes/unreleased/.
set -euo pipefail

SLEEP_SECS="${CHANGIE_SLEEP_SECS:-1}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
UNRELEASED_DIR="$ROOT/.changes/unreleased"

usage() {
  echo "Usage: changie-new.sh <kind> <body> [<kind> <body> ...]" >&2
  echo "Kinds depend on .changie.yaml (e.g. Added, Fixed, Changed)." >&2
  echo "Exact-duplicate bodies in .changes/unreleased/ are skipped." >&2
  exit 1
}

if [[ $# -eq 0 ]] || (( $# % 2 != 0 )); then
  usage
fi

if ! command -v changie >/dev/null 2>&1 && ! command -v bunx >/dev/null 2>&1; then
  echo "changie or bunx is required" >&2
  exit 1
fi

list_existing_bodies() {
  if [[ ! -d "$UNRELEASED_DIR" ]]; then
    return
  fi
  echo "Existing unreleased changelog entries:" >&2
  if compgen -G "$UNRELEASED_DIR"/*.yaml >/dev/null; then
    grep -H '^body:' "$UNRELEASED_DIR"/*.yaml | sed 's/^/  /' >&2
  else
    echo "  (none)" >&2
  fi
}

body_already_exists() {
  local body=$1
  local f existing
  [[ -d "$UNRELEASED_DIR" ]] || return 1
  for f in "$UNRELEASED_DIR"/*.yaml; do
    [[ -e "$f" ]] || continue
    existing="$(grep -m1 '^body:' "$f" | sed 's/^body:[[:space:]]*//')"
    existing="${existing#\"}"
    existing="${existing%\"}"
    existing="${existing#\'}"
    existing="${existing%\'}"
    if [[ "$existing" == "$body" ]]; then
      echo "$f"
      return 0
    fi
  done
  return 1
}

run_changie() {
  local kind=$1
  local body=$2
  if command -v bunx >/dev/null 2>&1; then
    bunx changie new --kind "$kind" --body "$body"
  else
    changie new --kind "$kind" --body "$body"
  fi
}

list_existing_bodies

created=0
skipped=0
first=1
while (( $# > 0 )); do
  kind=$1
  body=$2
  shift 2

  if existing_file="$(body_already_exists "$body")"; then
    echo "Skip exact duplicate ($kind): $body" >&2
    echo "  already in $existing_file" >&2
    echo "  For overlapping themes, edit that file instead of adding another." >&2
    skipped=$((skipped + 1))
    continue
  fi

  if (( first == 0 )); then
    sleep "$SLEEP_SECS"
  fi
  first=0

  run_changie "$kind" "$body"
  created=$((created + 1))
done

echo "Created $created changie entr(ies); skipped $skipped duplicate(s) in .changes/unreleased/" >&2
if (( created == 0 && skipped > 0 )); then
  exit 2
fi
