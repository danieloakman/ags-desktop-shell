# Astal libs required at runtime (GI typelibs via ags.override { extraPackages }).
# Keep flake.nix and home-manager.nix in sync by importing this list.
{ astal, system }:
let
  # TODO(astal#490): drop this override + nix/patches/astal-hyprland-workspace-id-optional.patch
  # once https://github.com/Aylur/astal/pull/490 (or equivalent) is in our astal pin.
  # Hyprland 0.57 omits `id` on special/named workspaces; unpatched AstalHyprland
  # asserts on every monitor sync (Json-CRITICAL when moving the cursor between monitors).
  hyprland = astal.packages.${system}.hyprland.overrideAttrs (old: {
    patches = (old.patches or [ ]) ++ [
      ./patches/astal-hyprland-workspace-id-optional.patch
    ];
  });
in
with astal.packages.${system}; [
  hyprland
  wireplumber
  network
  bluetooth
  notifd
  mpris
  apps
  tray
  cava
]
