#!/usr/bin/env bash
# Generate GI TypeScript types (@girs) via `ags init` without wiping project deps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_AGS_DIR="$(mktemp -d /tmp/ags-desktop-shell-types.XXXXXX)"

cleanup() {
  rm -rf "$TMP_AGS_DIR"
}
trap cleanup EXIT

ags init -d "$TMP_AGS_DIR"

if [[ ! -d "$TMP_AGS_DIR/@girs" ]]; then
  echo "error: ags init did not produce @girs under $TMP_AGS_DIR" >&2
  echo "hint: ensure gir typelibs are available (nix develop provides ags)." >&2
  exit 1
fi

rm -rf "$ROOT/@girs"
mv "$TMP_AGS_DIR/@girs" "$ROOT/@girs"

# Keep lockfile deps installed; ags init scaffolds a separate tree and must not
# replace this project's node_modules.
if [[ -f "$ROOT/package.json" ]]; then
  (cd "$ROOT" && bun install)
fi

echo "Generated $ROOT/@girs"
