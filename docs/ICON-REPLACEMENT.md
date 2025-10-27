# Replacing Application Icons & Splash Screens

**Status**: Complete
**Last Updated**: 2025-10-27
**Quick Reference**: See [specs/015-document-the-steps/quickstart.md](../specs/015-document-the-steps/quickstart.md) for one-page reference

---

## 1. Overview

This guide provides step-by-step instructions for replacing the application icon and splash screen in the FMA Skeckit desktop application.

### What This Guide Covers

- Replacing the default blue placeholder icon with custom branding
- Understanding icon file requirements and format specifications
- Building desktop applications with custom icons for macOS, Windows, and Linux
- Handling icon changes across different git branches (main and client branches)
- Verifying icon quality and appearance across all platforms

### Who This Guide Is For

This guide is written for **developers** working on the FMA Skeckit App who need to:
- Create client-specific branded desktop applications
- Update the default application icon
- Merge icon changes between main and client branches

### Time Estimate

**< 10 minutes** for a standard icon replacement (assuming you already have a properly formatted icon file)

### Problem Solved

The desktop application ships with a **blue placeholder icon** by default. This guide shows you how to replace it with:
- Client-specific branding (logos, custom colors)
- Custom icons for different deployment environments
- Updated branding when company logos change

---

## 2. Prerequisites

Before you begin, ensure you have the following tools, permissions, and knowledge.

### Required Tools

- **Node.js**: Version 20 or higher (check with `node --version`)
- **npm**: Installed with Node.js (check with `npm --version`)
- **git**: For version control (check with `git --version`)
- **Image Editor**: Any tool that can export PNG files at exact dimensions
  - Examples: Adobe Photoshop, GIMP, Figma, Sketch, Affinity Designer, Pixelmator
  - Minimum capability: Export PNG at 1024x1024 pixels with RGBA support

### Required Permissions

- **Git Repository Access**: Read/write access to the project repository
- **File System Access**: Write permissions for:
  - `desktop/icons/` directory
  - `branding/{client}/icons/` directory (for client-specific icons)
- **Build Permissions**: Ability to run npm build commands

### Required Knowledge

- **Git Basics**:
  - Checking out branches (`git checkout`)
  - Committing changes (`git add`, `git commit`)
  - Pushing to remote (`git push`)
  - Merging branches (`git merge`)
  - Resolving merge conflicts (for client branch workflows)

- **Command Line Basics**:
  - Navigating directories (`cd`)
  - Copying files (`cp`)
  - Running npm scripts (`npm run`)

- **Desktop Application Concepts**:
  - Understanding what an application icon is (Dock icon, taskbar icon)
  - Understanding what a splash screen is (shown during app launch)

---

## 3. Icon Requirements

### Format Specification

**Required Format**: PNG with RGBA support (transparency)

**Why PNG with RGBA?**
- **Transparency**: Allows icon to blend with different backgrounds (light/dark modes)
- **Quality**: Lossless format maintains crisp edges at all sizes
- **Platform Support**: electron-builder automatically converts PNG to platform-specific formats:
  - **macOS**: `.icns` (Apple Icon Image format)
  - **Windows**: `.ico` (Windows Icon format)
  - **Linux**: Uses PNG directly

### Dimensions

**Required Size**: **1024x1024 pixels** (exactly)

**Why 1024x1024?**
- electron-builder generates all required size variants from this source:
  - **macOS**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
  - **Windows**: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
  - **Linux**: Various sizes depending on desktop environment
- 1024x1024 provides enough detail for high-resolution displays (Retina, 4K)
- Smaller source images will appear pixelated when scaled up

### Design Best Practices

Follow these guidelines to ensure your icon looks professional at all sizes:

#### 1. Simplicity is Key

- **Use bold, simple shapes** - complex details disappear at small sizes (16x16)
- **Limit your color palette** - 2-4 colors work best
- **Avoid text** - text becomes unreadable at small sizes
- **Test at 16x16** - if your icon is unrecognizable at this size, simplify it

#### 2. Padding and Safe Area

- **Include ~10% padding** - prevents icon from touching edges
- **Safe area**: Keep critical elements within the central 80% of the canvas
- **Why?** Some platforms apply corner rounding or masks that can crop edges

#### 3. Transparency Handling

