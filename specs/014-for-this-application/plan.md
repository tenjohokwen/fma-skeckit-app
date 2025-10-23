# Implementation Plan: Multi-Client Branching Strategy and CI/CD for Desktop Packaging

**Branch**: `014-for-this-application` | **Date**: 2025-10-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-for-this-application/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature establishes a multi-client branching strategy and CI/CD infrastructure to support multiple clients (clientA, clientB, clientC) sharing a common core application (coreFma) while maintaining client-specific customizations. The technical approach involves:

1. **Git Branching Model**: Core branch (coreFma/main) with long-lived client branches (client/clientA, client/clientB, etc.) that merge core updates while preserving customizations
2. **Client Configuration System**: Configuration files (config/clientA.json, config/clientB.json, etc.) containing client-specific branding, feature flags, and API endpoints
3. **Parameterized CI/CD Pipeline**: GitHub Actions workflow accepting client parameter to build desktop packages for specific clients with client-specific configuration applied at build time
4. **Version Tracking**: Dual versioning showing core version + client version in desktop app metadata and release artifacts
5. **Documentation**: Branching workflow guides, merge conflict resolution procedures, and version matrix tracking

## Technical Context

**Language/Version**: YAML (GitHub Actions), Bash (scripts), JavaScript (configuration validation)
**Primary Dependencies**:
- Git with branch protection and merge workflows
- GitHub Actions (CI/CD platform)
- electron-builder v24+ (from feature 013 - desktop packaging)
- jq (JSON processing in scripts)

**Storage**:
- Git repository branches for code versions
- GitHub Releases for artifact storage
- Configuration files in repository (config/ directory)

**Testing**:
- Manual testing of branching workflows
- CI/CD pipeline testing with test clients
- Desktop package validation (from feature 013)

**Target Platform**: GitHub (git repository + GitHub Actions)
**Project Type**: DevOps/Infrastructure (not a traditional application feature)
**Performance Goals**:
- Merge and deploy in <2 hours
- CI/CD build all platforms in <15 minutes
- Onboard new client in <4 hours

**Constraints**:
- Must not break existing desktop packaging from feature 013
- Must preserve client customizations during core merges
- Build artifacts must clearly identify client and version

**Scale/Scope**:
- Support 3-10 clients initially
- Each client may have different release cadences
- Core may release more frequently than clients adopt updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**IMPORTANT NOTE**: This feature is **infrastructure/DevOps** work (Git branching + CI/CD), not a Vue.js/Quasar application feature. The constitution primarily governs application code, not DevOps infrastructure.

### Core Principles Compliance

- [N/A] **Vue 3 Composition API**: Not applicable - this is Git/CI/CD infrastructure, not Vue components
- [N/A] **Plain JavaScript**: Not applicable - uses YAML (GitHub Actions), Bash (scripts), JSON (config)
- [N/A] **Functional Component Splitting**: Not applicable - no UI components involved
- [N/A] **Quasar Integration**: Not applicable - infrastructure feature
- [✅] **Clean & Readable Code**: Configuration files will be well-documented, scripts under 250 lines, clear naming

### Testing Standards Compliance

- [N/A] **Component Isolation**: Not applicable - no Vue components
- [N/A] **Vitest + Vue Test Utils**: Not applicable - testing will be manual workflow validation
- [✅] **Realistic Test Scenarios**: Will test actual branching workflows, merge scenarios, and CI/CD builds

### UX Consistency Compliance

- [N/A] **Design System**: Not applicable - no UI changes
- [N/A] **Quasar Design Language**: Not applicable - infrastructure only
- [N/A] **Clear Feedback & States**: Not applicable (CI/CD provides own feedback via GitHub Actions UI)
- [N/A] **Accessibility**: Not applicable - no user-facing UI
- [N/A] **Responsive**: Not applicable - no UI components

### Performance Requirements Compliance

- [N/A] **Lazy Loading**: Not applicable - no frontend code
- [N/A] **Efficient Reactivity**: Not applicable - no Vue reactivity
- [N/A] **Network & Memory Hygiene**: Not applicable to Git/CI/CD workflows
- [✅] **Bundle Awareness**: CI/CD will use existing desktop packaging (feature 013) without changes

