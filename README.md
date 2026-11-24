# ags-desktop-shell

[![CI](https://github.com/danieloakman/ags-desktop-shell/actions/workflows/ci.yml/badge.svg)](https://github.com/danieloakman/ags-desktop-shell/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript/GTK4 desktop shell for Hyprland, built on [AGS](https://github.com/aylur/ags) / [Astal](https://github.com/aylur/astal).

Packaged as a Nix flake with a Home Manager module. Hyprland is the current compositor backend; a niri backend may come later.

## Screenshots

Screenshots live under [`assets/screenshots/`](assets/screenshots/) (curated before publish).

<!-- After curation, uncomment and adjust filenames:
![Status bar](assets/screenshots/bar.png)
![Control center](assets/screenshots/control-center.png)
![App launcher](assets/screenshots/apps.png)
![Password search](assets/screenshots/password-search.png)
-->

## Features

- **Status bar** — workspaces, clock, tray, volume / Bluetooth / network / battery indicators
- **Control center** — volume, brightness, Wi‑Fi, Bluetooth, power actions
- **App launcher** — fuzzy application search
- **Password search** — fuzzy search over a local [`pass`](https://www.passwordstore.org/) store
- **Touch helpers** — on-screen keyboard and orientation controls when a touch device is present
- **IPC** — `ags request toggle <window>` for keybinds (`bar`, `control-center`, `apps`, `password-search`)

## Requirements

- [Hyprland](https://hyprland.org/) (Wayland)
- For Nix install: flakes-enabled Nix; Home Manager recommended
- Optional: [`pass`](https://www.passwordstore.org/) for password search; Adwaita GTK theme colors are read from `~/.themes/adw-gtk3/gtk-4.0/gtk.css` when present

## Install (Nix)

```bash
nix build
nix run                # runs the packaged shell
nix develop            # bun, ags, entr, changie, formatters
```

### Flake input + Home Manager

```nix
{
  inputs.ags-desktop-shell = {
    url = "github:danieloakman/ags-desktop-shell";
    inputs.nixpkgs.follows = "nixpkgs";
  };

  imports = [ inputs.ags-desktop-shell.homeManagerModules.default ];

  programs.ags-desktop-shell = {
    enable = true;
    # optional:
    # package = inputs.ags-desktop-shell.packages.${pkgs.system}.default;
    # passwordStoreDir = "${config.home.homeDirectory}/.password-store";
  };
}
```

Options live under `programs.ags-desktop-shell` (`enable`, `package`, `passwordStoreDir`). Enabling imports AGS’s Home Manager module, installs Astal libs (hyprland, wireplumber, network, bluetooth, notifd, mpris, apps, tray, cava — see [`nix/astal-extra.nix`](nix/astal-extra.nix)), puts the package on `PATH`, and sets `PASSWORD_STORE_DIR`.

Start from your compositor (no systemd user unit in v1):

```ini
# hyprland.conf
exec-once = ags-desktop-shell
```

Example keybinds:

```ini
bind = $mainMod, SPACE, exec, ags request toggle apps
bind = $mainMod, V, exec, ags request toggle control-center
bind = $mainMod, P, exec, ags request toggle password-search
```

## Develop

With [direnv](https://direnv.net/) installed, `cd` into the repo loads the flake DevShell via `.envrc` (`use flake`). Otherwise:

```bash
nix develop            # bun, ags, entr, changie, nixfmt
bun install
bun run types          # generate @girs (needs `ags` on PATH)
ags quit               # stop the packaged shell if Hyprland already started it
bun run start
bun run dev            # reload on .tsx/.scss changes (needs `entr`)
bun run format:check
bun run typecheck      # after `bun run types` (fails on src/ / app.tsx only)
bun run check          # format:check + typecheck
```

`flake.nix` pins `nixpkgs` to the NixOS revision this shell is developed against so GTK/Pango match the host (and nix-ld). Bump that pin when you update the machine; after changing `flake.lock`, run `direnv reload` (or `rm -rf .direnv`) so the DevShell picks up the new `ags`.

## Versioning & changelog

Releases use [Changie](https://github.com/miniscruff/changie). Unreleased notes live in `.changes/unreleased/`; `bun run release` batches them, updates `CHANGELOG.md`, and syncs the version in `package.json` and `nix/package.nix`.

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © Daniel Brown
