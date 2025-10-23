# GitHub Actions Workflows

This directory contains CI/CD workflows for the FMA Skeckit App.

## Desktop Build Workflow

**File**: `desktop-build.yml`

**Purpose**: Automatically builds desktop installers for Windows, macOS, and Linux.

### Triggers

1. **Version Tags**: Automatically runs when you push a git tag matching `v*.*.*` (e.g., `v1.0.0`)
2. **Manual**: Can be triggered manually from the Actions tab in GitHub

### What It Does

The workflow:
1. Runs on three platforms in parallel: Windows, macOS, and Linux
2. Installs dependencies for both web app and desktop wrapper
3. Builds the web application (`npm run build`)
4. Creates platform-specific installers:
   - **macOS**: `.dmg` file
   - **Windows**: `.exe` installer
   - **Linux**: `.AppImage` file
5. Uploads artifacts for download (30-day retention)
6. Creates a GitHub Release with all installers (when triggered by tag)

### How to Use

#### Option 1: Create a Release via Git Tag

```bash
# 1. Update version in package.json files
npm version 1.0.1

# 2. Create and push tag
git tag v1.0.1
git push origin v1.0.1

# 3. Workflow runs automatically
# 4. Check Actions tab to monitor progress
# 5. Installers appear in GitHub Releases when complete
```

#### Option 2: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Desktop Build** workflow
3. Click **Run workflow**
4. Choose branch
5. Click **Run workflow** button
6. Artifacts available for download after completion (no release created)

### Build Artifacts

After the workflow completes, you'll find:

**Via GitHub Actions Artifacts** (manual trigger):
- `desktop-mac` - macOS DMG files
- `desktop-win` - Windows EXE/MSI installers
- `desktop-linux` - Linux AppImage/deb/rpm files

**Via GitHub Releases** (tag trigger):
- All platform installers attached to the release
- Automatically generated release notes from commits

### Auto-Update Integration

When installers are published to GitHub Releases, the electron-updater in the desktop app will automatically:
1. Check for new versions on app launch
2. Download updates in the background
3. Prompt users to restart and install

**Important**: For auto-update to work, update `desktop/electron-builder.yml`:
```yaml
publish:
  provider: github
  owner: YOUR_GITHUB_USERNAME
  repo: YOUR_REPO_NAME
  releaseType: release
```

### Build Time

Expected build times per platform:
- **macOS**: ~1.5-3 minutes
- **Windows**: ~3-5 minutes
- **Linux**: ~2-4 minutes

Total workflow time: ~5-10 minutes (platforms build in parallel)

### Troubleshooting

#### Build Fails on Icon Conversion

**Problem**: Icon file missing or invalid

**Solution**: Ensure `desktop/icons/icon.png` exists and is valid 1024x1024 PNG
```bash
file desktop/icons/icon.png
# Should show: PNG image data, 1024 x 1024
```

#### macOS Notarization Warnings

**Problem**: macOS build succeeds but warns about notarization

**Solution**: This is expected without Apple Developer certificates. Users will see Gatekeeper warning but can still install via right-click → Open.

For production:
1. Enroll in Apple Developer Program ($99/year)
2. Add signing certificates to GitHub Secrets
3. Update workflow to include notarization step

#### Windows Code Signing

**Problem**: Windows SmartScreen warning for users

**Solution**: This is expected without code signing certificate.

For production:
1. Purchase code signing certificate
2. Add certificate to GitHub Secrets
3. Update electron-builder config with signing details

### Security Considerations

- Workflow uses `GITHUB_TOKEN` (automatically provided)
- No additional secrets needed for basic builds
- For code signing, add certificates as repository secrets
- Never commit signing certificates or passwords to git

### Monitoring

- View build progress: **Actions** tab → **Desktop Build**
- Download build logs for debugging
- Check artifact sizes (should be <150MB per platform)

### Cost

- GitHub Actions is free for public repositories
- Private repositories: 2000 minutes/month free, then $0.008/minute
- Typical build uses ~15-30 minutes per run (all 3 platforms)

### Next Steps

After setting up this workflow:

1. **Test the workflow**:
   ```bash
   git tag v1.0.0-test
   git push origin v1.0.0-test
   ```

2. **Download artifacts** from Actions tab

3. **Test installers** on each platform

4. **Delete test release** if needed

5. **Create production release** when ready

### Related Documentation

- [Desktop README](../../desktop/README.md) - Desktop packaging overview
- [Build Notes](../../desktop/scripts/BUILD-NOTES.md) - Local build instructions
- [Auto-Update Testing](../../desktop/scripts/AUTO-UPDATE-TESTING.md) - Testing update mechanism
