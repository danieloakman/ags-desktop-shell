# ags-desktop-shell

TypeScript/GTK4 desktop shell for Hyprland, built on [AGS](https://github.com/aylur/ags) / [Astal](https://github.com/aylur/astal).

Widgets include a bar, control center, app launcher, notifications, media, and password-store search. Hyprland is the current compositor backend; a niri backend may come later.

## Nix

```bash
nix build
nix develop
```

### Flake input + Home Manager

```nix
{
  inputs.ags-desktop-shell.url = "github:danieloakman/ags-desktop-shell";

  imports = [ inputs.ags-desktop-shell.homeManagerModules.default ];

  programs.ags-desktop-shell = {
    enable = true;
    # optional:
    # passwordStoreDir = "${config.home.homeDirectory}/.password-store";
  };
}
```

Start the shell from your compositor (e.g. Hyprland `exec-once`) with the `ags-desktop-shell` wrapper on PATH.

## Develop

```bash
bun install
bun run types   # needs `ags` on PATH
bun run start
bun run dev     # needs `entr`
```

## License

MIT
