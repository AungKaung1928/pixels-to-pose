#!/usr/bin/env bash
# Build the site, then load it in headless Chrome and check every chapter of docs/FEATURES.md.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
node scripts/verify.mjs
