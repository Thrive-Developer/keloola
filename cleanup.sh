#!/bin/bash

# Cleanup script for build artifacts and caches
# Usage: ./scripts/cleanup.sh [--all]

set -e

echo "🧹 Cleaning up build artifacts and caches..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to remove directory if exists
remove_dir() {
  if [ -d "$1" ]; then
    echo -e "${YELLOW}Removing${NC} $1"
    rm -rf "$1"
  fi
}

# Function to remove file if exists
remove_file() {
  if [ -f "$1" ]; then
    echo -e "${YELLOW}Removing${NC} $1"
    rm -f "$1"
  fi
}

# Clean turbo cache
echo ""
echo "📦 Cleaning Turbo cache..."
remove_dir ".turbo"
remove_dir "node_modules/.cache"

# Clean dist folders in all packages
echo ""
echo "📁 Cleaning dist folders..."
for dir in n8n-nodes-*/; do
  remove_dir "${dir}dist"
  remove_dir "${dir}.turbo"
  remove_file "${dir}tsconfig.tsbuildinfo"
done

# Clean support package
remove_dir "support/.turbo"

# Clean generated files
echo ""
echo "🔧 Cleaning generated files..."
for dir in n8n-nodes-*/; do
  remove_file "${dir}env.generated.ts"
done

# Optional: Clean node_modules (with --all flag)
if [ "$1" = "--all" ]; then
  echo ""
  echo "📦 Cleaning all node_modules (--all flag)..."
  remove_dir "node_modules"
  for dir in n8n-nodes-*/; do
    remove_dir "${dir}node_modules"
  done
  remove_dir "support/node_modules"
  
  echo ""
  echo -e "${YELLOW}Run 'bun install' to reinstall dependencies${NC}"
fi

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
