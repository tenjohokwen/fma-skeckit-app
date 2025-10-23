# Research: Desktop Application Packaging

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-22
**Status**: Complete

## Overview

This research phase investigates the key technical decisions required to package the FMA Skeckit App (Vue 3/Quasar web application) as native desktop installers for Windows, macOS, and Linux. The primary research questions focus on selecting the appropriate desktop framework and determining the testing strategy for the desktop wrapper.

## Research Questions

### 1. Desktop Framework Selection: Electron vs Tauri

**Question**: Which desktop framework should be used to wrap the Vue/Quasar web application - Electron or Tauri?

**Findings**:

**Electron (v28+)**:
- **Pros**:
  - Mature, battle-tested framework (10+ years, used by VS Code, Slack, Discord, Figma)
  - Extensive documentation and large community (GitHub: 110k+ stars)
  - Cross-platform build tools (electron-builder) with proven Windows/macOS/Linux support
  - Auto-update support via electron-updater with minimal configuration
  - Rich ecosystem of plugins for system tray, notifications, deep linking
  - Native Node.js integration for advanced features
  - Excellent debugging tools (Chrome DevTools built-in)
- **Cons**:
  - Large bundle size (~100-120MB for basic app due to bundled Chromium + Node.js)
  - Higher memory footprint (~150-200MB baseline)
  - Longer startup time (~2-3 seconds)
  - Security considerations require careful context isolation configuration

**Tauri (v1.5+)**:
- **Pros**:
  - Much smaller bundle size (~10-30MB, uses OS webview instead of bundling browser)
  - Lower memory footprint (~50-100MB)
  - Faster startup time (~1-2 seconds)
  - Written in Rust with strong security focus (all IPC is explicit)
  - Modern architecture with better security defaults
  - Growing community and momentum
- **Cons**:
  - Younger framework (v1.0 released 2022, less battle-tested)
  - Smaller ecosystem and fewer community plugins
  - Requires Rust toolchain for development (adds complexity)
  - Cross-platform building can be more complex (especially Windows .msi from macOS/Linux)
  - Webview differences across platforms (WebKit on macOS/Linux, WebView2 on Windows) may cause subtle rendering differences
  - Auto-update functionality less mature than Electron's
  - Limited Node.js integration (Rust backend instead)

**Decision**: Use **Electron** for this project

**Rationale**:
1. **Lower implementation risk**: Electron is mature and battle-tested with extensive documentation, reducing implementation risk for a first-time desktop packaging effort
2. **Cross-platform build reliability**: electron-builder is proven to work reliably for building Windows/macOS/Linux packages from a single machine, which is a P1 requirement (User Story 4)
3. **Auto-update maturity**: electron-updater provides robust auto-update functionality (User Story 5, P3) with well-documented patterns
4. **Team familiarity**: Team is already using JavaScript/Node.js ecosystem; Electron requires no additional language expertise (Rust for Tauri would add learning curve)
5. **Bundle size acceptable**: For a desktop legal/case management application, 100-150MB installer is acceptable (not a mobile app with bandwidth constraints)
6. **Development velocity**: Electron's mature tooling and extensive examples will accelerate development
7. **Vue/Quasar compatibility**: Electron has proven compatibility with Vue 3 and Quasar (Quasar even has electron mode built-in)

**Alternatives Considered**:
- **Tauri**: Rejected due to younger ecosystem, Rust learning curve, and webview inconsistencies that could affect Vue/Quasar rendering. Better suited for projects prioritizing bundle size over implementation risk.
- **NW.js**: Rejected as it's less popular than Electron with smaller community and less mature packaging tools
- **Capacitor**: Rejected as it's primarily for mobile (iOS/Android), not desktop

---

### 2. Desktop Wrapper Testing Strategy

**Question**: What testing approach should be used for the desktop wrapper (main process, preload scripts, packaging)?

**Findings**:

**Automated Testing Options**:
1. **Spectron** (deprecated): Official Electron testing framework, no longer maintained
2. **WebdriverIO with Electron**: Can drive Electron app like a browser, but complex setup
3. **Playwright**: Supports Electron testing as of v1.9+, modern and well-maintained
4. **@wdio/electron-service**: WebdriverIO service specifically for Electron apps

