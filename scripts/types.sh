#!/usr/bin/env bash
# Generate types for AGS, Astal, GDK, etc. via `ags init`.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_AGS_DIR=/tmp/ags-desktop-shell-types
rm -rf "$ROOT/node_modules" "$ROOT/@girs" "$TMP_AGS_DIR"
ags init -d "$TMP_AGS_DIR"
mv "$TMP_AGS_DIR/@girs" "$TMP_AGS_DIR/node_modules" "$ROOT/"
rm -rf "$TMP_AGS_DIR"
