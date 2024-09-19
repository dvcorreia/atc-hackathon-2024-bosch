NAME ?= nervous-sys
DESCRIPTION ?= ATC Hackathon 2024: Bosch the Aveiro Tech City

VERSION ?= $(shell git describe --tags --exact-match 2>/dev/null || git symbolic-ref -q --short HEAD)
COMMIT_HASH ?= $(shell git rev-parse --short HEAD 2>/dev/null)
DATE_FMT ?= %Y-%m-%dT%H:%M:%SZ # ISO 8601
COMMIT_DATE ?= $(shell git log -1 --format=%cd --date=format:'$(DATE_FMT)' $(VERSION))

BUILD_DIR ?= bin
LDFLAGS += -X main.version=$(VERSION) -X main.commitHash=$(COMMIT_HASH) -X main.buildDate=$(COMMIT_DATE)

# set by devShell in flake.nix, you can overwrite here
# targets: > tinygo targets 
TARGET_BOARD ?= nano-33-ble

TINYGO_FLAGS += -target=$(TARGET_BOARD)

.DEFAULT_GOAL: help
default: help

##@ Server

.PHONY: run build
run: build ## run nervous-sys
	$(BUILD_DIR)/$(NAME)
build: ## build nervous-sys
	@mkdir -p $(BUILD_DIR)
	go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/nervous-sys ./cmd/$(NAME)

##@ Embeded

fw: firmware
firmware: ## compile firmware
	@mkdir -p $(BUILD_DIR)
	tinygo build $(TINYGO_FLAGS) -o $(BUILD_DIR)/$(TARGET_BOARD).elf ./cmd/$(TARGET_BOARD)
flash: ## builds and flashes the firmware
	tinygo flash $(TINYGO_FLAGS)
monitor: ## monitors the micro UART
	tinygo monitor

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