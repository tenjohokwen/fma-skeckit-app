# Data Model: Multi-Client Branching Strategy and CI/CD

**Feature**: Multi-Client Branching Strategy and CI/CD for Desktop Packaging
**Date**: 2025-10-23
**Status**: Complete

## Overview

This document defines the data structures and schemas for managing multi-client configuration and version tracking. Unlike traditional features, this infrastructure work deals with configuration data rather than application data.

---

## 1. Client Configuration

### Entity: Client Configuration

**Purpose**: Defines all client-specific settings including branding, features, and environment configuration.

**File Location**: `config/clients/<clientId>.json`

### Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Client Configuration",
  "description": "Configuration for a specific client deployment",
  "type": "object",
  "required": ["clientId", "displayName", "branding", "version"],
  "properties": {
    "clientId": {
      "type": "string",
      "pattern": "^[a-z0-9]+$",
      "description": "Unique identifier for the client (lowercase alphanumeric only)",
      "examples": ["clienta", "clientb", "clientc"]
    },
    "displayName": {
      "type": "string",
      "description": "Human-readable client name",
      "examples": ["Client A Financial Services", "Client B Corporation"]
    },
    "branding": {
      "type": "object",
      "required": ["appName", "logo", "primaryColor"],
      "properties": {
        "appName": {
          "type": "string",
          "description": "Application name shown in window title and about dialog",
          "examples": ["FMA Skeckit - Client A", "FMA Client B Edition"]
        },
        "logo": {
          "type": "string",
          "description": "Relative path to client logo PNG (from repository root)",
          "examples": ["branding/clientA/logo.png"]
        },
        "icon": {
          "type": "string",
          "description": "Relative path to desktop icon PNG (1024x1024)",
          "examples": ["branding/clientA/icons/icon.png"]
        },
        "primaryColor": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Primary brand color (hex format)",
          "examples": ["#1E3A8A", "#DC2626"]
        },
        "secondaryColor": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Secondary brand color (hex format)",
          "examples": ["#3B82F6", "#F87171"]
        }
      }
    },
    "apiEndpoints": {
      "type": "object",
      "description": "Client-specific API endpoints",
      "properties": {
        "baseUrl": {
          "type": "string",
          "format": "uri",
          "description": "Base URL for client's API",
          "examples": ["https://api-clienta.example.com"]
        },
        "authUrl": {
          "type": "string",
          "format": "uri",
          "description": "Authentication endpoint URL",
          "examples": ["https://auth-clienta.example.com"]
        }
      }
    },
    "features": {
      "type": "object",
      "description": "Feature flags to enable/disable functionality per client",
      "properties": {
        "dashboard": {
          "type": "boolean",
          "description": "Enable dashboard analytics",
          "default": true
        },
        "advancedAnalytics": {
          "type": "boolean",
          "description": "Enable advanced analytics charts",
          "default": false
        },
        "clientSearch": {
          "type": "boolean",
          "description": "Enable client search functionality",
          "default": true
        },
        "exportFeatures": {
          "type": "boolean",
          "description": "Enable export to Excel/PDF",
          "default": true
        }
      }
    },
    "version": {
      "type": "object",
      "required": ["client", "core"],
      "properties": {
        "client": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "Client-specific version (semantic versioning)",
          "examples": ["1.0.0", "2.1.3"]
        },
        "core": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "Core application version this client is based on",
          "examples": ["1.5.0", "2.0.1"]
        }
      }
    },
    "metadata": {
      "type": "object",
      "description": "Additional metadata (optional)",
      "properties": {
        "contactEmail": {
          "type": "string",
          "format": "email",
          "description": "Support contact for this client"
        },
        "region": {
          "type": "string",
          "description": "Geographic region",
          "examples": ["US", "CA", "EU"]
        },
        "industry": {
          "type": "string",
          "description": "Client industry vertical",
          "examples": ["Financial Services", "Healthcare", "Legal"]
        }
      }
    }
  }
}
```

### Example: clientA.json

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

### Validation Rules

1. **clientId**: Lowercase alphanumeric only (no spaces, special characters)
2. **Semantic Versioning**: Both client and core versions must follow `MAJOR.MINOR.PATCH` format
3. **Color Format**: Colors must be valid hex codes (#RRGGBB)
4. **Required Fields**: clientId, displayName, branding.appName, branding.logo, branding.primaryColor, version.client, version.core
5. **File Path**: Logo and icon paths must be relative to repository root and point to existing PNG files (validated at build time)

---

## 2. Version Matrix

### Entity: Version Matrix

**Purpose**: Tracks which clients are on which core and client versions, deployment status, and release history.

**File Location**: `docs/version-matrix.md`

### Schema (Markdown Table Format)

```markdown
# Version Matrix

Last Updated: YYYY-MM-DD

