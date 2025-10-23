# Feature Specification: Multi-Client Branching Strategy and CI/CD for Desktop Packaging

**Feature Branch**: `014-for-this-application`
**Created**: 2025-10-23
**Status**: Draft
**Input**: User description: "For this application, I current have a client but I envisage that I will have at least 3 clients. There will be some diversions in the code for each client. Given we have for example clientA, clientB and ClientC and the following scenario: I will have a core version of the app (say we call it coreFma) which is common to all clients. Then clientA's version of coreFma: coreFmaClientAv1, clientB version of coreFma: coreFmaClientBv1, clientC version of coreFma: coreFmaClientCv1. Subsequent versions for each client will have to build on the last release and an the latest version of coreFma e.g clientA's next version could be coreFmaClientAv2 which builds on coreFmaClientAv1 and the latest version of coreFma. Help organize my branching strategies etc to support that scenario for all clients. Next help create a CI/CD pipeline that will be used to generate desktop packages for a given client"

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing

### User Story 1 - Maintain Core Application with Client-Specific Customizations (Priority: P1)

As a development team lead, I need to maintain a core application (coreFma) that serves as the foundation for multiple clients, while allowing each client to have their own customizations and versions, so that we can efficiently serve multiple clients without duplicating common functionality.

**Why this priority**: This is the foundational requirement. Without a clear branching strategy, the team cannot effectively manage multiple client codebases. This enables the entire multi-client architecture.

**Independent Test**: Can be fully tested by creating the core branch, creating one client branch from core, making a change to core, merging it into the client branch, and verifying both core and client-specific features work correctly.

**Acceptance Scenarios**:

1. **Given** the core application (coreFma) has been updated with a new feature, **When** the development team merges core updates into clientA's branch, **Then** clientA receives the core feature while retaining their client-specific customizations
2. **Given** clientA has version v1 deployed, **When** the team needs to create clientA v2, **Then** the new version builds on clientA v1 and incorporates the latest coreFma updates
3. **Given** multiple clients (clientA, clientB, clientC) exist, **When** a bug is fixed in coreFma, **Then** all clients can receive the fix through their normal merge process
4. **Given** clientB has specific customizations not needed by other clients, **When** those changes are committed, **Then** they remain isolated to clientB's branch and don't affect coreFma or other clients

---

### User Story 2 - Automated Desktop Package Generation Per Client (Priority: P1)

As a release manager, I need to trigger automated desktop package builds for a specific client, so that I can quickly generate Windows, macOS, and Linux installers tailored to that client without manual intervention.

**Why this priority**: This is equally critical as the branching strategy. Without automated builds per client, the multi-client architecture becomes operationally unsustainable. This delivers immediate value by reducing manual build time from hours to minutes.

**Independent Test**: Can be fully tested by triggering the CI/CD pipeline for clientA, verifying that it builds desktop packages with clientA's branding and customizations, and confirming the installers work on all three platforms.

**Acceptance Scenarios**:

1. **Given** a release manager wants to create desktop packages for clientA, **When** they trigger the CI/CD pipeline with client parameter "clientA", **Then** the pipeline builds Windows, macOS, and Linux installers from the clientA branch with clientA-specific configuration
2. **Given** clientB needs an urgent hotfix release, **When** the release manager triggers the pipeline for clientB, **Then** only clientB's desktop packages are built and released without affecting other clients
3. **Given** the pipeline is building for clientA, **When** the build completes, **Then** artifacts are tagged and stored with clear client identification (e.g., "FMA-Skeckit-ClientA-1.0.0.dmg")
4. **Given** multiple clients need simultaneous releases, **When** pipelines run in parallel for different clients, **Then** each pipeline builds the correct client-specific packages without interference

---

### User Story 3 - Client-Specific Configuration Management (Priority: P2)

As a developer, I need to maintain client-specific configuration (branding, features, API endpoints) separate from core code, so that client customizations are organized, traceable, and easy to update without affecting core functionality.

**Why this priority**: While important for maintainability, this can be implemented after the basic branching and CI/CD are working. It improves developer experience but isn't blocking for initial multi-client support.

**Independent Test**: Can be fully tested by defining configuration for one client, switching to that client's build, and verifying that the desktop app displays correct branding, connects to correct endpoints, and enables/disables the correct features.

**Acceptance Scenarios**:

1. **Given** clientA requires custom branding, **When** the desktop app is built for clientA, **Then** it displays clientA's logo, colors, and app name throughout the interface
2. **Given** clientB uses different API endpoints than clientA, **When** the clientB desktop app launches, **Then** it connects to clientB's specific backend services
3. **Given** clientC has feature flags different from other clients, **When** a user opens clientC's desktop app, **Then** only the features enabled for clientC are visible and functional
4. **Given** configuration needs to be updated for clientA, **When** a developer changes clientA's config file, **Then** the changes are tracked in version control and don't affect other clients' configurations

