#!/bin/bash
set -e

for i in 1 2 3; do
  npm install --prefer-offline && break
  echo "npm install attempt $i failed, retrying in 3s..."
  sleep 3
  npm install && break
done

npm run db:push
