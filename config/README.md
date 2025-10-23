# Client Configuration

This directory contains client-specific configuration files for the multi-client FMA Skeckit application.

## Overview

Each client has a dedicated JSON configuration file that defines:
- Client identity and branding
- Feature flags (enable/disable features per client)
- API endpoints (client-specific backend URLs)
- Version tracking (client version + core version)
- Metadata (contact info, region, industry)

## Directory Structure

```
config/
├── clients/
│   ├── bechem.json       # Bechem client configuration
│   ├── schema.json       # JSON Schema for validation
│   └── [future clients]  # Add more client configs as needed
└── README.md             # This file
```

## Client Configuration Structure

### Example: bechem.json

```json
{
  "clientId": "bechem",
  "displayName": "Bechem",
  "branding": {
    "appName": "FMA Skeckit - Bechem",
    "logo": "branding/bechem/logo.png",
    "icon": "branding/bechem/icons/icon.png",
    "primaryColor": "#1E3A8A",
    "secondaryColor": "#3B82F6"
  },
  "apiEndpoints": {
    "baseUrl": "https://api-bechem.fmaskeckit.com",
    "authUrl": "https://auth-bechem.fmaskeckit.com"
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
    "contactEmail": "support@bechem.example.com",
    "region": "Ghana",
    "industry": "Financial Services"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | Yes | Unique client identifier (lowercase alphanumeric only) |
| `displayName` | string | Yes | Human-readable client name |
| `branding.appName` | string | Yes | Application name shown in window title |
| `branding.logo` | string | Yes | Path to client logo (relative to repo root) |
| `branding.icon` | string | Yes | Path to client icon (relative to repo root) |
| `branding.primaryColor` | string | Yes | Primary brand color (hex format #RRGGBB) |
| `branding.secondaryColor` | string | No | Secondary brand color (hex format #RRGGBB) |
| `apiEndpoints.baseUrl` | string | No | Client-specific API base URL |
| `apiEndpoints.authUrl` | string | No | Client-specific authentication URL |
| `features.*` | boolean | No | Feature flags (true = enabled, false = disabled) |
| `version.client` | string | Yes | Client-specific version (semantic versioning) |
| `version.core` | string | Yes | Core version this client is based on |
| `metadata.*` | various | No | Optional metadata (contact, region, industry) |

## How to Add a New Client

Follow these steps to onboard a new client:

### Step 1: Create Client Configuration File

```bash
# Copy template or existing client config
cp config/clients/bechem.json config/clients/newclient.json

# Edit the file
nano config/clients/newclient.json
```

Update all fields:
- `clientId`: Use lowercase alphanumeric (e.g., "newclient")
- `displayName`: Client's official name
- `branding`: Update app name, colors, and asset paths
- `apiEndpoints`: Client-specific URLs
- `features`: Enable/disable features as needed
- `version`: Start with "1.0.0" for both client and core

### Step 2: Create Branding Assets

```bash
# Create branding directory
mkdir -p branding/newclient/icons

# Add client's logo and icon
cp /path/to/client-logo.png branding/newclient/logo.png
cp /path/to/client-icon.png branding/newclient/icons/icon.png
```

**Asset Requirements**:
- Logo: 200x60px minimum, PNG format
- Icon: 1024x1024px exactly, PNG format

See [branding/README.md](../branding/README.md) for details.

### Step 3: Validate Configuration

```bash
# Validate JSON schema
./scripts/validate-client-config.sh newclient

# Should output:
# ✓ Config file exists
# ✓ JSON is valid
# ✓ All required fields present
# ✓ Logo file exists
# ✓ Icon file exists
# Validation passed for client: newclient
```

### Step 4: Create Client Branch

```bash
# Ensure main is up-to-date
git checkout main
git pull origin main

# Create client branch from main
git checkout -b client/newclient main

# Push to remote
git push -u origin client/newclient
```

### Step 5: Add to CI/CD Workflow

Edit `.github/workflows/build-client-manual.yml`:

```yaml
inputs:
  client:
    description: 'Client to build'
    required: true
    type: choice
    options:
      - bechem
      - newclient  # Add this line
```

Or use string input for flexibility (recommended):

```yaml
inputs:
  client:
    description: 'Client to build (e.g., bechem, newclient)'
    required: true
    type: string  # Allows any client without modifying workflow
```

### Step 6: Test Build Locally

```bash
# Checkout client branch
git checkout client/newclient

# Select client configuration
./scripts/select-client-config.sh newclient

# Update desktop metadata
./scripts/update-desktop-metadata.sh newclient

