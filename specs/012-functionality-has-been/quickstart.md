# Quickstart: Update User Guide Documentation

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-21
**Branch**: `012-functionality-has-been`

## Overview

This quickstart guide provides a high-level implementation roadmap for updating the user guide documentation to reflect recent application changes, including the removal of FileManagementPage and ClientManagementPage (feature 011) and the addition of Dashboard analytics charts (feature 008).

## Prerequisites

- Branch `012-functionality-has-been` checked out
- Access to `/docs/user-guide.md` file
- Running application available for manual verification (`npm run dev`)
- Understanding of the application's current UI structure (Dashboard, Search, Profile)

## Implementation Steps

### Step 1: Update Version and Date

**File**: `/docs/user-guide.md`

**Actions**:
1. Locate the version number at the top of the document (currently "Version 1.0")
2. Increment to "Version 1.1"
3. Locate the "Last Updated" date (currently "October 14, 2025")
4. Update to "October 21, 2025"

**Expected Outcome**: Document header shows Version 1.1 and updated date.

---

### Step 2: Remove File Operations Section

**File**: `/docs/user-guide.md`

**Actions**:
1. Locate the "File Operations" section (approximately lines 420-473)
2. Remove the entire section including:
   - Section heading "## File Operations"
   - All subsections (file browsing, upload/download workflows)
   - All content describing global file management
3. Verify the section before and after removal flow naturally together
4. Search document for any cross-references to "File Operations" section
5. Remove or update any references found

**Expected Outcome**: "File Operations" section completely removed, no orphaned references remain.

---

### Step 3: Remove or Update Client Management Sections

**File**: `/docs/user-guide.md`

**Actions**:
1. Locate the "Creating Client Folders" subsection (approximately lines 323-361)
2. Evaluate if section should be:
   - **Option A**: Completely removed (if functionality truly gone)
   - **Option B**: Updated to reference Search page workflow (if functionality moved)
3. If updating, replace with brief note: "Client folders can be managed through the Search page"
4. Search document for references to "ClientManagementPage" or standalone client management
5. Remove or update references to reflect Search page integration

**Expected Outcome**: Either section removed or updated to reflect current Search page workflow.

---

### Step 4: Update Navigation Menu Documentation

**File**: `/docs/user-guide.md`

**Actions**:
1. Locate the "Navigation Menu" section (approximately lines 215-222)
2. Update menu item list to show only 3 items:
   - Dashboard
   - Search
   - Profile
3. Remove all references to "Files" menu item (search for "Files" in quotes)
4. Remove references to standalone "Clients" menu item
5. Add note: "Additional administrative functions may appear for admin users"
6. Verify the described navigation matches the actual MainLayout.vue navigation drawer

**Expected Outcome**: Navigation menu documentation accurately lists 3 primary menu items.

---

### Step 5: Add Dashboard Analytics Documentation

**File**: `/docs/user-guide.md`

**Actions**:
1. Locate the "Dashboard Overview" section (approximately lines 440-505)
2. Add new subsection "### Dashboard Analytics" after existing Dashboard content
3. Document all 6 analytics charts from feature 008-dashboard-analytics:

   **Chart 1: Cases by Status**
   - Type: Donut chart
   - Content: Distribution of cases across status categories
   - How to use: Hover over segments for detailed counts and percentages

   **Chart 2: Monthly Case Trends**
   - Type: Area chart
   - Content: Case volume over time with trend line
   - How to use: Identify busy periods and seasonal patterns

   **Chart 3: Cases by Country**
   - Type: Bar chart
   - Content: Geographic distribution of cases
   - How to use: See which countries have highest case volume

   **Chart 4: Average Case Duration**
   - Type: Bar chart
   - Content: Time to close cases by status or type
   - How to use: Identify bottlenecks and efficiency metrics

   **Chart 5: Client Activity**
   - Type: Bar chart
   - Content: Number of cases per client
   - How to use: Identify most active clients

   **Chart 6: Case Age Distribution**
   - Type: Column chart
   - Content: How long cases have been open
   - How to use: Identify aging cases needing attention

4. Keep each chart description concise (2-3 sentences)
5. Use consistent formatting for all chart entries

**Expected Outcome**: Comprehensive documentation of 6 Dashboard analytics charts (~50 lines added).

---

### Step 6: Update Table of Contents

**File**: `/docs/user-guide.md`

**Actions**:
1. Locate the Table of Contents section (near top of document)
2. Remove ToC entry for "File Operations" section
3. Remove ToC entry for "Creating Client Folders" subsection (if section was removed)
4. Add new ToC entry for "Dashboard Analytics" subsection under Dashboard section
5. Verify all ToC anchor links (`#section-name`) match actual heading IDs
6. Verify ToC structure reflects the updated document organization

**Expected Outcome**: ToC accurately reflects all sections and subsections in updated document.

---

### Step 7: Search for Orphaned References

**Search Patterns**:
- "Files menu"
- "Files page"
- "FileManagementPage"
- "global file browsing"
- "Client Management page"
- "ClientManagementPage"
- "standalone client management"
- "As mentioned in File Operations"
- "See File Operations section"