**Manual Testing Approaches**:
- Build installers and manually test on each target OS
- Verify installation process, application launch, feature parity with web version
- Test platform-specific features (notifications, system tray, deep linking)
- Test auto-update flow end-to-end

**Decision**: **Hybrid approach** - Manual testing for installers, minimal automated tests for wrapper code

**Rationale**:
1. **Installer testing inherently manual**: Testing actual .exe/.dmg/.AppImage installation requires real OS environments and is difficult to automate reliably
2. **Feature parity guaranteed by web tests**: The Vue/Quasar application is already tested with Vitest + Vue Test Utils. Since desktop wraps the exact same web build, those tests provide confidence in functionality
3. **Wrapper code is minimal**: Electron main process and preload scripts will be simple (<100 lines each), primarily loading the web app from `dist/` directory
4. **Playwright for main process**: Use Playwright to test Electron-specific features (window management, deep linking, notifications) with a few focused tests
5. **Manual verification sufficient**: For packaging configuration and installer creation, manual verification on target OS platforms is most practical
6. **CI/CD smoke tests**: Automated builds in CI can verify packaging completes successfully without runtime errors, catching build issues early

**Testing Strategy**:
- **Web application**: Continue using Vitest + Vue Test Utils (existing tests, no changes)
- **Desktop wrapper (main process)**: 5-10 Playwright tests for Electron-specific features
- **Packaging**: Automated CI builds to verify all platforms package successfully
- **Installers**: Manual testing checklist on actual Windows/macOS/Linux machines
- **Auto-update**: Manual end-to-end testing with test update server

**Alternatives Considered**:
- **Comprehensive WebdriverIO suite**: Rejected as overkill for simple wrapper; high maintenance burden
- **Pure manual testing**: Rejected as CI builds should catch packaging errors automatically
- **No wrapper testing**: Rejected as platform-specific features (notifications, deep linking) need verification

---

### 3. Build Tool Selection

**Question**: Which build/packaging tool should be used - electron-builder or electron-forge?

**Findings**:

**electron-builder**:
- Most popular Electron packaging tool (npm: 150k+ weekly downloads)
- Supports all platforms (Windows .exe/.msi, macOS .dmg/.pkg, Linux .AppImage/.deb/.rpm)
- Cross-platform building from single machine (P1 requirement)
- Built-in auto-update support
- Extensive configuration options
- Well-documented, mature

**electron-forge**:
- Official Electron tool (maintained by Electron team)
- Simpler API, less configuration
- Good for basic apps
- Less flexible for advanced packaging scenarios
- Smaller community compared to electron-builder

**Decision**: Use **electron-builder**

**Rationale**:
1. **Industry standard**: More widely adopted with larger community and more examples
2. **Cross-platform proven**: Reliable track record for building Windows/macOS/Linux from single machine
3. **Feature completeness**: Supports all required formats (.exe, .msi, .dmg, .pkg, .AppImage, .deb, .rpm)
4. **Auto-update integration**: Seamless integration with electron-updater for User Story 5
5. **Configuration flexibility**: YAML configuration file is straightforward and well-documented

---

### 4. Application Icon Creation

**Question**: How should application icons be created and managed for multiple platforms and sizes?

**Findings**:

**Requirements**:
- **Windows**: .ico file (16x16, 32x32, 48x48, 256x256)
- **macOS**: .icns file (16x16 to 512x512, plus @2x retina versions)
- **Linux**: .png files (16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512)

**Tools**:
1. **Manual creation**: Design in Figma/Sketch, export multiple sizes, convert to .ico/.icns
2. **electron-icon-maker**: npm package that generates all sizes from single PNG
3. **electron-builder icon generation**: Automatically generates platform icons from 1024x1024 source
4. **Online converters**: CloudConvert, ICO Converter, etc.

**Decision**: Use **electron-builder's automatic icon generation** from a single 1024x1024 PNG source image

**Rationale**:
1. **Single source of truth**: Maintain one high-resolution icon (1024x1024.png)
2. **Automatic generation**: electron-builder automatically creates all platform-specific formats during build
3. **No additional tools**: No need for separate icon generation step
4. **Consistent sizing**: Ensures all required sizes are generated correctly for each platform

**Implementation**:
- Create `desktop/icons/icon.png` (1024x1024, transparent PNG with application logo)
- Configure electron-builder to use this as icon source
- electron-builder generates .ico (Windows), .icns (macOS), and .png (Linux) automatically

