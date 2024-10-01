{
    lib,
    stdenv,
    arduino-cli,
    tinygo,
    binaryen,
    wabt,
    unixtools, # xxd
}:

stdenv.mkDerivation (finalAttrs: {
    pname = "nano33-wasm-blink";
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

        arduino-cli compile --fqbn arduino:mbed_nano:nano33ble --output-dir bin --libraries lib nano33-wasm-blink.ino
    '';

    installPhase = ''
        mkdir -p $out/bin
        cp bin/* $out/bin
    '';
})