{
  description = "TypeScript/GTK4 desktop shell for Hyprland (AGS/Astal)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ags,
      astal,
    }:
    let
      overlay = final: _prev: {
        ags-desktop-shell = self.packages.${final.stdenv.hostPlatform.system}.default;
      };
    in
    (flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        package = pkgs.callPackage ./nix/package.nix {
          ags = ags.packages.${system}.default;
        };
      in
      {
        packages.default = package;

        apps.default = {
          type = "app";
          program = "${package}/bin/ags-desktop-shell";
        };

        checks.package = package;

        formatter = pkgs.nixfmt;

        devShells.default = pkgs.mkShell {
          name = "ags-desktop-shell";
          packages = [
            pkgs.bun
            pkgs.typescript
            (ags.packages.${system}.default.override {
              extraPackages = with astal.packages.${system}; [
                hyprland
                wireplumber
                network
                notifd
                mpris
                apps
                tray
                cava
              ];
            })
          ];
        };
      }
    ))
    // {
      overlays.default = overlay;

      homeManagerModules.default =
        { lib, pkgs, ... }:
        {
          imports = [
            (import ./nix/home-manager.nix {
              inherit ags astal;
            })
          ];
          config.programs.ags-desktop-shell.package =
            lib.mkDefault self.packages.${pkgs.stdenv.hostPlatform.system}.default;
        };
    };
}