---

### User Story 4 - Version Tracking and Release History Per Client (Priority: P2)

As a product manager, I need to track which version of coreFma each client is running and what client-specific changes exist in each client version, so that I can manage client expectations, plan upgrades, and troubleshoot issues effectively.

**Why this priority**: Important for operational clarity and client management, but can be implemented after core branching and CI/CD are functional. This improves visibility but doesn't block development.

**Independent Test**: Can be fully tested by examining version metadata in a built desktop package and confirming it shows both the core version and client-specific version information.

**Acceptance Scenarios**:

1. **Given** clientA is running coreFmaClientAv2, **When** a support engineer checks the version information, **Then** they can see it's based on coreFma v1.5.0 plus clientA-specific changes from v2
2. **Given** multiple client versions exist, **When** viewing the release history, **Then** each client's versions are clearly listed with their base coreFma version and release dates
3. **Given** a client reports a bug, **When** the support team checks the version, **Then** they can identify exactly which code (core + client-specific) the client is running
4. **Given** planning an upgrade for clientB, **When** comparing versions, **Then** the team can see what coreFma changes clientB will receive in the upgrade

---

### User Story 5 - Merge Conflict Resolution Workflow (Priority: P3)

As a developer, I need clear processes for resolving merge conflicts when integrating coreFma updates into client branches, so that I can safely merge without breaking client-specific functionality.

**Why this priority**: While important for long-term maintenance, this is primarily documentation and process rather than technical infrastructure. Teams can manage this manually initially and formalize it later.

**Independent Test**: Can be fully tested by creating a deliberate conflict between core and client code, following the documented resolution process, and verifying the merge preserves both core updates and client customizations.

**Acceptance Scenarios**:

1. **Given** a coreFma update conflicts with clientA's customization, **When** the developer follows the merge workflow, **Then** conflicts are identified with clear guidance on resolution priorities
2. **Given** a complex merge with multiple conflicts, **When** the developer resolves conflicts, **Then** automated tests verify that both core and client-specific features still work
3. **Given** a merge has been completed, **When** the developer reviews the changes, **Then** a summary shows what was merged from core and what client customizations were preserved
4. **Given** an uncertain conflict resolution, **When** the developer needs help, **Then** documentation provides examples and decision trees for common conflict scenarios

---

### Edge Cases

- What happens when a client's customization fundamentally conflicts with a core architectural change (e.g., core refactors a module that client heavily customized)?
- How does the system handle a situation where clientA is 5 versions behind coreFma and wants to upgrade?
- What happens if a critical security fix is needed in coreFma and must be deployed to all clients immediately?
- How does the CI/CD pipeline handle failures specific to one platform (e.g., macOS build succeeds but Windows build fails for clientA)?
- What happens when two clients need different versions of the same dependency?
- How does the system prevent accidental commits to the core branch that contain client-specific code?
- What happens when a client needs a hotfix but doesn't want the latest coreFma changes?
- How are database migrations handled when clients are on different versions?

## Requirements

### Functional Requirements

#### Branching Strategy

- **FR-001**: System MUST maintain a core branch (coreFma) containing all shared functionality common to all clients
- **FR-002**: System MUST support creation of client-specific branches (e.g., client/clientA, client/clientB, client/clientC) that branch from core
- **FR-003**: System MUST allow client branches to receive core updates through merge or rebase while preserving client-specific customizations
- **FR-004**: System MUST maintain version tags for core releases (e.g., core/v1.0.0, core/v1.1.0) and client releases (e.g., clientA/v1.0.0, clientA/v2.0.0)
- **FR-005**: System MUST prevent direct commits to core branch without appropriate review (pull requests require at least 1 reviewer approval before merging)
- **FR-006**: System MUST provide clear documentation of branching workflow showing how to: create client branches, merge core updates, handle conflicts, and create releases

#### CI/CD Pipeline

- **FR-007**: CI/CD pipeline MUST accept a client identifier parameter to specify which client to build (e.g., clientA, clientB, clientC)
- **FR-008**: CI/CD pipeline MUST checkout the correct client-specific branch based on the client parameter
- **FR-009**: CI/CD pipeline MUST build desktop packages for Windows, macOS, and Linux for the specified client
- **FR-010**: CI/CD pipeline MUST apply client-specific configuration during the build process (branding, feature flags, API endpoints)
- **FR-011**: CI/CD pipeline MUST tag build artifacts with client identifier and version (e.g., FMA-Skeckit-ClientA-v1.0.0.dmg)
- **FR-012**: CI/CD pipeline MUST publish packages to client-specific storage locations or release channels
- **FR-013**: CI/CD pipeline MUST support manual triggers for specific client builds
- **FR-014**: CI/CD pipeline MUST support automated triggers on client branch commits or tags
- **FR-015**: CI/CD pipeline MUST run client-specific tests (if any) in addition to core tests

