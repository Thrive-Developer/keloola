#!/bin/bash
set -e

# Generate environment files for all node packages
for d in n8n-nodes-keloola-*; do
  if [ -d "$d" ]; then
    echo "Generating env for $d..."
    (cd "$d" && bun run node_modules/@repo/support/generate-env.ts)
  fi
done
