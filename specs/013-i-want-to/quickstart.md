# Quickstart: Desktop Application Packaging

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-22
**Branch**: `013-i-want-to`

## Overview

This quickstart guide provides a step-by-step implementation roadmap for adding desktop application packaging capability to the FMA Skeckit App. The implementation wraps the existing Vue 3/Quasar web application using Electron and creates native installers for Windows, macOS, and Linux.

## Prerequisites

- Branch `013-i-want-to` checked out
- Node.js 18+ and npm 9+ installed
- Existing Vue 3/Quasar app builds successfully (`npm run build` works)
- ~50GB free disk space (for platform-specific build tools and outputs)
- Optional: Access to Windows, macOS, and Linux machines for testing (or VMs)

## Phase Overview

1. **Setup Electron Infrastructure** (User Story 4, P1)
2. **Package for Windows** (User Story 1, P1)
3. **Package for macOS** (User Story 2, P2)
4. **Package for Linux** (User Story 3, P3)
5. **Add Auto-Update** (User Story 5, P3) - Optional

---

## Phase 1: Setup Electron Infrastructure (P1)

### Step 1.1: Install Electron Dependencies

```bash
# Install Electron and build tools
npm install --save-dev electron@^28.0.0
npm install --save-dev electron-builder@^24.0.0
npm install --save-dev concurrently@^8.0.0
```

**Expected Outcome**: `package.json` dev dependencies updated with Electron packages.

---

### Step 1.2: Create Desktop Directory Structure

```bash
mkdir -p desktop/icons desktop/scripts
touch desktop/main.js desktop/preload.js desktop/package.json desktop/electron-builder.yml
```

**Expected Outcome**: `desktop/` folder created with placeholders for main process files.

---

### Step 1.3: Create Desktop Package Configuration

**File**: `desktop/package.json`

```json
{
  "name": "fma-skeckit-app-desktop",
  "version": "1.0.0",
  "description": "FMA Skeckit App - Desktop Application",
  "main": "main.js",
  "author": "FMA Team",
  "private": true,
  "dependencies": {
    "electron-log": "^5.0.0",
    "electron-updater": "^6.1.0"
  }
}
```

**Expected Outcome**: Desktop-specific package.json with Electron runtime dependencies.

---

### Step 1.4: Create Electron Main Process

**File**: `desktop/main.js`

```javascript
const { app, BrowserWindow, protocol, shell } = require('electron');
const path = require('path');
const log = require('electron-log');

// Enable logging
log.transports.file.level = 'info';
log.info('Application starting...');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    icon: path.join(__dirname, 'icons', 'icon.png'),
    show: false // Show after ready-to-show
  });

  // Load the production build from dist/
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(distPath);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log.info('Window displayed');
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready event
app.whenReady().then(() => {
  createWindow();

  // macOS: Re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Deep linking support (fmaskeckit://)
app.setAsDefaultProtocolClient('fmaskeckit');

// Handle deep links (Windows/Linux)
app.on('second-instance', (event, commandLine) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    // Find the fmaskeckit:// URL
    const url = commandLine.find(arg => arg.startsWith('fmaskeckit://'));
    if (url) {
      log.info('Deep link received:', url);
      mainWindow.webContents.send('deeplink', url);
    }
  }
});

// Handle deep links (macOS)
app.on('open-url', (event, url) => {
  event.preventDefault();
  log.info('Deep link received (macOS):', url);
  if (mainWindow) {
    mainWindow.webContents.send('deeplink', url);
  }
});
```

**Expected Outcome**: Main process file that creates Electron window and loads Vue app from dist/.

---

### Step 1.5: Create Preload Script

**File**: `desktop/preload.js`

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Deep linking
  onDeepLink: (callback) => {
    ipcRenderer.on('deeplink', (event, url) => callback(url));
  },

  // Platform info
  platform: process.platform,

  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
```

**Expected Outcome**: Preload script that safely exposes Electron APIs to renderer via context bridge.

---

### Step 1.6: Create electron-builder Configuration

**File**: `desktop/electron-builder.yml`

```yaml
appId: com.fma.skeckit
productName: FMA Skeckit App
copyright: Copyright © 2025 FMA Team

directories:
  output: ../dist-desktop
  buildResources: icons

files:
  - main.js
  - preload.js
  - package.json
  - "!**/.git"
  - "!**/.DS_Store"
  - from: ../dist
    to: dist
    filter:
      - "**/*"

extraMetadata:
  main: desktop/main.js

protocols:
  name: FMA Skeckit Protocol
  schemes:
    - fmaskeckit

win:
  target:
    - target: nsis
      arch:
        - x64
  icon: icons/icon.ico
  artifactName: "${productName}-Setup-${version}.${ext}"

mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  icon: icons/icon.icns
  category: public.app-category.business
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: null
  entitlementsInherit: null

linux:
  target:
    - target: AppImage
      arch:
        - x64
    - target: deb
      arch:
        - x64
    - target: rpm
      arch:
        - x64
  icon: icons/icon.png
  category: Office
  maintainer: FMA Team
  vendor: FMA
