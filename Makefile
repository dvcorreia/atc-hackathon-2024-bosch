DESCRIPTION ?= ATC Hackathon 2024: Bosch the Aveiro Tech City

# set by devShell in flake.nix, you can overwrite here
# targets: > tinygo targets
TARGET_BOARD ?= arduino:mbed_nano:nano33ble
BOARD_USB_PORT ?= $(shell arduino-cli board list | grep $(TARGET_BOARD) | awk '{print $$1}')

MAIN_FW ?= nano33-rev2-wasm

.DEFAULT_GOAL: help
default: help

##@ Embeded

.PHONY: build-%
build: build-$(MAIN_FW)
build-%: ## build firmware
	nix build .#$*

flash: ## flash nano33
	arduino-cli upload -p $(BOARD_USB_PORT) --fqbn arduino:mbed_nano:nano33ble --input-dir ./result/bin/
monitor: ## monitor the serial port
	arduino-cli monitor --port $(BOARD_USB_PORT)

.PHONY: help
help:
	@printf -- "${FORMATTING_BEGIN_BLUE}%s${FORMATTING_END}\n" \
	"" \
	"  $(DESCRIPTION)" \
	"" \
	"--------------------------------------------------" \
	""
	@awk 'BEGIN {\
	    FS = ":.*##"; \
	    printf                "Usage: ${FORMATTING_BEGIN_BLUE}OPTION${FORMATTING_END}=<value> make ${FORMATTING_BEGIN_YELLOW}<target>${FORMATTING_END}\n"\
	  } \
	  /^[a-zA-Z0-9_-]+:.*?##/ { printf "  ${FORMATTING_BEGIN_BLUE}%-12s${FORMATTING_END} %s\n", $$1, $$2 } \
	  /^.?.?##~/              { printf "   %-46s${FORMATTING_BEGIN_YELLOW}%-46s${FORMATTING_END}\n", "", substr($$1, 6) } \
	  /^##@/                  { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)