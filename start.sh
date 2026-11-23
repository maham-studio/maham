#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npx prisma db push
node prisma/seed.js
npm run build && npm start
