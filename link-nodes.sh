#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO] ${NC} $1"; }
log_debug() { echo -e "${BLUE}[DEBUG]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN] ${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

N8N_DIR="${HOME}/.n8n"
CUSTOM_DIR="${N8N_DIR}/custom"

log_info "Starting node linking process..."

# 1. Register all node packages locally
log_info "Registering local packages..."
PACKAGES=()

for d in n8n-nodes-keloola-*; do
  if [ -d "$d" ]; then
    log_info "Processing $d"

    # Extract package name from package.json
    if [ -f "$d/package.json" ]; then
      PKG_NAME=$(grep '"name":' "$d/package.json" | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')

      # Register package
      (cd "$d" && bun link)

      PACKAGES+=("$PKG_NAME")
      log_info "Registered: $PKG_NAME"
    else
      log_warn "No package.json found in $d, skipping..."
    fi
  fi
done

# 2. Setup n8n custom directory
log_info "Setting up n8n custom directory: $CUSTOM_DIR"

if [ ! -d "$N8N_DIR" ]; then
  log_info "Creating $N8N_DIR"
  mkdir -p "$N8N_DIR"
fi

if [ ! -d "$CUSTOM_DIR" ]; then
  log_info "Creating $CUSTOM_DIR"
  mkdir -p "$CUSTOM_DIR"
fi

# 3. Initialize custom directory if needed and link packages
cd "$CUSTOM_DIR"

if [ ! -f "package.json" ]; then
  log_info "Initializing package.json..."
  npm init -y >/dev/null
fi

log_info "Linking packages to custom directory..."
for pkg in "${PACKAGES[@]}"; do
  log_info "Linking $pkg"
  bun link "$pkg"
done

log_info "Successfully linked ${#PACKAGES[@]} packages!"
log_debug "Path: $CUSTOM_DIR/node_modules"

if command -v n8n &>/dev/null; then
  log_info "You can now restart n8n to load the custom nodes."
else
  log_warn "n8n is not installed or not in your PATH."
  log_info "The nodes have been linked to $CUSTOM_DIR, so they will be available once you install n8n."
  log_info "To install n8n globally: npm install -g n8n"
fi
