#!/usr/bin/env bash
# Batch unreleased Changie notes into the next semver and refresh CHANGELOG.md.
# Bumps package.json + nix/package.nix via .changie.yaml replacements.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .changes/unreleased ]] || ! compgen -G '.changes/unreleased/*.yaml' >/dev/null; then
  echo "error: no unreleased changie entries under .changes/unreleased/" >&2
  echo "hint: bunx changie new --kind Added --body \"…\" (or the agent skill helper)" >&2
  exit 1
fi

if command -v bunx >/dev/null 2>&1; then
  bunx changie batch auto
  bunx changie merge
else
  changie batch auto
  changie merge
fi

echo "Release notes merged. Review CHANGELOG.md, commit, then tag (e.g. git tag vX.Y.Z)." >&2