### Additional Requirements Compliance

- [N/A] **Mobile-First Design**: Not applicable - no UI
- [N/A] **Internationalization**: Not applicable - Git/CI/CD infrastructure
- [N/A] **Progress Indicators**: Not applicable (GitHub Actions provides own progress indicators)

### Google Apps Script Architecture Compliance

- [N/A] **Project Structure**: Not applicable - no GAS code involved
- [N/A] **Request Flow**: Not applicable - no backend API changes
- [N/A] **Security**: Git branch protection rules will enforce code review (FR-005)
- [N/A] **Response Format**: Not applicable - no API responses

**Constitution Compliance Summary**: This is an infrastructure feature that does not involve application code covered by the constitution. The applicable principles (clean code, realistic testing) will be followed for scripts and configuration files.

## Project Structure

### Documentation (this feature)

```
specs/014-for-this-application/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command) - Configuration schema
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - Config file schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This feature adds infrastructure to the existing repository structure:

```
# NEW: Multi-client configuration
config/
├── clients/
│   ├── clientA.json     # Client A configuration
│   ├── clientB.json     # Client B configuration
│   ├── clientC.json     # Client C configuration
│   └── schema.json      # JSON schema for validation
└── README.md            # Configuration documentation

# NEW: Client-specific branding assets
branding/
├── clientA/
│   ├── logo.png
│   ├── icons/
│   └── colors.json
├── clientB/
│   ├── logo.png
│   ├── icons/
│   └── colors.json
└── clientC/
    ├── logo.png
    ├── icons/
    └── colors.json

# NEW: Build scripts for client selection
scripts/
├── select-client-config.sh    # Apply client config at build time
├── validate-client-config.sh  # Validate config before build
└── version-matrix.sh          # Track client/core version mappings

# MODIFIED: GitHub Actions workflow (extends feature 013)
.github/workflows/
├── desktop-build.yml           # MODIFIED: Add client parameter
└── desktop-build-client.yml    # NEW: Client-specific build workflow

# MODIFIED: Desktop packaging (extends feature 013)
desktop/
├── main.js                     # MODIFIED: Load client config
├── package.json                # MODIFIED: Support client-specific versions
└── build-config.js             # NEW: Dynamic electron-builder config

# NEW: Branching documentation
docs/
├── branching-strategy.md       # Git branching workflow guide
├── merge-workflow.md           # How to merge core into client branches
└── version-matrix.md           # Track which clients are on which core versions