---

### 5. Deep Linking / Custom URL Protocol

**Question**: How should deep linking (e.g., `fmaskeckit://case/12345`) be implemented?

**Findings**:

**Electron Deep Linking**:
- Use `app.setAsDefaultProtocolClient('fmaskeckit')` in main process
- Register protocol on application startup
- Handle `open-url` (macOS) and `second-instance` (Windows/Linux) events
- Parse URL and route to appropriate page in renderer process

**Platform-specific considerations**:
- **Windows**: Requires registry entries (handled by electron-builder)
- **macOS**: Requires Info.plist entries (handled by electron-builder)
- **Linux**: Requires .desktop file entries (handled by electron-builder)

**Decision**: Implement custom protocol handler using Electron's built-in APIs

**Rationale**:
1. **Native Electron support**: Electron provides straightforward APIs for protocol handling
2. **electron-builder handles registration**: Build tool automatically registers protocol with OS
3. **User Story requirement**: FR-012 requires deep linking support
4. **Common use case**: Opening specific cases from email links or other applications

**Implementation**:
- Configure protocol in package.json and electron-builder config
- Implement URL parsing in main process
- Use Electron IPC to send deep link data to renderer
- Vue Router handles navigation to appropriate case page

---

### 6. Local Data Storage Strategy

**Question**: How should local data be stored (user preferences, cache, app state)?

**Findings**:

**Electron Storage Options**:
1. **electron-store**: Simple key-value storage using JSON file
2. **LocalStorage/IndexedDB**: Browser APIs available in renderer process
3. **Native file system**: Direct file writes using Node.js fs module
4. **SQLite**: For structured data (overkill for this use case)

