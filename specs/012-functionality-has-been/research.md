# Research: Update User Guide Documentation

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-21
**Status**: Complete

## Overview

This research phase investigates how to effectively update the user guide documentation (`/docs/user-guide.md`) to reflect recent application changes, specifically the removal of FileManagementPage and ClientManagementPage (feature 011-as-a-user) and the addition of Dashboard analytics charts (feature 008-dashboard-analytics).

## Research Questions

### 1. Documentation Structure and Organization

**Question**: What is the current structure of the user guide and which sections need updating?

**Findings**:
- Current file: `/docs/user-guide.md` (718 lines)
- Version: 1.0, Last Updated: October 14, 2025
- Table of Contents includes 11 main sections
- Lines 420-473: "File Operations" section documents global file browsing via removed FileManagementPage
- Lines 323-361: "Creating Client Folders" section documents standalone client management via removed ClientManagementPage
- Lines 215-222: "Navigation Menu" section lists 5+ menu items including removed "Files" and "Clients"
- Lines 440-505: Dashboard section lacks documentation for new analytics charts

**Decision**:
1. Remove entire "File Operations" section (lines 420-473) - ~53 lines
2. Remove "Creating Client Folders" subsection (lines 323-361) - ~38 lines, or update to reference Search page workflow
3. Update "Navigation Menu" section to list only 3 items: Dashboard, Search, Profile
4. Add new "Dashboard Analytics" subsection under "Dashboard Overview" section to document 6 charts
5. Update Table of Contents to reflect all changes
6. Increment version from 1.0 to 1.1
7. Update "Last Updated" date to October 21, 2025

**Rationale**: Complete removal of obsolete documentation prevents user confusion, while adding analytics documentation provides value for interpreting business insights

---

### 2. Content Removal Strategy

**Question**: When removing sections for deleted features, should we explain what was removed or simply delete without comment?

**Findings**:
- Option 1: Silent removal - simply delete obsolete sections
- Option 2: Add migration notes explaining what changed
- Option 3: Keep stub sections with "Feature Removed" notices

**Decision**: Silent removal (Option 1) - simply delete obsolete sections and update Table of Contents

**Rationale**:
- Users reading current documentation expect it to match current application state
- Migration notes clutter the documentation and become outdated themselves
- Users discovering missing features will naturally explore the current UI
- Version increment (1.0 → 1.1) signals changes occurred
- Git history preserves what was removed for maintainer reference

**Alternatives Considered**:
- Migration notes: Rejected - documentation is not a changelog; adds permanent clutter
- Stub sections: Rejected - draws attention to missing features unnecessarily

---

### 3. Navigation Menu Documentation

**Question**: How should the simplified navigation menu be documented?

**Findings**:
- Current menu structure (post-feature-011): Dashboard, Search, Profile (3 items)
- Old documentation listed 5+ items including removed "Files" and "Clients"
- Admin users may have additional menu items in future features
- Navigation menu is defined in MainLayout.vue

**Decision**:
1. List the 3 primary navigation items explicitly: Dashboard, Search, Profile
2. Add note: "Additional administrative functions may appear for admin users"
3. Remove all references to "Files" menu item (9 occurrences identified)
4. Update or remove references to "Clients" menu based on current Search page functionality

**Rationale**: Explicit listing provides clarity while future-proofing note accommodates potential admin expansions

---

### 4. Dashboard Analytics Documentation

**Question**: How should the 6 new Dashboard analytics charts be documented?

**Findings**:
- Feature 008-dashboard-analytics added 6 charts using ApexCharts:
  1. Cases by Status (donut chart)
  2. Monthly Case Trends (area chart)
  3. Cases by Country (bar chart)
  4. Average Case Duration (bar chart)
  5. Client Activity (bar chart)
  6. Case Age Distribution (column chart)
- Current Dashboard section (lines 440-505) documents search, filters, case cards, pagination
- No mention of analytics/charts in current documentation
- Charts provide business insights and data visualization

