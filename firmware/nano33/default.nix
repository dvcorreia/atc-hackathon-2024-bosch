{
    lib,
    stdenv,
    arduino-cli,
}:

stdenv.mkDerivation (finalAttrs: {
    pname = "nano33-fw";
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

        arduino-cli compile --fqbn arduino:mbed_nano:nano33ble --output-dir bin nano33.ino
    '';

    installPhase = ''
        mkdir -p $out/bin
        cp bin/* $out/bin
    '';
})