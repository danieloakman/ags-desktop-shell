This project uses [Bun](https://bun.sh) as its package manager.

When installing dependencies or running scripts from `package.json`, **always use Bun** — never npm, yarn, or pnpm:

- `bun install` / `bun run <script>` / `bunx <command>`
- Prefer `nix develop` (or direnv `use flake`) for a shell with `ags`, `bun`, `entr`, `changie`, and formatters

## Changelog

User-facing changes need Changie entries. **Read [`.agents/skills/changie/SKILL.md`](.agents/skills/changie/SKILL.md)** before adding notes or cutting a release — after shipping bar/control-center/launcher/password-search/HM behavior users notice, when running `changie new` / `bun run changelog`, or before `bun run release`.

Always create entries with the skill helper (never raw `bunx changie new`):

```bash
.agents/skills/changie/scripts/changie-new.sh Fixed "Workspace bar buttons switch workspaces again"
```

Version sync across `package.json` and `nix/package.nix` is via Changie replacements (`bun run release`).

## Match existing project patterns

Before implementing a feature or fixing a bug, find similar code already in the repo and follow it. Prefer the project's established widgets, components, utils, and import style (`@/…`) over inventing a parallel approach.

- Search nearby peers under `src/widget/`, `src/components/`, `src/utils/` and read them before writing.
- Reuse helpers that already exist — if something looks shared, it probably is.
- Mirror naming, file layout, and typing from those peers.

## Gotchas

### Local run / nixpkgs pin

`flake.nix` pins `nixpkgs` to the host revision so GTK/Pango match (nix-ld). After changing `flake.lock`, run `direnv reload` or `rm -rf .direnv`. Stop the packaged shell before a checkout run: `ags quit`, then `bun run start` / `bun run dev`. Details: README Develop.

### Hyprland dispatch

Workspace and other Hyprland actions go through [`src/utils/hyprland.ts`](src/utils/hyprland.ts). Do not call Astal `workspace.focus()` or legacy `dispatch workspace N` — they break under Hyprland's Lua dispatcher. Use the `hl.dsp.*` helpers there (e.g. `focusWorkspace`).

### Types / typecheck

`bun run types` generates `@girs` and links `node_modules/{ags,gnim}` (needs `ags` on PATH). `bun run typecheck` / CI fail on diagnostics under `src/` or `app.tsx` only; AGS/gnim ship strict-unsafe `.ts` sources that are ignored. Do not write generated files into `src/` at runtime.
