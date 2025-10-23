# Quickstart: Multi-Client Branching Strategy and CI/CD for Desktop Packaging

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-23
**Branch**: `014-for-this-application`

## Overview

This quickstart guide provides a step-by-step implementation roadmap for establishing a multi-client branching strategy and CI/CD infrastructure. The implementation enables multiple clients (clientA, clientB, clientC) to share a common core application while maintaining client-specific customizations.

## Prerequisites

- Feature 013 (Desktop Packaging) must be complete and working
- Git repository with appropriate access controls
- GitHub Actions enabled on repository
- Node.js 18+ and npm 9+ installed
- Basic understanding of Git branching strategies
- Access to create GitHub branches and workflows

## Phase Overview

1. **Phase 1**: Set up Git branching structure (P1)
2. **Phase 2**: Create client configuration system (P1)
3. **Phase 3**: Create build scripts (P1)
4. **Phase 4**: Extend CI/CD pipeline (P1)
5. **Phase 5**: Create documentation and workflows (P2)
6. **Phase 6**: Test with one client end-to-end (P1)
7. **Phase 7**: Onboard additional clients (P2)

---

## Phase 1: Set Up Git Branching Structure

### Step 1.1: Protect Main Branch

**Objective**: Configure branch protection rules on `main` branch

```bash
# Via GitHub UI or gh CLI
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

**Expected Outcome**: Main branch requires PR with 1 reviewer approval before merge

**Verify**:
- Go to Repository → Settings → Branches
- Confirm "main" has protection rules:
  - ✓ Require pull request reviews (1 reviewer)
  - ✓ Require status checks to pass

---

### Step 1.2: Create First Client Branch

**Objective**: Create long-lived client branch from main

```bash
# Ensure main is up-to-date
git checkout main
git pull origin main

# Create client branch
git checkout -b client/clienta main

# Push to remote
git push -u origin client/clienta
```

**Expected Outcome**: `client/clienta` branch created from main

**Verify**:
```bash
git branch -a | grep "client/clienta"
# Should show: remotes/origin/client/clienta
```

---

### Step 1.3: Create Remaining Client Branches

**Objective**: Create branches for clientB and clientC

```bash
# Create clientB branch
git checkout main
git checkout -b client/clientb main
git push -u origin client/clientb

# Create clientC branch
git checkout main
git checkout -b client/clientc main
git push -u origin client/clientc
```

**Expected Outcome**: Three client branches exist

**Verify**:
```bash
git branch -a | grep "client/"
# Should show:
#   remotes/origin/client/clienta
#   remotes/origin/client/clientb
#   remotes/origin/client/clientc
```

---

## Phase 2: Create Client Configuration System

### Step 2.1: Create Configuration Directory Structure

```bash
# Create directories
mkdir -p config/clients
mkdir -p branding/clientA/icons
mkdir -p branding/clientB/icons
mkdir -p branding/clientC/icons
```

**Expected Outcome**: Directory structure created

**Verify**:
```bash
tree config branding
# Should show directory structure
```

---

### Step 2.2: Create JSON Schema

**File**: `config/clients/schema.json`

Copy the schema from `specs/014-for-this-application/contracts/client-config-schema.json`

```bash
cp specs/014-for-this-application/contracts/client-config-schema.json config/clients/schema.json
```

**Expected Outcome**: Schema file exists and is valid

**Verify**:
```bash
test -f config/clients/schema.json && echo "Schema exists"
```

---

### Step 2.3: Create Client A Configuration

**File**: `config/clients/clienta.json`

```json
{
  "clientId": "clienta",
  "displayName": "Client A Financial Services",
  "branding": {
    "appName": "FMA Skeckit - Client A",
    "logo": "branding/clientA/logo.png",
    "icon": "branding/clientA/icons/icon.png",
    "primaryColor": "#1E3A8A",
    "secondaryColor": "#3B82F6"
  },
  "apiEndpoints": {
    "baseUrl": "https://api-clienta.fmaskeckit.com",
    "authUrl": "https://auth-clienta.fmaskeckit.com"
  },
  "features": {
    "dashboard": true,
    "advancedAnalytics": true,
    "clientSearch": false,
    "exportFeatures": true
  },
  "version": {
    "client": "1.0.0",
    "core": "1.0.0"
  },
  "metadata": {
    "contactEmail": "support@clienta.example.com",
    "region": "US",
    "industry": "Financial Services"
  }
}
```

**Expected Outcome**: Configuration file created

---

### Step 2.4: Create Placeholder Branding Assets

**Objective**: Create temporary branding assets for testing

```bash
# Create placeholder logo (200x60 PNG)
# Use existing desktop icon or create simple placeholder
cp desktop/icons/icon.png branding/clientA/icons/icon.png

