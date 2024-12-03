{
  description = "Aveiro Tech City 2024 HACKATHON: Bosch challenge";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    arduino-nix.url = "github:bouk/arduino-nix";
    arduino-package-index = {
      url = "github:bouk/arduino-indexes/package_index";
      flake = false;
    };
    arduino-library-index = {
      url = "github:bouk/arduino-indexes/library_index";
      flake = false;
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      arduino-nix,
      arduino-package-index,
      arduino-library-index,
      ...
    }:
    let
      overlays = [
        (arduino-nix.overlay)
        (arduino-nix.mkArduinoPackageOverlay (arduino-package-index + "/package_index.json"))
        (arduino-nix.mkArduinoLibraryOverlay (arduino-library-index + "/library_index.json"))
      ];
    in
    (flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = (import nixpkgs) { inherit system overlays; };

        arduino-cli = pkgs.wrapArduinoCLI {
          libraries = with pkgs.arduinoLibraries; [
            (arduino-nix.latestVersion Wasm3)
            (arduino-nix.latestVersion ArduinoBLE)
            (arduino-nix.latestVersion Arduino_LSM9DS1)
            (arduino-nix.latestVersion Arduino_LPS22HB)
            (arduino-nix.latestVersion Arduino_APDS9960)
            (arduino-nix.latestVersion Arduino_BMI270_BMM150)
          ];

          packages = with pkgs.arduinoPackages; [
            platforms.arduino.avr."1.6.23"
            platforms.arduino.mbed_nano."3.1.1"
          ];
        };

        devDeps = with pkgs; [
          git
          gnumake
          go
          tinygo
          arduino-cli
          nodejs_22
          pnpm_8

          binaryen
          wabt
          unixtools.xxd
        ];

        arduino_project = "atc-hackathon-2024-bosch";
      in
      {
        packages = {
          esp32-gateway = pkgs.callPackage ./firmware/esp32-gateway/default.nix { inherit arduino-cli; };
          nano33 = pkgs.callPackage ./firmware/nano33/default.nix { inherit arduino-cli; };
          nano33-ble = pkgs.callPackage ./firmware/nano33-ble/default.nix { inherit arduino-cli; };
          nano33-wasm = pkgs.callPackage ./firmware/nano33-wasm/default.nix { inherit arduino-cli; };
          nano33-rev2-wasm = pkgs.callPackage ./firmware/nano33-wasm/default-rev2.nix {
            inherit arduino-cli;
          };
          nano33-wasm-blink = pkgs.callPackage ./firmware/nano33-wasm-blink/default.nix {
            inherit arduino-cli;
          };
        };

        devShell = pkgs.mkShell {
          packages = devDeps;

          shellHook = ''
            if [ -z "''${_ARDUINO_PROJECT_DIR:-}" ]; then
              if [ -n "''${_ARDUINO_ROOT_DIR:-}" ]; then
                export _ARDUINO_PROJECT_DIR="''${_ARDUINO_ROOT_DIR}/${arduino_project}"
              elif [ -n "''${XDG_CACHE_HOME:-}" ]; then
                export _ARDUINO_PROJECT_DIR="''${XDG_CACHE_HOME}/arduino/${arduino_project}"
              else
                export _ARDUINO_PROJECT_DIR="''${HOME}/.arduino/${arduino_project}"
              fi
            fi
            # The variables below are respected by arduino-cli
            export ARDUINO_DIRECTORIES_USER=$_ARDUINO_PROJECT_DIR
            export ARDUINO_DIRECTORIES_DATA=$_ARDUINO_PROJECT_DIR
            export ARDUINO_DIRECTORIES_DOWNLOADS=$_ARDUINO_PROJECT_DIR/staging
          '';
        };
      }
    ));
}
