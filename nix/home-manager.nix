# Home Manager module for ags-desktop-shell.
#
# Prefer importing via the flake (`homeManagerModules.default`) so `package`
# is defaulted and the AGS module is wired; if you import this file directly,
# pass `{ ags, astal }` and set `package` yourself.
{ ags, astal }:
{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.programs.ags-desktop-shell;
  system = pkgs.stdenv.hostPlatform.system;

  # Flake package already wraps aylur `ags` with Astal extraPackages (GI path).
  wrapped = pkgs.symlinkJoin {
    name = "${cfg.package.pname or "ags-desktop-shell"}-wrapped";
    paths = [ cfg.package ];
    nativeBuildInputs = [ pkgs.makeWrapper ];
    postBuild = ''
      wrapProgram $out/bin/ags-desktop-shell \
        --set PASSWORD_STORE_DIR ${lib.escapeShellArg cfg.passwordStoreDir}
    '';
  };
in
{
  imports = [ ags.homeManagerModules.default ];

  options.programs.ags-desktop-shell = {
    enable = lib.mkEnableOption "ags-desktop-shell (Hyprland AGS/Astal desktop shell)";

    package = lib.mkOption {
      type = lib.types.package;
      description = "ags-desktop-shell package (wrapper + packaged app tree).";
    };

    passwordStoreDir = lib.mkOption {
      type = lib.types.str;
      default = "${config.home.homeDirectory}/.password-store";
      defaultText = lib.literalExpression ''"''${config.home.homeDirectory}/.password-store"'';
      description = ''
        Directory for pass(1) password-store entries. Exported as
        `PASSWORD_STORE_DIR` for the session and the shell wrapper.
      '';
    };
  };

  config = lib.mkIf cfg.enable {
    programs.ags = {
      enable = true;
      configDir = "${cfg.package}/share/ags-desktop-shell";
      extraPackages = import ./astal-extra.nix { inherit astal system; };
    };

    home.packages = [ wrapped ];

    home.sessionVariables.PASSWORD_STORE_DIR = cfg.passwordStoreDir;
  };
}
