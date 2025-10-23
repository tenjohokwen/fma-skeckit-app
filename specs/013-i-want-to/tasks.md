# Tasks: Desktop Application Packaging

**Input**: Design documents from `/specs/013-i-want-to/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Constitution Compliance**: All tasks must adhere to the project constitution at `.specify/memory/constitution.md`. This desktop packaging feature adds infrastructure separate from the Vue/Quasar codebase (desktop wrapper in `desktop/` directory) and does not modify existing Vue application code.

**Tests**: This feature does not include automated tests for installers (manual testing only). Desktop wrapper will have minimal Playwright tests for Electron-specific features (window management, deep linking).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each platform's packaging capability.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)

## Path Conventions
- **Desktop wrapper**: `desktop/` at repository root (new)
- **Existing Vue app**: `src/` at repository root (unchanged)
- **Build outputs**: `dist/` (web build), `dist-desktop/` (desktop packages)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Install dependencies and create initial project structure for desktop packaging

- [x] T001 Install Electron core dependencies (electron@^28.0.0, electron-builder@^24.0.0, concurrently@^8.0.0) in root package.json devDependencies
- [x] T002 Create desktop directory structure (desktop/, desktop/icons/, desktop/scripts/) at repository root
- [x] T003 Update root .gitignore to exclude dist-desktop/, desktop/node_modules/, and *.log files from desktop wrapper

---

## Phase 2: Foundational - Cross-Platform Build Infrastructure (User Story 4, P1)

**Purpose**: Core Electron infrastructure that enables ALL platform packaging (US1, US2, US3)

**⚠️ CRITICAL**: No platform-specific packaging can begin until this phase is complete

**Goal**: Set up Electron wrapper that loads the Vue/Quasar web application, enabling cross-platform builds from a single machine (US4 requirement)

**Independent Test**: After this phase, `npm run electron:dev` should launch the desktop app in development mode, loading the web application in an Electron window with native window controls (minimize, maximize, close)

### Configuration Files

- [x] T004 [P] [US4] Create desktop/package.json with Electron runtime dependencies (electron-log@^5.0.0, electron-updater@^6.1.0) and metadata (name, version, main: "main.js", author)
- [x] T005 [P] [US4] Create desktop/electron-builder.yml with base configuration (appId: com.fma.skeckit, productName: "FMA Skeckit App", directories.output: ../dist-desktop, files include main.js/preload.js/dist, protocols for fmaskeckit://)

### Electron Main Process

- [x] T006 [US4] Create desktop/main.js - Electron main process entry point with createWindow() function (BrowserWindow config: 1400x900, minWidth 800, minHeight 600, webPreferences with context isolation, preload script, sandbox enabled)
- [x] T007 [US4] In desktop/main.js, implement window lifecycle management (app.whenReady, app.on('activate'), app.on('window-all-closed') respecting platform conventions - macOS stays open, Windows/Linux quit)
- [x] T008 [US4] In desktop/main.js, configure loading production build from dist/index.html using path.join(__dirname, '..', 'dist', 'index.html')
- [x] T009 [US4] In desktop/main.js, add electron-log integration for main process logging (log.transports.file.level = 'info', log startup/shutdown events)

### Security & Preload Script

- [x] T010 [US4] Create desktop/preload.js with context bridge exposing safe APIs to renderer (electron.platform, electron.versions, electron.onDeepLink callback registration via contextBridge.exposeInMainWorld)
- [x] T011 [US4] In desktop/main.js, implement security best practices (webPreferences: nodeIntegration: false, contextIsolation: true, sandbox: true, validate all IPC messages)

### Deep Linking Support (FR-012)

- [x] T012 [US4] In desktop/main.js, register custom protocol handler using app.setAsDefaultProtocolClient('fmaskeckit') for deep linking support
- [x] T013 [US4] In desktop/main.js, implement deep link event handlers for open-url (macOS) and second-instance (Windows/Linux) events, parsing fmaskeckit:// URLs
- [x] T014 [US4] In desktop/main.js, use IPC to send deep link URLs to renderer process (mainWindow.webContents.send('deeplink', url))

### Application Icon

- [x] T015 [US4] Create application icon (desktop/icons/icon.png) at 1024x1024 resolution with transparent background featuring FMA Skeckit App logo
- [x] T016 [US4] Configure electron-builder.yml to reference icon source and enable automatic generation of platform-specific formats (.ico for Windows, .icns for macOS, .png for Linux)

### Build Scripts

- [x] T017 [US4] Add npm scripts to root package.json for desktop development and building (electron:dev, electron:build, electron:build:win, electron:build:mac, electron:build:linux, electron:build:all)
- [x] T018 [US4] Create desktop/scripts/build-all.sh script that runs web build (npm run build) then electron-builder for all platforms (--win --mac --linux)

**Checkpoint**: Foundation ready - Electron wrapper functional, can load Vue app in development mode, ready for platform-specific packaging

---

## Phase 3: User Story 1 - Package for Windows (Priority: P1) 🎯 MVP

**Goal**: Create Windows desktop application installer (.exe/.msi) that users can install and run natively on Windows 10/11

**Independent Test**: Run `npm run electron:build:win`, install resulting .exe on Windows machine, launch application, verify all web functionality works (authentication, search, case management, file operations), verify native window controls work, verify application quits cleanly

### Windows-Specific Configuration

- [x] T019 [US1] Configure Windows build target in desktop/electron-builder.yml (win.target: nsis and msi, win.arch: x64, win.icon: icons/icon.ico)
- [x] T020 [US1] Add Windows-specific metadata to desktop/electron-builder.yml (copyright, publish info, nsis installer options: oneClick=false, allowToChangeInstallationDirectory=true, createDesktopShortcut=true, createStartMenuShortcut=true)

### Windows Build & Validation

- [x] T021 [US1] Test Windows build process by running electron:build:win script and verify output in dist-desktop/ (FMA Skeckit App Setup.exe and .msi installer created)
- [x] T022 [US1] Create manual testing checklist document (desktop/scripts/WINDOWS-TESTING.md) with verification steps: installer runs, app installs to Program Files or user directory, desktop shortcut created, app launches in <3 seconds, all web features work, window controls work, app quits cleanly without background processes (FR-004 functional parity, SC-009 95% install success)

**Checkpoint**: Windows packaging complete - .exe/.msi installers can be distributed to Windows 10/11 users

---

## Phase 4: User Story 2 - Package for macOS (Priority: P2)

**Goal**: Create macOS desktop application installer (.dmg/.pkg) that Mac users can install and run natively on macOS 11+

**Independent Test**: Run `npm run electron:build:mac`, mount resulting .dmg on macOS machine, drag app to Applications folder, launch from Launchpad, verify all web functionality works and macOS-specific features (native menu bar, fullscreen mode, notification center integration)

### macOS-Specific Configuration

- [x] T023 [US2] Configure macOS build target in desktop/electron-builder.yml (mac.target: dmg and pkg, mac.arch: x64 and arm64 for Apple Silicon support, mac.icon: icons/icon.icns, mac.category: public.app-category.business)
- [x] T024 [US2] Add macOS-specific metadata to desktop/electron-builder.yml (mac.bundleVersion, dmg installer options: background image optional, window size, icon positioning)
- [x] T025 [US2] In desktop/main.js, implement macOS-specific menu bar using Menu.buildFromTemplate with standard macOS menu structure (App menu, Edit, View, Window, Help with proper keyboard shortcuts and roles)

### macOS Build & Validation

- [x] T026 [US2] Test macOS build process by running electron:build:mac script and verify output in dist-desktop/ (FMA Skeckit App.dmg and .pkg installer created for both Intel and Apple Silicon)
- [x] T027 [US2] Create manual testing checklist document (desktop/scripts/MACOS-TESTING.md) with verification steps: .dmg mounts, drag to Applications works, app appears in Launchpad, app launches in <3 seconds, native menu bar works, fullscreen mode works, all web features work, Gatekeeper warning acknowledged (unsigned), notification center integration works (FR-004, SC-009)

**Checkpoint**: macOS packaging complete - .dmg/.pkg installers can be distributed to macOS 11+ users (Intel and Apple Silicon)

---

## Phase 5: User Story 3 - Package for Linux (Priority: P3)

**Goal**: Create Linux desktop application packages (.AppImage, .deb, .rpm) that Linux users can install on their preferred distribution

**Independent Test**: Run `npm run electron:build:linux`, install resulting .deb on Ubuntu or run .AppImage directly, launch application from application menu, verify all web functionality works

### Linux-Specific Configuration

- [ ] T028 [US3] Configure Linux build targets in desktop/electron-builder.yml (linux.target: AppImage, deb, and rpm, linux.icon: icons/icon.png, linux.category: Office or Network, linux.desktop entries for application menu integration)
- [ ] T029 [US3] Add Linux-specific metadata to desktop/electron-builder.yml (linux.synopsis, linux.description, AppImage options, deb/rpm package metadata)

### Linux Build & Validation

- [ ] T030 [US3] Test Linux build process by running electron:build:linux script and verify output in dist-desktop/ (FMA Skeckit App.AppImage, .deb, and .rpm packages created)
- [ ] T031 [US3] Create manual testing checklist document (desktop/scripts/LINUX-TESTING.md) with verification steps: AppImage runs without installation on Ubuntu/Fedora, .deb installs with apt/dpkg, .rpm installs with dnf/rpm, app appears in application menu, app launches in <3 seconds, all web features work, deep linking protocol registered (FR-004, SC-009)

**Checkpoint**: Linux packaging complete - .AppImage/.deb/.rpm installers can be distributed to Linux users (Ubuntu 20.04+, Fedora 35+)

---

## Phase 6: User Story 5 - Application Auto-Update (Priority: P3)

**Goal**: Enable desktop users to receive update notifications and easily update to new versions without manual reinstallation

**Independent Test**: Deploy new version to GitHub Releases, launch older version of desktop app, verify update notification appears with release notes, click "Update Now", verify update downloads with progress indicator, verify app restarts with new version

### Auto-Update Infrastructure

- [ ] T032 [US5] In desktop/main.js, import electron-updater (const { autoUpdater } = require('electron-updater')) and configure update server to use GitHub Releases (autoUpdater.setFeedURL with GitHub releases URL)
- [ ] T033 [US5] In desktop/main.js, implement update check on application launch (autoUpdater.checkForUpdates() in app.whenReady, handle update-available event)
- [ ] T034 [US5] In desktop/main.js, implement update download with progress tracking (handle download-progress event, send progress to renderer via IPC for UI display)
- [ ] T035 [US5] In desktop/main.js, implement update installation flow (handle update-downloaded event, show dialog with release notes and "Update Now" / "Remind Me Later" buttons using dialog.showMessageBox, call autoUpdater.quitAndInstall() on user confirmation)

### Auto-Update Configuration

- [ ] T036 [US5] Configure electron-builder.yml for auto-update publishing (publish: provider: github, owner, repo, publish: true to enable GitHub Releases integration)
- [ ] T037 [US5] Add version bump workflow to build scripts (update desktop/package.json version, create git tag, push to trigger release build)

### Auto-Update Testing

- [ ] T038 [US5] Create manual testing procedure document (desktop/scripts/AUTO-UPDATE-TESTING.md) with steps: build v1.0.0 and install, build v1.0.1 with changes, upload v1.0.1 to GitHub Releases, launch v1.0.0 app, verify update notification appears, verify download progress shown, verify update installs and app restarts with v1.0.1 (SC-006 update in <5 minutes)

**Checkpoint**: Auto-update feature complete - desktop apps can update automatically via GitHub Releases

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, optimization, and final validation across all platforms

- [ ] T039 [P] Update root README.md with desktop packaging section (how to build, system requirements, supported platforms, build commands npm run electron:build:all)
- [ ] T040 [P] Create desktop/README.md with detailed build instructions (prerequisites: Node 18+, disk space requirements, platform-specific build tools, build process for each platform, troubleshooting common issues)
- [ ] T041 [P] Document deep linking usage in desktop/README.md (fmaskeckit:// protocol format, example URLs, security considerations, how to test deep linking)
- [ ] T042 Verify bundle size targets (run builds for all platforms, check installer sizes are <150MB as per SC-002, optimize if needed by reviewing electron-builder compression settings)
- [ ] T043 Verify build time targets (run full build with `npm run electron:build:all`, ensure each platform builds in <10 minutes as per SC-001, optimize build scripts if needed)
- [ ] T044 Create CI/CD configuration for automated builds (e.g., .github/workflows/desktop-build.yml with matrix strategy for Windows/macOS/Linux builds, artifact uploads to GitHub Releases on tag push per SC-007)
- [ ] T045 Update CLAUDE.md with desktop packaging technologies (Electron v28+, electron-builder v24+, electron-updater, Playwright for wrapper testing)
- [ ] T046 Run quickstart.md validation (follow all steps in specs/013-i-want-to/quickstart.md from clean environment, verify each phase completes successfully, update quickstart if any steps are outdated)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all platform packaging
- **User Story 1 - Windows (Phase 3)**: Depends on Foundational (Phase 2) - Can proceed independently after foundation ready
- **User Story 2 - macOS (Phase 4)**: Depends on Foundational (Phase 2) - Can proceed in parallel with US1 if staffed
- **User Story 3 - Linux (Phase 5)**: Depends on Foundational (Phase 2) - Can proceed in parallel with US1/US2 if staffed
- **User Story 5 - Auto-Update (Phase 6)**: Depends on at least one platform package being complete (typically done after US1/US2/US3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 4 (P1) - Cross-Platform Infrastructure**: Foundation for all packaging, MUST complete first
- **User Story 1 (P1) - Windows**: Can start after US4 foundation - No dependencies on other packaging stories
- **User Story 2 (P2) - macOS**: Can start after US4 foundation - Independent of US1, can run in parallel
- **User Story 3 (P3) - Linux**: Can start after US4 foundation - Independent of US1/US2, can run in parallel
- **User Story 5 (P3) - Auto-Update**: Can start after any platform package exists - Typically done after US1/US2/US3 complete

### Within Each User Story

- Configuration files before build execution
- Build scripts before manual testing
- Manual testing checklist creation before actual manual verification
- Documentation updates can happen in parallel with implementation

### Parallel Opportunities

- **Phase 1 (Setup)**: All 3 tasks (T001, T002, T003) can run in parallel if using multiple terminals
- **Phase 2 (Foundational)**: T004 and T005 can run in parallel (different config files), T010 can run parallel with T004/T005
- **After Phase 2 completes**: US1 (Windows), US2 (macOS), and US3 (Linux) can ALL be worked on in parallel by different team members
- **Phase 7 (Polish)**: T039, T040, T041 are all independent documentation tasks that can run in parallel

---

## Parallel Example: After Foundation Ready

```bash
# After Phase 2 completes, these user stories can proceed in parallel:

