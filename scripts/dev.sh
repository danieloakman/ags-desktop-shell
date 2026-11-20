#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
find "$ROOT" -type f \( -name "*.tsx" -o -name "*.scss" \) | entr -r ags run "$ROOT/app.tsx"