# Create simple logo (can be replaced later)
cp desktop/icons/icon.png branding/clientA/logo.png
```

**Expected Outcome**: Placeholder branding files exist

**Verify**:
```bash
test -f branding/clientA/logo.png && echo "Logo exists"
test -f branding/clientA/icons/icon.png && echo "Icon exists"
```

---

### Step 2.5: Create Configurations for clientB and clientC

Repeat Step 2.3 and 2.4 for clientB and clientC with different values:

**clientB**:
- displayName: "Client B Corporation"
- primaryColor: "#DC2626"
- API endpoints: clientb subdomain
- Features: different feature flags

**clientC**:
- displayName: "Client C Legal Group"
- primaryColor: "#059669"
- API endpoints: clientc subdomain
- Features: different feature flags

---

## Phase 3: Create Build Scripts

### Step 3.1: Create Validation Script

**File**: `scripts/validate-client-config.sh`

```bash
#!/bin/bash
set -e

CLIENT_ID=$1

if [ -z "$CLIENT_ID" ]; then
  echo "Usage: $0 <clientId>"
  exit 1
fi

CONFIG_FILE="config/clients/${CLIENT_ID}.json"

echo "Validating configuration for client: $CLIENT_ID"

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
  if ! jq -e ".$FIELD" "$CONFIG_FILE" > /dev/null; then
    echo "✗ Missing required field: $FIELD"
    exit 1
  fi
done
echo "✓ All required fields present"

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

echo "Validation passed for client: $CLIENT_ID"
exit 0
```

**Make executable**:
```bash
chmod +x scripts/validate-client-config.sh
```

**Test**:
```bash
./scripts/validate-client-config.sh clienta
# Should output validation success
```

---

### Step 3.2: Create Config Selection Script

**File**: `scripts/select-client-config.sh`

```bash
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
ICON_DIR=$(dirname "$ICON")
cp "$ICON" desktop/icons/icon.png
echo "✓ Copied icon → desktop/icons/icon.png"

echo "Client configuration selected: $CLIENT_ID"
exit 0
```

**Make executable**:
```bash
chmod +x scripts/select-client-config.sh
```

---

### Step 3.3: Create Metadata Update Script

**File**: `scripts/update-desktop-metadata.sh`

```bash
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

# Extract values from config
CLIENT_VERSION=$(jq -r '.version.client' "$CONFIG_FILE")
CORE_VERSION=$(jq -r '.version.core' "$CONFIG_FILE")
DISPLAY_NAME=$(jq -r '.displayName' "$CONFIG_FILE")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update package.json using jq
jq --arg ver "$CLIENT_VERSION" \
   --arg desc "$DISPLAY_NAME" \
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
echo "  - clientId: $CLIENT_ID"
echo "  - clientVersion: $CLIENT_VERSION"
echo "  - coreVersion: $CORE_VERSION"
echo "  - buildDate: $BUILD_DATE"

echo "Desktop metadata updated successfully"
exit 0
```

**Make executable**:
```bash
chmod +x scripts/update-desktop-metadata.sh
```

---

### Step 3.4: Create Version Matrix Script

**File**: `scripts/update-version-matrix.sh`

```bash
#!/bin/bash
set -e

CLIENT_ID=$1
CLIENT_VERSION=$2
CORE_VERSION=$3
STATUS=$4
NOTES=${5:-""}

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_VERSION" ] || [ -z "$CORE_VERSION" ] || [ -z "$STATUS" ]; then
  echo "Usage: $0 <clientId> <clientVersion> <coreVersion> <status> [notes]"
  echo "Status: Development, Staging, Production, Archived"
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
fi

# Append new entry
echo "| $CLIENT_ID | $CLIENT_VERSION | $CORE_VERSION | $DATE | $STATUS | $NOTES |" >> "$MATRIX_FILE"

# Update "Last Updated" timestamp
sed -i.bak "s/Last Updated:.*/Last Updated: $DATE/" "$MATRIX_FILE"
rm -f "${MATRIX_FILE}.bak"

echo "✓ Updated $MATRIX_FILE"
echo "  Client: $CLIENT_ID"
echo "  Client Version: $CLIENT_VERSION"
echo "  Core Version: $CORE_VERSION"
echo "  Status: $STATUS"
echo "Version matrix updated successfully"
exit 0
```

**Make executable**:
```bash
chmod +x scripts/update-version-matrix.sh
```

---

## Phase 4: Extend CI/CD Pipeline

### Step 4.1: Create Reusable Workflow

**File**: `.github/workflows/build-client-reusable.yml`

```yaml
name: Build Client Desktop Packages (Reusable)