# Developer A works on Windows packaging:
Task: T019 - Configure Windows build target
Task: T020 - Add Windows metadata
Task: T021 - Test Windows build
Task: T022 - Create Windows testing checklist

# Developer B simultaneously works on macOS packaging:
Task: T023 - Configure macOS build target
Task: T024 - Add macOS metadata
Task: T025 - Implement macOS menu bar
Task: T026 - Test macOS build
Task: T027 - Create macOS testing checklist

# Developer C simultaneously works on Linux packaging:
Task: T028 - Configure Linux build targets
Task: T029 - Add Linux metadata
Task: T030 - Test Linux build
Task: T031 - Create Linux testing checklist
```

---

## Implementation Strategy

### MVP First (User Story 4 + User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational - Cross-Platform Infrastructure (T004-T018) - **CRITICAL**
3. Complete Phase 3: Windows Packaging (T019-T022)
4. **STOP and VALIDATE**: Build Windows installer, test on Windows machine independently
5. Deploy/demo Windows desktop app

**Rationale**: US4 (cross-platform infrastructure) + US1 (Windows packaging) together form the MVP because:
- Windows is P1 priority (dominant enterprise OS per spec.md User Story 1)
- Provides immediate value to Windows users
- Validates entire Electron wrapper approach
- Can be deployed and demoed as standalone desktop offering

### Incremental Delivery

1. **Phase 1 + 2**: Setup + Foundation → Cross-platform infrastructure ready (US4 complete)
2. **+ Phase 3**: Add Windows packaging → Test independently → **Deploy Windows app (MVP!)**
3. **+ Phase 4**: Add macOS packaging → Test independently → **Deploy macOS app**
4. **+ Phase 5**: Add Linux packaging → Test independently → **Deploy Linux app**
5. **+ Phase 6**: Add Auto-Update → Test on all platforms → **Deploy updated apps with auto-update**
6. **+ Phase 7**: Polish → Final documentation and CI/CD → **Production-ready multi-platform desktop app**

Each phase adds value without breaking previous platforms.

### Parallel Team Strategy

With multiple developers after Phase 2 completion:

1. **Team completes Setup + Foundation together** (Phase 1 + 2)
2. **Once Foundation is done (after T018)**:
   - **Developer A**: Windows packaging (T019-T022)
   - **Developer B**: macOS packaging (T023-T027)
   - **Developer C**: Linux packaging (T028-T031)
3. **After platform packages complete**:
   - **Developer D**: Auto-update (T032-T038)
   - **Developers A/B/C**: Polish tasks in parallel (T039-T046)

---

## Success Criteria Validation

After implementation, verify these measurable outcomes from spec.md:

- **SC-001**: Build all platforms from single machine in <10 minutes each (validate with T043)
- **SC-002**: Installer size <150MB for all platforms (validate with T042)
- **SC-003**: Desktop app launches in <3 seconds (validate in manual testing T022, T027, T031)
- **SC-004**: 100% feature parity with web version (validate by testing all web features in desktop app)
- **SC-005**: Installation completes in <2 minutes (validate in manual testing checklists)
- **SC-006**: Auto-update completes in <5 minutes (validate with T038)
- **SC-007**: CI/CD runs without manual intervention (validate with T044)
- **SC-008**: <500MB RAM during normal operation (measure with Task Manager/Activity Monitor during testing)
- **SC-009**: 95% install success rate (track via user feedback after deployment)
- **SC-010**: Respects platform conventions (validate menu behavior, window controls, keyboard shortcuts in testing)

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **No automated tests**: Manual testing only for installers (Playwright tests for wrapper optional, not included in task list)
- **User Story 4 is foundational**: It provides the infrastructure that enables US1/US2/US3
- **Each platform package is independently testable**: Windows, macOS, and Linux can be validated separately
- **Auto-update requires at least one platform**: Typically implemented after US1/US2/US3
- **Commit after each task or logical group**: Especially after completing each phase
- **Stop at checkpoints**: Validate each platform independently before moving to next
- **Code signing deferred**: Packages will be unsigned initially (per spec.md Edge Cases, Assumption A-009)
- **Desktop wrapper is separate**: No changes to existing Vue/Quasar codebase in `src/` (constitution compliance)
