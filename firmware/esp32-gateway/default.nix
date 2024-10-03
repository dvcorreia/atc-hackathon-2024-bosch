{
    lib,
    stdenv,
    arduino-cli,
}:

stdenv.mkDerivation (finalAttrs: {
    pname = "esp32-gateway";
    version = "0.0.1";

    src = ./.;

    nativeBuildInputs = [
        arduino-cli
    ];

    doCheck = false;

    buildPhase = ''
        mkdir build

        export ARDUINO_DIRECTORIES_USER="$PWD/build"
        export ARDUINO_DIRECTORIES_DATA="$PWD/build"
        export ARDUINO_DIRECTORIES_DOWNLOADS="$PWD/build/staging"

        arduino-cli compile --fqbn arduino:esp32:nano_nora --output-dir bin esp32-gateway.ino
    '';

    installPhase = ''
        mkdir -p $out/bin
        cp bin/* $out/bin
    '';
})