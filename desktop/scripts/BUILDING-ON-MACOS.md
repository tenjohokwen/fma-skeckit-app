# Building Desktop App on macOS

## The Problem

Building Windows installers from macOS requires Wine, which is not currently installed. The error you're seeing (`macOS Catalina doesn't support 32-bit executables and as result Wine cannot run Windows 32-bit applications too`) indicates that electron-builder is trying to use Wine for cross-platform building but failing.

## Solutions

### Option 1: Build for macOS First (Recommended for Testing)

Since you're on macOS, build the macOS version first to verify everything works:

```bash
# From repository root
npm run electron:build:mac
```

This will create:
- `dist-desktop/FMA Skeckit App.dmg`
- `dist-desktop/FMA Skeckit App.pkg`

You can then test the .dmg on your Mac immediately.

### Option 2: Install Wine for Cross-Platform Windows Building

To build Windows installers from macOS, you need Wine:

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Wine
brew install --cask wine-stable

# Then try Windows build again
npm run electron:build:win
```

**Note**: Wine can be finicky on macOS, especially on Apple Silicon Macs.

### Option 3: Use CI/CD for Cross-Platform Builds

The recommended production approach is to use GitHub Actions or similar CI/CD that builds on native platforms:

- Windows builds run on Windows runners
- macOS builds run on macOS runners
- Linux builds run on Linux runners

See the task list (T044) for CI/CD configuration.

### Option 4: Build on Native Platforms

For Windows builds, use an actual Windows machine or VM:

1. Clone repository on Windows
2. Run `npm install` and `cd desktop && npm install`
3. Run `npm run electron:build:win`

## Recommended Workflow

1. **Test on macOS first**: `npm run electron:build:mac`
2. **Verify it works**: Install and test the .dmg
3. **Set up CI/CD**: Use GitHub Actions for multi-platform builds
4. **OR install Wine**: If you need local Windows builds

## Current Status

✅ Configuration is complete
✅ Icon placeholder created
✅ Web application builds successfully
⚠️ Wine not installed (needed for Windows builds from macOS)

## Next Steps

Try building for macOS:

```bash
npm run electron:build:mac
```

This should work natively on your Mac and will verify that:
- electron-builder is working correctly
- Icon conversion is working
- The Electron wrapper loads the Vue app correctly
- The packaging configuration is valid

Once macOS build succeeds, you can address Windows building separately.