| Client ID | Client Version | Core Version | Release Date | Status     | Notes |
|-----------|----------------|--------------|--------------|------------|-------|
| clienta   | v2.0.0         | v1.5.0       | 2025-10-20   | Production | Latest |
| clienta   | v1.0.0         | v1.3.0       | 2025-09-15   | Archived   | EOL    |
| clientb   | v1.2.0         | v1.5.0       | 2025-10-18   | Production | Latest |
| clientc   | v1.0.0         | v1.4.0       | 2025-10-10   | Staging    | Testing |
```

### Fields

| Field | Type | Description | Required | Valid Values |
|-------|------|-------------|----------|--------------|
| `Client ID` | String | Client identifier (matches clientId in config) | Yes | Lowercase alphanumeric |
| `Client Version` | String | Client-specific version | Yes | vMAJOR.MINOR.PATCH |
| `Core Version` | String | Core application version | Yes | vMAJOR.MINOR.PATCH |
| `Release Date` | Date | Date version was released | Yes | YYYY-MM-DD |
| `Status` | Enum | Deployment status | Yes | Development, Staging, Production, Archived |
| `Notes` | String | Additional information | No | Free text |

### Status Values

- **Development**: Version in active development, not yet released
- **Staging**: Version deployed to staging environment for testing
- **Production**: Version deployed to production, actively used by client
- **Archived**: Old version, no longer supported, replaced by newer version

### Automation

**Script**: `scripts/update-version-matrix.sh`

**Usage**:
```bash
./scripts/update-version-matrix.sh <clientId> <clientVersion> <coreVersion> <status> [notes]
```

**Example**:
```bash
./scripts/update-version-matrix.sh clienta v2.1.0 v1.6.0 Production "Feature X added"
```

**Behavior**:
- Appends new row to version-matrix.md
- Updates "Last Updated" timestamp
- Sorts by Client ID, then by Release Date (newest first)

---

## 3. Branch Naming Convention

### Entity: Branch

**Purpose**: Define naming conventions for git branches to support multi-client development.

### Core Branch

**Name**: `main`

**Purpose**: Contains the core application shared by all clients

**Protection Rules**:
- Requires pull request before merging
- Requires 1 reviewer approval (FR-005)
- Requires status checks to pass
- Prevents force pushes
- Prevents deletion

### Client Branches

**Naming Pattern**: `client/<clientId>`

**Examples**:
- `client/clienta`
- `client/clientb`
- `client/clientc`

**Purpose**: Long-lived branches containing client-specific customizations plus core code

**Lifecycle**:
1. Created from `main` when onboarding new client
2. Receives regular merges from `main` to stay up-to-date with core
3. Contains client-specific commits (branding, config, features)
4. Source branch for CI/CD builds
5. Exists as long as client is active

**Protection Rules** (recommended):
- Requires pull request for client-specific changes (optional)
- Requires status checks to pass before merge
- Allows force pushes (in case merge needs cleanup)

### Version Tags

**Naming Pattern**:
- **Core versions**: `core/vMAJOR.MINOR.PATCH`
- **Client versions**: `<clientId>/vMAJOR.MINOR.PATCH`

**Examples**:
- Core: `core/v1.5.0`, `core/v1.6.0`
- Client A: `clienta/v1.0.0`, `clienta/v2.0.0`
- Client B: `clientb/v1.0.0`, `clientb/v1.1.0`

**Tag Message Format**:
```
Release: Client A v2.0.0 (based on Core v1.5.0)

Changes:
- Updated branding to new logo
- Enabled advanced analytics feature
- Updated API endpoint to production URL

Core Version: v1.5.0
Client Version: v2.0.0
Release Date: 2025-10-20
Status: Production
```

---

## 4. CI/CD Workflow Inputs

### Entity: Workflow Input Parameters

**Purpose**: Define input parameters for GitHub Actions workflows to enable parameterized builds.

### Schema (GitHub Actions Format)

```yaml
on:
  workflow_dispatch:
    inputs:
      client:
        description: 'Client to build (clienta, clientb, clientc)'
        required: true
        type: choice
        options:
          - clienta
          - clientb
          - clientc
      version:
        description: 'Client version to tag (e.g., 2.0.0)'
        required: true
        type: string
      platforms:
        description: 'Platforms to build (all, windows, macos, linux)'
        required: false
        type: choice
        default: 'all'
        options:
          - all
          - windows
          - macos
          - linux
      release:
        description: 'Create GitHub Release after build'
        required: false
        type: boolean
        default: false