on:
  workflow_call:
    inputs:
      client:
        description: 'Client to build'
        required: true
        type: string
      version:
        description: 'Client version'
        required: true
        type: string
      platforms:
        description: 'Platforms to build (all, windows, macos, linux)'
        required: false
        type: string
        default: 'all'

jobs:
  build:
    name: Build Desktop Packages for ${{ inputs.client }}
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        include:
          - os: macos-latest
            platform: mac
            artifact: '*.dmg'
          - os: windows-latest
            platform: win
            artifact: '*.exe'
          - os: ubuntu-latest
            platform: linux
            artifact: '*.AppImage'

    steps:
      - name: Checkout client branch
        uses: actions/checkout@v4
        with:
          ref: client/${{ inputs.client }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install root dependencies
        run: npm ci

      - name: Install desktop dependencies
        run: |
          cd desktop
          npm ci
          cd ..

      - name: Validate client configuration
        run: ./scripts/validate-client-config.sh ${{ inputs.client }}

      - name: Select client configuration
        run: ./scripts/select-client-config.sh ${{ inputs.client }}

      - name: Update desktop metadata
        run: ./scripts/update-desktop-metadata.sh ${{ inputs.client }}

      - name: Build web application
        run: npm run build

      - name: Build desktop app (macOS)
        if: matrix.platform == 'mac' && (inputs.platforms == 'all' || inputs.platforms == 'macos')
        run: npm run electron:build:mac

      - name: Build desktop app (Windows)
        if: matrix.platform == 'win' && (inputs.platforms == 'all' || inputs.platforms == 'windows')
        run: npm run electron:build:win

      - name: Build desktop app (Linux)
        if: matrix.platform == 'linux' && (inputs.platforms == 'all' || inputs.platforms == 'linux')
        run: npm run electron:build:linux

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: desktop-${{ inputs.client }}-${{ matrix.platform }}
          path: dist-desktop/${{ matrix.artifact }}
          retention-days: 30
```

**Expected Outcome**: Reusable workflow created

---

### Step 4.2: Create Manual Trigger Workflow

**File**: `.github/workflows/build-client-manual.yml`

```yaml
name: Build Client Desktop Packages (Manual)

on:
  workflow_dispatch:
    inputs:
      client:
        description: 'Client to build'
        required: true
        type: choice
        options:
          - clienta
          - clientb
          - clientc
      version:
        description: 'Client version (e.g., 1.0.0)'
        required: true
        type: string
      platforms:
        description: 'Platforms to build'
        required: false
        type: choice
        default: 'all'
        options:
          - all
          - windows
          - macos
          - linux
      release:
        description: 'Create GitHub Release'
        required: false
        type: boolean
        default: false

jobs:
  build:
    name: Build ${{ inputs.client }} v${{ inputs.version }}
    uses: ./.github/workflows/build-client-reusable.yml
    with:
      client: ${{ inputs.client }}
      version: ${{ inputs.version }}
      platforms: ${{ inputs.platforms }}

  release:
    name: Create GitHub Release
    needs: build
    runs-on: ubuntu-latest
    if: inputs.release == true

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: release-artifacts

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ inputs.client }}/v${{ inputs.version }}
          name: ${{ inputs.client }} v${{ inputs.version }}
          draft: false
          prerelease: false
          files: release-artifacts/**/*
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Expected Outcome**: Manual trigger workflow created

---

## Phase 5: Create Documentation

### Step 5.1: Create Branching Strategy Guide

**File**: `docs/branching-strategy.md`

See [docs/branching-strategy.md template] for full content

**Key sections**:
- Branch naming conventions
- Core vs client branches
- When to create client branches
- How to merge core into client
- Version tagging conventions

---

### Step 5.2: Create Merge Workflow Guide

**File**: `docs/merge-workflow.md`

**Content**: Step-by-step guide for merging core updates into client branches

---

### Step 5.3: Create Version Matrix

**File**: `docs/version-matrix.md`

Initial empty version matrix (populated by script)

---

### Step 5.4: Update .gitattributes

**File**: `.gitattributes`

```
# Client-specific config - always keep client version
config/clients/*.json merge=ours

# Client-specific branding - never merge from core
branding/** merge=ours

# Desktop config during builds - always keep local
desktop/client-config.json merge=ours
desktop/branding/** merge=ours
```

