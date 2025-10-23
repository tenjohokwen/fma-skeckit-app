# Branding Assets

This directory contains client-specific branding assets used during desktop application builds.

## Directory Structure

```
branding/
└── <clientId>/
    ├── logo.png          # Client logo (200x60px minimum)
    ├── icons/
    │   └── icon.png      # App icon (1024x1024px)
    └── colors.json       # (optional) Additional color schemes
```

## Asset Specifications

### Logo (logo.png)
- **Minimum Size**: 200x60 pixels
- **Recommended Size**: 400x120 pixels (for HiDPI displays)
- **Format**: PNG with transparency
- **Usage**: Application header, splash screen, about dialog

### Icon (icons/icon.png)
- **Required Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Usage**: electron-builder generates all platform-specific icon formats from this master icon
  - macOS: .icns (512x512, 256x256, 128x128, 64x64, 32x32, 16x16)
  - Windows: .ico (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
  - Linux: .png (512x512, 256x256, 128x128, 64x64, 48x48, 32x32, 16x16)

## How to Replace Branding Assets

### When to Replace
- When onboarding a new client
- When a client updates their branding
- Before production release (replace placeholders)

### Steps to Replace

1. **Obtain high-quality assets from client**
   - Request logo in PNG format (transparent background preferred)
   - Request icon/logo in at least 1024x1024 resolution
   - Confirm brand colors (hex codes)

2. **Prepare assets**
   ```bash
   # Create client directory if it doesn't exist
   mkdir -p branding/<clientId>/icons

   # Copy assets (ensure correct names and sizes)
   cp /path/to/client-logo.png branding/<clientId>/logo.png
   cp /path/to/client-icon.png branding/<clientId>/icons/icon.png
   ```

3. **Validate asset dimensions**
   ```bash
   # Check logo dimensions (should be at least 200x60)
   file branding/<clientId>/logo.png

   # Check icon dimensions (must be 1024x1024)
   file branding/<clientId>/icons/icon.png
   ```

4. **Update client configuration**
   - Ensure `config/clients/<clientId>.json` references correct asset paths
   - Update `branding.primaryColor` and `branding.secondaryColor` if needed

5. **Test build**
   ```bash
   # Validate configuration
   ./scripts/validate-client-config.sh <clientId>

   # Build desktop app to verify branding
   npm run electron:build:mac  # or :win, :linux
   ```

## Placeholder Assets

Current placeholder assets are based on the default FMA Skeckit icon. **These must be replaced with actual client branding before production release.**

Placeholders are acceptable for:
- Development builds
- Internal testing
- Demo environments

Placeholders are **NOT** acceptable for:
- Production releases
- Client-facing builds
- Beta/staging deployments to external users

## Brand Guidelines

When creating or replacing assets:

1. **Maintain aspect ratios** - Don't stretch or distort logos
2. **Use transparent backgrounds** - Allows flexibility in UI placement
3. **Optimize file size** - Keep PNG files under 500KB when possible
4. **Test on all platforms** - Verify appearance on macOS, Windows, and Linux
5. **Check HiDPI displays** - Ensure assets look sharp on Retina/4K displays

## Troubleshooting

### Icon not appearing in built app
- Verify icon.png is exactly 1024x1024 pixels
- Ensure PNG format (not JPEG renamed to .png)
- Check file permissions (must be readable)
- Clear electron-builder cache: `rm -rf dist-desktop`

### Logo appears blurry
- Increase logo resolution (use 2x or 3x size)
- Ensure PNG format with transparency
- Use vector graphics (SVG) when possible (convert to PNG at high resolution)

### Colors don't match config
- Verify hex color codes in `config/clients/<clientId>.json`
- Ensure primaryColor and secondaryColor are valid hex codes (#RRGGBB)
- Rebuild desktop app after config changes

## Git Merge Strategy

Branding assets are protected by `.gitattributes` merge strategy:

```
branding/** merge=ours
```

This ensures that when merging core updates into client branches, the client's branding assets are **always preserved** (never overwritten by core changes).

## Questions?

For questions about branding assets or build issues, contact the development team or refer to:
- [Branching Strategy Guide](../docs/branching-strategy.md)
- [Build Scripts Documentation](../scripts/README.md)