#### Configuration Management

- **FR-016**: System MUST store client-specific configuration in dedicated config files or directories (e.g., config/clientA.json)
- **FR-017**: System MUST support runtime selection of client configuration based on build-time parameter or environment variable
- **FR-018**: Client configuration MUST include: application name, branding assets (logo, icons, colors), API endpoints, feature flags, and version information
- **FR-019**: System MUST validate client configuration at build time to catch errors before deployment
- **FR-020**: System MUST provide a mechanism to share common configuration patterns across clients while allowing overrides

#### Version Management

- **FR-021**: Each client release MUST record which coreFma version it's based on
- **FR-022**: Desktop application MUST display version information showing both client version and core version
- **FR-023**: System MUST maintain a version matrix showing which clients are on which core versions
- **FR-024**: System MUST support semantic versioning for both core and client releases

### Key Entities

- **Core Application (coreFma)**: The base application containing all shared functionality, features, and components common to all clients. Maintained in a protected core branch with versioned releases.

- **Client Branch**: A long-lived git branch specific to one client (e.g., client/clientA) that contains the core application plus client-specific customizations. Receives updates from core through merges.

- **Client Configuration**: A structured configuration file or set of files containing client-specific settings including: application branding (name, logo, colors, icons), API endpoints and service URLs, feature flags enabling/disabling functionality, version metadata, and build parameters.

- **Client Release**: A specific version of the application for one client (e.g., clientA v2.0.0), tagged in git and built into desktop packages. Contains a specific coreFma version plus client customizations as of that point in time.

- **Build Artifact**: The compiled desktop installers for one client on one platform (e.g., FMA-Skeckit-ClientA-1.0.0.dmg), tagged with client identifier and version, stored in artifact repository or release system.

- **Version Matrix**: A tracking system (potentially automated) showing which coreFma version each client is currently running in production, what client-specific version they're on, and upgrade paths.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Development team can merge a core update into a client branch and deploy to production in under 2 hours (assuming no conflicts)
- **SC-002**: CI/CD pipeline can build complete desktop packages for one client (all 3 platforms) in under 15 minutes
- **SC-003**: Team can onboard a new client (create branch, configure, build first release) in under 4 hours
- **SC-004**: 95% of core updates merge into client branches without conflicts
- **SC-005**: Zero incidents of client-specific code accidentally being merged into core branch
- **SC-006**: Build artifacts clearly identify client and version with 100% accuracy
- **SC-007**: Support team can identify exact code version (core + client) for any deployed client in under 1 minute
- **SC-008**: Parallel builds for multiple clients complete without interference or cross-contamination 100% of the time

## Assumptions

- Git is used for version control with support for branching and tagging
- CI/CD platform supports parameterized builds (e.g., GitHub Actions with workflow_dispatch inputs, Jenkins with parameters)
- Desktop packaging infrastructure from feature 013 is already implemented and working
- Client customizations are primarily configuration-based rather than deep code changes (reduces merge conflicts)
- Clients are willing to accept periodic core updates rather than staying on ancient versions indefinitely
- The team has established code review processes for core changes
- Build artifacts can be stored in separate locations or tagged clearly to distinguish clients
- Client-specific secrets (API keys, certificates) are managed outside the repository using secure secret management
- Core application architecture supports feature flags and configuration-driven behavior
- The number of clients will remain manageable (3-10 clients, not 100s) for the foreseeable future

## Dependencies

- Feature 013 (desktop packaging with Electron and electron-builder) must be complete
- Git repository with appropriate access controls and branch protection
- CI/CD platform (GitHub Actions, Jenkins, GitLab CI, etc.)
- Secure secret management for client-specific credentials
- Artifact storage system (GitHub Releases, Artifactory, S3, etc.)
- Code review and approval workflow for core branch

## Out of Scope

- Automated conflict resolution (conflicts will be manually resolved by developers)
- Dynamic runtime client switching within a single application instance (each build is for one client only)
- Client-specific backend services or databases (only frontend desktop app is addressed)
- Automated testing of every possible core version + client version combination
- Migration of existing clients from other codebases (assumes clients start fresh or are already on the current codebase)
- Client-specific plugin systems or module loading
- Automated rollback mechanisms (handled by standard deployment processes)
- Performance optimization specific to individual clients