```

**Expected Outcome**: electron-builder config defining package formats for all platforms.

---

### Step 1.7: Add npm Scripts

**File**: `package.json` (repository root) - Add to scripts section:

```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:9000 && electron desktop/main.js\"",
    "electron:build": "npm run build && electron-builder --config desktop/electron-builder.yml",
    "electron:build:win": "npm run build && electron-builder --win --config desktop/electron-builder.yml",
    "electron:build:mac": "npm run build && electron-builder --mac --config desktop/electron-builder.yml",
    "electron:build:linux": "npm run build && electron-builder --linux --config desktop/electron-builder.yml",
    "electron:build:all": "npm run build && electron-builder -mwl --config desktop/electron-builder.yml"
  }
}
```

**Expected Outcome**: npm scripts for building desktop packages.

---

### Step 1.8: Create Application Icons

1. Design or obtain a 1024x1024 PNG icon for the application
2. Save as `desktop/icons/icon.png`
3. electron-builder will automatically generate platform-specific icons:
   - `icon.ico` for Windows (generated)
   - `icon.icns` for macOS (generated)
   - Various PNG sizes for Linux (generated)

**Expected Outcome**: Single source icon that electron-builder converts to all platform formats.

---

### Step 1.9: Update .gitignore

**File**: `.gitignore` (add at end):

```
# Desktop build outputs
dist-desktop/
desktop/node_modules/
desktop/package-lock.json

# Platform-specific
*.ico
*.icns
.DS_Store
```

**Expected Outcome**: Build artifacts excluded from git.

---

### Step 1.10: Test Development Mode

```bash
# Start dev server and Electron
npm run electron:dev
```

**Expected Outcome**: Electron window opens showing the Quasar dev server running at localhost:9000.

**Verify**:
- Window shows Vue application correctly
- All features work (login, search, cases, files)
- Console logs appear in terminal
- Hot reload works when editing Vue components

---

## Phase 2: Build Windows Package (P1)

### Step 2.1: Build Windows Installer

```bash
npm run electron:build:win
```

**Expected Outcome**:
- Windows installer created: `dist-desktop/FMA-Skeckit-App-Setup-1.0.0.exe`
- Build completes in under 10 minutes
- No errors in build log

---

### Step 2.2: Test Windows Installer

**Manual Testing on Windows Machine**:

1. Copy `dist-desktop/FMA-Skeckit-App-Setup-1.0.0.exe` to Windows machine
2. Run installer (accept security warning for unsigned package)
3. Verify:
   - Application installs to `C:\Program Files\FMA Skeckit App\`
   - Desktop shortcut created
   - Start menu entry created
4. Launch application from desktop shortcut
5. Verify:
   - Window opens in under 3 seconds
   - All features work (login, search, cases, files, dashboard analytics)
   - Deep linking works: Open `fmaskeckit://case/123` from browser
6. Close application
7. Verify:
   - Application quits cleanly
   - No background processes remain (check Task Manager)

**Expected Outcome**: Windows package installs, runs, and functions identically to web version.

---

## Phase 3: Build macOS Package (P2)

### Step 3.1: Build macOS Installer

```bash
npm run electron:build:mac
```

**Expected Outcome**:
- macOS installer created: `dist-desktop/FMA-Skeckit-App-1.0.0.dmg`
- Build completes in under 10 minutes
- Supports both Intel (x64) and Apple Silicon (arm64)

---

### Step 3.2: Test macOS Installer

**Manual Testing on macOS Machine**:

1. Copy `dist-desktop/FMA-Skeckit-App-1.0.0.dmg` to macOS machine
2. Mount DMG and drag app to Applications folder
3. Launch application (accept security warning for unsigned package via System Preferences > Security)
4. Verify:
   - Window opens with native macOS menu bar
   - All features work (login, search, cases, files, dashboard analytics)
   - macOS-specific features work (fullscreen mode, notification center)
   - Deep linking works: Open `fmaskeckit://case/123` from browser
