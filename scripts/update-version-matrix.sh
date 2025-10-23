#!/bin/bash
set -e

CLIENT_ID=$1
CLIENT_VERSION=$2
CORE_VERSION=$3
STATUS=$4
NOTES=${5:-""}

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_VERSION" ] || [ -z "$CORE_VERSION" ] || [ -z "$STATUS" ]; then
  echo "Usage: $0 <clientId> <clientVersion> <coreVersion> <status> [notes]"
  echo ""
  echo "Status options: Development, Staging, Production, Archived"
  echo ""
  echo "Example:"
  echo "  $0 bechem 1.0.0 1.0.0 Production \"Initial release\""
  exit 1
fi

MATRIX_FILE="docs/version-matrix.md"
DATE=$(date +%Y-%m-%d)

# Create file if it doesn't exist
if [ ! -f "$MATRIX_FILE" ]; then
  mkdir -p docs
  cat > "$MATRIX_FILE" <<EOF
# Version Matrix

Last Updated: $DATE

| Client ID | Client Version | Core Version | Release Date | Status | Notes |
|-----------|----------------|--------------|--------------|--------|-------|
EOF
  echo "✓ Created new version matrix file"
fi

# Append new entry
echo "| $CLIENT_ID | v$CLIENT_VERSION | v$CORE_VERSION | $DATE | $STATUS | $NOTES |" >> "$MATRIX_FILE"

# Update "Last Updated" timestamp
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/Last Updated:.*/Last Updated: $DATE/" "$MATRIX_FILE"
else
  # Linux
  sed -i "s/Last Updated:.*/Last Updated: $DATE/" "$MATRIX_FILE"
fi

echo "✓ Updated $MATRIX_FILE"
echo "  Client: $CLIENT_ID"
echo "  Client Version: v$CLIENT_VERSION"
echo "  Core Version: v$CORE_VERSION"
echo "  Status: $STATUS"
if [ -n "$NOTES" ]; then
  echo "  Notes: $NOTES"
fi

echo ""
echo "✅ Version matrix updated successfully"
exit 0
