{
  description = "TypeScript/GTK4 desktop shell for Hyprland (AGS/Astal)";

  inputs = {
    # Pin to the NixOS host revision used for local `nix develop` / direnv.
    # Floating `nixos-unstable` can pull GTK/Pango newer than nix-ld on the
    # machine and break `ags run`. Consumers should still set
    # `inputs.nixpkgs.follows = "nixpkgs"`.
    nixpkgs.url = "github:NixOS/nixpkgs/f4a03c008967841f2a0b3cb7c436fc6fc31671f6";
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
        astalExtra = import ./nix/astal-extra.nix { inherit astal system; };
        package = pkgs.callPackage ./nix/package.nix {
          ags = ags.packages.${system}.default;
          extraPackages = astalExtra;
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
            pkgs.entr
            pkgs.changie
            pkgs.nixfmt
            (ags.packages.${system}.default.override {
              extraPackages = astalExtra;
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
            lib.mkDefault
              self.packages.${pkgs.stdenv.hostPlatform.system}.default;
        };
    };
}
