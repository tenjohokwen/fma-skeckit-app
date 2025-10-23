# Tasks: Multi-Client Branching Strategy and CI/CD for Desktop Packaging

**Input**: Design documents from `/specs/014-for-this-application/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Constitution Compliance**: This is a DevOps/infrastructure feature that does not involve application code covered by the constitution. However, scripts and configuration files will follow applicable principles (clean code <250 lines, clear naming, thorough testing).

**Tests**: This feature involves infrastructure configuration and automation. Testing is primarily manual workflow validation and end-to-end testing of builds rather than unit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each capability.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)

## Path Conventions
- **Configuration**: `config/` at repository root (client configs)
- **Branding**: `branding/` at repository root (client assets)
- **Scripts**: `scripts/` at repository root (build automation)
- **CI/CD**: `.github/workflows/` (GitHub Actions)
- **Documentation**: `docs/` at repository root (workflow guides)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure setup

**Note**: Starting with one real client "bechem". Infrastructure supports adding more clients as needed.

- [X] T001 Create configuration directory structure (config/clients/, config/README.md)
- [X] T002 Create branding directory structure for bechem (branding/bechem/ with icons/ subdirectory)
- [X] T003 [P] Create scripts directory for build automation (scripts/)
- [X] T004 [P] Create documentation directory structure (docs/)
- [X] T005 [P] Copy JSON schema from contracts to config/clients/schema.json

---

## Phase 2: Foundational - Git Branching Structure (User Story 1, P1)

**Purpose**: Core git branching model that enables ALL user stories

**⚠️ CRITICAL**: No other user story can be implemented until git branching structure is established

**Goal**: Establish core branch + client branches with protection rules to support multi-client development

**Independent Test**: Create core branch, create one client branch from core, make a change to core, merge it into client branch, verify both core and client-specific features work correctly

### Git Infrastructure Setup

- [ ] T006 [US1] Configure branch protection on main branch (requires PR, 1 reviewer approval, status checks) via GitHub settings or gh CLI
- [ ] T007 [US1] Create client/bechem branch from main and push to remote

### Merge Strategy Configuration

- [ ] T008 [US1] Create .gitattributes file with merge strategies (config/clients/*.json merge=ours, branding/** merge=ours, src/** merge=theirs)
- [ ] T009 [US1] Test merge strategy by creating test commit on main, merging to client/bechem, verifying config/branding files kept client version

**Checkpoint**: Git branching structure ready - client configuration and CI/CD can now be implemented

---

## Phase 3: User Story 3 - Client Configuration Management (Priority: P2)

**Goal**: Enable client-specific configuration for branding, features, and API endpoints

**Independent Test**: Define configuration for one client, build desktop app, verify app displays correct branding, connects to correct endpoints, enables/disables correct features

### Configuration System

- [ ] T010 [US3] Create bechem configuration file (config/clients/bechem.json with all required fields: clientId="bechem", displayName="Bechem", branding, apiEndpoints, features, version, metadata)

### Branding Assets

- [ ] T011 [US3] Create branding assets for bechem (logo.png 200x60, icon.png 1024x1024 in branding/bechem/ - use actual Bechem branding if available, or create placeholder)
- [ ] T012 [US3] Document branding asset replacement process in branding/README.md (specs for logo/icon, how to replace, when to replace)
- [ ] T013 [US3] Document how to add new clients in config/README.md (copy config template, add branding, create branch, add to CI/CD workflow)

### Build Scripts for Configuration

- [ ] T014 [US3] Create validate-client-config.sh script (validates JSON exists, is valid, matches schema, required fields present, branding assets exist) in scripts/
- [ ] T015 [US3] Create select-client-config.sh script (copies config/clients/<clientId>.json to desktop/client-config.json, copies branding assets) in scripts/
- [ ] T016 [P] [US3] Create update-desktop-metadata.sh script (updates desktop/package.json with client version, displayName, clientId, coreVersion, buildDate) in scripts/
- [ ] T017 [US3] Make all scripts executable (chmod +x scripts/*.sh)
- [ ] T018 [US3] Test validate-client-config.sh with bechem to verify validation works
- [ ] T019 [US3] Test select-client-config.sh with bechem to verify config and branding copied correctly to desktop/

### Desktop App Configuration Loading

- [ ] T020 [US3] Modify desktop/main.js to load client-config.json at startup (read file, parse JSON, store in global config object)
- [ ] T021 [US3] Modify desktop/main.js to use client config for app name (BrowserWindow title), branding (logo/icon paths), API endpoints
- [ ] T022 [US3] Update desktop/package.json to include clientId, clientVersion, coreVersion fields (will be populated by build script)

**Checkpoint**: Client configuration system ready - clients can now be built with custom branding and config

---

## Phase 4: User Story 2 - Automated CI/CD for Desktop Packaging (Priority: P1)

**Goal**: Enable one-click desktop package builds for any client on all platforms

**Independent Test**: Trigger CI/CD pipeline for bechem, verify builds Windows/macOS/Linux installers with bechem branding, confirm artifacts are correctly tagged

### Reusable CI/CD Workflow

- [ ] T023 [US2] Create .github/workflows/build-client-reusable.yml with workflow_call inputs (client, version, platforms)
- [ ] T024 [US2] Add matrix strategy to reusable workflow (macos-latest, windows-latest, ubuntu-latest with platform-specific artifact patterns)
- [ ] T025 [US2] Add checkout step to reusable workflow (checks out client/<clientId> branch based on input parameter)
- [ ] T026 [US2] Add Node.js setup, root dependencies install, desktop dependencies install steps to workflow
- [ ] T027 [US2] Add validation step to workflow (runs validate-client-config.sh <client>)
- [ ] T028 [US2] Add config selection step to workflow (runs select-client-config.sh <client>)
- [ ] T029 [US2] Add metadata update step to workflow (runs update-desktop-metadata.sh <client>)
- [ ] T030 [US2] Add web app build step to workflow (npm run build)
- [ ] T031 [US2] Add platform-specific desktop build steps with conditional logic (electron:build:mac if macos, electron:build:win if windows, electron:build:linux if linux)
- [ ] T032 [US2] Add artifact upload step to workflow (upload-artifact@v4 with client and platform in artifact name, 30-day retention)

### Manual Trigger Workflow

- [ ] T033 [US2] Create .github/workflows/build-client-manual.yml with workflow_dispatch trigger
- [ ] T034 [US2] Add workflow_dispatch inputs to manual workflow (client as string input for flexibility, version as string, platforms as choice [all, windows, macos, linux], release as boolean) - note: initially configure with bechem as default
- [ ] T035 [US2] Add build job to manual workflow that calls reusable workflow with inputs
- [ ] T036 [US2] Add release job to manual workflow (downloads all artifacts, creates GitHub Release with tag <client>/v<version>) that runs only if release input is true

### Testing and Validation

- [ ] T037 [US2] Test manual workflow with bechem, version 1.0.0, platform macos, release false via GitHub Actions UI
- [ ] T038 [US2] Verify workflow runs successfully, macOS artifact uploads, build completes in <15 minutes
- [ ] T039 [US2] Download bechem macOS artifact from GitHub Actions, verify it's a valid DMG with Bechem branding

**Checkpoint**: CI/CD pipeline operational - automated builds available for all clients

---

## Phase 5: User Story 4 - Version Tracking and Release History (Priority: P2)

**Goal**: Track which core version each client is based on and maintain release history

**Independent Test**: Build desktop package for one client, examine metadata, confirm it shows both core and client version; update version matrix, confirm tracking is accurate

### Version Matrix System

- [ ] T040 [US4] Create docs/version-matrix.md with initial markdown table structure (headers: Client ID, Client Version, Core Version, Release Date, Status, Notes)
- [ ] T041 [US4] Create scripts/update-version-matrix.sh script (appends new row to version-matrix.md with client, client version, core version, status, date, notes; updates Last Updated timestamp)
- [ ] T042 [US4] Make update-version-matrix.sh executable (chmod +x)
- [ ] T043 [US4] Test update-version-matrix.sh by manually adding a test entry for bechem v1.0.0 based on core v1.0.0 with status Production
- [ ] T044 [US4] Verify version-matrix.md updated correctly with new entry and timestamp

### Version in Desktop Packages

- [ ] T045 [US4] Update update-desktop-metadata.sh to embed clientId, clientVersion, coreVersion in desktop/package.json (already included from US3 T016, verify it works)
- [ ] T046 [US4] Modify desktop/main.js to expose version info in About dialog or app menu (add menu item showing clientId, clientVersion, coreVersion)
- [ ] T047 [US4] Test version display by building bechem desktop app and checking About dialog shows correct versions

### CI/CD Integration

- [ ] T048 [US4] Add step to reusable workflow (.github/workflows/build-client-reusable.yml) to run update-version-matrix.sh after successful build (only if release=true)
- [ ] T049 [US4] Test version matrix update by triggering manual workflow with release=true and verifying version-matrix.md gets updated automatically

**Checkpoint**: Version tracking operational - can identify core/client versions in any deployed package

---

## Phase 6: User Story 5 - Merge Conflict Resolution Workflow (Priority: P3)

**Goal**: Provide clear guidance and automation for resolving merge conflicts when updating clients with core changes

**Independent Test**: Create deliberate conflict between core and client code, follow documented resolution process, verify merge preserves both core updates and client customizations

### Documentation

- [ ] T050 [P] [US5] Create docs/branching-strategy.md documenting branch naming conventions (main for core, client/<clientId> for clients), protection rules, how to create new client branches, tagging conventions (core/vX.Y.Z, <clientId>/vX.Y.Z)
- [ ] T051 [P] [US5] Create docs/merge-workflow.md documenting step-by-step merge process (weekly merge schedule recommended, how to merge main into client branch, conflict resolution decision tree, testing checklist after merge)
- [ ] T052 [US5] Add conflict resolution examples to merge-workflow.md (config conflicts: keep client version, application code conflicts: prefer core, tests: merge both and update)

### Merge Testing

- [ ] T053 [US5] Test merge workflow by making a change to main branch (e.g., update README.md), merging into client/bechem, verifying .gitattributes merge strategies work (config/branding kept client version, core code merged)
- [ ] T054 [US5] Test conflict scenario by modifying same file in both main and client/bechem (but different sections), performing merge, verifying git merge tool helps resolve, documenting resolution in merge-workflow.md
- [ ] T055 [US5] Verify after merge that bechem still builds successfully (npm run build && npm run electron:build:mac)

**Checkpoint**: Merge workflow documented and tested - developers can safely update clients with core changes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, cleanup, and final testing across all user stories

### Configuration Validation

- [ ] T056 Validate bechem client config against JSON schema (run validate-client-config.sh for bechem; must pass)
- [ ] T057 Verify bechem branding assets exist and are correct dimensions (logo 200x60+, icon 1024x1024)

### Documentation Completion

- [ ] T058 [P] Update config/README.md with complete documentation: client configuration structure, how to add new client (step-by-step), how to update existing client config, validation process
- [ ] T059 [P] Update root README.md with multi-client branching section (link to docs/branching-strategy.md, link to docs/merge-workflow.md, how to build for specific client, how to add new client)
- [ ] T060 [P] Create .github/workflows/README.md documenting how to use manual build workflow (workflow_dispatch inputs, when to use release=true, how to download artifacts, how to add new clients to workflow)

### End-to-End Testing

- [ ] T061 Build bechem locally using full workflow (validate config, select config, update metadata, build web app, build desktop macOS) and verify package works with Bechem branding

### CI/CD Full Integration Test

- [ ] T062 Trigger manual workflow for bechem with all platforms, verify all three platform artifacts build successfully (Windows .exe, macOS .dmg, Linux .AppImage)
- [ ] T063 Create test GitHub Release for bechem/v1.0.0 using release=true option, verify Release created with all artifacts attached, tagged correctly

### Version Matrix Validation

- [ ] T064 Verify version-matrix.md has entry for bechem with correct core/client versions
- [ ] T065 Verify desktop package shows correct version info in About dialog for bechem

### Documentation Review

- [ ] T066 Review all documentation (branching-strategy.md, merge-workflow.md, config/README.md, .github/workflows/README.md) for completeness, clarity, accuracy, and ensure "add new client" instructions are clear
- [ ] T067 Update CLAUDE.md with multi-client branching information if not already done by agent context update script

### Cleanup

- [ ] T068 Remove any test commits, test tags, or test releases created during implementation
- [ ] T069 Verify .gitignore excludes desktop/client-config.json and desktop/branding/* (build-time generated files)

---

## Dependencies & Execution Order

### User Story Dependencies

```
Phase 1: Setup (independent)
    ↓
