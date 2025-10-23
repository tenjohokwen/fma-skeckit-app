# Contracts: Multi-Client Branching Strategy and CI/CD

**Feature**: Multi-Client Branching Strategy and CI/CD for Desktop Packaging
**Date**: 2025-10-23

## Overview

This directory contains "contracts" for the multi-client infrastructure. Since this is a DevOps/infrastructure feature rather than a traditional API-based application, contracts define:

1. **Configuration File Schemas**: JSON Schema for client configuration files
2. **Script Interfaces**: Input/output contracts for build scripts
3. **CI/CD Workflow Contracts**: GitHub Actions workflow input/output specifications

---

## 1. Client Configuration Schema

**File**: `client-config-schema.json`

**Purpose**: Defines the structure and validation rules for client configuration files (`config/clients/<clientId>.json`)

**Usage**:
```bash
# Validate a client config file against the schema
npm install -g ajv-cli
ajv validate -s contracts/client-config-schema.json -d config/clients/clientA.json
```

**Key Fields**:
- `clientId`: Unique client identifier (lowercase alphanumeric)
- `displayName`: Human-readable client name
- `branding`: Application branding (name, logo, colors)
- `apiEndpoints`: Client-specific API URLs
- `features`: Feature flags (enable/disable functionality)
- `version`: Client and core version numbers
- `metadata`: Optional contact, region, industry info

**Validation Rules**:
- All required fields must be present
- clientId must match pattern `^[a-z0-9]+$`
- Versions must follow semantic versioning `MAJOR.MINOR.PATCH`
- Colors must be valid hex codes `#RRGGBB`
- API endpoints must be HTTPS URLs

---

## 2. Script Contracts

### 2.1 validate-client-config.sh

**Location**: `scripts/validate-client-config.sh`

**Purpose**: Validates a client configuration file before build

**Interface**:
```bash
./scripts/validate-client-config.sh <clientId>
```

**Inputs**:
- `clientId`: Client identifier (e.g., "clienta", "clientb")

**Outputs**:
- **Exit Code 0**: Validation passed
- **Exit Code 1**: Validation failed

**stdout** (on success):
```
✓ Config file exists: config/clients/clienta.json
✓ JSON is valid
✓ Schema validation passed
✓ Logo file exists: branding/clientA/logo.png
✓ Icon file exists: branding/clientA/icons/icon.png
Validation passed for client: clienta
```

**stderr** (on failure):
```
✗ Config file not found: config/clients/clientx.json
ERROR: Client configuration validation failed
```

**Validation Checks**:
1. Config file exists at `config/clients/<clientId>.json`
2. File contains valid JSON
3. JSON matches schema (client-config-schema.json)
4. Logo file exists at path specified in config
5. Icon file exists and is 1024x1024 PNG
6. API endpoints are valid HTTPS URLs
7. Colors are valid hex codes

---

### 2.2 select-client-config.sh

**Location**: `scripts/select-client-config.sh`

**Purpose**: Copies the appropriate client config for build process

**Interface**:
```bash
./scripts/select-client-config.sh <clientId>
```

**Inputs**:
- `clientId`: Client identifier

**Outputs**:
- **Exit Code 0**: Config selected successfully
- **Exit Code 1**: Config selection failed

**Side Effects**:
1. Copies `config/clients/<clientId>.json` to `desktop/client-config.json`
2. Copies branding assets to `desktop/branding/`
3. Updates `desktop/package.json` with client metadata

**stdout**:
```
Selecting configuration for client: clienta
✓ Copied config/clients/clienta.json → desktop/client-config.json
✓ Copied branding assets → desktop/branding/
✓ Updated desktop/package.json with client metadata
Client configuration selected: clienta
```

---

### 2.3 update-version-matrix.sh

**Location**: `scripts/update-version-matrix.sh`

**Purpose**: Updates the version matrix after a release

**Interface**:
```bash
./scripts/update-version-matrix.sh <clientId> <clientVersion> <coreVersion> <status> [notes]
```

**Inputs**:
- `clientId`: Client identifier (e.g., "clienta")
- `clientVersion`: Client version (e.g., "v2.0.0")
- `coreVersion`: Core version (e.g., "v1.5.0")
- `status`: Deployment status ("Development", "Staging", "Production", "Archived")
- `notes`: Optional notes (e.g., "Feature X added")

**Outputs**:
- **Exit Code 0**: Version matrix updated
- **Exit Code 1**: Update failed

**Side Effects**:
1. Appends row to `docs/version-matrix.md`
2. Updates "Last Updated" timestamp
3. Sorts entries by client ID and release date

**stdout**:
```
Adding to version matrix:
  Client: clienta
  Client Version: v2.0.0
  Core Version: v1.5.0
  Status: Production
  Notes: Feature X added
✓ Updated docs/version-matrix.md
Version matrix updated successfully
```

---

### 2.4 update-desktop-metadata.sh

**Location**: `scripts/update-desktop-metadata.sh`

