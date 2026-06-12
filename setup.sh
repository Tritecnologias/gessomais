#!/bin/bash
set -e

echo "=== Gesso Premium - Setup Inicial ==="
cd "$(dirname "$0")/app"
npm run db:setup