- **Use transparency for non-rectangular shapes** - creates polished appearance
- **Avoid semi-transparent backgrounds** - can look muddy on different backgrounds
- **Opaque core elements** - main icon elements should be fully opaque (alpha = 255)

#### 4. Testing Before Final Export

Before exporting your final icon, test it:

1. **Scale Down Test**:
   - Resize your icon to 16x16 in your image editor
   - Can you still recognize what it is?
   - Are the main shapes still visible?

2. **Background Test**:
   - View icon on white background
   - View icon on dark gray/black background
   - Does it work on both?

3. **Color Contrast Test**:
   - Ensure sufficient contrast between icon elements
   - Avoid low-contrast color combinations (light gray on white, dark gray on black)

### Platform-Specific Notes

#### macOS (.icns)
- electron-builder generates `.icns` file with all size variants
- macOS uses multiple sizes: Dock, Finder, Spotlight, etc.
- Icons appear with system-applied shadow and rounded corners

#### Windows (.ico)
- electron-builder generates `.ico` file with embedded size variants
- Windows uses multiple sizes: taskbar, Start menu, file explorer
- Icons appear with optional system transparency effects

#### Linux (PNG)
- Most Linux desktop environments use PNG directly
- Some environments generate additional sizes from the source
- Appearance varies by desktop environment (GNOME, KDE, etc.)

### Splash Screen Relationship

**Important**: The application icon and splash screen are the same file.

- **Splash Screen**: Shown briefly during application launch
- **Same Icon Used**: `desktop/icons/icon.png` serves both purposes
- **Platform Behavior**:
  - **macOS**: Icon appears in center of window during app load
  - **Windows**: Icon may appear in taskbar during launch
  - **Linux**: Behavior varies by desktop environment

**Design Implication**: Your icon should work well both as a small icon (16x16) and as a larger splash screen element.

---

## 4. File Locations

The desktop application uses **two locations** for icon files. Understanding both is critical for proper icon management.

### Primary Location (Used in Builds)

```
desktop/icons/icon.png
```

**Purpose**: This is the **active icon** used by electron-builder during the build process.

**When to Update**:
- When replacing the default icon on the main branch
- When updating the icon for all clients (generic change)
- Before building any desktop application

**Build Configuration Reference**:
The `desktop/electron-builder.yml` file references this location:
```yaml
icon: icons/icon.png

win:
  icon: icons/icon.png

mac:
  icon: icons/icon.png
```

### Client Branding Location (Source of Truth for Client Branches)

```
branding/{client}/icons/icon.png
```

**Example**:
```
branding/bechem/icons/icon.png
```

**Purpose**: This is the **client-specific source of truth** for icon files on client branches.

**When to Update**:
- When creating or updating a client-specific branded build
- When working on a client branch (e.g., `client/bechem`)
- When you want to preserve client branding across merges from main

**Why Two Locations?**

1. **Separation of Concerns**:
   - `desktop/icons/icon.png` = What gets built
   - `branding/{client}/icons/icon.png` = Client-specific source

2. **Git Workflow Support**:
   - Main branch: Only `desktop/icons/icon.png` matters (generic icon)
   - Client branches: Both files should match (client-specific icon)
   - When merging main → client: `branding/{client}/` preserves client branding

3. **Merge Conflict Resolution**:
   - If `desktop/icons/icon.png` conflicts during merge, restore from `branding/{client}/icons/icon.png`
   - Client branding is never lost

### Directory Structure Visualization

```
fma-skeckit-app/
├── desktop/
│   ├── icons/
│   │   └── icon.png              ← Active icon (used in builds)
│   └── electron-builder.yml      ← References desktop/icons/icon.png
│
├── branding/
│   ├── bechem/
│   │   └── icons/
│   │       └── icon.png          ← Bechem client source of truth
│   │
│   └── {other-clients}/
│       └── icons/
│           └── icon.png          ← Other client source files
│
└── package.json                  ← Contains build scripts
```

### File Synchronization Rules

**Main Branch**:
```bash
# Only desktop/icons/icon.png needs to exist
# Contains the default blue placeholder icon
```

**Client Branch** (e.g., `client/bechem`):
```bash
# BOTH files must exist and be identical:
desktop/icons/icon.png           # Used in builds
branding/bechem/icons/icon.png   # Source of truth

# Keep them in sync:
cp branding/bechem/icons/icon.png desktop/icons/icon.png
```

