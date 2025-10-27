# Documentation Structure: Icon Replacement Guide

**Feature**: Application Icon & Splash Screen Replacement Guide
**Date**: 2025-10-24
**Purpose**: Define the structure and sections for the icon replacement documentation

## Documentation Sections

This document defines the required sections for `docs/ICON-REPLACEMENT.md` to satisfy all functional requirements from the specification.

### Section 1: Overview

**Purpose**: Orient readers and set expectations

**Required Content**:
- What this guide covers (icon and splash screen replacement)
- Who this is for (developers building desktop packages)
- What problem this solves (replacing blue placeholder with client branding)
- Estimated time to complete (should be under 10 minutes per FR/Success Criteria)

**Maps to Requirements**: FR-001 through FR-010 (provides context for all requirements)

---

### Section 2: Prerequisites

**Purpose**: Ensure readers have necessary tools and permissions before starting

**Required Content**:
- Access requirements (git permissions, file system access)
- Required tools:
  - Node.js and npm (for build commands)
  - electron-builder (installed via npm, no separate install needed)
  - Git (for branching/merging workflow)
  - Image editor (for creating/verifying 1024x1024 PNG)
- Knowledge prerequisites:
  - Basic git operations (commit, merge, branch)
  - Command line familiarity
  - Basic file system navigation

**Maps to Requirements**: Supports all requirements by ensuring readers can execute documented steps

---

### Section 3: Icon Requirements

**Purpose**: Specify exact format and design guidelines

**Required Content**:
- **Format**: PNG with RGBA support (FR-001)
- **Dimensions**: 1024x1024 pixels minimum (FR-002)
- **Design Best Practices** (FR-007):
  - Keep design simple (recognizable at 16x16)
  - Use bold shapes and limited colors
  - Include ~10% padding/margin
  - Test at multiple sizes before finalizing
  - Avoid fine details and text
- **Transparency Handling**: RGBA preserves transparency across platforms
- **Platform-Specific Notes**: Automatic conversion to .icns (macOS), .ico (Windows) (FR-004)

**Maps to Requirements**: FR-001, FR-002, FR-004, FR-007

---

### Section 4: File Locations

**Purpose**: Specify exactly which files need to be updated

**Required Content**:
- **Primary Location**: `desktop/icons/icon.png` (used for all builds) (FR-003)
- **Client Branding Location**: `branding/{client}/icons/icon.png` (client-specific assets) (FR-003)
- **Why Two Locations**:
  - desktop/icons/ = active icon used in builds
  - branding/{client}/ = client-specific source of truth for merging
- **Directory Tree Visualization**:
  ```
  project-root/
  ├── desktop/
  │   └── icons/
  │       └── icon.png          ← UPDATE THIS
  └── branding/
      └── bechem/               ← Example client
          └── icons/
              └── icon.png      ← AND THIS
  ```

**Maps to Requirements**: FR-003

---

### Section 5: Step-by-Step Instructions

**Purpose**: Provide clear, actionable steps for icon replacement

**Required Content**:

#### 5.1: Replacing Icon on Main Branch (FR-005)

**When to use**: Updating the default icon in the main branch

**Steps**:
1. Checkout main branch: `git checkout main`
2. Replace the icon file:
   - Option A: `cp /path/to/your-icon.png desktop/icons/icon.png`
   - Option B: Use Finder/Explorer to drag-and-drop replacement
3. Verify format: `sips -g pixelWidth -g pixelHeight desktop/icons/icon.png` (should show 1024x1024)
4. Commit changes: `git add desktop/icons/icon.png && git commit -m "Update application icon"`
5. Push to remote: `git push origin main`

#### 5.2: Replacing Icon on Client Branch (FR-005)

**When to use**: Updating client-specific branding

**Steps**:
1. Checkout client branch: `git checkout client/bechem`
2. Replace both icon locations:
   ```bash
   cp /path/to/client-icon.png desktop/icons/icon.png
   cp /path/to/client-icon.png branding/bechem/icons/icon.png
   ```
3. Commit changes: `git add desktop/icons/ branding/bechem/icons/ && git commit -m "Update bechem client icon"`
4. Push to remote: `git push origin client/bechem`

#### 5.3: Merging Icon Changes from Main to Client Branch (FR-010)

**When to use**: After updating main branch icon, sync to client branches

**Steps**:
1. Checkout client branch: `git checkout client/bechem`
2. Merge from main: `git merge main`
3. **If conflict on desktop/icons/icon.png**:
   - Accept client version: `git checkout --ours desktop/icons/icon.png`
   - Or accept main version: `git checkout --theirs desktop/icons/icon.png`
   - Then ensure both locations match:
     ```bash
     cp desktop/icons/icon.png branding/bechem/icons/icon.png
     ```
4. Complete merge: `git add . && git commit -m "Merge main: sync icon changes"`
5. Push: `git push origin client/bechem`

**Maps to Requirements**: FR-005, FR-010

---

### Section 6: Building & Verifying

**Purpose**: Explain how to build the desktop app and verify the icon was applied

**Required Content**:

#### 6.1: Build Commands (FR-009)

**Clear build cache first** (critical for seeing changes):
```bash
rm -rf dist-desktop
```

**Platform-specific build commands**:
- **macOS**: `npm run electron:build:mac`
- **Windows**: `npm run electron:build:win`
- **Linux**: `npm run electron:build:linux`
- **All platforms**: `npm run electron:build:all` (if you have cross-compilation setup)

**Advanced**: Clear electron-builder cache if issues persist:
```bash
# macOS/Linux
rm -rf ~/Library/Caches/electron-builder

# Windows
rm -rf %APPDATA%\electron-builder\cache
```

#### 6.2: Verification Steps (FR-006)

