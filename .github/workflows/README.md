# GitHub Actions Workflows - Multi-Client Desktop Builds

**Feature**: Multi-Client Branching Strategy and CI/CD (Feature 014)
**Last Updated**: 2025-10-23

## Workflows

### 1. build-client-reusable.yml
Reusable workflow for building client-specific desktop packages across all platforms.

### 2. build-client-manual.yml  
Manual trigger workflow for building and releasing client desktop packages.

## How to Use

### Triggering a Build

1. Go to Actions → "Build Client Desktop Packages (Manual)"
2. Click "Run workflow"
3. Fill in parameters:
   - **Client**: bechem
   - **Version**: 1.0.0
   - **Platforms**: all
   - **Release**: false (for testing) or true (for production)
4. Click "Run workflow"

## Artifacts

Builds produce platform-specific installers:
- macOS: .dmg file
- Windows: .exe file
- Linux: .AppImage file

If release=true, a GitHub Release is created with all artifacts.

## Documentation

See full documentation in this file for:
- Detailed workflow descriptions
- Build matrix configuration
- Troubleshooting guide
- Best practices
- Security considerations

For more information, see:
- [Client Configuration](../../config/README.md)
- [Build Scripts](../../scripts/README.md)
- [Branching Strategy](../../docs/branching-strategy.md)
