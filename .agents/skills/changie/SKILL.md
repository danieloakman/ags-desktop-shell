---
name: changie
description: >-
  Creates Changie unreleased changelog entries with correct kinds and avoids
  timestamp collisions and overlapping duplicate notes. Use when adding
  changelog notes, running changie new, preparing a release, or after
  user-facing work that needs a CHANGELOG entry.
---

# Changie changelog entries

## Audience

Unreleased notes in `.changes/unreleased/` ship in the public changelog. Write them for someone installing or using this Hyprland shell (via Nix / Home Manager), not for a contributor reading the source tree.

- Describe **what a user gets or can do**, in plain language — one short sentence.
- Prefer product words (bar, control center, launcher, password search, Home Manager) over file paths and library names.
- Skip the entry if only a technical description would be accurate (internal refactors, renames, dep bumps).
- Prefer `bunx changie new --kind … --body "…"` (or the helper below); use Fixed / Added / etc. from `.changie.yaml`.

```yaml
# ❌ BAD
body: Wrap ags with Astal extraPackages so GI typelibs resolve at runtime

# ✅ GOOD
body: Shell starts reliably when installed through the Nix package or Home Manager module
```

## Quick start

One entry:

```bash
bunx changie new --kind Added --body "Home Manager option to set the password-store directory"
```

Multiple entries — **always** use the helper script next to this skill (sleeps 1s between writes):

```bash
.agents/skills/changie/scripts/changie-new.sh \
  Added "First user-facing change" \
  Fixed "Second change"
```

## Why sleep matters

Changie names unreleased files with `Kind-YYYYMMDD-HHMMSS.yaml`. Two `changie new` calls in the **same second with the same kind** overwrite the previous file. Only the last body survives.

**Do not** chain multiple `bunx changie new` calls in one shell line without a delay between them.

**Do** use this skill's `scripts/changie-new.sh`, which runs `sleep 1` between entries (override with `CHANGIE_SLEEP_SECS=2` if needed).

## Workflow: decide what to log

1. Read `.changie.yaml` for valid `kinds` (this repo: Added, Changed, Deprecated, Removed, Fixed, Security).

2. **Inventory existing unreleased notes first** (required — do not skip):

   ```bash
   grep -h '^kind:\|^body:' .changes/unreleased/*.yaml
   ```

   Also see what this branch already adds vs `main`:

   ```bash
   git diff origin/main...HEAD --name-status -- .changes/unreleased/
   git diff origin/main...HEAD -- .changes/unreleased/
   ```

3. **Dedupe before creating anything new.** Prefer **one entry per user-facing theme**, not one entry per commit.

   | Situation                                                    | Action                                                                           |
   | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
   | Existing unreleased note already covers the same feature/bug | **Edit that YAML's `body`** (and `kind` if needed). Do **not** add another file. |
   | This PR already added a note for the same theme              | **Update or replace that file**; delete extras.                                  |
   | Exact same `body` text already exists                        | Skip (`changie-new.sh` refuses exact duplicates).                                |
   | Truly distinct user-facing change                            | Add a new entry.                                                                 |

4. Diff the rest of the branch against `main`:

   ```bash
   git diff origin/main...HEAD --stat
   git log origin/main..HEAD --oneline
   ```

5. For each **user-facing** change that is **not** already covered, pick a kind:

   | Kind           | Use for                           |
   | -------------- | --------------------------------- |
   | **Added**      | New features users can do         |
   | **Changed**    | Behavior changes (often breaking) |
   | **Fixed**      | Bug fixes                         |
   | **Removed**    | Removed features                  |
   | **Deprecated** | Soon-to-be-removed APIs/features  |
   | **Security**   | Security fixes                    |

6. **Skip** internal-only work: refactors, packaging internals that do not change install/use, dep bumps, and other changes a shell user would never notice.

7. Write bodies for installers/users — see Body guidelines below. Match existing `CHANGELOG.md` style (short, one line).

8. Create **only missing** entries with `changie-new.sh` (one invocation for all new lines). Prefer editing an existing file when consolidating.

9. Verify the final unreleased set has no overlapping themes:

   ```bash
   grep -h '^kind:\|^body:' .changes/unreleased/*.yaml
   ```

## Body guidelines

- One change per file; one sentence per body.
- Describe **what the user sees or can do**.
- Avoid function/file/API names and stack jargon unless the project is explicitly a developer library changelog.
- Litmus test: would a Hyprland/Nix user understand this and care? If either answer is no, rewrite or skip.

Good:

- `Nix flake and Home Manager module to install and enable the shell`
- `Status bar with workspaces, clock, and system controls`
- `Fuzzy search over the local password store`

Bad:

- `Wrap ags with Astal extraPackages so GI typelibs resolve`
- `Extract widgets from danieloakman/dotfiles into src/widget`

## CI / non-interactive

Changie fails without prompts when `CI=true`. Pass kind and body flags explicitly (the helper script already does).

```bash
bunx changie new --kind Fixed --body "Control center opens again after toggling Bluetooth"
```

## Release (do not run unless asked)

Batching a version is separate from adding entries. Prefer the package script:

```bash
bun run release          # changie batch auto && changie merge (bumps package.json + nix/package.nix)
```

Or manually:

```bash
bunx changie batch auto   # next semver from kinds; use e.g. `batch v0.1.1` to pin
bunx changie merge        # updates CHANGELOG.md
```

Version tags and fragment filenames use a `v` prefix (`v0.1.0`). Only run batch/merge when the user explicitly requests a release. Afterward, create a matching git tag if they ask.

## Project layout

- Config: `.changie.yaml`
- Unreleased: `.changes/unreleased/*.yaml`
- Released fragments: `.changes/v*.md`
- Output: `CHANGELOG.md`

Semantic impact (from config): **Added** → minor, **Fixed** → patch, **Changed/Removed** → major; highest kind wins when batching. Version is written to `package.json` and `nix/package.nix` via replacements.