**Visual Inspection**:
1. **Launch the app**:
   - macOS: `open "dist-desktop/mac/FMA Skeckit App.app"`
   - Windows: Run the .exe from dist-desktop/
2. **Check Dock/Taskbar**: Icon should appear in system Dock (macOS) or taskbar (Windows)
3. **Check Splash Screen**: Icon shows during app launch (FR-008)
4. **Check App Windows**: Icon appears in window title bar and app switcher

**File Verification**:
- **macOS**: Check `dist-desktop/mac/FMA Skeckit App.app/Contents/Resources/` for .icns file
- **Windows**: Check `dist-desktop/` for .ico file in the packaged app
- **Size Verification**: Generated icon files should contain multiple embedded sizes (16x16 through 1024x1024)

**Maps to Requirements**: FR-004, FR-006, FR-008, FR-009

---

### Section 7: Troubleshooting

**Purpose**: Address common errors and issues

**Required Content**:

#### Issue 1: Icon doesn't change after rebuild
**Symptoms**: Built app still shows old icon
**Cause**: Build cache not cleared
**Solution**:
```bash
rm -rf dist-desktop
rm -rf ~/Library/Caches/electron-builder  # macOS
npm run electron:build:mac
```

#### Issue 2: electron-builder error about icon format
**Symptoms**: Build fails with "Invalid icon format"
**Cause**: Icon is not 1024x1024 PNG or has invalid metadata
**Solution**:
- Verify size: `sips -g pixelWidth -g pixelHeight desktop/icons/icon.png`
- Should output exactly 1024x1024
- Re-export from image editor if size is wrong

#### Issue 3: Icon looks blurry at small sizes
**Symptoms**: Icon is unclear in system menus
**Cause**: Too much detail in icon design
**Solution**:
- Simplify icon design
- Test by viewing at 16x16 in image editor
- Use bold shapes instead of fine details

#### Issue 4: Git conflict on icon.png during merge
**Symptoms**: Binary file conflict when merging main to client branch
**Cause**: Both branches modified icon.png
**Solution**:
```bash
# Keep client version
git checkout --ours desktop/icons/icon.png
# Or keep main version
git checkout --theirs desktop/icons/icon.png
# Then sync to branding directory
cp desktop/icons/icon.png branding/bechem/icons/icon.png
```

#### Issue 5: macOS DMG creation fails (hdiutil error)
**Symptoms**: Build succeeds but DMG creation fails
**Cause**: hdiutil compatibility issues (known issue)
**Solution**: Project uses ZIP format instead of DMG - check `dist-desktop/*.zip`

**Maps to Requirements**: Supports FR-006 (verification) by helping resolve common issues

---

### Section 8: Examples

**Purpose**: Provide concrete, copy-paste-able examples

**Required Content**:

#### Example 1: Quick Replacement (Main Branch)
```bash
# 1. Prepare your icon (1024x1024 PNG)
# 2. Replace and build
cp ~/Downloads/my-icon.png desktop/icons/icon.png
rm -rf dist-desktop
npm run electron:build:mac
open "dist-desktop/mac/FMA Skeckit App.app"
```

#### Example 2: Client Branch Update
```bash
# Update bechem client icon
git checkout client/bechem
cp ~/Downloads/bechem-logo.png desktop/icons/icon.png
cp ~/Downloads/bechem-logo.png branding/bechem/icons/icon.png
git add desktop/icons/ branding/bechem/
git commit -m "Update bechem client branding icon"
git push origin client/bechem
```

#### Example 3: Complete Workflow (Main → Client)
```bash
# 1. Update main branch
git checkout main
cp ~/Downloads/new-default-icon.png desktop/icons/icon.png
git add desktop/icons/icon.png
git commit -m "Update default application icon"
git push origin main

# 2. Merge to client branch
git checkout client/bechem
git merge main
# If conflict: git checkout --ours desktop/icons/icon.png
git add .
git commit -m "Merge main: preserve bechem client icon"
git push origin client/bechem
```

**Maps to Requirements**: Supports all requirements through practical examples

---

## Documentation Validation Checklist

After writing `docs/ICON-REPLACEMENT.md`, verify it contains:

- [x] **Section 1**: Overview (what, who, why, time estimate)
- [x] **Section 2**: Prerequisites (tools, access, knowledge)
- [x] **Section 3**: Icon Requirements (format, dimensions, best practices)
- [x] **Section 4**: File Locations (exact paths for both locations)
- [x] **Section 5**: Step-by-Step Instructions (main branch, client branch, merging)
- [x] **Section 6**: Building & Verifying (commands, cache clearing, verification)
- [x] **Section 7**: Troubleshooting (common issues and solutions)
- [x] **Section 8**: Examples (copy-paste workflows)

**Functional Requirements Coverage**:
- [x] FR-001: Icon format specified (PNG with RGBA)
- [x] FR-002: Dimensions specified (1024x1024 pixels)
- [x] FR-003: File locations listed (desktop/icons/, branding/{client}/)
- [x] FR-004: Automatic conversion explained (.icns, .ico)
- [x] FR-005: Step-by-step instructions provided (main and client branches)
- [x] FR-006: Verification steps explained (visual and file checks)
- [x] FR-007: Design best practices included (simplicity, transparency)
- [x] FR-008: Icon/splash screen relationship explained (same file)
- [x] FR-009: Cache clearing commands provided (rm -rf dist-desktop)
- [x] FR-010: Git workflow documented (main → client merge)

---

## Additional Deliverables

### README.md Update

Add to main README.md under a "Developer Documentation" section:

```markdown
## Developer Documentation

### Desktop Application

- [Replacing Application Icons](docs/ICON-REPLACEMENT.md) - Guide for updating app icons and splash screens
```

This provides discoverability while keeping the detailed guide in a dedicated file.
