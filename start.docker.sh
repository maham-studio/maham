#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
echo "Running prisma db push..."
./node_modules/.bin/prisma db push --skip-generate
echo "Seeding (idempotent)..."
node prisma/seed.js || echo "seed skipped/failed (continuing)"
echo "Starting server on port ${PORT:-7860}..."
exec node server.js
