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
    # package = inputs.ags-desktop-shell.packages.${pkgs.system}.default;
    # passwordStoreDir = "${config.home.homeDirectory}/.password-store";
  };
}
```

Options live under `programs.ags-desktop-shell` (`enable`, `package`, `passwordStoreDir`). Enabling imports AGS’s Home Manager module, installs Astal libs (hyprland, wireplumber, network, notifd, mpris, apps, tray, cava), puts the package on `PATH`, and sets `PASSWORD_STORE_DIR`.

Start the shell from your compositor (e.g. Hyprland `exec-once = [ "ags-desktop-shell" ]`) — there is no systemd user unit in v1.

## Develop

```bash
bun install
bun run types   # needs `ags` on PATH
bun run start
bun run dev     # needs `entr`
```

## License

MIT
