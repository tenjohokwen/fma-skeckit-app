# Research: Application Icon & Splash Screen Replacement

**Feature**: Application Icon & Splash Screen Replacement Guide
**Date**: 2025-10-24
**Status**: Complete

## Research Areas

### 1. Icon File Format & Structure

**Question**: What are the exact icon requirements for electron-builder across platforms?

**Findings**:
- **Source Format**: PNG with RGBA support (transparency)
- **Required Size**: 1024x1024 pixels (verified from current icon files)
- **Current Location**: `desktop/icons/icon.png`
- **Client Branding Location**: `branding/{client}/icons/icon.png`
- **electron-builder Configuration**: References `icons/icon.png` in electron-builder.yml for all platforms (Windows, macOS, Linux)

**Platform-Specific Conversions**:
- **macOS**: electron-builder automatically generates `.icns` file containing multiple icon sizes (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
- **Windows**: electron-builder automatically generates `.ico` file with embedded sizes
- **Linux**: Uses PNG directly, but may generate multiple sizes

**Decision**: Documentation will specify 1024x1024 PNG as the required format, with automatic conversion handled by electron-builder.

**Rationale**: This matches current project structure and electron-builder standard practices. 1024x1024 provides enough resolution for all target sizes without requiring manual conversion.

**Alternatives Considered**:
- Requiring pre-generated .icns/.ico files → Rejected: adds complexity, electron-builder handles this automatically
- Supporting SVG source → Rejected: electron-builder doesn't natively support SVG; would require pre-processing
- Multiple PNG sizes → Rejected: unnecessary since electron-builder generates sizes from 1024x1024 source

---

### 2. Git Workflow & Branching Strategy

**Question**: How should icon changes flow between main and client branches to avoid conflicts?

**Findings**:
- **Current Strategy**: Long-lived client branches (e.g., `client/bechem`) that periodically merge from `main`
- **Icon Files Tracked**: Both `desktop/icons/icon.png` and `branding/{client}/icons/icon.png` are git-tracked
- **Conflict Potential**: Icon files are binary (PNG), so git cannot automatically merge conflicts

**Best Practice Workflow**:
1. Update icon in `main` branch first (in `desktop/icons/`)
2. Commit and push to main
3. Checkout client branch
4. Merge main into client branch
5. If conflict on `desktop/icons/icon.png`, use client-specific version from `branding/{client}/icons/icon.png`
6. Update both `desktop/icons/icon.png` and `branding/{client}/icons/icon.png` to match

**Decision**: Documentation will prescribe "main-first" approach: update main branch's desktop/icons/, then merge to client branches with explicit handling of binary file conflicts.

**Rationale**: This ensures the default icon in main stays generic while client branches override with client-specific branding. Main-first prevents client-specific icons from accidentally being committed to main.

**Alternatives Considered**:
- Client-branch-first approach → Rejected: risks client branding leaking into main branch
- Using .gitattributes to mark icons as "ours" or "theirs" → Rejected: too complex for simple documentation
- Storing icons outside git (external asset server) → Rejected: adds infrastructure complexity

---

### 3. Documentation Structure & Location

**Question**: Where should this documentation live for maximum discoverability and maintainability?

**Findings**:
- **Current Documentation**: README.md in root, some module-specific READMEs (e.g., `desktop/icons/README.md` exists)
- **docs/ Directory**: Does not currently exist in project
- **Common Patterns**: Large projects typically have `docs/` for detailed guides, with README.md linking to them

**Options Evaluated**:
1. **docs/ICON-REPLACEMENT.md**: Dedicated file in docs/ directory
   - ✅ Keeps root clean
   - ✅ Follows common open-source patterns
   - ✅ Allows for related documentation (e.g., docs/BRANDING.md, docs/DEPLOYMENT.md)
   - ❌ Requires creating new docs/ directory

2. **desktop/README-ICONS.md**: Alongside desktop code
   - ✅ Co-located with related code
   - ❌ Harder to discover (users may not think to look in desktop/)
   - ❌ Doesn't follow common documentation patterns

3. **README.md section**: Add "Replacing Icons" section to main README
   - ✅ Maximum discoverability
   - ❌ Makes README very long (already has considerable content)
   - ❌ Mixes usage docs with development/maintenance docs

**Decision**: Create `docs/ICON-REPLACEMENT.md` and add a link from main README.md under a "Developer Documentation" section.

**Rationale**: Balances discoverability (via README link) with organization (detailed guide in dedicated file). Establishes docs/ pattern for future documentation needs.

**Alternatives Considered**: See options above.

---

### 4. Build Process & Commands

**Question**: What are the exact commands for building and verifying icon changes?

**Findings from package.json**:
```json
"electron:build": "npm run build && cd desktop && electron-builder"
"electron:build:win": "npm run build && cd desktop && electron-builder --win"
"electron:build:mac": "npm run build && cd desktop && electron-builder --mac"
"electron:build:linux": "npm run build && cd desktop && electron-builder --linux"
"electron:build:all": "npm run build && cd desktop && electron-builder --win --mac --linux"
```

**Build Process Flow**:
1. `npm run build` - Builds Quasar web application to `dist/spa/`
2. `cd desktop && electron-builder` - Packages Electron app with electron-builder
3. Output goes to `dist-desktop/` directory

**Cache Clearing**:
- **Build Cache**: `rm -rf dist-desktop` (clears electron-builder output)
- **electron-builder Cache**: `rm -rf ~/Library/Caches/electron-builder` (macOS) or `rm -rf %APPDATA%\electron-builder\cache` (Windows)

**Verification Steps**:
1. **Visual Check**: Open packaged .app (macOS) or .exe (Windows)
2. **Dock/Taskbar**: Icon appears in system Dock or taskbar when app launches
3. **Splash Screen**: Icon shows as splash screen during app load (macOS shows app icon while loading)
4. **Generated Files**: Check `dist-desktop/` for platform-specific icon files (.icns, .ico)

**Decision**: Document all platform-specific build commands with clear cache-clearing instructions.

**Rationale**: Developers need platform-specific commands (not all have access to all platforms). Cache clearing is critical when icon changes don't seem to apply.

---

### 5. Icon Design Best Practices

**Question**: What icon design guidelines should be provided to ensure good results across all sizes?

**Research Findings**:

**Size Recommendations**:
- **Minimum**: 1024x1024 pixels (matches macOS .icns largest size)
- **Recommended**: 1024x1024 PNG with transparent background
- **Aspect Ratio**: Must be square (1:1)

**Design Guidelines**:
1. **Simplicity**: Icon should be recognizable at 16x16 pixels
   - Avoid fine details that disappear when scaled down
   - Use bold, simple shapes
   - Limit number of colors/elements

2. **Transparency**:
   - Use RGBA PNG format to support transparency
   - Windows .ico preserves PNG alpha channel
   - macOS .icns fully supports transparency

3. **Padding**:
   - Leave ~10% padding/margin around icon content
   - Prevents icon from touching edges when rendered
   - Accounts for platform-specific styling (rounded corners on macOS, etc.)

4. **Testing at Multiple Sizes**:
   - View icon at 16x16, 32x32, 64x64 to check readability
   - Use image editor or online tools to preview scaled versions
   - macOS Preview app can show .icns at all sizes

**Common Pitfalls**:
- Text in icons (unreadable at small sizes)
- Too many fine details
- Low contrast colors
- Non-square source images (causes distortion)

**Decision**: Include a "Design Best Practices" section with specific guidelines on simplicity, transparency, and testing.

**Rationale**: Poor icon design is a common issue. Proactive guidance prevents time-consuming iterations.

**Alternatives Considered**:
- Not providing design guidance → Rejected: leads to poor results
- Requiring professional designer → Rejected: not always available/practical
- Providing icon templates → Considered for future enhancement

---

## Summary of Decisions

| Research Area | Decision | Rationale |
|---------------|----------|-----------|
| Icon Format | 1024x1024 PNG (RGBA) | Standard for electron-builder, provides all needed sizes |
| File Locations | `desktop/icons/icon.png` and `branding/{client}/icons/icon.png` | Matches current structure, separates default from client-specific |
| Git Workflow | Main-first: update main, then merge to client branches | Prevents client branding in main, clear conflict resolution |
| Documentation Location | `docs/ICON-REPLACEMENT.md` with README link | Balances discoverability with organization |
| Build Commands | Document all platform-specific commands | Not all developers have access to all platforms |
| Cache Clearing | `rm -rf dist-desktop` before rebuilds | Critical for seeing icon changes |
| Verification | Visual check + Dock/taskbar + splash screen | No special tools required |
| Design Guidelines | Include simplicity, transparency, padding guidance | Prevents common pitfalls |

---

## Unresolved Questions

None. All research areas have clear decisions documented above.

---

## Next Phase

Proceed to Phase 1: Design & Contracts
- Create `data-model.md` defining documentation sections
- Create `quickstart.md` as one-page reference guide
- Define validation checklist for documentation completeness
