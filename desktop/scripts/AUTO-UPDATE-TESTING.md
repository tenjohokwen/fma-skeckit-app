# Auto-Update Testing Procedure

**Feature**: Application Auto-Update (User Story 5, P3)
**Test Date**: _____________
**Tested By**: _____________

## Overview

This document describes how to test the auto-update functionality using electron-updater and GitHub Releases.

## Prerequisites

### GitHub Repository Setup

1. **GitHub repository** with releases enabled
2. **GitHub Personal Access Token** with `repo` scope
   - Generate at: https://github.com/settings/tokens
   - Scopes needed: `repo` (full control of private repositories)
3. **electron-builder.yml configured** with your GitHub username and repo name:
   ```yaml
   publish:
     provider: github
     owner: YOUR_GITHUB_USERNAME
     repo: YOUR_REPO_NAME
   ```

### Version Management

Auto-update works by comparing version numbers. Ensure:
- `desktop/package.json` has a `version` field (e.g., `"1.0.0"`)
- New releases have higher version numbers (e.g., `"1.0.1"`, `"1.1.0"`, `"2.0.0"`)

## Testing Procedure

### Step 1: Build and Release Initial Version (v1.0.0)

1. **Set version to 1.0.0** in `desktop/package.json`:
   ```json
   {
     "version": "1.0.0",
     ...
   }
   ```

2. **Build the application**:
   ```bash
   npm run build
   cd desktop
   electron-builder --mac --win --linux --publish never
   ```