**Key Principle**: On client branches, `branding/{client}/icons/icon.png` is the source of truth. Copy it to `desktop/icons/icon.png` before building.

---

## 5. Step-by-Step Instructions

### 5.1 Replacing Icon on Main Branch

This workflow is for updating the **default icon** that ships with the application on the main branch.

**When to use this workflow**:
- Updating the default placeholder icon
- Making a generic icon change that applies to all builds
- Testing icon changes before client-specific customization

#### Step 1: Prepare Your Icon File

1. **Ensure your icon meets requirements** (see Section 3):
   - Format: PNG with RGBA
   - Size: 1024x1024 pixels exactly
   - Design: Simple, recognizable at small sizes

2. **Verify icon dimensions** (macOS example):
   ```bash
   sips -g pixelWidth -g pixelHeight /path/to/your-icon.png
   ```

   Expected output:
   ```
   pixelWidth: 1024
   pixelHeight: 1024
   ```

3. **Alternative verification** (any platform with ImageMagick):
   ```bash
   identify /path/to/your-icon.png
   ```

   Should show: `your-icon.png PNG 1024x1024 ...`

#### Step 2: Checkout Main Branch

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main
```

#### Step 3: Replace the Icon File

```bash
# Copy your new icon to the desktop/icons/ directory
cp /path/to/your-icon.png desktop/icons/icon.png
```

**Verification**:
```bash
# Verify the file was copied correctly
ls -lh desktop/icons/icon.png

# Verify dimensions again
sips -g pixelWidth -g pixelHeight desktop/icons/icon.png
```

#### Step 4: Commit and Push

```bash
# Stage the icon change
git add desktop/icons/icon.png

# Commit with a descriptive message
git commit -m "Update application icon"

# Push to main branch
git push origin main
```

**Important**: This update will affect all future builds from main, but client branches will retain their custom icons until they merge from main.

---

### 5.2 Replacing Icon on Client Branch

This workflow is for updating **client-specific branding** on a client branch (e.g., `client/bechem`).

**When to use this workflow**:
- Creating a client-specific branded build
- Updating existing client branding
- Maintaining client-specific icons separate from main branch

**Key Difference from Main Branch**:
- Updates **TWO** locations (not one)
- `desktop/icons/icon.png` - used in builds
- `branding/{client}/icons/icon.png` - client source of truth

#### Step 1: Prepare Client Icon

Follow the same icon requirements as Section 3:
- Format: PNG with RGBA
- Size: 1024x1024 pixels
- Design: Simple, recognizable at small sizes
- **Plus**: Should represent client branding (logo, colors)

```bash
# Verify icon dimensions
sips -g pixelWidth -g pixelHeight /path/to/client-icon.png
# Must show: pixelWidth: 1024, pixelHeight: 1024
```

#### Step 2: Checkout Client Branch

```bash
# Checkout client branch (e.g., client/bechem)
git checkout client/bechem

# Pull latest changes
git pull origin client/bechem
```

#### Step 3: Replace Icon in BOTH Locations

**Critical**: You MUST update both files:

```bash
# Replace desktop icon (used in builds)
cp /path/to/client-icon.png desktop/icons/icon.png

# Replace branding source (client source of truth)
cp /path/to/client-icon.png branding/bechem/icons/icon.png
```

**Why both?**
- `desktop/icons/icon.png` is used by electron-builder during build
- `branding/bechem/icons/icon.png` preserves client icon across merges from main
- If you only update one, they'll get out of sync

**Verification**:
```bash
# Verify both files were copied
ls -lh desktop/icons/icon.png
ls -lh branding/bechem/icons/icon.png

# Verify both are identical (file sizes should match)
ls -l desktop/icons/icon.png branding/bechem/icons/icon.png
```

#### Step 4: Commit and Push

```bash
# Stage both icon changes
git add desktop/icons/icon.png branding/bechem/icons/icon.png

# Commit with descriptive message
git commit -m "Update bechem client icon"

