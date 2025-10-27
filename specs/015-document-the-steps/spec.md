# Feature Specification: Application Icon & Splash Screen Replacement Guide

**Feature Branch**: `015-document-the-steps`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "document the steps to Replace Application Icon & Splash Screen in the main branch and then merge it  in client/bechem"

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing

### User Story 1 - Replace Desktop Application Icon (Priority: P1)

A developer needs to replace the default blue placeholder icon with a client-specific logo for the desktop application. The icon appears in the Dock (macOS), taskbar (Windows), and as the application splash screen during launch.

**Why this priority**: This is the most visible branding element and directly impacts first impressions. Every desktop build requires a custom icon.

**Independent Test**: Can be fully tested by replacing the icon file, building the desktop package, and launching the application to verify the new icon appears in all OS-specific locations (Dock, taskbar, splash screen).

**Acceptance Scenarios**:

1. **Given** a developer has a 1024x1024 PNG logo, **When** they replace the icon file and build the desktop app, **Then** the new icon appears in the Dock/taskbar and as the splash screen
2. **Given** a developer replaces the icon with an invalid format, **When** they attempt to build, **Then** they receive clear error messages indicating format requirements
3. **Given** a developer has different icons for different clients, **When** they switch to a client branch and build, **Then** the correct client-specific icon is used

---

### User Story 2 - Verify Icon Quality Across Platforms (Priority: P2)

A developer needs to verify that their custom icon scales properly and looks good at all sizes (16x16 to 1024x1024) across different operating systems (macOS, Windows, Linux).

**Why this priority**: Poor icon quality at small sizes leads to unprofessional appearance and difficult-to-identify applications in system menus.

**Independent Test**: Can be tested by examining the generated platform-specific icon files (.icns for macOS, .ico for Windows) and verifying all size variants are present and visually acceptable.

**Acceptance Scenarios**:

1. **Given** a developer has replaced the icon, **When** the build process completes, **Then** platform-specific icon files are generated with all required sizes
2. **Given** an icon with fine details that don't scale well, **When** the developer views the 16x16 version, **Then** they can identify the icon needs simplification
3. **Given** a transparent PNG icon, **When** built for Windows, **Then** the .ico file properly preserves transparency

---

### User Story 3 - Update Client-Specific Branding (Priority: P3)

A developer working on a client-specific branch needs to replace both the desktop icon and ensure the client branding directory contains the updated assets for future builds.

**Why this priority**: Ensures consistency between client branding assets and actual built applications, enabling easier maintenance and future updates.

**Independent Test**: Can be tested by verifying both the desktop/icons/ and branding/{client}/icons/ directories contain the same updated icon files.

**Acceptance Scenarios**:

1. **Given** a developer is on a client branch, **When** they update the icon, **Then** both desktop/icons/ and branding/{client}/icons/ are updated
2. **Given** client-specific icons exist, **When** switching between client branches, **Then** each branch maintains its own icon assets
3. **Given** updated client branding, **When** merging to the client branch, **Then** no icon conflicts occur

---

### Edge Cases

- What happens when an icon file is not exactly 1024x1024 pixels? (Build should fail with clear error message indicating size requirements)
- How does the system handle non-PNG formats like JPG or SVG? (Documentation should specify PNG requirement and automatic conversion limitations)
- What occurs if the icon file is corrupted or has invalid metadata? (Build process should detect and report the issue before package creation)
- How does the system behave if icon files are missing from the branding directory? (Should fall back to desktop/icons/ default or fail with clear instructions)

## Requirements

### Functional Requirements

- **FR-001**: Documentation MUST specify the required icon format (PNG with RGBA support)
- **FR-002**: Documentation MUST specify the required icon dimensions (1024x1024 pixels minimum)
- **FR-003**: Documentation MUST list all file locations that need to be updated (desktop/icons/icon.png and branding/{client}/icons/icon.png)
- **FR-004**: Documentation MUST explain the automatic conversion process that generates platform-specific formats (.icns, .ico)
- **FR-005**: Documentation MUST provide step-by-step instructions for replacing icons on both main and client branches
- **FR-006**: Documentation MUST explain how to verify the icon was successfully applied after building
- **FR-007**: Documentation MUST include recommendations for icon design best practices (simplicity for small sizes, transparency handling)
- **FR-008**: Documentation MUST explain the relationship between the application icon and splash screen (they use the same icon file)
- **FR-009**: Documentation MUST provide commands to clear build cache before rebuilding with new icons
- **FR-010**: Documentation MUST document the git workflow for updating icons (main branch → merge to client branches)

### Key Entities

- **Application Icon**: The primary visual identifier for the desktop application, stored as a 1024x1024 PNG file, automatically converted to platform-specific formats during build
- **Branding Directory**: Client-specific directory (branding/{client}/) containing icon assets that should mirror the desktop/icons/ directory
- **Platform Icon Files**: Generated formats (.icns for macOS, .ico for Windows) that contain multiple icon sizes embedded in a single file

## Success Criteria

### Measurable Outcomes

- **SC-001**: Developers can successfully replace the application icon following the documentation without external assistance in under 10 minutes
- **SC-002**: 100% of desktop builds display the correct custom icon (not the default blue placeholder) when documentation is followed
- **SC-003**: All generated platform-specific icon files (.icns, .ico) contain the required size variants (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
- **SC-004**: Developers can verify icon replacement success by visual inspection without requiring specialized tools
- **SC-005**: Icon replacement process results in zero merge conflicts when updating from main to client branches when following the documented git workflow
- **SC-006**: 95% of developers correctly identify both file locations (desktop/icons/ and branding/) that need updating on first attempt

## Assumptions

- Developers have basic file system navigation skills and can locate directories
- Developers have git access and permission to create branches and merge changes
- Build environment has the necessary tools installed (electron-builder, platform-specific build tools)
- Developers understand basic image formats and can obtain or create PNG files at required dimensions
- Icon replacement is performed during development/build time, not at runtime
- The same icon is used for both the application icon and splash screen (no separate splash screen image)
- Developers use the standard build commands (npm run electron:build:mac, etc.) as documented in package.json

## Dependencies

- electron-builder must be configured to process icon files from the desktop/icons/ directory
- Build scripts must be functional and accessible via npm commands
- Platform-specific build tools must be available (macOS for .icns generation, etc.)
- Git branching strategy must support main → client branch merging workflow
- Documentation must be stored in an accessible location (likely project README or docs/ directory)

## Out of Scope

- Automated icon generation from text/SVG (users must provide pre-made PNG files)
- Icon validation or linting tools (manual verification expected)
- Client-specific icon switching at runtime (build-time replacement only)
- Splash screen animations or custom splash screen designs (static icon only)
- Icon versioning or history tracking (handled by git)
- Web application favicon updates (desktop application icons only)