**Purpose**: Updates desktop/package.json with client-specific metadata

**Interface**:
```bash
./scripts/update-desktop-metadata.sh <clientId>
```

**Inputs**:
- `clientId`: Client identifier

**Outputs**:
- **Exit Code 0**: Metadata updated
- **Exit Code 1**: Update failed

**Side Effects**:
Modifies `desktop/package.json` with:
- `version`: Client version from config
- `description`: Client display name
- `clientId`: Client identifier
- `clientVersion`: Client version
- `coreVersion`: Core version
- `buildDate`: Current timestamp (ISO 8601)

**stdout**:
```
Updating desktop metadata for client: clienta
✓ Read config: config/clients/clienta.json
✓ Updated desktop/package.json:
  - version: 2.0.0
  - clientId: clienta
  - clientVersion: 2.0.0
  - coreVersion: 1.5.0
  - buildDate: 2025-10-23T15:30:00Z
Desktop metadata updated successfully
```

---

## 3. GitHub Actions Workflow Contracts

### 3.1 Build Client Workflow (Reusable)

**File**: `.github/workflows/build-client-reusable.yml`

**Type**: Reusable workflow

**Inputs**:
```yaml
inputs:
  client:
    description: 'Client to build (clienta, clientb, clientc)'
    required: true
    type: string
  version:
    description: 'Client version (e.g., 2.0.0)'
    required: true
    type: string
  platforms:
    description: 'Platforms to build (all, windows, macos, linux)'
    required: false
    type: string
    default: 'all'
```

**Outputs**:
```yaml
outputs:
  artifact-names:
    description: 'Comma-separated list of artifact names uploaded'
    value: ${{ jobs.build.outputs.artifacts }}
  build-status:
    description: 'Build status (success, failure)'
    value: ${{ jobs.build.outputs.status }}
```

**Side Effects**:
1. Checks out `client/<clientId>` branch
2. Validates client configuration
3. Builds desktop packages for specified platforms
4. Uploads artifacts to GitHub Actions
5. (Optional) Creates GitHub Release

---

### 3.2 Manual Build Workflow

**File**: `.github/workflows/build-client-manual.yml`

**Type**: Manual trigger workflow (workflow_dispatch)

**Inputs**:
```yaml
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
        description: 'Version to tag (e.g., 2.0.0)'
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
```

**Behavior**:
1. Validates inputs
2. Calls reusable build workflow
3. If `release=true`, creates GitHub Release with artifacts

---

## 4. Contract Testing

### Validating Configuration Files

```bash
# Install validation tools
npm install -g ajv-cli

# Validate schema itself
ajv compile -s contracts/client-config-schema.json

# Validate a client config
ajv validate -s contracts/client-config-schema.json -d config/clients/clientA.json
```

### Testing Scripts

```bash
# Test validation script
./scripts/validate-client-config.sh clienta
echo $?  # Should be 0 for success

# Test with invalid client
./scripts/validate-client-config.sh invalidclient
echo $?  # Should be 1 for failure

# Test config selection
./scripts/select-client-config.sh clienta
test -f desktop/client-config.json && echo "Config copied successfully"

# Test version matrix update
./scripts/update-version-matrix.sh clienta v2.0.0 v1.5.0 Production "Test release"
grep "clienta.*v2.0.0" docs/version-matrix.md
```

---

## 5. Contract Versioning

Contracts follow semantic versioning:

- **MAJOR**: Breaking changes to schema or script interfaces
- **MINOR**: New optional fields or parameters
- **PATCH**: Documentation updates, bug fixes

**Current Version**: 1.0.0

---

## 6. Contract Examples

### Example: Valid Client Configuration

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
    "clientSearch": false
  },
  "version": {
    "client": "2.0.0",
    "core": "1.5.0"
  },
  "metadata": {
    "contactEmail": "support@clienta.example.com",
    "region": "US",
    "industry": "Financial Services"
  }
}
```

### Example: Script Usage in CI/CD

```yaml
# GitHub Actions workflow step
- name: Validate and Select Client Config
  run: |
    # Validate configuration
    ./scripts/validate-client-config.sh ${{ inputs.client }}

    # Select configuration for build
    ./scripts/select-client-config.sh ${{ inputs.client }}

    # Update desktop metadata
    ./scripts/update-desktop-metadata.sh ${{ inputs.client }}
```

---

## Summary

| Contract Type | File | Purpose |
|--------------|------|---------|
| JSON Schema | `client-config-schema.json` | Validates client configuration files |
| Script | `validate-client-config.sh` | Pre-build configuration validation |
| Script | `select-client-config.sh` | Copies config for build |
| Script | `update-version-matrix.sh` | Tracks releases |
| Script | `update-desktop-metadata.sh` | Updates package metadata |
| Workflow | `build-client-reusable.yml` | Reusable build workflow |
| Workflow | `build-client-manual.yml` | Manual trigger workflow |

**All Contracts Defined**: ✅ Yes
**Ready for Implementation**: ✅ Yes