# Push to client branch
git push origin client/bechem
```

**Important**: This update only affects the `client/bechem` branch. The main branch keeps its default icon.

---

### 5.3 Merging Icon Changes from Main → Client Branch

This workflow handles merging changes from main into client branches while preserving client-specific icons.

**When to use this workflow**:
- Pulling latest features/fixes from main into client branch
- Updating client branch with main branch changes
- After icon was changed on main branch

**Challenge**: Main branch and client branch have different icons → merge conflict

#### Step 1: Checkout Client Branch and Merge

```bash
# Checkout client branch
git checkout client/bechem

# Merge from main
git merge main
```

**Two Possible Outcomes**:

**Outcome A: No Conflict** (icon unchanged on main since last merge)
```
Auto-merging desktop/icons/icon.png
Merge made by the 'recursive' strategy.
```
→ Skip to Step 4 (verify client icon preserved)

**Outcome B: Conflict** (icon changed on main)
```
CONFLICT (content): Merge conflict in desktop/icons/icon.png
Automatic merge failed; fix conflicts and then commit the result.
```
→ Continue to Step 2

#### Step 2: Resolve Icon Conflict (Keep Client Version)

```bash
# View conflict status
git status
# You should see: both modified: desktop/icons/icon.png

# Keep client branch version (--ours = client/bechem icon)
git checkout --ours desktop/icons/icon.png

# Stage the resolution
git add desktop/icons/icon.png
```

**Why --ours?**
- `--ours` = keep current branch (client/bechem) version
- `--theirs` = use incoming branch (main) version
- For client branches, you almost always want `--ours` to preserve branding

#### Step 3: Complete the Merge

```bash
# Check if other conflicts exist
git status

# If only icon was conflicted, complete merge
git commit -m "Merge main: preserve client icon"

# Push to client branch
git push origin client/bechem
```

#### Step 4: Verify Client Icon Preserved

**Critical verification step** - ensure client icon is correct:

```bash
# Verify desktop icon matches branding source
diff desktop/icons/icon.png branding/bechem/icons/icon.png

# Should output nothing (files identical)
```

**If files differ** (desktop icon was overwritten):
```bash
# Restore client icon from branding directory
cp branding/bechem/icons/icon.png desktop/icons/icon.png

# Commit the fix
git add desktop/icons/icon.png
git commit -m "Restore client icon after merge"
git push origin client/bechem
```

#### Step 5: Build and Verify

After merge, build to ensure client icon appears correctly:

```bash
# Clear caches
rm -rf dist-desktop ~/.cache/electron-builder

# Build for your platform
npm run electron:build:mac  # or :win, :linux

# Launch and verify
open "dist-desktop/mac/FMA Skeckit App.app"
```

**Visual Checklist**:
- ✓ Dock/taskbar shows **client icon** (not main branch icon)
- ✓ Splash screen shows **client icon**
- ✓ Application file shows **client icon**

---

## 6. Building & Verifying

### 6.1 Build Commands

After replacing the icon, you must rebuild the desktop application for the changes to take effect.

#### Clear Build Cache (IMPORTANT)

**Always clear the build cache before building** to ensure the new icon is used:

```bash
# Remove the build output directory
rm -rf dist-desktop

# Remove electron-builder cache (macOS/Linux)
rm -rf ~/.cache/electron-builder

# Remove electron-builder cache (Windows PowerShell)
# Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\cache"
```

**Why clear cache?**
- electron-builder caches icon conversions (.icns, .ico files)
- Without clearing cache, old icon may persist even after replacing source PNG
- Cache location varies by platform

#### Build for Specific Platform

**macOS**:
```bash
npm run electron:build:mac
```

**Output**: `dist-desktop/mac/FMA Skeckit App.app`

**Windows**:
```bash
npm run electron:build:win
```

**Output**: `dist-desktop/win-unpacked/FMA Skeckit App.exe` (and installer in `dist-desktop/`)

**Linux**:
```bash
npm run electron:build:linux
```

**Output**: `dist-desktop/linux-unpacked/` (and packages in `dist-desktop/`)

**All Platforms** (builds for current platform only):
```bash
npm run electron:build
```

#### Build Process Overview

The build command runs two steps:

1. **Frontend Build** (`npm run build`):
   - Compiles Vue/Quasar application
   - Outputs to `dist-desktop/`
   - Takes 30-60 seconds

2. **Electron Packaging** (`electron-builder`):
   - Packages frontend with Electron runtime
   - Converts icon.png → .icns (macOS) or .ico (Windows)
   - Creates platform-specific application bundle
   - Takes 1-3 minutes depending on platform

**Total time**: 2-5 minutes per platform

#### Build Troubleshooting

**Build fails with "Invalid icon format"**:
```bash
# Verify icon is exactly 1024x1024
sips -g pixelWidth -g pixelHeight desktop/icons/icon.png