**Platform-specific directories**:
- **Windows**: `%APPDATA%\fma-skeckit-app\`
- **macOS**: `~/Library/Application Support/fma-skeckit-app/`
- **Linux**: `~/.config/fma-skeckit-app/`

**Decision**: Use **browser APIs (LocalStorage/IndexedDB)** for application state, same as web version

**Rationale**:
1. **Zero changes to Vue app**: Existing web application already uses browser APIs for local storage
2. **Feature parity**: Desktop automatically gets same storage behavior as web version
3. **Electron provides API access**: Renderer process has full access to browser storage APIs
4. **No additional dependencies**: No need for electron-store or other packages

**Note**: For desktop-specific settings (e.g., window size/position), can use electron-store if needed, but application data uses existing browser APIs.

---

### 7. Auto-Update Server Infrastructure

**Question**: What infrastructure is needed for the auto-update feature (User Story 5, P3)?

**Findings**:

**Update Server Options**:
1. **electron-updater + GitHub Releases**: Free hosting, automatic update checks
2. **electron-updater + S3**: Custom hosting with S3 bucket
3. **Hazel**: Self-hosted update server (Node.js)
4. **Custom server**: Full control but more maintenance

**Update Flow**:
1. Desktop app checks for updates on launch (or periodically)
2. Queries update server for latest version and download URL
3. Downloads update in background
4. Notifies user when ready
5. Installs and restarts application

**Decision**: Use **electron-updater with GitHub Releases** for auto-update

**Rationale**:
1. **Zero infrastructure cost**: GitHub Releases provides free hosting
2. **Standard pattern**: electron-updater has built-in GitHub Releases support
3. **Simple workflow**: Upload installers to GitHub Releases, electron-updater handles the rest
4. **Version management**: Git tags drive release versions naturally
5. **P3 priority**: Auto-update is lower priority; can defer implementation or use simple solution

**Implementation**:
- Configure electron-updater in main process
- Upload built installers to GitHub Releases
- electron-updater checks GitHub Releases API for new versions
- Download and install updates automatically (or prompt user)

---

## Implementation Risks

### Risk 1: Cross-Platform Build Environment Limitations

**Likelihood**: Medium
**Impact**: High
**Mitigation**: Use electron-builder's proven cross-platform capabilities. Test builds early on macOS, Windows, and Linux environments. Use CI/CD (GitHub Actions) with matrix builds for all platforms.

### Risk 2: Unsigned Packages Security Warnings

**Likelihood**: High
**Impact**: Medium
**Mitigation**: Document clearly in release notes and installer README that packages are unsigned. Users will see security warnings on Windows and macOS. Provide screenshots showing how to proceed. Plan to add code signing in future release once certificates are obtained.

### Risk 3: Desktop Package Size Exceeding Target

**Likelihood**: Low
**Impact**: Low
**Mitigation**: Electron bundles are typically 100-120MB. Target is <150MB. Use electron-builder's asar packing and compression. Monitor bundle size during builds. If needed, can optimize by removing unused Electron modules.

### Risk 4: Platform-Specific Rendering Differences

**Likelihood**: Low
**Impact**: Low
**Mitigation**: Electron uses same Chromium engine on all platforms, so rendering should be identical. Existing Vue/Quasar responsive design already handles different viewport sizes. Test on all platforms during manual verification phase.

### Risk 5: Auto-Update Implementation Complexity

**Likelihood**: Medium
**Impact**: Low (P3 feature)
**Mitigation**: Auto-update is P3 priority and can be deferred if needed. electron-updater provides straightforward implementation once GitHub Releases infrastructure is set up. Start with manual updates, add auto-update later.

---

## Best Practices for Electron Desktop Apps

### Security

1. **Enable context isolation**: Separate main and renderer processes
2. **Use preload scripts**: Expose only specific APIs to renderer via context bridge
3. **Disable Node integration in renderer**: Use IPC for main-renderer communication
4. **Validate all IPC messages**: Don't trust renderer data
5. **Content Security Policy**: Same CSP as web version applies

### Performance

1. **Lazy load windows**: Create windows on demand, not at startup
2. **Use hidden windows**: Pre-create windows for instant display
3. **Background processing**: Use main process for heavy operations
4. **Memory management**: Clean up windows and listeners properly

### UX

1. **Save window state**: Remember window size/position across launches
2. **Native menus**: Use Electron's Menu API for consistent platform behavior
3. **Notifications**: Use Electron's Notification API for OS-native notifications
4. **Quit behavior**: macOS apps hide on close, Windows/Linux apps quit

### Development

1. **Hot reload**: Use electron-reloader for development builds
2. **DevTools**: Enable Chrome DevTools in development mode
3. **Logging**: Use electron-log for main process logging
4. **Error handling**: Catch and log errors in main and renderer processes

---

## Technology Stack Summary

Based on research, the final technology stack for desktop packaging:

**Desktop Framework**:
- Electron v28+ (latest stable)
- Reason: Mature, battle-tested, JavaScript-based, excellent cross-platform support

**Build Tools**:
- electron-builder v24+ for packaging
- npm scripts for build automation
- Reason: Industry standard, proven cross-platform building, auto-update support

**Testing**:
- Playwright for Electron-specific features (5-10 focused tests)
- Manual testing for installers on target platforms
- Vitest + Vue Test Utils for web application (existing, no changes)
- Reason: Hybrid approach balances automation with practical manual verification

**Auto-Update**:
- electron-updater for update client
- GitHub Releases for update server hosting
- Reason: Zero infrastructure cost, standard pattern, simple workflow

**Icons**:
- Single 1024x1024 PNG source image
- electron-builder automatic generation
- Reason: Single source of truth, automated cross-platform icon creation

**Local Storage**:
- Browser APIs (LocalStorage/IndexedDB) - existing web app patterns
- Reason: Zero changes to Vue application, automatic feature parity

**Deep Linking**:
- Electron protocol handler APIs
- Custom `fmaskeckit://` protocol
- Reason: Native Electron support, automatic OS registration via electron-builder

---

## Research Complete

All technical decisions resolved. No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1: Design (data-model.md, contracts/, quickstart.md).

### Key Decisions Summary

1. **Desktop Framework**: Electron v28+
2. **Build Tool**: electron-builder v24+
3. **Testing Strategy**: Playwright for wrapper (minimal), Manual for installers
4. **Auto-Update**: electron-updater + GitHub Releases
5. **Icons**: 1024x1024 PNG with automatic generation
6. **Storage**: Browser APIs (LocalStorage/IndexedDB)
7. **Deep Linking**: Electron protocol handler
8. **Project Structure**: `desktop/` folder at repository root, `src/` unchanged

### Next Steps

1. Generate data-model.md (likely minimal/N/A for this feature)
2. Generate contracts/ (API contracts if needed)
3. Generate quickstart.md (implementation guide)
4. Update agent context (CLAUDE.md or similar)
5. Re-evaluate constitution check post-design
