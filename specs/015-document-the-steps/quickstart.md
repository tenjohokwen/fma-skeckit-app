# Icon Replacement Quick Reference

**For complete details, see**: [Icon Replacement Guide](../../docs/ICON-REPLACEMENT.md)

## At a Glance

### Icon Requirements
- **Format**: PNG with transparency (RGBA)
- **Size**: 1024x1024 pixels (exactly)
- **Design**: Simple, bold shapes (must be clear at 16x16)

### File Locations
```
desktop/icons/icon.png          ← Primary (used in builds)
branding/{client}/icons/icon.png ← Client-specific source
```

---

## Quick Workflows

### Replace Icon on Main Branch

```bash
# 1. Replace the icon
cp /path/to/your-icon.png desktop/icons/icon.png

# 2. Verify size
sips -g pixelWidth -g pixelHeight desktop/icons/icon.png
# Should show: pixelWidth: 1024, pixelHeight: 1024

# 3. Commit and push
git add desktop/icons/icon.png
git commit -m "Update application icon"
git push origin main
```

---

### Replace Icon on Client Branch

```bash
# 1. Checkout client branch
git checkout client/bechem

# 2. Replace BOTH locations
cp /path/to/client-icon.png desktop/icons/icon.png
cp /path/to/client-icon.png branding/bechem/icons/icon.png

# 3. Commit and push
git add desktop/icons/ branding/bechem/icons/
git commit -m "Update bechem client icon"
git push origin client/bechem
```

---

### Merge Main → Client Branch

```bash
# 1. Checkout client branch
git checkout client/bechem

# 2. Merge from main
git merge main

# 3. If conflict on icon.png:
git checkout --ours desktop/icons/icon.png  # Keep client version
# OR
git checkout --theirs desktop/icons/icon.png  # Use main version

# 4. Sync to branding directory
cp desktop/icons/icon.png branding/bechem/icons/icon.png

# 5. Complete merge
git add .
git commit -m "Merge main: preserve client icon"
git push origin client/bechem
```

---

## Build & Verify

### Build Commands

```bash
# 1. Clear build cache (IMPORTANT!)
rm -rf dist-desktop

# 2. Build for your platform
npm run electron:build:mac     # macOS
npm run electron:build:win     # Windows
npm run electron:build:linux   # Linux
```

### Verify Icon Applied

```bash
# Launch the app
open "dist-desktop/mac/FMA Skeckit App.app"  # macOS
# OR navigate to dist-desktop/ and run .exe (Windows)

# Check:
# ✓ Icon appears in Dock/taskbar
# ✓ Icon shows as splash screen during launch
# ✓ Icon appears in app window title bar
```

---

## Troubleshooting

### Icon doesn't change after rebuild
```bash
# Clear ALL caches
rm -rf dist-desktop
rm -rf ~/Library/Caches/electron-builder  # macOS
npm run electron:build:mac
```

### Build fails: "Invalid icon format"
```bash
# Verify icon is exactly 1024x1024
sips -g pixelWidth -g pixelHeight desktop/icons/icon.png
# Must show 1024x1024 - if not, re-export from image editor
```

### Icon looks blurry at small sizes
- Simplify icon design (remove fine details)
- Test by viewing at 16x16 in image editor
- Use bold shapes and limited colors

---

## Design Tips

✅ **DO:**
- Use simple, bold shapes
- Keep design recognizable at 16x16 pixels
- Include ~10% padding/margin
- Use RGBA PNG format (preserves transparency)
- Test at multiple sizes before finalizing

❌ **DON'T:**
- Use text in icon (unreadable when scaled)
- Include fine details
- Use low-contrast colors
- Use non-square images (causes distortion)

---

## Platform-Specific Notes

- **macOS**: Generates .icns file with all sizes (16x16 through 1024x1024)
- **Windows**: Generates .ico file with embedded sizes
- **Linux**: Uses PNG directly (may generate multiple sizes)
- **Splash Screen**: Same icon used for splash (macOS shows icon during app load)

---

## Complete Guide

For full details, troubleshooting, and examples, see:
**[Icon Replacement Guide](../../docs/ICON-REPLACEMENT.md)**