# If not, re-export from your image editor at exact dimensions
```

**Build completes but icon unchanged**:
```bash
# Clear ALL caches and rebuild
rm -rf dist-desktop
rm -rf ~/.cache/electron-builder  # macOS/Linux
npm run electron:build:mac
```

**Build is very slow**:
- First build takes longer (downloads Electron binaries)
- Subsequent builds should be faster
- Check internet connection (downloads dependencies)

### 6.2 Verification Steps

After building, verify the icon appears correctly across all contexts.

#### Visual Verification Checklist

**macOS**:

1. **Launch the application**:
   ```bash
   open "dist-desktop/mac/FMA Skeckit App.app"
   ```

2. **Check icon in Dock**:
   - ✓ Icon appears in macOS Dock while app is running
   - ✓ Icon matches your custom design (not blue placeholder)
   - ✓ Icon has appropriate size and clarity

3. **Check splash screen**:
   - ✓ Icon appears briefly in center of window during app launch
   - ✓ Splash screen icon matches Dock icon

4. **Check Finder**:
   - Navigate to `dist-desktop/mac/` in Finder
   - ✓ Application file shows custom icon (not generic app icon)

**Windows**:

1. **Launch the application**:
   - Navigate to `dist-desktop/win-unpacked/`
   - Double-click `FMA Skeckit App.exe`

2. **Check taskbar**:
   - ✓ Icon appears in Windows taskbar
   - ✓ Icon matches your custom design

3. **Check File Explorer**:
   - View `FMA Skeckit App.exe` in File Explorer
   - ✓ EXE file shows custom icon

**Linux**:

1. **Launch the application**:
   ```bash
   ./dist-desktop/linux-unpacked/fma-skeckit-app
   ```

2. **Check application launcher**:
   - ✓ Icon appears in application launcher/dock (behavior varies by desktop environment)
   - ✓ Icon shows in window title bar (some desktop environments)

#### Size Variant Verification (macOS)

electron-builder generates multiple size variants. To verify all sizes exist in the .icns file:

```bash
# Install iconutil (should be pre-installed on macOS)
# Extract .icns to see all size variants
iconutil -c iconset "dist-desktop/mac/FMA Skeckit App.app/Contents/Resources/icon.icns" -o /tmp/icon.iconset

# List all size variants
ls -lh /tmp/icon.iconset/
```

**Expected sizes**:
- `icon_16x16.png`
- `icon_16x16@2x.png` (32x32 for Retina)
- `icon_32x32.png`
- `icon_32x32@2x.png` (64x64 for Retina)
- `icon_128x128.png`
- `icon_128x128@2x.png` (256x256 for Retina)
- `icon_256x256.png`
- `icon_256x256@2x.png` (512x512 for Retina)
- `icon_512x512.png`
- `icon_512x512@2x.png` (1024x1024 for Retina)

**Quality check**: Open the smallest size (icon_16x16.png) and verify it's still recognizable.

#### Automated Verification (Optional)

```bash
# Verify icon file exists in built app (macOS)
test -f "dist-desktop/mac/FMA Skeckit App.app/Contents/Resources/icon.icns" && echo "✓ Icon file exists" || echo "✗ Icon file missing"

# Verify icon file exists in built app (Windows)
test -f "dist-desktop/win-unpacked/resources/app.asar.unpacked/desktop/icons/icon.png" && echo "✓ Icon file exists" || echo "✗ Icon file missing"
```

---

## 7. Examples

### Example 1: Quick Icon Replacement on Main Branch

**Scenario**: You have a new icon file (`new-icon.png`) and want to update the main branch.

**Complete workflow** (< 5 minutes):

```bash
# 1. Verify icon dimensions
sips -g pixelWidth -g pixelHeight ~/Downloads/new-icon.png
# Should show: pixelWidth: 1024, pixelHeight: 1024

# 2. Checkout main branch
git checkout main
git pull origin main

# 3. Replace the icon
cp ~/Downloads/new-icon.png desktop/icons/icon.png