Phase 2: Foundational - US1 Branching (BLOCKS all other stories)
    ↓
    ├─→ Phase 3: US3 Configuration (independent after US1)
    ├─→ Phase 4: US2 CI/CD (depends on US1, enhanced by US3)
    ├─→ Phase 5: US4 Version Tracking (depends on US1 + US3, integrates with US2)
    └─→ Phase 6: US5 Merge Workflow (depends on US1, benefits from US3)
         ↓
Phase 7: Polish (depends on all stories being complete)
```

### Critical Path

1. **Phase 1 (Setup)**: T001-T005 (can run in parallel)
2. **Phase 2 (US1 Branching)**: T006-T011 (must complete before other stories)
3. **Phase 3 (US3 Configuration)**: T012-T027 (independent, can run in parallel with Phase 4 after Phase 2)
4. **Phase 4 (US2 CI/CD)**: T028-T045 (can start after Phase 2, benefits from Phase 3 completion)
5. **Phase 5 (US4 Version Tracking)**: T046-T055 (depends on Phase 2+3, integrates with Phase 4)
6. **Phase 6 (US5 Merge Workflow)**: T056-T061 (depends on Phase 2, can run in parallel with others)
7. **Phase 7 (Polish)**: T062-T077 (depends on all previous phases)

### Parallel Execution Examples

**Within Setup (Phase 1)**:
- T002 (branding dirs), T003 (scripts dir), T004 (docs dir), T005 (schema copy) can all run simultaneously

**Within Branching (Phase 2)**:
- All tasks sequential (branch protection → create bechem branch → gitattributes → test merge)

**Within Configuration (Phase 3)**:
- T011 (bechem config) and T012 (branding) can run in parallel after directory setup
- T013 (branding replacement docs) can run in parallel with config/branding creation
- T021 (metadata script) can run in parallel with T019-T020

**Within CI/CD (Phase 4)**:
- T028-T037 (reusable workflow) must be sequential (building single file)
- T038-T041 (manual workflow) can run in parallel with reusable workflow creation
- T044-T045 (testing) can run in parallel

**Within Polish (Phase 7)**:
- T062-T063 (validation) can run in parallel
- T064-T066 (documentation) can run in parallel
- T068-T069 (local builds) can run in parallel

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Phase 1 + Phase 2 + Phase 3 + Phase 4 (partial)** = Working multi-client CI/CD for Bechem

Minimal MVP (28 tasks):
- T001-T005 (Setup - 5 tasks)
- T006-T009 (Branching - 4 tasks)
- T010-T022 (Bechem config + scripts - 13 tasks)
- T023-T037 (CI/CD workflows - partial, no testing yet - 15 tasks minus T038-T039)

This delivers:
- Git branching structure with main + client/bechem
- Bechem configuration system
- Build scripts (validate, select, update-metadata)
- Automated CI/CD workflow for bechem
- **Value**: Can build Bechem desktop packages automatically via CI/CD

### Incremental Delivery

1. **MVP** (28 tasks): Delivers working CI/CD for Bechem client
2. **Test and validate MVP**: T037-T039 (CI/CD testing - 3 tasks)
3. **Add version tracking**: T040-T049 (Phase 5 - 10 tasks)
4. **Add merge workflow documentation**: T050-T055 (Phase 6 - 6 tasks)
5. **Polish and document**: T056-T069 (Phase 7 - 14 tasks)
6. **Add new clients as needed**: Follow documented process in config/README.md to add additional clients beyond Bechem

### Testing Checkpoints

- After Phase 2: Verify git branches exist (main + client/bechem) and main is protected
- After Phase 3: Verify bechem config validates and loads in desktop app
- After Phase 4: Verify CI/CD builds bechem successfully on at least one platform (macOS recommended)
- After Phase 5: Verify version info embedded in bechem package and tracked in version-matrix.md
- After Phase 6: Verify merge workflow documented and tested with bechem
- After Phase 7: Full end-to-end test with bechem on all platforms, infrastructure ready for additional clients

---

## Task Statistics

- **Total Tasks**: 69
- **Setup**: 5 tasks (T001-T005)
- **Foundational (US1)**: 4 tasks (T006-T009)
- **User Story 3 (Configuration)**: 13 tasks (T010-T022)
- **User Story 2 (CI/CD)**: 17 tasks (T023-T039)
- **User Story 4 (Version Tracking)**: 10 tasks (T040-T049)
- **User Story 5 (Merge Workflow)**: 6 tasks (T050-T055)
- **Polish**: 14 tasks (T056-T069)

**Parallelization Opportunities**:
- 11 tasks marked [P] for parallel execution
- Maximum parallelism: 3-4 tasks simultaneously (within phases)

**Estimated Timeline** (assuming 1-2 hours per task):
- MVP (28 tasks): 28-56 hours (1 week)
- Full implementation (69 tasks): 69-138 hours (2-3 weeks)

---

## Notes

- **No automated tests**: This is infrastructure work; testing is manual workflow validation
- **Scripts must be tested**: Each build script must be manually tested before use in CI/CD
- **Branding assets**: Placeholders initially; clients should provide real assets before production
- **GitHub Actions cost**: Monitor usage; free tier provides 2000 minutes/month for private repos
- **Branch protection**: Main branch protection is critical to prevent accidental core contamination
- **Weekly merges**: Establish schedule for merging main into client branches to minimize drift
- **Documentation first**: Complete all documentation (Phase 6-7) before considering feature complete

---

**Ready for Implementation**: Yes
**All User Stories Covered**: Yes (US1, US2, US3, US4, US5)
**Independent Testing Criteria**: Defined for each user story phase
**MVP Identified**: Phase 1 + 2 + 3 (partial) + 4 (partial) = ~35 tasks
