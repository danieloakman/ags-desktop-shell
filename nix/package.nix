{
  lib,
  stdenvNoCC,
  bun,
  cacert,
  makeWrapper,
  runCommand,
  ags,
  # Astal libs (and friends) so the wrapped `ags` gets GI_TYPELIB_PATH via
  # aylur's `ags.override { extraPackages = ... }` (wrapGAppsHook3).
  extraPackages ? [ ],
}:
let
  pname = "ags-desktop-shell";
  version = "0.1.0";

  agsWithAstal = ags.override { inherit extraPackages; };

  src = lib.cleanSourceWith {
    src = ./..;
    filter =
      path: type:
      let
        base = baseNameOf path;
      in
      (lib.cleanSourceFilter path type)
      && !(builtins.elem base [
        "node_modules"
        "@girs"
        "result"
        ".github"
        "nix"
        "flake.nix"
        "flake.lock"
      ]);
  };

  # Only lockfiles — keeps the FOD hash stable across unrelated source edits.
  lockfiles = runCommand "${pname}-lockfiles" { } ''
    mkdir -p $out
    cp ${../package.json} $out/package.json
    cp ${../bun.lock} $out/bun.lock
  '';

  # Fixed-output fetch of bun lockfile deps (production only).
  bunDeps = stdenvNoCC.mkDerivation {
    name = "${pname}-bun-deps-${version}";
    src = lockfiles;

    nativeBuildInputs = [
      bun
      cacert
    ];

    impureEnvVars = lib.fetchers.proxyImpureEnvVars ++ [
      "GIT_PROXY_COMMAND"
      "SOCKS_SERVER"
    ];

    dontConfigure = true;
    dontFixup = true;
    dontPatchShebangs = true;

    buildPhase = ''
      runHook preBuild
      export HOME=$TMPDIR
      export BUN_INSTALL_CACHE_DIR=$TMPDIR/.bun-cache
      bun install --frozen-lockfile --production --no-progress --ignore-scripts
      runHook postBuild
    '';

    installPhase = ''
      runHook preInstall
      mkdir -p $out
      cp -R node_modules $out/
      runHook postInstall
    '';

    outputHashAlgo = "sha256";
    outputHashMode = "recursive";
    outputHash = "sha256-1jWaqhzxPTthScG0InUslq3qDF0UmCS3QfyRQ3Bki2Y=";
  };
in
stdenvNoCC.mkDerivation {
  inherit pname version src;

  nativeBuildInputs = [ makeWrapper ];

  dontConfigure = true;
  dontBuild = true;

  installPhase = ''
    runHook preInstall

    share=$out/share/${pname}
    mkdir -p "$share" $out/bin

    cp -R . "$share"/
    cp -R ${bunDeps}/node_modules "$share"/node_modules

    makeWrapper ${lib.getExe agsWithAstal} $out/bin/${pname} \
      --chdir "$share" \
      --add-flags "run app.tsx"

    runHook postInstall
  '';

  meta = {
    description = "TypeScript/GTK4 desktop shell for Hyprland (AGS/Astal)";
    homepage = "https://github.com/danieloakman/ags-desktop-shell";
    license = lib.licenses.mit;
    mainProgram = pname;
    platforms = lib.platforms.linux;
  };
}