# 4. Verify copy succeeded
ls -lh desktop/icons/icon.png

# 5. Commit and push
git add desktop/icons/icon.png
git commit -m "Update application icon"
git push origin main

# 6. Clear build cache
rm -rf dist-desktop
rm -rf ~/.cache/electron-builder

# 7. Build for macOS
npm run electron:build:mac

# 8. Launch and verify
open "dist-desktop/mac/FMA Skeckit App.app"
# Check: Dock icon, splash screen, Finder icon
```

**Expected result**:
- ✓ New icon appears in Dock
- ✓ Splash screen shows new icon
- ✓ Application file in Finder shows new icon
- ✓ All size variants generated correctly

---

### Example 2: Update Client Branch Icon

**Scenario**: You have a client-specific icon (`bechem-logo.png`) and want to update the `client/bechem` branch.

**Complete workflow** (< 5 minutes):

```bash
# 1. Verify icon dimensions
sips -g pixelWidth -g pixelHeight ~/Downloads/bechem-logo.png
# Should show: pixelWidth: 1024, pixelHeight: 1024

# 2. Checkout client branch
git checkout client/bechem
git pull origin client/bechem

# 3. Replace icon in BOTH locations (critical!)
cp ~/Downloads/bechem-logo.png desktop/icons/icon.png
cp ~/Downloads/bechem-logo.png branding/bechem/icons/icon.png

# 4. Verify both files updated
ls -lh desktop/icons/icon.png branding/bechem/icons/icon.png
# File sizes should be identical

# 5. Commit and push
git add desktop/icons/icon.png branding/bechem/icons/icon.png
git commit -m "Update bechem client icon"
git push origin client/bechem

# 6. Clear build cache
rm -rf dist-desktop
rm -rf ~/.cache/electron-builder

# 7. Build for macOS
npm run electron:build:mac

# 8. Launch and verify
open "dist-desktop/mac/FMA Skeckit App.app"
# Check: Dock shows bechem logo (not generic icon)
```

**Expected result**:
- ✓ Dock/taskbar shows bechem client logo
- ✓ Splash screen shows bechem logo
- ✓ Both `desktop/icons/` and `branding/bechem/icons/` match
- ✓ Client branding preserved for future merges

---

### Example 3: Complete Workflow - Merge Main Into Client Branch

**Scenario**: Main branch was updated with new features. You want to merge those changes into `client/bechem` while preserving the client's custom icon.

**Complete workflow** (< 10 minutes):

```bash
# 1. Checkout client branch
git checkout client/bechem
git pull origin client/bechem

# 2. Merge from main
git merge main

# ---- SCENARIO A: No conflict (icon unchanged on main) ----
# If you see: "Merge made by the 'recursive' strategy"
# Skip to step 5 (verification)

# ---- SCENARIO B: Conflict (icon changed on main) ----
# If you see: "CONFLICT (content): Merge conflict in desktop/icons/icon.png"
# Continue with step 3...

# 3. Resolve conflict - keep client icon
git status
# Should show: both modified: desktop/icons/icon.png

git checkout --ours desktop/icons/icon.png
# --ours = keep client/bechem icon (NOT main icon)

git add desktop/icons/icon.png

# 4. Complete merge
git commit -m "Merge main: preserve client icon"

# 5. Verify client icon preserved
diff desktop/icons/icon.png branding/bechem/icons/icon.png
# Should output nothing (files identical)

# If diff shows differences (desktop icon was overwritten):
cp branding/bechem/icons/icon.png desktop/icons/icon.png
git add desktop/icons/icon.png
git commit -m "Restore client icon after merge"

# 6. Push to client branch
git push origin client/bechem

# 7. Build to verify
rm -rf dist-desktop ~/.cache/electron-builder
npm run electron:build:mac