# Build web app
npm run build

# Build desktop app (macOS example)
npm run electron:build:mac
```

### Step 7: Test CI/CD Build

1. Go to GitHub → Actions → "Build Client Desktop Packages (Manual)"
2. Click "Run workflow"
3. Select:
   - Client: newclient
   - Version: 1.0.0
   - Platforms: macos (or your platform)
   - Release: false
4. Verify workflow succeeds and artifacts are uploaded

### Step 8: Update Version Matrix

```bash
# Add client to version matrix
./scripts/update-version-matrix.sh newclient 1.0.0 1.0.0 Development "Initial onboarding"
```

## How to Update an Existing Client Configuration

### Update Configuration File

```bash
# Edit client config
nano config/clients/bechem.json

# Make changes (e.g., update API endpoints, change colors, toggle features)

# Validate after changes
./scripts/validate-client-config.sh bechem
```

### Update Version

When making changes, increment the client version following semantic versioning:

- **Major** (1.0.0 → 2.0.0): Breaking changes, major feature additions
- **Minor** (1.0.0 → 1.1.0): New features, non-breaking changes
- **Patch** (1.0.0 → 1.0.1): Bug fixes, minor tweaks

Update version in `config/clients/bechem.json`:

```json
{
  "version": {
    "client": "1.1.0",  // Incremented
    "core": "1.0.0"     // Update if based on newer core
  }
}
```

### Commit and Build

```bash
# Commit configuration changes
git add config/clients/bechem.json
git commit -m "Update bechem configuration: [describe changes]"
git push origin client/bechem

# Trigger CI/CD build with new version
# (via GitHub Actions manual trigger)
```

## Validation

All client configurations are validated against JSON Schema before builds.

### Validation Script

```bash
./scripts/validate-client-config.sh <clientId>
```

**Checks**:
- JSON file exists and is parseable
- All required fields are present
- `clientId` matches pattern: lowercase alphanumeric
- Versions follow semantic versioning (X.Y.Z)
- Colors are valid hex codes (#RRGGBB)
- Logo and icon files exist at specified paths

### Schema File

`config/clients/schema.json` defines the JSON Schema for validation.

## Git Merge Strategy

Client configuration files are protected by `.gitattributes`:

```
config/clients/*.json merge=ours
```

This ensures when merging core updates into client branches, **client configurations are always preserved** (never overwritten by core).

## Feature Flags

Feature flags allow enabling/disabling functionality per client:

```json
"features": {
  "dashboard": true,           // Enable dashboard analytics
  "advancedAnalytics": true,   // Enable advanced charts
  "clientSearch": false,       // Disable client search
  "exportFeatures": true       // Enable Excel/PDF export
}
```

**Adding New Feature Flags**:
1. Add flag to all client configs (default value)
2. Update application code to check flag:
   ```javascript
   if (clientConfig.features.newFeature) {
     // Enable feature
   }
   ```
3. Document flag in this README

## API Endpoints

Client-specific API endpoints allow each client to connect to their own backend:

```json
"apiEndpoints": {
  "baseUrl": "https://api-bechem.fmaskeckit.com",
  "authUrl": "https://auth-bechem.fmaskeckit.com"
}
```

**Usage in Application**:
```javascript
const config = require('./client-config.json');
const apiUrl = config.apiEndpoints.baseUrl;
```

## Troubleshooting

### Validation Fails

**Error**: "Config file not found"
- Ensure file exists at `config/clients/<clientId>.json`
- Check file name matches `clientId` (lowercase)

**Error**: "Invalid JSON"
- Validate JSON syntax using `jq`:
  ```bash
  jq empty config/clients/<clientId>.json
  ```

**Error**: "Missing required field"
- Check schema.json for required fields
- Ensure all required fields are present in config

### Build Uses Wrong Configuration

- Verify `./scripts/select-client-config.sh <clientId>` runs successfully
- Check `desktop/client-config.json` contains correct client config
- Ensure CI/CD workflow passes correct `client` parameter

### Icon Not Appearing

- Verify icon exists at path specified in `branding.icon`
- Check icon is exactly 1024x1024 pixels
- See [branding/README.md](../branding/README.md) for troubleshooting

## Related Documentation

- [Branding Assets Guide](../branding/README.md)
- [Build Scripts Documentation](../scripts/README.md)
- [Branching Strategy](../docs/branching-strategy.md)
- [CI/CD Workflow Guide](../.github/workflows/README.md)

## Questions?

For questions about client configuration or onboarding new clients, contact the development team.
