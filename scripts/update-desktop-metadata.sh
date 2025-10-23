#!/bin/bash
set -e

CLIENT_ID=$1

if [ -z "$CLIENT_ID" ]; then
  echo "Usage: $0 <clientId>"
  exit 1
fi

echo "Updating desktop metadata for client: $CLIENT_ID"

CONFIG_FILE="config/clients/${CLIENT_ID}.json"
PACKAGE_FILE="desktop/package.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "✗ Config file not found: $CONFIG_FILE"
  exit 1
fi

if [ ! -f "$PACKAGE_FILE" ]; then
  echo "✗ Package file not found: $PACKAGE_FILE"
  exit 1
fi

# Extract values from config
CLIENT_VERSION=$(jq -r '.version.client' "$CONFIG_FILE")
CORE_VERSION=$(jq -r '.version.core' "$CONFIG_FILE")
DISPLAY_NAME=$(jq -r '.displayName' "$CONFIG_FILE")
APP_NAME=$(jq -r '.branding.appName' "$CONFIG_FILE")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update package.json using jq
jq --arg ver "$CLIENT_VERSION" \
   --arg desc "$APP_NAME" \
   --arg client "$CLIENT_ID" \
   --arg clientVer "$CLIENT_VERSION" \
   --arg coreVer "$CORE_VERSION" \
   --arg buildDate "$BUILD_DATE" \
   '.version = $ver |
    .description = $desc |
    .clientId = $client |
    .clientVersion = $clientVer |
    .coreVersion = $coreVer |
    .buildDate = $buildDate' \
   "$PACKAGE_FILE" > "${PACKAGE_FILE}.tmp"

mv "${PACKAGE_FILE}.tmp" "$PACKAGE_FILE"

echo "✓ Updated $PACKAGE_FILE:"
echo "  - version: $CLIENT_VERSION"
echo "  - description: $APP_NAME"
echo "  - clientId: $CLIENT_ID"
echo "  - clientVersion: $CLIENT_VERSION"
echo "  - coreVersion: $CORE_VERSION"
echo "  - buildDate: $BUILD_DATE"

echo ""
echo "✅ Desktop metadata updated successfully"
exit 0