# 8. Launch and verify client branding
open "dist-desktop/mac/FMA Skeckit App.app"
# Check: Dock shows CLIENT icon (bechem logo, NOT main branch icon)
```

**Expected result**:
- ✓ Client branch has latest features from main
- ✓ Client-specific icon is preserved (not overwritten by main icon)
- ✓ `desktop/icons/` matches `branding/bechem/icons/`
- ✓ Built application shows correct client branding

**Common mistakes to avoid**:
- ❌ Using `git checkout --theirs` (overwrites client icon with main icon)
- ❌ Forgetting to verify icon after merge
- ❌ Not updating `branding/{client}/icons/` (causes sync issues)

---

## 8. Troubleshooting

This section covers common issues and their solutions.

### Issue 1: Icon Doesn't Change After Rebuild

**Symptoms**:
- Built application still shows old icon
- Replaced `desktop/icons/icon.png` but icon unchanged in built app
- Verified source PNG is correct, but app shows wrong icon

**Cause**: electron-builder caches icon conversions (.icns, .ico files)

**Solution**:

```bash
# 1. Clear ALL caches
rm -rf dist-desktop
rm -rf ~/.cache/electron-builder  # macOS/Linux

# Windows PowerShell:
# Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\cache"

# 2. Verify source icon is correct
sips -g pixelWidth -g pixelHeight desktop/icons/icon.png
# Should show 1024x1024

# 3. Rebuild from scratch
npm run electron:build:mac  # or :win, :linux
```

**Additional checks**:
- Verify you're building from the correct branch (`git branch` should show current branch)
- Verify icon file timestamp changed: `ls -lh desktop/icons/icon.png`
- Check icon file size (should be > 10KB for typical icons)

### Issue 2: Build Fails with "Invalid Icon Format"

**Symptoms**:
- electron-builder fails during build
- Error message mentions "Invalid icon format" or "Icon must be..."
- Build stops before creating application bundle

**Cause**: Icon file doesn't meet electron-builder requirements

**Solution**:

**Step 1: Verify dimensions**
```bash
sips -g pixelWidth -g pixelHeight desktop/icons/icon.png
```

Must show exactly:
```
pixelWidth: 1024
pixelHeight: 1024
```

**If dimensions are wrong**:
- Re-export from your image editor at **exactly** 1024x1024 pixels
- Don't rely on "resize" - use "export" or "save as" with explicit dimensions
- Some tools round dimensions - verify after export

**Step 2: Verify format**
```bash
file desktop/icons/icon.png
```

Should show: `PNG image data, 1024 x 1024, 8-bit/color RGBA`

**If format is wrong**:
- Ensure RGBA mode (not RGB - transparency required)
- Re-save as PNG (not JPEG, WebP, or other formats)
- Some tools may create indexed PNG - convert to RGBA

**Step 3: Verify file integrity**
```bash
# macOS - verify PNG is valid
sips -g all desktop/icons/icon.png

# Any platform with ImageMagick
identify -verbose desktop/icons/icon.png
```

**If file is corrupted**:
- Re-export from original source
- Try different image editor
- Check disk space (corrupted writes if disk full)

**Step 4: Common format mistakes**

| ❌ **Wrong** | ✅ **Correct** |
|-------------|---------------|
| 1024x1025 (off by 1 pixel) | 1024x1024 (exact) |
| 1000x1000 (rounded) | 1024x1024 (exact) |
| RGB mode (no alpha) | RGBA mode (with alpha) |
| JPEG format | PNG format |
| Indexed color | RGBA color |
| 512x512 (too small) | 1024x1024 |

### Issue 3: Icon Looks Blurry or Pixelated at Small Sizes

**Symptoms**:
- Icon looks fine at large sizes (512x512, 1024x1024)
- Icon looks blurry, pixelated, or unrecognizable at small sizes (16x16, 32x32)
- Icon details disappear when scaled down
- Icon looks muddy in Dock/taskbar

**Cause**: Icon design is too complex for small size display

**Solution**:

**Step 1: Test icon at actual small size**

```bash
# macOS - create 16x16 version to test
sips -z 16 16 desktop/icons/icon.png --out /tmp/icon-16x16.png
open /tmp/icon-16x16.png
```

Can you still recognize what the icon represents at 16x16?

**Step 2: Simplify icon design**

**Design principles for multi-size icons**:

✅ **DO:**
- Use **2-4 bold shapes maximum**
- Use **high-contrast colors** (dark vs light, not similar shades)
- Keep **critical elements in center 80%** of canvas
- Use **solid fills** (not gradients with many color stops)
- Test at 16x16 **during design** (not after export)

❌ **DON'T:**
- Use thin lines (< 3% of canvas width)
- Include text (becomes unreadable)
- Use similar colors (low contrast)
- Include fine details (they vanish)
- Use complex gradients (become muddy)

**Step 3: Examples**

**Bad icon design** (too complex):
- Logo with text and tagline
- Detailed illustration with many small elements
- Thin outline style with intricate paths
- Realistic photo or portrait
- Many colors with subtle differences

**Good icon design** (appropriate simplicity):
- Single bold letter or number
- Simple geometric shape (circle, square, triangle)
- Simplified logo mark (no text)
- High-contrast icon (dark shape on light background)
- 2-3 bold colors maximum

**Step 4: If you must use complex design**

If your brand guidelines require a complex logo:

**Option 1: Create simplified variant**
- Design a "mark" version (without text)
- Use only the most recognizable element of logo
- Remove fine details

**Option 2: Icon-optimized version**
- Increase stroke width for visibility
- Remove or simplify small elements
- Boost color contrast
- Add padding to prevent edge cropping

**Step 5: Verify after changes**

```bash
# Build and check all size variants (macOS)
npm run electron:build:mac

