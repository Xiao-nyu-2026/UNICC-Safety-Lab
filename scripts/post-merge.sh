#!/bin/bash
set -e
npm install --prefer-offline || npm install
npm run db:push