```

### Input Fields

| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| `client` | choice | Yes | Client to build | clienta, clientb, clientc |
| `version` | string | Yes | Client version to tag | Semantic version (e.g., 2.0.0) |
| `platforms` | choice | No | Platforms to build | all, windows, macos, linux |
| `release` | boolean | No | Create GitHub Release | true, false |

---

## 5. Desktop Application Metadata

### Entity: Desktop Package Metadata

**Purpose**: Metadata embedded in desktop application to identify client and versions.

**File Location**: `desktop/package.json` (dynamically updated during build)

### Schema

```json
{
  "name": "fma-skeckit-app-desktop",
  "version": "2.0.0",
  "description": "FMA Skeckit App - Client A Edition",
  "clientId": "clienta",
  "clientVersion": "2.0.0",
  "coreVersion": "1.5.0",
  "buildDate": "2025-10-20T15:30:00Z",
  "main": "main.js",
  "author": "FMA Team",
  "private": true
}
```

### Fields

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `name` | String | Package name | Static |
| `version` | String | Client version | From client config |
| `description` | String | Application description | From client config (displayName) |
| `clientId` | String | Client identifier | From client config |
| `clientVersion` | String | Client-specific version | From client config |
| `coreVersion` | String | Core version | From client config |
| `buildDate` | ISO 8601 | Build timestamp | Generated at build time |

### Build-Time Update Script

**Script**: `scripts/update-desktop-metadata.sh`

**Usage**:
```bash
./scripts/update-desktop-metadata.sh <clientId>
```

**Behavior**:
1. Reads `config/clients/<clientId>.json`
2. Updates `desktop/package.json` with:
   - `version` from clientConfig.version.client
   - `description` from clientConfig.displayName
   - `clientId` from clientConfig.clientId
   - `clientVersion` from clientConfig.version.client
   - `coreVersion` from clientConfig.version.core
   - `buildDate` from current timestamp

---

## Entity Relationships

```
┌─────────────────────┐
│  Client Config      │
│  (clientA.json)     │
│                     │
│  - clientId         │◄──────┐
│  - branding         │       │
│  - features         │       │  References
│  - version.client   │       │
│  - version.core     │       │
└─────────────────────┘       │
          │                   │
          │ Embedded          │
          │ at build          │
          ▼                   │
┌─────────────────────┐       │
│  Desktop Package    │       │
│  (package.json)     │       │
│                     │       │
│  - clientId         │       │
│  - clientVersion    │       │
│  - coreVersion      │       │
└─────────────────────┘       │
                              │
┌─────────────────────┐       │
│  Version Matrix     │       │
│  (version-matrix.md)│       │
│                     │       │
│  Tracks all client  │───────┘
│  versions and their │
│  core dependencies  │
└─────────────────────┘
          ▲
          │ Updated by
          │ CI/CD
          │
┌─────────────────────┐
│  Git Branches       │
│                     │
│  - main (core)      │
│  - client/clientA   │
│  - client/clientB   │
└─────────────────────┘
```

---

## Validation

### Configuration Validation

**When**: Before every build

**Script**: `scripts/validate-client-config.sh <clientId>`

**Checks**:
1. ✅ JSON file exists at `config/clients/<clientId>.json`
2. ✅ JSON is valid (parseable)
3. ✅ JSON matches schema (all required fields present)
4. ✅ clientId matches pattern (lowercase alphanumeric)
5. ✅ Versions match semantic versioning pattern
6. ✅ Colors are valid hex codes
7. ✅ Logo and icon files exist at specified paths
8. ✅ API endpoints are valid URLs

**Exit Codes**:
- `0`: Validation passed
- `1`: Validation failed (prints errors)

### Version Matrix Validation

**When**: After every update to version-matrix.md

**Script**: `scripts/validate-version-matrix.sh`

**Checks**:
1. ✅ File exists and is valid markdown
2. ✅ All versions follow semantic versioning
3. ✅ Dates are valid (YYYY-MM-DD format)
4. ✅ Status values are valid (Development, Staging, Production, Archived)
5. ✅ No duplicate client+version combinations
6. ✅ "Last Updated" timestamp is current

---

## State Transitions

### Client Version Lifecycle

```
Development → Staging → Production → Archived
     │            │           │
     └────────────┴───────────┴────► Can rollback to previous status
```

**Transitions**:
1. **Development**: New version created, actively developed
2. **Staging**: Build deployed to staging environment for QA
3. **Production**: Build deployed to production after QA approval
4. **Archived**: Old version replaced by newer version, no longer supported

---

## Data Model Summary

| Entity | Format | Location | Purpose |
|--------|--------|----------|---------|
| Client Configuration | JSON | `config/clients/<clientId>.json` | Client-specific settings |
| Version Matrix | Markdown Table | `docs/version-matrix.md` | Track client/core version relationships |
| Branch Names | Git Convention | Repository branches | Organize code per client |
| Version Tags | Git Tags | Repository tags | Mark releases |
| Workflow Inputs | YAML | `.github/workflows/*.yml` | CI/CD parameters |
| Desktop Metadata | JSON | `desktop/package.json` | Application version info |

---

**Data Model Status**: ✅ Complete
**All Schemas Defined**: Yes
**Ready for Contracts**: Yes