**Decision**:
1. Add new subsection: "### Dashboard Analytics" after existing Dashboard content
2. Document all 6 charts with:
   - Chart name and type
   - What data it displays
   - How to interpret the visualization
   - Any interactive features (tooltips, legends)
3. Keep documentation concise - 2-3 sentences per chart (total ~50 lines)
4. Use consistent formatting for each chart description

**Rationale**: Users need guidance to interpret analytics visualizations and understand business insights provided by each chart

**Example format**:
```markdown
#### Cases by Status
A donut chart showing the distribution of cases across different status categories.
Each segment represents a status (e.g., Open, In Progress, Closed) with the count
displayed. Hover over segments to see detailed percentages.
```

---

### 5. File Management Workflow Updates

**Question**: How should users be guided to manage files after global file browsing is removed?

**Findings**:
- FileManagementPage (global file browsing) was removed in feature 011
- CaseFilesPage still exists for case-specific file management
- Current documentation section "File Operations" (lines 420-473) documents removed global feature
- Users can still upload/download/delete files within specific cases via CaseFilesPage

**Decision**:
1. Remove entire "File Operations" section that documents global file browsing
2. Verify "Case Management" section adequately documents CaseFilesPage workflow
3. If needed, add brief note in "Case Management" section: "Each case has a dedicated Files tab for uploading and managing case-specific documents"

**Rationale**:
- Case-specific file management is more contextually appropriate than global browsing
- Documentation should guide users to the correct workflow (per-case files)
- Removing obsolete section prevents confusion about non-existent global file feature

---

### 6. Client Management Workflow Updates

**Question**: How should client management workflows be documented now that ClientManagementPage is removed?

**Findings**:
- ClientManagementPage (standalone client management) was removed in feature 011
- Client operations now performed through SearchPage
- Current documentation section "Creating Client Folders" (lines 323-361) documents removed standalone page
- Users can still manage clients through Search page interface

**Decision**:
1. Remove "Creating Client Folders" subsection that documents standalone ClientManagementPage
2. Verify Search page documentation adequately covers client management operations
3. If Search page section lacks client management details, add brief guidance: "Use the Search page to find, create, and manage client folders"

**Rationale**:
- Integrated client management through Search is more streamlined than standalone page
- Documentation should reflect current workflow (search-based client operations)
- Removing obsolete section prevents confusion about non-existent standalone feature

**Alternatives Considered**:
- Keep section and update to reference Search page: Rejected - cleaner to remove and ensure Search section is complete
- Rename section to "Client Management via Search": Rejected - creates unnecessary hierarchy

---

### 7. Table of Contents Maintenance

**Question**: How should the Table of Contents be updated to reflect structural changes?

