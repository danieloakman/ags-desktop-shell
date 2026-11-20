This project uses [Bun](https://bun.sh) as its package manager.

When installing dependencies or running scripts from `package.json`, **always use Bun** — never npm, yarn, or pnpm:

- `bun install` / `bun run <script>` / `bunx <command>`
- Prefer `nix develop` for a shell with `ags`, `bun`, `entr`, `changie`, and formatters

## Changelog

User-facing changes need Changie entries. Read `.agents/skills/changie/SKILL.md` before adding notes or cutting a release. Use `.agents/skills/changie/scripts/changie-new.sh` when creating multiple entries. Version is kept in sync across `package.json` and `nix/package.nix` by Changie replacements (`bun run release`).

## Match existing project patterns

Before implementing a feature or fixing a bug, find similar code already in the repo and follow it. Prefer the project's established widgets, components, utils, and import style (`@/…`) over inventing a parallel approach.
