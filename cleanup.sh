#!/bin/bash

# Cleanup script for build artifacts and caches
# Usage: ./scripts/cleanup.sh [--all]

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

log_info "Cleaning up build artifacts and caches..."

remove_dir() {
  if [ -d "$1" ]; then
    log_info "Removing $1"
    rm -rf "$1"
  fi
}

# Function to remove file if exists
remove_file() {
  if [ -f "$1" ]; then
    log_info "Removing $1"
    rm -f "$1"
  fi
}

# Clean turbo cache
echo ""
log_info "Cleaning Turbo cache..."
remove_dir ".turbo"
remove_dir "node_modules/.cache"

# Clean dist folders in all packages
echo ""
log_info "Cleaning dist folders..."
for dir in n8n-nodes-*/; do
  remove_dir "${dir}dist"
  remove_dir "${dir}.turbo"
  remove_file "${dir}tsconfig.tsbuildinfo"
done

# Clean support package
remove_dir "support/.turbo"

# Clean generated files
echo ""
log_info "Cleaning generated files..."
for dir in n8n-nodes-*/; do
  remove_file "${dir}env.ts"
  remove_dir "${dir}shared"
done

# Optional: Clean node_modules (with --all flag)
if [ "$1" = "--all" ]; then
  echo ""
  log_info "Cleaning all node_modules (--all flag)..."
  remove_dir "node_modules"
  for dir in n8n-nodes-*/; do
    remove_dir "${dir}node_modules"
  done
  remove_dir "support/node_modules"

  echo ""
  log_warn "Run 'bun install' to reinstall dependencies"
fi

echo ""
log_info "Cleanup complete!"
