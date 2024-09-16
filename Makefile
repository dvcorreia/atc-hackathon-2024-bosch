# set by devShell in flake.nix, you can overwrite here
# targets: > tinygo targets 
TARGET_BOARD ?=

TINYGO_FLAGS += -target=$(TARGET_BOARD)
TINYGO_FLAGS += -print-allocs=.

run:
	tinygo flash $(TINYGO_FLAGS) -monitor
build: main.go
	tinygo build $(TINYGO_FLAGS)
flash:
	tinygo flash $(TINYGO_FLAGS)
monitor:
	tinygo monitor