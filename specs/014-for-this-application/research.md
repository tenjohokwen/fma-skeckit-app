# Research: Multi-Client Branching Strategy and CI/CD

**Feature**: Multi-Client Branching Strategy and CI/CD for Desktop Packaging
**Date**: 2025-10-23
**Status**: Complete

## Overview

This document consolidates research findings for implementing a multi-client branching strategy and CI/CD infrastructure. The goal is to support multiple clients (clientA, clientB, clientC) sharing a common core application (coreFma) while maintaining client-specific customizations.

---

## 1. Git Branching Model Selection

### Research Question

What is the best branching model for managing a shared core application with multiple client-specific customizations?

### Options Evaluated

#### Option A: Long-Lived Client Branches with Regular Core Merges ✅ **SELECTED**

**Structure**:
```
main (core)
├── client/clientA (long-lived)
├── client/clientB (long-lived)
└── client/clientC (long-lived)
```

**Workflow**:
1. All shared development happens on `main`
2. Client-specific work happens on `client/clientA`, `client/clientB`, etc.
3. Regular merges from `main` into client branches bring core updates
4. Releases tagged per client: `clientA/v1.0.0`, `clientA/v2.0.0`

**Pros**:
- Simple, intuitive model
- Easy to see client history
- Straightforward CI/CD integration (build from client branch)
- Client branches are source of truth for "what's deployed"
- Supports different release cadences per client

**Cons**:
- Merge conflicts when core and client touch same code
- Client branches can drift from core if not regularly updated
- Requires discipline to keep client branches up-to-date

#### Option B: Release Branches Per Client with Cherry-Picks

**Structure**:
```
main (core)
├── release/clientA/v1.0.0
├── release/clientA/v2.0.0
├── release/clientB/v1.0.0
└── ...
```

**Workflow**:
1. Core development on `main`
2. Create release branch for each client version
3. Cherry-pick client-specific commits into release branches
4. Tag and build from release branches

**Pros**:
- Clean separation of releases
- Easy to see exact code in production

**Cons**:
- Complex cherry-pick management
- Difficult to track which commits are in which client
- Hard to merge core updates into all clients
- CI/CD complexity (which branch to build?)

#### Option C: Git Submodules with Client Wrapper Repositories

**Structure**:
```
fma-core/ (main repository)
clientA-app/ (wrapper repo with core as submodule)
clientB-app/ (wrapper repo with core as submodule)
clientC-app/ (wrapper repo with core as submodule)
```

**Workflow**:
1. Core development in `fma-core`
2. Client customizations in wrapper repos
3. Update submodule reference to pull core updates

**Pros**:
- Complete code separation
- No merge conflicts
- Independent client repositories

**Cons**:
- Complex submodule management
- Harder to share client-specific improvements back to core
- CI/CD needs to understand submodules
- Developer confusion with submodule workflows

### Decision

**Selected**: Option A - Long-Lived Client Branches with Regular Core Merges

**Rationale**:
- **Simplicity**: Developers understand branch-based workflows better than submodules or cherry-picking
- **Visibility**: Client branches show full history of both core and client changes
- **CI/CD Integration**: Straightforward - build from `client/clientA` branch
- **Merge Strategy**: Git's merge tools handle conflicts well with proper testing
- **Industry Standard**: This is the "feature branch" model scaled to long-lived client branches, widely adopted

**Implementation Details**:
- **Main branch**: Protected, requires PR with 1 reviewer (FR-005)
- **Client branches**: Created from main, receive core updates via merge commits
- **Merge frequency**: Weekly or bi-weekly core→client merges to minimize drift
- **Conflict resolution**: Manual, with automated tests to verify merge success

---

## 2. Client Configuration Strategy

### Research Question

Where and how should client-specific configuration be stored to balance version control, security, and flexibility?

### Options Evaluated

#### Option A: JSON Files in config/ Directory ✅ **SELECTED**

**Structure**:
```
config/
├── clients/
│   ├── clientA.json
│   ├── clientB.json
│   ├── clientC.json
│   └── schema.json (validation)
└── README.md
```

