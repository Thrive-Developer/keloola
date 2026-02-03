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

for d in n8n-nodes-keloola-*; do
  if [ -d "$d" ]; then
    log_info "Processing $d..."
    (cd "$d" && bun run node_modules/@repo/support/generate-env.ts)
    (cd "$d" && bun run node_modules/@repo/support/distribute-shared.ts)
  fi
done
