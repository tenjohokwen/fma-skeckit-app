#!/bin/bash

# Build all platform packages for FMA Skeckit App
# This script builds the web application first, then creates desktop installers
# for Windows, macOS, and Linux from a single machine

set -e  # Exit on error

echo "========================================="
echo "FMA Skeckit App - Build All Platforms"
echo "========================================="
echo ""

# Step 1: Build the web application
echo "[1/2] Building web application..."
cd "$(dirname "$0")/../.."
npm run build
echo "✓ Web build complete"
echo ""

# Step 2: Build desktop packages for all platforms
echo "[2/2] Building desktop packages for all platforms..."
cd desktop
electron-builder --win --mac --linux

echo ""
echo "========================================="
echo "✓ Build complete!"
echo "========================================="
echo ""
echo "Installers created in: dist-desktop/"
echo ""
echo "Windows: dist-desktop/*.exe, *.msi"
echo "macOS:   dist-desktop/*.dmg, *.pkg"
echo "Linux:   dist-desktop/*.AppImage, *.deb, *.rpm"
echo ""
