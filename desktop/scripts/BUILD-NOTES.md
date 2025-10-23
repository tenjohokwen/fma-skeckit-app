# Desktop Build Notes

## Building Process

### Prerequisites Before First Build

1. **Desktop Dependencies**: Install Electron and electron-builder in the desktop directory
   ```bash
   cd desktop
   npm install
   cd ..
   ```
   This installs Electron and electron-builder locally in the `desktop/` directory, which electron-builder requires.

2. **Application Icon Required**: Create `desktop/icons/icon.png` (1024x1024 pixels)
   - See `desktop/icons/ICON-PLACEHOLDER.txt` for details
   - electron-builder will auto-generate .ico, .icns from this file

3. **Web Application Build**: Ensure `npm run build` completes successfully
   - Creates `dist/` directory with production build
   - Desktop wrapper loads this build

### Testing Windows Build (T021)

To test the Windows packaging:

```bash
npm run electron:build:win
```

This will:
1. Build the web application (`npm run build`)
2. Create Windows installers in `dist-desktop/`:
   - `FMA Skeckit App Setup <version>.exe` (NSIS installer)
   - `FMA Skeckit App Setup <version>.msi` (MSI installer)

**Expected output location**: `dist-desktop/`

**Build time**: ~5-10 minutes depending on machine

**Note**: Without an actual icon file, the build may warn but should still complete.

### Manual Testing Verification

After build completes, verify:
- [ ] Installer files created in dist-desktop/
- [ ] File sizes reasonable (<150MB per SC-002)
- [ ] Can install on Windows machine (manual testing required)

See `desktop/scripts/WINDOWS-TESTING.md` for full manual testing checklist.