**Example clientA.json**:
```json
{
  "clientId": "clientA",
  "displayName": "Client A Financial Services",
  "branding": {
    "appName": "FMA Skeckit - Client A",
    "logo": "../branding/clientA/logo.png",
    "primaryColor": "#1E3A8A",
    "secondaryColor": "#3B82F6"
  },
  "apiEndpoints": {
    "baseUrl": "https://api-clienta.example.com",
    "authUrl": "https://auth-clienta.example.com"
  },
  "features": {
    "dashboard": true,
    "advancedAnalytics": true,
    "clientSearch": false
  },
  "version": {
    "client": "1.0.0",
    "core": "1.5.0"
  }
}
```

**Pros**:
- Version controlled alongside code
- Easy to review configuration changes in PRs
- Simple JSON schema validation
- Build-time selection (pick config based on client parameter)

**Cons**:
- Secrets must NOT be stored in JSON (use environment variables)
- All clients see all other clients' configs (visibility concern)

#### Option B: Environment Variables Injected by CI/CD

**Structure**:
- Configuration stored in GitHub Secrets or environment variables
- CI/CD injects values at build time

**Pros**:
- Secure for secrets
- No config files in repository

**Cons**:
- Hard to version control configuration
- Difficult to review configuration changes
- CI/CD platform lock-in
- Complex for non-secret config (branding, features)

#### Option C: Separate Config Repositories

**Structure**:
```
fma-config-clientA/ (private repo)
fma-config-clientB/ (private repo)
fma-config-clientC/ (private repo)
```

**Pros**:
- Complete separation (clients can't see each other's config)
- Secure for sensitive data

**Cons**:
- Repository sprawl
- Hard to track config/code version relationships
- Complex CI/CD setup (clone multiple repos)

### Decision

**Selected**: Option A - JSON Files in config/ Directory

**Rationale**:
- **Version Control**: Configuration changes tracked in git history
- **Reviewability**: PRs show config changes alongside code changes
- **Simplicity**: Single repository, easy for developers to find config
- **Build-Time Selection**: CI/CD picks config file based on `client` parameter
- **Validation**: JSON Schema catches config errors before build

**Security Approach**:
- **Non-secret data in JSON**: Branding, feature flags, API endpoints (public URLs)
- **Secrets in environment**: API keys, certificates stored in GitHub Secrets, injected at build/runtime
- **Access control**: If config visibility is a concern, use branch protection to limit who can modify client configs

**Implementation Details**:
- JSON Schema validation in `config/clients/schema.json`
- Validation script runs before build: `scripts/validate-client-config.sh`
- Build script selects config: `scripts/select-client-config.sh <clientId>`

---

## 3. Build-Time vs Runtime Configuration Loading

### Research Question

When should client configuration be applied - at build time (baked into desktop app) or at runtime (loaded dynamically)?

### Options Evaluated

#### Option A: Build-Time Embedding ✅ **SELECTED**

**Mechanism**:
- CI/CD selects client config JSON during build
- Configuration embedded into desktop app bundle
- Electron app reads config from embedded file at startup

**Pros**:
- Security: Config cannot be modified after build
- Simplicity: No runtime config loading logic
- Offline-capable: No network dependency

**Cons**:
- Configuration changes require rebuild
- Cannot change config for deployed apps (must release new version)

#### Option B: Runtime Loading from API

**Mechanism**:
- Desktop app fetches config from API at startup
- Configuration served dynamically based on client ID

**Pros**:
- Can update config without rebuild
- Centralized configuration management