**Findings**:
- Current ToC includes links to sections being removed
- ToC uses markdown anchor links (#section-name format)
- New analytics subsection needs to be added
- ToC should match actual document structure for navigation

**Decision**:
1. Remove ToC entries for deleted sections: "File Operations", "Creating Client Folders" (if removed)
2. Add new ToC entry: "Dashboard Analytics" under Dashboard section
3. Verify all ToC anchor links match actual heading IDs
4. Maintain alphabetical or logical ordering of ToC entries

**Rationale**: ToC must accurately reflect document structure for effective navigation

---

### 8. Version and Date Management

**Question**: How should version numbering and dating be handled for this documentation update?

**Findings**:
- Current version: 1.0
- Current "Last Updated": October 14, 2025
- This update removes significant sections and adds new content
- Semantic versioning for documentation: MAJOR.MINOR.PATCH

**Decision**:
1. Increment version from 1.0 to 1.1 (minor version bump)
2. Update "Last Updated" to October 21, 2025
3. Use minor version bump (not major) because:
   - Core documentation structure preserved
   - Changes are subtractive and additive, not restructuring
   - No breaking changes to how users consume documentation

**Rationale**: Minor version bump appropriately signals substantial but non-breaking updates

**Alternatives Considered**:
- Major version bump (2.0): Rejected - too aggressive for subtractive changes
- Patch version bump (1.0.1): Rejected - understates significance of section removals

---

## Implementation Risks

### Risk 1: Missing Context After Section Removal

**Likelihood**: Low
**Impact**: Medium
**Mitigation**: After removing sections, read through entire document to ensure flow is maintained and no orphaned references exist (e.g., "As mentioned in the File Operations section...").

### Risk 2: Incomplete Analytics Documentation

**Likelihood**: Medium
**Impact**: Low
**Mitigation**: Reference feature 008-dashboard-analytics implementation to ensure all 6 charts are documented with accurate descriptions of their functionality.

### Risk 3: Broken Internal Links

**Likelihood**: Low
**Impact**: Low
**Mitigation**: After structural changes, verify all Table of Contents links and cross-references within the document still work correctly.

### Risk 4: Documentation-Code Drift

**Likelihood**: Low
**Impact**: Medium
**Mitigation**: Manually verify updated documentation against running application to confirm all documented features/workflows match actual UI behavior.

---

## Best Practices for Technical Documentation Updates

### Content Removal
1. Remove entire obsolete sections cleanly
2. Update Table of Contents immediately
3. Search for cross-references to removed sections
4. Verify document flow after removal
5. Do not leave "TODO" or "REMOVED" markers

### Content Addition
1. Place new content in logical location within existing structure
2. Match writing style and formatting of surrounding content
3. Use consistent terminology with rest of document
4. Add appropriate headings and subheadings
5. Update Table of Contents

### Version Management
1. Increment version number appropriately (MAJOR.MINOR.PATCH)
2. Update "Last Updated" date
3. Consider maintaining changelog separately (not in user-facing docs)

### Quality Assurance
1. Read entire document after changes for flow and coherence
2. Verify all links and anchors work
3. Test documented workflows against actual application
4. Check for orphaned references to removed content
5. Ensure terminology consistency throughout

---

## Technology-Specific Guidance

### Markdown Documentation

**Format**: GitHub-flavored markdown (.md) with standard syntax
**Line Length**: No hard limit, but keeping under 750 lines improves readability
**Headers**: Use `#` through `####` for hierarchy (H1 through H4)
**Links**: Use `[text](#anchor)` for internal links, `[text](url)` for external
**Code Blocks**: Use triple backticks with language identifier for syntax highlighting
**Lists**: Use `-` for unordered, `1.` for ordered
**Emphasis**: Use `**bold**` for UI elements, `*italic*` for emphasis

### Line Count Management
- Current: 718 lines
- Removing: ~150-200 lines (File Operations, Client Folders sections)
- Adding: ~50 lines (Dashboard Analytics)
- Target: ~570-620 lines (well under 750 line readability target)

### Accessibility
- Use descriptive link text (not "click here")
- Provide alt text for images if any exist
- Use semantic heading hierarchy
- Ensure sufficient contrast in code examples
- Markdown is inherently accessible (plain text, screen reader friendly)

---

## Summary

This is a straightforward documentation maintenance task with minimal technical risk. The key considerations are:

1. **Content Removal**: Clean removal of obsolete File Operations and Client Folders sections
2. **Content Addition**: Comprehensive documentation of 6 Dashboard analytics charts
3. **Structural Updates**: Navigation menu documentation updated to reflect simplified 3-item menu
4. **Version Management**: Minor version bump (1.0 → 1.1) with date update
5. **Quality Assurance**: Manual verification against running application
6. **Maintainability**: Keep documentation under 750 lines for readability

No new technologies, tools, or architectural patterns are required. This is purely a content editing task performed on a single markdown file with manual verification against the actual application state.

---

## Research Complete

All questions resolved. No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1: Design.
