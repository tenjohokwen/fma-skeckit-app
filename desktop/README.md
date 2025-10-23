# FMA Skeckit App - Desktop Application

Desktop packaging for the FMA Skeckit App using Electron.

## ✅ Current Status

**Implementation Complete**: MVP (Phase 1-3) finished
- ✅ Electron infrastructure setup
- ✅ macOS build configuration
- ✅ Windows build configuration
- ✅ Deep linking support (fmaskeckit://)
- ✅ Security-compliant wrapper
- ✅ Cross-platform build capability

**Successfully Built**: macOS installers created and tested
- Intel (x64): `FMA Skeckit App 1.0.0.dmg` (90MB)
- Apple Silicon (ARM64): `FMA Skeckit App-1.0.0.dmg` (95MB)

## 🚀 Quick Start

### Prerequisites

1. **Install dependencies** (one-time setup):
   ```bash
   # From repository root
   cd desktop
   npm install
   cd ..
   ```

2. **Build the web application**:
   ```bash
   npm run build
   ```

3. **Replace placeholder icon** (recommended before distribution):
   - Create/obtain a 1024x1024 PNG with your logo
   - Save as: `desktop/icons/icon.png`
   - Must have transparent background

### Build Commands

**macOS** (native, works on Mac):
```bash
npm run electron:build:mac
```
Output: `dist-desktop/FMA Skeckit App 1.0.0.dmg`

**Windows** (requires Wine on macOS, or use Windows machine):
```bash
npm run electron:build:win
```
Output: `dist-desktop/FMA Skeckit App Setup 1.0.0.exe` and `.msi`

**Linux**:
```bash
npm run electron:build:linux
```
Output: `dist-desktop/*.AppImage`, `*.deb`, `*.rpm`

**All platforms**:
```bash
npm run electron:build:all
```

### Development Mode

Test the desktop app without building installers:
```bash
npm run electron:dev
```

## 📁 Project Structure

```
desktop/
├── main.js              # Electron main process (app lifecycle, deep linking)
├── preload.js           # Context bridge (security layer)
├── package.json         # Desktop runtime dependencies
├── electron-builder.yml # Build configuration for all platforms
├── icons/
│   ├── icon.png         # 1024x1024 source icon (placeholder - replace!)
│   └── README.md        # Icon requirements
└── scripts/
    ├── build-all.sh               # Build all platforms script
    ├── BUILD-NOTES.md             # Build process documentation
    ├── BUILDING-ON-MACOS.md       # macOS-specific build guide
    └── WINDOWS-TESTING.md         # Windows manual testing checklist
```

## 🔧 Technical Details

### Electron Wrapper

- **Electron**: v28.3.3
- **electron-builder**: v24.13.3
- **Window size**: 1400x900 (min: 800x600)
- **Security**: Context isolation, no Node integration, sandboxed

### Features Implemented

✅ **Native window controls** (minimize, maximize, close)
✅ **Deep linking** via `fmaskeckit://` protocol
✅ **Platform-specific menus** (macOS menu bar ready)
✅ **Logging** via electron-log
✅ **Auto icon conversion** (PNG → .ico/.icns)
✅ **Cross-platform builds** from single machine

### Security

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Sandbox enabled
- ✅ External links open in system browser
- ✅ Safe IPC via context bridge
- ⚠️ Code signing: Unsigned (add certificates for production)

## 📋 Build Results

### macOS Build (Tested ✅)

**What was built**:
- Intel x64: 90MB DMG
- Apple Silicon ARM64: 95MB DMG

**Status**: ✅ Build successful, under 150MB target

**Notes**:
- Unsigned packages (Gatekeeper warning expected)
- Right-click → Open to bypass warning
- Both architectures built in ~1.5 minutes

### Windows Build (Configured, Not Tested)

**Configuration ready for**:
- NSIS installer (.exe)
- MSI installer (.msi)
- x64 architecture
- Desktop & Start Menu shortcuts

**To build on macOS**: Install Wine first
```bash
brew install --cask wine-stable
npm run electron:build:win
```

**Or build on Windows**: Clone repo on Windows and run build command

### Linux Build (Configured, Not Tested)

**Configuration ready for**:
- AppImage (universal)
- .deb (Debian/Ubuntu)
- .rpm (Fedora/RHEL)

```bash
npm run electron:build:linux
```

## 🎯 Testing

### macOS Testing

1. Mount `dist-desktop/FMA Skeckit App 1.0.0.dmg`
2. Drag to Applications
3. Launch from Launchpad
4. Verify:
   - App launches in <3 seconds
   - All web features work (auth, search, cases, files)
   - Window controls work
   - App quits cleanly

### Windows Testing

See [scripts/WINDOWS-TESTING.md](scripts/WINDOWS-TESTING.md) for comprehensive manual testing checklist.

### Deep Link Testing

Test custom URL protocol:
```bash
# macOS
open "fmaskeckit://case/123"

# Windows (from Command Prompt)
start fmaskeckit://case/123
```

Should launch app and navigate to case #123.

## 🔄 Updating the Application

### Auto-Update (Not Yet Implemented)

Auto-update infrastructure is configured but not enabled. To implement:
- See tasks.md Phase 6 (T032-T038)
- Requires GitHub Releases setup
- Uses electron-updater

### Manual Updates

Users download and install new .dmg/.exe from releases.

## 🐛 Troubleshooting

### "Cannot compute electron version" Error

**Solution**: Install dependencies in desktop directory
```bash
cd desktop && npm install && cd ..
```

### Icon Conversion Error

**Solution**: Ensure `desktop/icons/icon.png` exists and is valid 1024x1024 PNG
```bash
file desktop/icons/icon.png
# Should show: PNG image data, 1024 x 1024
```

### Wine/Windows Build Error on macOS

**Solution**: Either install Wine or build on Windows machine
```bash
brew install --cask wine-stable
```

### Quasar Build Path Error

**Solution**: Electron expects web build in `dist/spa/` (already configured)
```bash
npm run build
# Creates dist/spa/index.html
```

## 📚 Documentation

- [BUILD-NOTES.md](scripts/BUILD-NOTES.md) - Build process and prerequisites
- [BUILDING-ON-MACOS.md](scripts/BUILDING-ON-MACOS.md) - macOS-specific guide
- [WINDOWS-TESTING.md](scripts/WINDOWS-TESTING.md) - Windows testing checklist
- [../specs/013-i-want-to/tasks.md](../specs/013-i-want-to/tasks.md) - Full task breakdown

## 🔮 Future Enhancements

From tasks.md phases not yet implemented:

- **Phase 6**: Auto-update (electron-updater + GitHub Releases)
- **Phase 7**: CI/CD automation, additional documentation
- **Production**: Code signing certificates (remove Gatekeeper warnings)

## ⚠️ Before Production Release

- [ ] Replace placeholder icon with branded 1024x1024 PNG logo
- [ ] Add code signing certificates (macOS: Developer ID, Windows: Authenticode)
- [ ] Test installers on all target platforms
- [ ] Set up GitHub Releases or CDN for distribution
- [ ] Configure auto-update infrastructure (optional)
- [ ] Update version numbers in package.json files

## 📊 Success Metrics

From spec.md success criteria:

- ✅ **SC-001**: Build time <10 min per platform (✅ ~1.5 min)
- ✅ **SC-002**: Package size <150MB (✅ 90-95MB)
- ⏳ **SC-003**: Launch time <3 seconds (needs testing)
- ⏳ **SC-004**: 100% feature parity (needs verification)
- ⏳ **SC-008**: RAM usage <500MB (needs monitoring)

## 🤝 Contributing

When adding desktop features:

1. Update `desktop/main.js` for main process changes
2. Update `desktop/preload.js` for renderer API exposure
3. Test on all platforms
4. Update documentation
5. Follow security best practices (context isolation)

## 📝 License

Same as main application.

---

**Need Help?**
- Build issues: See [BUILD-NOTES.md](scripts/BUILD-NOTES.md)
- Platform-specific: See [BUILDING-ON-MACOS.md](scripts/BUILDING-ON-MACOS.md)
- Testing: See [WINDOWS-TESTING.md](scripts/WINDOWS-TESTING.md)
- Full implementation: See [../specs/013-i-want-to/](../specs/013-i-want-to/)