**Cons**:
- Network dependency (app won't start offline)
- Security: Config endpoint must be secured
- Complexity: Need config API service

#### Option C: Hybrid (Build-Time Selection, Runtime Overrides)

**Mechanism**:
- Default config embedded at build time
- App can fetch runtime overrides from API (optional)

**Pros**:
- Flexibility: Can update some settings without rebuild
- Offline works with defaults

**Cons**:
- Complex: Two config loading paths
- Confusing: Which config takes precedence?

### Decision

**Selected**: Option A - Build-Time Embedding

**Rationale**:
- **Security**: Client branding and configuration locked at build time, cannot be tampered with
- **Simplicity**: Single configuration path, no runtime loading complexity
- **Offline-Capable**: Desktop app works without network (aligns with desktop use case)
- **Desktop Paradigm**: Desktop apps typically have fixed configuration per version
- **Version Coupling**: Configuration changes tied to version releases (explicit, traceable)

**Implementation Details**:
1. CI/CD workflow has `client` parameter
2. Build script selects appropriate config file: `cp config/clients/clientA.json desktop/client-config.json`
3. Electron app reads config during initialization: `fs.readFileSync('client-config.json')`
4. Config used to set app name, logo, colors, API endpoints

**Future Enhancement** (if needed):
- Add runtime override capability for specific settings (like API endpoint overrides for dev/staging)
- But default to build-time embedding for production

---

## 4. Version Tracking Mechanism

### Research Question

How should we track which coreFma version each client is based on to support version matrix visibility and troubleshooting?

### Options Evaluated

#### Option A: Version Matrix File in Repository ✅ **SELECTED**

**Structure**: `docs/version-matrix.md`
```markdown
# Version Matrix

Last Updated: 2025-10-23

| Client   | Client Version | Core Version | Release Date | Status     |
|----------|----------------|--------------|--------------|------------|
| clientA  | v2.0.0         | v1.5.0       | 2025-10-20   | Production |
| clientA  | v1.0.0         | v1.3.0       | 2025-09-15   | Archived   |
| clientB  | v1.2.0         | v1.5.0       | 2025-10-18   | Production |
| clientC  | v1.0.0         | v1.4.0       | 2025-10-10   | Production |
```

**Automation**: Script `scripts/version-matrix.sh` updates matrix after each release

**Pros**:
- Human-readable
- Version controlled
- Easy to view in GitHub
- Simple automation

**Cons**:
- Manual updates (unless automated)
- Can become outdated

#### Option B: Git Tags with Embedded Metadata

**Structure**:
- Tags: `clientA/v2.0.0+core-v1.5.0`
- Metadata embedded in tag message

**Pros**:
- Git-native
- Traceable in git history

**Cons**:
- Hard to query ("show me all clients on core v1.5.0")
- Not human-friendly without tooling
- Tag naming gets complex

#### Option C: External Tracking System

**Structure**:
- Database, spreadsheet, or tracking tool
- Updated via API after each release

**Pros**:
- Queryable
- Can add rich metadata

**Cons**:
- External dependency
- Not version controlled
- Extra system to maintain

### Decision

**Selected**: Option A - Version Matrix File in Repository

**Rationale**:
- **Simplicity**: Markdown file in docs/ is easy to understand and maintain
- **Version Control**: Changes tracked in git (who updated what, when)
- **Visibility**: Anyone can view without special tools
- **Automation**: Script can update matrix file automatically

**Implementation Details**:
1. **File**: `docs/version-matrix.md` (markdown table)
2. **Update Script**: `scripts/update-version-matrix.sh <client> <clientVersion> <coreVersion> <status>`
3. **CI/CD Integration**: After successful build, CI/CD runs script to update matrix
4. **Format**: Markdown table with columns: Client, Client Version, Core Version, Release Date, Status

**Complementary Approach**:
- Also embed version in desktop app metadata
- Desktop `package.json` has both `version` (client version) and `coreVersion` field
- App "About" dialog shows both versions
- Supports troubleshooting: user reports version, support sees both client and core versions

**Script Example**:
```bash
#!/bin/bash
# update-version-matrix.sh
CLIENT=$1
CLIENT_VERSION=$2
CORE_VERSION=$3
STATUS=$4
DATE=$(date +%Y-%m-%d)

# Append to version-matrix.md
echo "| $CLIENT | $CLIENT_VERSION | $CORE_VERSION | $DATE | $STATUS |" >> docs/version-matrix.md
```

---

## 5. Merge Conflict Resolution Best Practices

### Research Question

What strategies can minimize merge conflicts when merging core updates into client branches, and how should conflicts be resolved safely?

### Research Findings

#### Strategy 1: Protected File Patterns ✅ **RECOMMENDED**

**Approach**:
- Identify files that should NEVER be merged from core into client branches
- Use `.gitattributes` merge strategies to protect client-specific files

**Example `.gitattributes`**:
```
# Client-specific config - always keep client version
config/clients/*.json merge=ours

# Client-specific branding - never merge from core
branding/** merge=ours

# Core code - prefer core version in conflicts
src/** merge=theirs
```

**Pros**:
- Automatic conflict resolution for known patterns
- Prevents accidental overwrite of client configs

**Cons**:
- Requires careful setup
- Can hide changes if not well understood

#### Strategy 2: Merge Frequency and Small Batches ✅ **RECOMMENDED**

**Approach**:
- Merge core→client frequently (weekly or bi-weekly)
- Small, incremental merges reduce conflict surface area

**Guideline**:
- Don't let client branches fall more than 2 weeks behind core
- Regular merges = smaller diffs = fewer conflicts

#### Strategy 3: Automated Conflict Detection (Pre-Merge Analysis)

**Approach**:
- Script analyzes potential conflicts before merging
- Report shows which files will conflict

**Example Script**:
```bash
#!/bin/bash
# detect-merge-conflicts.sh
git fetch origin main
git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main | grep "changed in both"
```

**Pros**:
- Advance warning of conflicts
- Can plan resolution before merging

**Cons**:
- Doesn't prevent conflicts, just detects them

#### Strategy 4: Merge Strategy Documentation ✅ **RECOMMENDED**

**Approach**:
- Document clear rules for conflict resolution
- Examples: "In conflicts, prefer core version unless client has security/compliance reason"

**Documentation**: `docs/merge-workflow.md`
- Decision tree for resolving conflicts
- Examples of common conflicts and resolutions
- When to ask for help vs when to resolve independently

### Decision

**Selected**: Combination of Strategies 1, 2, and 4

**Rationale**:
- **Protected Patterns**: Use `.gitattributes` to automatically prefer client version for config/branding, core version for application code
- **Frequent Merges**: Establish weekly core→client merge cadence to minimize drift
- **Documentation**: Clear merge workflow guide with decision trees and examples

**Implementation**:
1. **Create `.gitattributes`** with merge strategies for known patterns
2. **Schedule weekly merges**: Core team merges `main` into all client branches weekly
3. **Document workflow**: `docs/merge-workflow.md` with:
   - Step-by-step merge procedure
   - Conflict resolution decision tree
   - Common conflict examples and solutions
   - Testing checklist after merge (run full test suite)
4. **Automated Tests**: CI runs on client branches after merge to catch breakage

**Conflict Resolution Principles**:
- **Config/Branding**: Always keep client version
- **Application Code**: Prefer core version unless client has specific requirement
- **Tests**: Merge both, update as needed to pass
- **When Uncertain**: Ask in PR review before merging

---

## 6. CI/CD Platform Capabilities (GitHub Actions)

### Research Question

What GitHub Actions features support parameterized multi-client builds, and how should the CI/CD workflow be structured?

### Research Findings

#### Feature 1: workflow_dispatch Inputs ✅ **USE THIS**

**Capability**:
- Manual workflow triggers with input parameters
- Supports text, choice, boolean inputs

**Example**:
```yaml
on:
  workflow_dispatch:
    inputs:
      client:
        description: 'Client to build'
        required: true
        type: choice
        options:
          - clientA
          - clientB
          - clientC
      version:
        description: 'Version to tag (e.g., 1.0.0)'
        required: true
        type: string
      platforms:
        description: 'Platforms to build'
        required: true
        type: choice
        options:
          - all
          - windows
          - macos
          - linux
```

**Use Case**: Manual releases - release manager triggers build for specific client

#### Feature 2: Matrix Strategies ✅ **USE THIS**

**Capability**:
- Run same job with different parameters in parallel
- Build multiple clients or platforms simultaneously

**Example**:
```yaml
strategy:
  matrix:
    client: [clientA, clientB, clientC]
    os: [macos-latest, windows-latest, ubuntu-latest]
```

**Use Case**: Bulk builds - build all clients on all platforms in parallel

#### Feature 3: Reusable Workflows ✅ **USE THIS**

**Capability**:
- Define workflow once, call with different parameters
- Shared build logic across client-specific workflows

**Example**:
```yaml
# .github/workflows/build-client-reusable.yml
on:
  workflow_call:
    inputs:
      client:
        required: true
        type: string

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: client/${{ inputs.client }}
      - run: scripts/select-client-config.sh ${{ inputs.client }}
      - run: npm run electron:build:mac
```

**Use Case**: DRY - define build logic once, reuse for each client

#### Feature 4: Secrets Per Environment

**Capability**:
- Store secrets per repository
- Access secrets in workflow: `${{ secrets.CLIENTA_API_KEY }}`

**Use Case**: Client-specific secrets (API keys, signing certificates)

#### Feature 5: Artifact Storage and GitHub Releases

**Capability**:
- Store build artifacts (actions/upload-artifact@v4)
- Publish to GitHub Releases with tags

**Example**:
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: desktop-${{ inputs.client }}-macos
    path: dist-desktop/*.dmg

- name: Create GitHub Release
  if: startsWith(github.ref, 'refs/tags/')
  uses: softprops/action-gh-release@v1
  with:
    files: dist-desktop/*
    tag_name: ${{ inputs.client }}/v${{ inputs.version }}
```

**Use Case**: Artifact storage and release management

### Decision

**Selected**: Combination of workflow_dispatch + Reusable Workflows

**Rationale**:
- **workflow_dispatch**: Enables manual, parameterized builds per client
- **Reusable Workflows**: DRY principle - define build logic once, call for each client
- **Secrets**: Use GitHub Secrets for client-specific credentials
- **Artifacts**: Use GitHub Releases for desktop package distribution

**Implementation**:
1. **Reusable Workflow**: `.github/workflows/build-client-reusable.yml`
   - Accepts `client` input parameter
   - Checks out `client/<clientName>` branch
   - Selects client config
   - Builds desktop packages for all platforms
   - Uploads artifacts

2. **Manual Trigger Workflow**: `.github/workflows/build-client-manual.yml`
   - workflow_dispatch with client and version inputs
   - Calls reusable workflow
   - Creates GitHub Release with artifacts

3. **Automated Trigger** (optional): Trigger on push to client branches
   - `on: push: branches: [client/*]`
   - Build and test, but don't release

4. **Matrix Build** (optional): Build all clients in parallel for testing
   - Manual trigger "Build All Clients"
   - Matrix strategy with all clients

**Cost Consideration**:
- GitHub Actions free tier: 2000 minutes/month for private repos
- Each full build (3 platforms) takes ~15 minutes
- ~130 builds/month free tier
- Sufficient for regular releases

---

## Summary of Decisions

| Research Area | Selected Approach | Key Rationale |
|--------------|-------------------|---------------|
| **Branching Model** | Long-lived client branches with core merges | Simple, visible, industry-standard |
| **Configuration Storage** | JSON files in config/ directory | Version controlled, reviewable, validated |
| **Configuration Loading** | Build-time embedding | Secure, simple, offline-capable |
| **Version Tracking** | Version matrix file + embedded metadata | Human-readable, version controlled, traceable |
| **Conflict Resolution** | Protected patterns + frequent merges + documentation | Automated + procedural safeguards |
| **CI/CD Platform** | GitHub Actions with workflow_dispatch + reusable workflows | Parameterized, reusable, integrated |

---

## Next Steps

With research complete, proceed to:

1. **Phase 1**: Generate `data-model.md` (configuration schemas)
2. **Phase 1**: Generate `contracts/` (JSON schemas, script interfaces)
3. **Phase 1**: Generate `quickstart.md` (implementation roadmap)
4. **Phase 2**: Run `/speckit.tasks` to create detailed task breakdown
5. **Implementation**: Follow task list to implement branching + CI/CD infrastructure

---

**Research Status**: ✅ Complete
**All Unknowns Resolved**: Yes
**Ready for Phase 1**: Yes