**Actions**:
1. Search document for each pattern above
2. Evaluate each match:
   - Remove if reference is to removed functionality
   - Update if reference can be redirected to current workflow
3. Ensure all references match current application state
4. Replace any vague references with specific current workflows

**Expected Outcome**: Zero references to removed features, all cross-references valid.

---

### Step 8: Verify Document Readability

**File**: `/docs/user-guide.md`

**Actions**:
1. Check final line count: should be ~570-620 lines (down from 718)
2. Read through entire document for flow and coherence
3. Verify all section transitions are smooth after removals
4. Check for consistent terminology throughout
5. Verify markdown formatting is correct (headings, lists, links, code blocks)
6. Ensure no placeholder text like "TODO" or "NEEDS UPDATE" remains

**Expected Outcome**: Document is cohesive, readable, and under 750 lines.

---

### Step 9: Manual Verification Against Running Application

**Test Scenarios**:

1. **Navigation Menu**:
   - Start dev server: `npm run dev`
   - Open application in browser
   - Verify navigation shows only Dashboard, Search, Profile
   - Verify documented navigation matches actual navigation

2. **Dashboard Analytics**:
   - Navigate to Dashboard
   - Count analytics charts displayed (should be 6)
   - Verify each documented chart exists and matches description
   - Test chart interactivity (hover tooltips, legends)

3. **File Management**:
   - Verify there is NO global "Files" menu item
   - Navigate to a case via Search
   - Verify case-specific file management works (CaseFilesPage)
   - Confirm documentation does not mention removed global file feature

4. **Client Management**:
   - Verify there is NO standalone "Clients" menu item
   - Navigate to Search page
   - Verify client search and management is available
   - Confirm documentation accurately describes current workflow

**Expected Outcome**: All documented features exist and work as described, no documented features are missing.

---

## Verification Checklist

- [ ] Version number updated from 1.0 to 1.1
- [ ] "Last Updated" date changed to October 21, 2025
- [ ] "File Operations" section completely removed
- [ ] "Creating Client Folders" section removed or updated to reference Search page
- [ ] Navigation menu documentation lists only 3 items (Dashboard, Search, Profile)
- [ ] Dashboard Analytics subsection added with documentation for 6 charts
- [ ] Table of Contents updated to reflect all changes
- [ ] Zero references to "Files menu" or "FileManagementPage" remain
- [ ] Zero references to standalone "Client Management page" remain
- [ ] Document line count is ~570-620 lines (under 750 line target)
- [ ] All markdown formatting is correct
- [ ] Document reads cohesively from start to finish
- [ ] Manual verification against running application passes
- [ ] All documented workflows match actual application behavior
- [ ] No broken internal links or cross-references

---

## Rollback Plan

If issues arise during implementation:

1. **Git Revert**: Use `git revert` or `git reset` to restore docs/user-guide.md to previous state
2. **Restore from Commit**: Check out previous version from git history: `git checkout HEAD~1 docs/user-guide.md`
3. **Manual Restore**: Re-add removed sections from git history if needed

---

## Success Criteria

This feature is complete when:

1. Version number is 1.1 and date is October 21, 2025
2. Zero references to removed "Files" menu or global file management
3. Zero references to standalone "Client Management" page
4. Navigation menu accurately documented as 3 items (Dashboard, Search, Profile)
5. All 6 Dashboard analytics charts documented with clear descriptions
6. Table of Contents reflects all structural changes
7. Document is under 750 lines (target: ~570-620 lines)
8. Manual verification confirms all documented features exist and work correctly
9. Manual verification confirms no documented features reference removed functionality
10. Document is cohesive, readable, and free of orphaned references

---

## Next Steps

After completing implementation:

1. Run `/speckit.tasks` to generate detailed task breakdown (optional - this is straightforward)
2. Manually perform all implementation steps above
3. Run verification checklist
4. Create git commit with message: "docs: update user guide to reflect UI simplification (feature 011) and dashboard analytics (feature 008)"
5. Manual review of updated documentation
6. Merge to main branch

---

## Notes

- This is a **documentation-only change** - no code modifications required
- No tests to run (documentation is manually verified against running application)
- No build process required (markdown is plain text)
- Keep tone consistent with existing documentation (professional, clear, concise)
- Use present tense ("The Dashboard displays..." not "The Dashboard will display...")
- Assume reader is a new user learning the application

## Estimated Effort

- **Content Removal**: 30 minutes (remove 2 sections, update navigation docs)
- **Content Addition**: 1 hour (document 6 analytics charts clearly)
- **Table of Contents Update**: 15 minutes
- **Search for Orphaned References**: 30 minutes
- **Manual Verification**: 45 minutes (test against running app)
- **Total**: 3 hours

## Risk Level

**Very Low** - This is a straightforward documentation update with no code changes, minimal risk, and easy rollback via git. The only "risk" is missing orphaned references, which is mitigated by systematic searching.
