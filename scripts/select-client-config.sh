#!/bin/bash
set -e

CLIENT_ID=$1

if [ -z "$CLIENT_ID" ]; then
  echo "Usage: $0 <clientId>"
  exit 1
fi

echo "Selecting configuration for client: $CLIENT_ID"

# Validate first
./scripts/validate-client-config.sh "$CLIENT_ID"

CONFIG_FILE="config/clients/${CLIENT_ID}.json"
DEST_FILE="desktop/client-config.json"

# Copy config to desktop directory
cp "$CONFIG_FILE" "$DEST_FILE"
echo "✓ Copied $CONFIG_FILE → $DEST_FILE"

# Copy branding assets
LOGO=$(jq -r '.branding.logo' "$CONFIG_FILE")
ICON=$(jq -r '.branding.icon' "$CONFIG_FILE")

mkdir -p desktop/branding
cp "$LOGO" desktop/branding/logo.png
cp "$ICON" desktop/branding/icon.png
echo "✓ Copied branding assets → desktop/branding/"

# Update electron-builder icon path
mkdir -p desktop/icons
cp "$ICON" desktop/icons/icon.png
echo "✓ Copied icon → desktop/icons/icon.png"

echo ""
echo "✅ Client configuration selected: $CLIENT_ID"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/update-desktop-metadata.sh $CLIENT_ID"
echo "  2. Build web app: npm run build"
echo "  3. Build desktop: npm run electron:build:mac (or :win, :linux)"
exit 0
