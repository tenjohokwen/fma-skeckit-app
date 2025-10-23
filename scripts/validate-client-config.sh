#!/bin/bash
set -e

CLIENT_ID=$1

if [ -z "$CLIENT_ID" ]; then
  echo "Usage: $0 <clientId>"
  exit 1
fi

echo "Validating configuration for client: $CLIENT_ID"

CONFIG_FILE="config/clients/${CLIENT_ID}.json"

# Check config file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "✗ Config file not found: $CONFIG_FILE"
  exit 1
fi
echo "✓ Config file exists: $CONFIG_FILE"

# Check JSON is valid
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
  echo "✗ Invalid JSON in $CONFIG_FILE"
  exit 1
fi
echo "✓ JSON is valid"

# Validate required fields
REQUIRED_FIELDS=("clientId" "displayName" "branding" "version")
for FIELD in "${REQUIRED_FIELDS[@]}"; do
  if ! jq -e ".$FIELD" "$CONFIG_FILE" > /dev/null 2>&1; then
    echo "✗ Missing required field: $FIELD"
    exit 1
  fi
done
echo "✓ All required fields present"

# Validate branding sub-fields
BRANDING_FIELDS=("appName" "logo" "icon" "primaryColor")
for FIELD in "${BRANDING_FIELDS[@]}"; do
  if ! jq -e ".branding.$FIELD" "$CONFIG_FILE" > /dev/null 2>&1; then
    echo "✗ Missing required branding field: $FIELD"
    exit 1
  fi
done
echo "✓ All required branding fields present"

# Validate version sub-fields
if ! jq -e ".version.client" "$CONFIG_FILE" > /dev/null 2>&1; then
  echo "✗ Missing required version.client field"
  exit 1
fi
if ! jq -e ".version.core" "$CONFIG_FILE" > /dev/null 2>&1; then
  echo "✗ Missing required version.core field"
  exit 1
fi
echo "✓ All required version fields present"

# Validate branding assets exist
LOGO=$(jq -r '.branding.logo' "$CONFIG_FILE")
ICON=$(jq -r '.branding.icon' "$CONFIG_FILE")

if [ ! -f "$LOGO" ]; then
  echo "✗ Logo file not found: $LOGO"
  exit 1
fi
echo "✓ Logo file exists: $LOGO"

if [ ! -f "$ICON" ]; then
  echo "✗ Icon file not found: $ICON"
  exit 1
fi
echo "✓ Icon file exists: $ICON"

# Validate semantic versioning format
CLIENT_VERSION=$(jq -r '.version.client' "$CONFIG_FILE")
CORE_VERSION=$(jq -r '.version.core' "$CONFIG_FILE")

if ! echo "$CLIENT_VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "✗ Invalid client version format: $CLIENT_VERSION (expected X.Y.Z)"
  exit 1
fi
echo "✓ Client version format valid: $CLIENT_VERSION"

if ! echo "$CORE_VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "✗ Invalid core version format: $CORE_VERSION (expected X.Y.Z)"
  exit 1
fi
echo "✓ Core version format valid: $CORE_VERSION"

# Validate hex color format
PRIMARY_COLOR=$(jq -r '.branding.primaryColor' "$CONFIG_FILE")
if ! echo "$PRIMARY_COLOR" | grep -Eq '^#[0-9A-Fa-f]{6}$'; then
  echo "✗ Invalid primaryColor format: $PRIMARY_COLOR (expected #RRGGBB)"
  exit 1
fi
echo "✓ Primary color format valid: $PRIMARY_COLOR"

# Validate clientId matches filename
CONFIG_CLIENT_ID=$(jq -r '.clientId' "$CONFIG_FILE")
if [ "$CONFIG_CLIENT_ID" != "$CLIENT_ID" ]; then
  echo "✗ clientId in config ($CONFIG_CLIENT_ID) doesn't match filename ($CLIENT_ID)"
  exit 1
fi
echo "✓ clientId matches filename"

echo ""
echo "✅ Validation passed for client: $CLIENT_ID"
exit 0
