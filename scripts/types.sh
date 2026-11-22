#!/usr/bin/env bash
# Generate GI TypeScript types (@girs) via `ags init` and link ags/gnim for tsc.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# `ags init -d` creates the directory; mktemp -u only reserves a name.
TMP_AGS_DIR="$(mktemp -u /tmp/ags-desktop-shell-types.XXXXXX)"

cleanup() {
  rm -rf "$TMP_AGS_DIR"
}
trap cleanup EXIT

if ! command -v ags >/dev/null 2>&1; then
  echo "error: ags not on PATH (use nix develop / direnv)" >&2
  exit 1
fi

ags init -d "$TMP_AGS_DIR"

if [[ ! -d "$TMP_AGS_DIR/@girs" ]]; then
  echo "error: ags init did not produce @girs under $TMP_AGS_DIR" >&2
  echo "hint: ensure gir typelibs are available (nix develop provides ags)." >&2
  exit 1
fi

rm -rf "$ROOT/@girs"
mv "$TMP_AGS_DIR/@girs" "$ROOT/@girs"

# Drop GTK3 / Astal3 ambient modules that collide with the GTK4 stack under tsc.
rm -f \
  "$ROOT/@girs"/gtk-3*.d.ts \
  "$ROOT/@girs"/gdk-3*.d.ts \
  "$ROOT/@girs"/gdkx11-3*.d.ts \
  "$ROOT/@girs"/girepository-2*.d.ts \
  "$ROOT/@girs"/astal-3*.d.ts

# Keep lockfile deps installed; ags init scaffolds a separate tree and must not
# replace this project's node_modules.
if [[ -f "$ROOT/package.json" ]]; then
  (cd "$ROOT" && bun install)
fi

# Link AGS JS libs so `import 'ags'` / `gnim` resolve for typecheck (nix store).
AGS_BIN="$(command -v ags)"
AGS_JS="$(dirname "$(dirname "$(readlink -f "$AGS_BIN")")")/share/ags/js"
if [[ ! -d "$AGS_JS" ]]; then
  echo "error: could not find ags js lib at $AGS_JS" >&2
  exit 1
fi
mkdir -p "$ROOT/node_modules"
ln -sfn "$AGS_JS" "$ROOT/node_modules/ags"
ln -sfn "$AGS_JS/node_modules/gnim" "$ROOT/node_modules/gnim"

echo "Generated $ROOT/@girs and linked node_modules/{ags,gnim}"
