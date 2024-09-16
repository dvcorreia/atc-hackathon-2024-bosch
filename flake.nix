{
  description = "Aveiro Tech City 2024 HACKATHON: Bosch challenge";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        devBoard = "nano-33-ble";

        pkgs = import nixpkgs { system = system; };

        buildDeps = with pkgs; [
          git
          gnumake
          go
          tinygo
        ];

        # tinygo calls for the bossac_arduino2 exec. see: targets/nano-33-ble.json
        # it is a flash programming utility for Atmel's SAM family of flash-based ARM microcontrollers
        bossac_arduino2 = pkgs.bossa-arduino.overrideAttrs (old: {
          pname = "bossac_arduino2";

          installPhase = ''
            mkdir -p $out/bin
            cp bin/bossa{c,sh,} $out/bin/
            cp bin/bossac $out/bin/bossac_arduino2
          '';
        });

        devDeps =
          with pkgs;
          buildDeps
          ++ [
            bossac_arduino2
            gopls
          ];
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = devDeps; 
        
          TARGET_BOARD = devBoard;

          # shellHook = '' # see: https://github.com/tinygo-org/tinygo/issues/4450
          #   export GOROOT=$(tinygo info ${devBoard} | grep GOROOT | awk '{print $3}')
          #   export GOFLAGS=-tags=$(tinygo info ${devBoard} | grep "build tags" | awk -F" {1,}" '{for(i=3;i<NF;i++) printf $i","; print $NF}')
          # '';
        };
      }
    );
}