# EXISTING: Application code (unchanged by this feature)
src/                            # Existing Vue/Quasar app
gas/                            # Existing Google Apps Script backend
```

**Structure Decision**: This feature adds **configuration management** and **CI/CD infrastructure** to the existing single-project repository. It does not change the Vue/Quasar application structure, only adds:
- Client configuration files (`config/`)
- Client-specific branding assets (`branding/`)
- Build-time client selection scripts (`scripts/`)
- Extended CI/CD workflows (`.github/workflows/`)
- Branching strategy documentation (`docs/`)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No violations - this feature is infrastructure/DevOps work outside the scope of the Vue.js/Quasar application constitution.

## Phase 0: Research & Unknowns

### Research Tasks

The following unknowns need investigation before implementation:

1. **Git Branching Model Selection**
   - **Unknown**: Best branching model for multi-client with shared core
   - **Options to research**:
     - Long-lived client branches (client/clientA) with regular core merges
     - Release branches per client (release/clientA/v1.0.0) with cherry-picks
     - Git submodules with client-specific wrapper repos
   - **Decision criteria**: Ease of core updates, merge conflict frequency, CI/CD integration

2. **Client Configuration Strategy**
   - **Unknown**: Where and how to store client-specific configuration
   - **Options to research**:
     - JSON files in config/ directory (selected at build time)
     - Environment variables (injected by CI/CD)
     - Separate config repositories (linked as git submodules)
   - **Decision criteria**: Type safety, version control, ease of updates, security

3. **Build-Time vs Runtime Configuration Loading**
   - **Unknown**: When to apply client configuration
   - **Options to research**:
     - Build-time embedding (client config baked into desktop app)
     - Runtime loading (app loads config from file/API)
     - Hybrid (build-time selection, runtime overrides)
   - **Decision criteria**: Security, flexibility, deployment complexity

4. **Version Tracking Mechanism**
   - **Unknown**: How to track which core version each client is based on
   - **Options to research**:
     - Git tags with embedded metadata (core-v1.0.0+clientA-v2.0.0)
     - Version matrix file in repository
     - External tracking system (database, spreadsheet)
   - **Decision criteria**: Automation, visibility, accuracy

5. **Merge Conflict Resolution Best Practices**
   - **Unknown**: Best practices for handling core/client conflicts
   - **Options to research**:
     - Automated conflict detection (pre-merge analysis)
     - Protected file patterns (never merge certain client files)
     - Merge strategy recommendations (merge vs rebase)
   - **Decision criteria**: Developer experience, conflict frequency, safety

6. **CI/CD Platform Capabilities**
   - **Unknown**: GitHub Actions features for parameterized multi-client builds
   - **Research needed**:
     - workflow_dispatch inputs for manual client selection
     - Matrix strategies for parallel client builds
     - Reusable workflows for shared build logic
     - Secret management for client-specific credentials
   - **Decision criteria**: Feature availability, cost, performance

**Output**: research.md documenting decisions for each unknown

## Phase 1: Design & Contracts

### Data Model (data-model.md)

Key entities to define:

1. **Client Configuration Schema**
   - Fields: clientId, displayName, branding (logo, colors, icons), apiEndpoints, featureFlags, version metadata
   - Validation rules: Required fields, format constraints
   - Relationships: Links to branding assets, core version

2. **Version Matrix Schema**
   - Fields: clientId, clientVersion, coreVersion, releaseDate, status (dev/staging/production)
   - Tracking: Which clients are on which core versions

3. **Branch Naming Convention**
   - Core branch: main (or core/main)
   - Client branches: client/clientA, client/clientB, client/clientC
   - Version tags: core/v1.0.0, clientA/v1.0.0, clientB/v2.0.0

### API Contracts (contracts/)

Since this is infrastructure, "contracts" are configuration file schemas:

1. **config/schema.json**: JSON Schema for client configuration files
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "type": "object",
     "required": ["clientId", "displayName", "branding"],
     "properties": {
       "clientId": { "type": "string", "pattern": "^[a-z0-9]+$" },
       "displayName": { "type": "string" },
       "branding": {
         "type": "object",
         "properties": {
           "appName": { "type": "string" },
           "logo": { "type": "string" },
           "primaryColor": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" }
         }
       }
     }
   }
   ```

2. **scripts/validate-client-config.sh**: Script contract - validates config against schema before build

3. **CI/CD Workflow Inputs**: GitHub Actions workflow_dispatch inputs
   ```yaml
   inputs:
     client:
       description: 'Client to build (clientA, clientB, clientC)'
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
   ```

### Quickstart Guide (quickstart.md)

Step-by-step implementation roadmap:

1. **Phase 1**: Set up branching structure (create client branches)
2. **Phase 2**: Create configuration system (config files + validation)
3. **Phase 3**: Extend CI/CD pipeline (add client parameter)
4. **Phase 4**: Document workflows (branching guide, merge procedures)
5. **Phase 5**: Test with one client (validate end-to-end)
6. **Phase 6**: Onboard additional clients

### Agent Context Update

After Phase 1 completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update CLAUDE.md with:
- GitHub Actions (CI/CD platform)
- Multi-client configuration management
- Git branching strategies

## Next Steps (not part of `/speckit.plan`)

After this command completes:

1. Review `research.md` for technology decisions
2. Review `data-model.md` for configuration schemas
3. Review `contracts/` for JSON schemas and script interfaces
4. Review `quickstart.md` for implementation steps
5. Run `/speckit.tasks` to generate detailed task breakdown
6. Begin implementation following the task list

**NOTE**: This plan establishes the foundation. The `/speckit.tasks` command will break down the implementation into specific, actionable tasks.
