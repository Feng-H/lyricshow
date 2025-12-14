#!/bin/bash

# Fix Next.js Cache Issues Script
# This script fixes the common "Cannot find module './638.js'" error

echo "🔧 Fixing Next.js cache issues..."

# Kill any running dev servers
echo "🛑 Stopping any running development servers..."
pkill -f "npm run dev" || true
pkill -f "next dev" || true

# Clear all caches
echo "🗑️  Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .eslintcache

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies (if needed)
echo "📥 Checking dependencies..."
npm install --no-audit --no-fund

# Start dev server
echo "🚀 Starting development server..."
npm run dev