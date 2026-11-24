# Astal libs required at runtime (GI typelibs via ags.override { extraPackages }).
# Keep flake.nix and home-manager.nix in sync by importing this list.
{ astal, system }:
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