5. Test window management:
   - Close window (app hides, doesn't quit on macOS)
   - Click dock icon (window reappears)
   - Cmd+Q to quit (app fully quits)

**Expected Outcome**: macOS package installs, runs, and respects macOS platform conventions.

---

## Phase 4: Build Linux Package (P3)

### Step 4.1: Build Linux Packages

```bash
npm run electron:build:linux
```

**Expected Outcome**:
- Three Linux packages created:
  - `dist-desktop/FMA-Skeckit-App-1.0.0.AppImage` (portable, no install)
  - `dist-desktop/fma-skeckit-app_1.0.0_amd64.deb` (Debian/Ubuntu)
  - `dist-desktop/fma-skeckit-app-1.0.0.x86_64.rpm` (Fedora/Red Hat)
- Build completes in under 10 minutes

---

### Step 4.2: Test Linux Packages

**Manual Testing on Linux Machine (Ubuntu 20.04+ recommended)**:

1. **Test AppImage** (portable):
   ```bash
   chmod +x FMA-Skeckit-App-1.0.0.AppImage
   ./FMA-Skeckit-App-1.0.0.AppImage
   ```
   - Verify application launches without installation
   - Test all features

2. **Test .deb** (Debian/Ubuntu):
   ```bash
   sudo dpkg -i fma-skeckit-app_1.0.0_amd64.deb
   fma-skeckit-app  # Launch from terminal or app menu
   ```
   - Verify application appears in application menu
   - Test all features

3. **Test .rpm** (Fedora/Red Hat):
   ```bash
   sudo rpm -i fma-skeckit-app-1.0.0.x86_64.rpm
   fma-skeckit-app
   ```
   - Verify application appears in application menu
   - Test all features

**Expected Outcome**: Linux packages work on target distributions.

---

## Phase 5: Cross-Platform Build (P1)

### Step 5.1: Build All Platforms at Once

```bash
npm run electron:build:all
```

**Expected Outcome**:
- Windows, macOS, and Linux packages all created in single build
- Build completes in under 30 minutes total (10 minutes per platform)
- All packages appear in `dist-desktop/` directory
- Build log shows success for all platforms

**Verify**:
```bash
ls -lh dist-desktop/
# Should show:
# - FMA-Skeckit-App-Setup-1.0.0.exe (Windows)
# - FMA-Skeckit-App-1.0.0.dmg (macOS)
# - FMA-Skeckit-App-1.0.0.AppImage (Linux portable)
# - fma-skeckit-app_1.0.0_amd64.deb (Linux Debian)
# - fma-skeckit-app-1.0.0.x86_64.rpm (Linux RPM)
```

---

## Phase 6: Auto-Update Setup (P3, Optional)

### Step 6.1: Configure electron-updater

**File**: `desktop/main.js` (add after requires):

```javascript
const { autoUpdater } = require('electron-updater');

// Configure auto-updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Check for updates on app start
app.whenReady().then(() => {
  createWindow();

  // Check for updates 5 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 5000);
});

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);
  mainWindow.webContents.send('update-downloaded', info);
});
```

**Expected Outcome**: Auto-updater checks GitHub Releases for new versions.

---

### Step 6.2: Configure Update Server

**File**: `desktop/electron-builder.yml` (add):

```yaml
publish:
  provider: github
  owner: your-org
  repo: fma-skeckit-app
  private: false
```

**Expected Outcome**: electron-builder configured to use GitHub Releases for updates.

---

### Step 6.3: Test Auto-Update

1. Create GitHub Release with version 1.0.1
2. Upload installers as release assets
3. Launch desktop app version 1.0.0
4. Verify update notification appears
5. Download and install update
6. Verify application restarts with version 1.0.1

**Expected Outcome**: Auto-update downloads and installs new versions automatically.

---

## Verification Checklist

### Build Verification

- [ ] Windows .exe installer builds successfully (<10 min)
- [ ] macOS .dmg installer builds successfully (<10 min)
- [ ] Linux .AppImage builds successfully (<10 min)
- [ ] Linux .deb builds successfully
- [ ] Linux .rpm builds successfully
- [ ] Cross-platform build creates all packages (<30 min)
- [ ] All packages are under 150MB

### Functional Verification

- [ ] Desktop app launches in under 3 seconds
- [ ] All web features work identically in desktop
- [ ] Authentication works (login, signup, email verification)
- [ ] Search works (clients, cases, case IDs)
- [ ] Case management works (view, edit, metadata)
- [ ] File operations work (upload, download, delete)
- [ ] Dashboard analytics display all 6 charts
- [ ] Deep linking works (fmaskeckit:// URLs)

### Platform-Specific Verification

- [ ] **Windows**: Installer creates desktop shortcut and Start menu entry
- [ ] **Windows**: Application quits cleanly without background processes
- [ ] **macOS**: Application has native menu bar
- [ ] **macOS**: Application hides on close, quits with Cmd+Q
- [ ] **macOS**: Fullscreen mode works correctly
- [ ] **Linux**: AppImage runs without installation
- [ ] **Linux**: .deb and .rpm install correctly and appear in app menu

### Auto-Update Verification (P3, Optional)

- [ ] Application checks for updates on launch
- [ ] Update notification displays when new version available
- [ ] Update downloads in background
- [ ] Application restarts and updates successfully

---

## Rollback Plan

If issues arise:

1. **Revert branch**: `git checkout main`
2. **Remove desktop files**: `rm -rf desktop/ dist-desktop/`
3. **Clean npm**: `npm install` to restore original package.json
4. **Web version unaffected**: Desktop packaging doesn't modify web app

---

## Next Steps

After completing quickstart:

1. Run `/speckit.tasks` to generate detailed implementation tasks
2. Implement tasks in priority order (US4 + US1 first)
3. Test on all target platforms
4. Create release documentation
5. Optional: Add code signing for production (requires certificates)
6. Optional: Implement auto-update (P3)

---

## Notes

- **Development**: Use `npm run electron:dev` for hot reload during development
- **Building**: Always run `npm run build` before `electron-builder` to ensure latest web app
- **Testing**: Manual testing on actual OS platforms is required (VMs acceptable)
- **Icons**: Provide 1024x1024 PNG, electron-builder generates all formats
- **Unsigned packages**: Users will see security warnings; add code signing later
- **Memory**: electron-builder requires significant disk space (~50GB) for platform tools