# Extract .icns to see all sizes
iconutil -c iconset "dist-desktop/mac/FMA Skeckit App.app/Contents/Resources/icon.icns" -o /tmp/icon.iconset

# Check smallest sizes
open /tmp/icon.iconset/icon_16x16.png
open /tmp/icon.iconset/icon_32x32.png
```

Are the small sizes recognizable? If not, further simplification needed.

### Issue 4: Git Merge Conflict on Icon File

**Symptoms**:
- Merging main → client branch causes conflict on `desktop/icons/icon.png`
- Git reports: `CONFLICT (content): Merge conflict in desktop/icons/icon.png`
- Client icon at risk of being overwritten by main branch icon

**Cause**: Both main and client branches modified `desktop/icons/icon.png`

**Solution**:

**Step 1: Understand the conflict**

```bash
# View conflict status
git status

# You should see:
# both modified: desktop/icons/icon.png
```

**Binary file conflict**: PNG files can't be merged like text - must choose one version

**Step 2: Keep client icon (most common)**

```bash
# Keep client branch version (--ours)
git checkout --ours desktop/icons/icon.png

# Stage the resolution
git add desktop/icons/icon.png
```

**Step 3: Or, use main branch icon**

```bash
# Keep main branch version (--theirs)
git checkout --theirs desktop/icons/icon.png

# Then restore client branding from branding directory
cp branding/bechem/icons/icon.png desktop/icons/icon.png

# Stage the resolution
git add desktop/icons/icon.png
```

**Step 4: Complete the merge**

```bash
# Complete merge commit
git commit -m "Merge main: preserve client icon"

# Push to client branch
git push origin client/bechem
```

**Prevention**:

On client branches, **always** keep `branding/{client}/icons/icon.png` as source of truth:

```bash
# After any merge from main, sync client icon
cp branding/bechem/icons/icon.png desktop/icons/icon.png
git add desktop/icons/icon.png
git commit -m "Restore client icon after merge"
```

This ensures client branding is never lost during merges.

### Issue 5: Built App Shows Generic Icon (Not Custom)

**Symptoms**:
- Build completes successfully
- Application launches, but shows generic/default icon
- No electron-builder errors during build

**Possible Causes & Solutions**:

**Cause 1: Icon not at expected location**

```bash
# Verify icon exists at build location
ls -lh desktop/icons/icon.png

# If missing, replace it
cp /path/to/your-icon.png desktop/icons/icon.png
```

**Cause 2: electron-builder.yml misconfigured**

Check `desktop/electron-builder.yml` contains:
```yaml
icon: icons/icon.png
```

**Cause 3: Platform-specific icon issue**

**macOS**:
```bash
# Verify .icns was generated
ls -lh "dist-desktop/mac/FMA Skeckit App.app/Contents/Resources/icon.icns"

# If missing or empty, rebuild with cache clear
rm -rf dist-desktop ~/.cache/electron-builder
npm run electron:build:mac
```

**Windows**:
```bash
# Verify .ico was generated
# Check dist-desktop/ for .ico file
find dist-desktop -name "*.ico" -type f
```

**Cause 4: macOS icon cache**

macOS caches application icons. After building:

```bash
# Kill Dock to refresh icon cache
killall Dock

# Or restart Finder
killall Finder
```

Then relaunch application.

---

_Additional sections will be added as implementation continues..._