3. **Create a GitHub Release manually**:
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v1.0.0`
   - Release title: `Version 1.0.0`
   - Upload the built installers from `dist-desktop/`:
     - macOS: `FMA Skeckit App 1.0.0.dmg` + `FMA Skeckit App 1.0.0.dmg.blockmap`
     - Windows: `FMA Skeckit App Setup 1.0.0.exe` + `.blockmap`
     - Linux: `.AppImage`, `.deb`, `.rpm` + blockm maps
   - Mark as "Latest release"
   - Publish release

4. **Install v1.0.0 on test machine**:
   - Download the installer from GitHub Releases
   - Install normally
   - Launch the application
   - Verify it's running v1.0.0

### Step 2: Make Changes and Build v1.0.1

1. **Make a visible change** (so you can verify the update):
   - For example: Add a console.log in `desktop/main.js`
   - Or: Update the "About" dialog text

2. **Bump version to 1.0.1** in `desktop/package.json`:
   ```json
   {
     "version": "1.0.1",
     ...
   }
   ```

3. **Build with publish enabled**:
   ```bash
   # Set GitHub token environment variable
   export GH_TOKEN=your_github_personal_access_token

   npm run build
   cd desktop
   electron-builder --mac --win --linux --publish always
   ```

   This will build and automatically upload to GitHub Releases.

### Step 3: Test Auto-Update Flow

#### Test 3A: Update Check on Launch

1. **Launch the v1.0.0 application** (installed in Step 1)

2. **Wait 3 seconds** (auto-update check delay)

3. **Check logs** (`~/Library/Logs/fma-skeckit-app/main.log` on macOS):
   ```
   [info] Checking for updates...
   [info] Update available: 1.0.1
   [info] Download speed: ...
   [info] Downloaded 50% ...
   [info] Update downloaded: 1.0.1
   ```

4. **Dialog should appear**:
   - Title: "Application Update"
   - Message: "A new version (1.0.1) has been downloaded."
   - Buttons: "Restart Now" | "Later"

#### Test 3B: User Chooses "Restart Now"

1. Click **"Restart Now"** button

2. **Expected behavior**:
   - [ ] Application quits immediately
   - [ ] Application restarts automatically
   - [ ] New version (1.0.1) is running
   - [ ] Changes from v1.0.1 are visible
   - [ ] No data loss occurred

3. **Verify version**:
   - Check "About" dialog or logs
   - Should show v1.0.1

#### Test 3C: User Chooses "Later"

1. Launch v1.0.0 again (fresh install)

2. When update dialog appears, click **"Later"**

3. **Expected behavior**:
   - [ ] Dialog closes
   - [ ] Application continues running v1.0.0
   - [ ] No immediate restart

4. **Quit and relaunch**:
   - [ ] On next launch, app updates to v1.0.1
   - [ ] Update applied during quit/restart

#### Test 3D: Download Progress

1. **Monitor update progress** (for large updates):
   - If you implement UI progress indicator, verify it shows
   - Check logs for progress updates:
     ```
     Download speed: 1234567 - Downloaded 25% (10MB/40MB)
     Download speed: 1234567 - Downloaded 50% (20MB/40MB)
     ```

2. **Verify progress is reasonable**:
   - Download speed makes sense
   - Percentage increases steadily
   - No hanging or errors

### Step 4: Error Scenarios

#### Test 4A: No Internet Connection

1. **Disconnect from internet**
2. **Launch application**
3. **Expected behavior**:
   - [ ] App launches normally
   - [ ] No error dialogs shown to user
   - [ ] Error logged: "Error in auto-updater: ..."
   - [ ] App continues to work offline

#### Test 4B: Invalid Update Server

1. **Temporarily change GitHub repo** in electron-builder.yml to non-existent repo
2. **Rebuild and install**
3. **Expected behavior**:
   - [ ] App launches normally
   - [ ] Error logged (404 or similar)
   - [ ] No crash or user-facing error

#### Test 4C: Update Download Interrupted

1. **Start update download**
2. **Disconnect internet mid-download**
3. **Expected behavior**:
   - [ ] Download fails gracefully
   - [ ] Error logged
   - [ ] App continues running old version
   - [ ] Can retry update on next launch

## Performance Validation

### Criterion SC-006: Update completes in <5 minutes

- [ ] **Update download time**: _____ seconds/minutes
- [ ] **Update installation time**: _____ seconds
- [ ] **Total time from "Update Available" to running new version**: _____ minutes
- [ ] **Result**: [ ] Pass (<5 min) [ ] Fail (≥5 min)

### Network Impact

- [ ] Update downloads in background without blocking UI
- [ ] Application remains responsive during download
- [ ] Download speed is reasonable for file size

## Platform-Specific Testing

### macOS

- [ ] Auto-update works on Intel x64
- [ ] Auto-update works on Apple Silicon ARM64
- [ ] Gatekeeper doesn't block updated app (same signature as original)
- [ ] Update preserves user data in `~/Library/Application Support/`

### Windows

- [ ] Auto-update works on Windows 10
- [ ] Auto-update works on Windows 11
- [ ] SmartScreen doesn't block updated app
- [ ] Update preserves user data in `%APPDATA%`
- [ ] No UAC prompt required (per-user install)

### Linux

- [ ] Auto-update works with AppImage
- [ ] Update works for .deb installations
- [ ] Update works for .rpm installations
- [ ] User data preserved in `~/.config/`

## Manual Update Fallback

If auto-update fails, users should be able to manually update:

1. **Download new installer** from GitHub Releases
2. **Install over existing version**
3. **Expected behavior**:
   - [ ] Installation succeeds
   - [ ] User data preserved
   - [ ] Settings preserved
   - [ ] No need to uninstall old version first

## Release Notes Display (Future Enhancement)

If you implement release notes in the update dialog:

- [ ] Release notes appear in update dialog
- [ ] Markdown formatting renders correctly
- [ ] Links are clickable
- [ ] Notes are relevant to the update

## Checklist Summary

### Update Flow

- [ ] Update check occurs on app launch
- [ ] Update detection works (v1.0.0 detects v1.0.1)
- [ ] Download progresses successfully
- [ ] Download completes without errors
- [ ] Update dialog appears with correct version
- [ ] "Restart Now" button installs update immediately
- [ ] "Later" button defers update to next launch
- [ ] Application restarts with new version
- [ ] User data and settings preserved

### Error Handling

- [ ] No internet: Fails gracefully
- [ ] Invalid server: Fails gracefully
- [ ] Download interrupted: Fails gracefully
- [ ] No error dialogs for background failures

### Performance

- [ ] Update completes in <5 minutes (SC-006)
- [ ] Download doesn't block UI
- [ ] Application remains responsive

### Security

- [ ] Update signatures verified (if code-signed)
- [ ] HTTPS used for all update downloads
- [ ] No man-in-the-middle vulnerabilities

## Common Issues & Solutions

### Issue: "Update not available" when update exists

**Cause**: Version comparison problem
**Solution**: Ensure `desktop/package.json` version is lower than GitHub Release version

### Issue: Update download hangs

**Cause**: Firewall or proxy blocking GitHub
**Solution**: Check network, whitelist GitHub domains

### Issue: Update fails to install

**Cause**: Insufficient permissions
**Solution**: Ensure app has write permissions to its own directory

### Issue: Update redownloads every launch

**Cause**: Update installation not completing
**Solution**: Check logs for installation errors

## Advanced Testing

### Test with Beta/Prerelease

1. Create a prerelease on GitHub (check "This is a pre-release")
2. Configure electron-updater to use prereleases:
   ```javascript
   autoUpdater.allowPrerelease = true;
   ```
3. Verify beta updates are detected

### Test Update Rollback

If an update is broken:
1. Remove the bad release from GitHub
2. Create a new release with higher version
3. Verify rollback works

## Documentation

After testing, document:
- [ ] Update frequency (how often app checks)
- [ ] File sizes for typical updates
- [ ] Average update time
- [ ] Any platform-specific quirks
- [ ] Instructions for users

## Sign-Off

**Auto-Update Testing**: [ ] Pass [ ] Fail

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Tester**: _________________________ Date: _____________