**Expected Outcome**: Merge strategies configured

---

## Phase 6: Test with One Client (End-to-End)

### Step 6.1: Build clientA Locally

```bash
# Checkout client branch
git checkout client/clienta

# Run build scripts
./scripts/validate-client-config.sh clienta
./scripts/select-client-config.sh clienta
./scripts/update-desktop-metadata.sh clienta

# Build web app
npm run build

# Build desktop (macOS example)
npm run electron:build:mac
```

**Expected Outcome**: Desktop package builds successfully for clientA

**Verify**:
```bash
ls -lh dist-desktop/*.dmg
# Should show clientA-branded DMG file
```

---

### Step 6.2: Test Manual CI/CD Workflow

1. Go to GitHub → Actions → "Build Client Desktop Packages (Manual)"
2. Click "Run workflow"
3. Select:
   - Client: clienta
   - Version: 1.0.0
   - Platforms: macos
   - Release: false
4. Click "Run workflow"

**Expected Outcome**: Workflow runs successfully, artifacts uploaded

**Verify**:
- Workflow completes with green checkmark
- Artifacts available for download

---

### Step 6.3: Verify Desktop Package

1. Download artifact from GitHub Actions
2. Install desktop package
3. Verify:
   - App name matches "FMA Skeckit - Client A"
   - Logo and colors match clientA branding
   - About dialog shows clientId, clientVersion, coreVersion

---

## Phase 7: Onboard Additional Clients

### Step 7.1: Onboard clientB

Repeat Phase 6 for clientB:
1. Checkout `client/clientb` branch
2. Verify clientB config exists
3. Build locally to test
4. Trigger CI/CD for clientB
5. Verify clientB package

---

### Step 7.2: Onboard clientC

Repeat for clientC

---

### Step 7.3: Test Core→Client Merge

```bash
# Make a change to main
git checkout main
echo "# Core Update Test" >> README.md
git add README.md
git commit -m "test: Core update for merge test"
git push origin main

# Merge into clientA
git checkout client/clienta
git merge main
# Resolve any conflicts
git push origin client/clienta

# Verify clientA still builds
./scripts/validate-client-config.sh clienta
npm run build
npm run electron:build:mac
```

**Expected Outcome**: Core changes merge into client without breaking client-specific customizations

---

## Verification Checklist

### Infrastructure

- [ ] Main branch has protection rules (PR + 1 reviewer)
- [ ] Three client branches exist (client/clienta, client/clientb, client/clientc)
- [ ] Configuration files exist for all three clients
- [ ] Branding assets exist for all three clients
- [ ] All build scripts are executable and work

### Build Process

- [ ] `validate-client-config.sh` validates all three clients
- [ ] `select-client-config.sh` copies config correctly
- [ ] `update-desktop-metadata.sh` updates package.json correctly
- [ ] Desktop packages build successfully for at least one client
- [ ] CI/CD workflow runs successfully

### Version Tracking

- [ ] Version matrix file exists and is updated
- [ ] Desktop packages show correct clientId and versions
- [ ] Git tags follow naming convention

### Documentation

- [ ] Branching strategy guide exists
- [ ] Merge workflow guide exists
- [ ] Version matrix populated with at least one entry

---

## Rollback Plan

If issues arise:

1. **Remove client branches**:
   ```bash
   git push origin --delete client/clienta
   git push origin --delete client/clientb
   git push origin --delete client/clientc
   ```

2. **Remove configuration**:
   ```bash
   git rm -r config/
   git rm -r branding/
   git commit -m "Rollback: Remove multi-client configuration"
   ```

3. **Remove workflows**:
   ```bash
   git rm .github/workflows/build-client-*.yml
   git commit -m "Rollback: Remove multi-client CI/CD"
   ```

4. **Core application unaffected**: Main branch and desktop packaging (feature 013) remain functional

---

## Next Steps

After completing quickstart:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Implement tasks in priority order
3. Test thoroughly on all platforms
4. Create real branding assets (replace placeholders)
5. Document client-specific features and configurations
6. Set up regular core→client merge schedule (weekly)
7. Train team on branching workflow and conflict resolution

---

## Notes

- **Client onboarding time**: Target 4 hours per client (including testing)
- **Merge frequency**: Weekly core→client merges recommended
- **Testing**: Manual testing required on all platforms for each client
- **Secrets**: Use GitHub Secrets for client-specific API keys (not in JSON)
- **Branch protection**: Consider enabling for client branches in production

---

**Quickstart Status**: ✅ Complete
**All Phases Defined**: Yes
**Ready for Implementation**: Yes
