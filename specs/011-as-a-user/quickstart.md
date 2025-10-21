# Quickstart: UI Simplification - Remove File and Client Management Pages

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-10-21
**Branch**: `011-as-a-user`

## Overview

This quickstart guide provides a high-level implementation roadmap for removing FileManagementPage and ClientManagementPage from the application to simplify the user interface.

## Prerequisites

- Branch `011-as-a-user` checked out
- Development environment running (`npm run dev`)
- Understanding of Vue 3 Composition API, Vue Router, and Quasar 2

## Implementation Steps

### Step 1: Remove Navigation Menu Items (MainLayout.vue)

**File**: `src/layouts/MainLayout.vue`

**Actions**:
1. Locate the "Files" navigation item (lines 107-117)
2. Remove the entire `<q-item>` block for "Files"
3. Locate the "Clients" navigation item in the admin section (lines 127-137)
4. Remove the entire `<q-item>` block for "Clients"
5. Verify MainLayout.vue remains under 250 lines after removal
6. Test navigation drawer renders correctly without these items

**Expected Outcome**: Navigation menu shows only Dashboard, Search, and Profile for regular users. Admin users see no "Clients" menu item.

---

### Step 2: Remove Route Definitions (routes.js)

**File**: `src/router/routes.js`

**Actions**:
1. Locate the `/files/:pathMatch(.*)*` route definition (lines 79-83)
2. Remove the entire route object
3. Locate the `/clients` route definition (lines 85-89)
4. Remove the entire route object
5. Verify the catch-all route (`/:catchAll(.*)*`) still exists at the end of routes array

**Expected Outcome**: Attempting to navigate to `/files` or `/clients` displays ErrorNotFound page.

---

### Step 3: Analyze and Remove Page Components

**Files**:
- `src/pages/FileManagementPage.vue`
- `src/pages/ClientManagementPage.vue`

**Actions**:
1. Open FileManagementPage.vue and document all imports
2. Search codebase to determine which imports are exclusive to this page
3. Repeat for ClientManagementPage.vue
4. Remove both page component files
5. Remove any exclusive dependencies (components, composables, utilities)
6. KEEP any shared dependencies used by other pages

**Expected Outcome**: Two page files removed, exclusive dependencies removed, shared code preserved.

---

### Step 4: Remove Test Files

**Files**:
- `tests/unit/FileManagementPage.spec.js` (if exists)
- `tests/unit/ClientManagementPage.spec.js` (if exists)
- Any E2E tests referencing removed pages

**Actions**:
1. Search `tests/` directory for FileManagementPage test files
2. Search `tests/` directory for ClientManagementPage test files
3. Remove identified test files
4. Search E2E tests for references to `/files` or `/clients` routes
5. Update or remove E2E tests that depend on removed pages

**Expected Outcome**: Test suite runs clean with no references to removed pages.

---

### Step 5: Clean Up i18n Translation Keys (Optional)

**Files**:
- `src/i18n/en-US/index.js`
- `src/i18n/fr-FR/index.js`

**Actions**:
1. Identify translation keys used exclusively by removed pages
2. Common keys to check: `navigation.files`, potentially others
3. Verify keys are not used by other components before removal
4. Remove unused translation keys from both language files

**Expected Outcome**: i18n files cleaned of unused keys, retained keys unchanged.

---

### Step 6: Search for Programmatic Navigation References

**Search Pattern**:
- `router.push({ name: 'files' })`
- `router.push({ name: 'clients' })`
- `to="{ name: 'files' }"`
- `to="{ name: 'clients' }"`

**Actions**:
1. Use global search to find any programmatic navigation to removed routes
2. Remove or update these navigation calls
3. Verify no hard-coded navigation remains in codebase

**Expected Outcome**: No code attempts to navigate to removed routes.

---

### Step 7: Run Tests and Verify

**Commands**:
```bash
# Run linter
npm run lint

# Run unit tests
npm test

# Run E2E tests (if applicable)
npm run test:e2e

# Build for production
npm run build
```

**Actions**:
1. Fix any linting errors
2. Fix any failing tests
3. Verify production build succeeds
4. Check bundle size reduction (optional - Vite analyzer)

**Expected Outcome**: All tests pass, production build succeeds, no errors.

---

### Step 8: Manual Testing

**Test Scenarios**:

1. **Navigation Menu**:
   - Log in as regular user → verify no "Files" menu item
   - Log in as admin user → verify no "Clients" menu item
   - Verify Dashboard, Search, and Profile menu items work

2. **Direct URL Navigation**:
   - Navigate to `/files` → should show ErrorNotFound page
   - Navigate to `/clients` → should show ErrorNotFound page

3. **Retained Functionality**:
   - Dashboard page loads and displays correctly
   - Search page loads and allows searching
   - Profile page loads and shows user info
   - CaseDetailsPage works (case viewing)
   - CaseEditPage works (case editing)
   - CaseFilesPage works (case-specific file management)

4. **Mobile Responsive**:
   - Open mobile view (< 768px width)
   - Verify navigation drawer opens correctly
   - Verify removed items not present in mobile menu

**Expected Outcome**: All retained functionality works without errors, removed pages inaccessible.

---

## Verification Checklist

- [ ] MainLayout.vue navigation drawer renders without "Files" and "Clients" items
- [ ] Routes `/files` and `/clients` return 404 ErrorNotFound page
- [ ] FileManagementPage.vue and ClientManagementPage.vue files deleted
- [ ] Test files for removed pages deleted
- [ ] Linter passes with no errors
- [ ] Unit tests pass
- [ ] E2E tests pass (or updated to remove removed page tests)
- [ ] Production build succeeds
- [ ] Manual testing scenarios all pass
- [ ] No programmatic navigation to removed routes remains in code
- [ ] CaseFilesPage (case-specific file management) still works correctly
- [ ] SearchPage still allows client search and management
- [ ] All retained pages (Dashboard, Search, Profile, auth flows) work without degradation

---

## Rollback Plan

If issues arise during implementation:

1. **Git Revert**: Use `git revert` or `git reset` to undo commits
2. **Restore Files**: Restore removed page components from git history
3. **Restore Routes**: Add back route definitions to routes.js
4. **Restore Navigation**: Add back menu items to MainLayout.vue
5. **Restore Tests**: Restore test files from git history

---

## Success Criteria

This feature is complete when:

1. Navigation menu contains 8 or fewer pages (down from 10)
2. No "Files" or "Clients" menu items visible to any user role
3. Routes `/files` and `/clients` correctly show ErrorNotFound page
4. All retained pages function without degradation
5. All tests pass
6. Production build succeeds with smaller bundle size
7. Zero navigation errors or broken links
8. Manual testing confirms UI is simplified and functional

---

## Next Steps

After completing implementation:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Run `/speckit.implement` to execute implementation
3. Create git commit with descriptive message
4. Manual testing on development server
5. Deploy to staging environment (if applicable)
6. User acceptance testing
7. Merge to main branch and deploy to production

---

## Notes

- This is a **frontend-only change** - no backend modifications required
- CaseFilesPage is distinct from FileManagementPage and must be preserved
- Admin users lose dedicated ClientManagementPage but can still search clients via SearchPage
- Bundle size reduction is automatic via Vite tree-shaking (no manual configuration)
- Translation key cleanup is optional but recommended for long-term maintainability

## Estimated Effort

- **Development**: 2-3 hours (analysis, removal, cleanup)
- **Testing**: 1-2 hours (unit tests, manual testing)
- **Total**: 3-5 hours

## Risk Level

**Low** - This is a straightforward removal with minimal risk, leveraging existing error handling and requiring no new code or complex logic.
