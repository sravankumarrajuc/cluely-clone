#!/bin/bash
set -e

echo "Cleaning previous builds..."
rm -rf dist/ build/ out/

# Build for macOS (universal: arm64 and x64)
echo "Building for macOS (arm64 and x64 DMG)..."
npx electron-builder --mac --arm64 --x64

echo "Building for Windows (exe)..."
npx electron-builder --win --x64

echo "Builds complete. Output files:"
ls -lh dist/* || ls -lh out/* || ls -lh build/*

echo "\nmacOS DMGs and Windows EXE are in the dist/ folder." 