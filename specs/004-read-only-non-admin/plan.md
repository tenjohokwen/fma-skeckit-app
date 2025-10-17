# Implementation Plan: Read-Only Access for Non-Admin Users

**Branch**: `004-read-only-non-admin` | **Date**: 2025-10-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-read-only-non-admin/spec.md`

## Summary

This feature implements comprehensive role-based access control (RBAC) to enforce read-only access for non-admin users. The implementation prioritizes security by enforcing all authorization checks server-side, with frontend restrictions serving as UX enhancements only. Non-admin users will be able to view all data but cannot create, edit, delete, or download any content.

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend)
**Primary Dependencies**: Vue 3, Quasar 2, Pinia, existing auth system (frontend); Google Apps Script (backend)
**Authentication**: Token-based with role stored in JWT (ROLE_ADMIN vs ROLE_USER)
**Testing**: Vitest + Vue Test Utils for frontend, manual testing for backend
**Target Platform**: Web browsers, Google Apps Script environment
**Project Type**: Security enhancement affecting all CRUD operations
**Performance Goals**: Role checks < 1ms, no impact on page load times
**Constraints**: Must not break existing admin functionality, must enforce server-side
**Scale/Scope**: Security-critical feature affecting 8 backend endpoints and 6 frontend components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: New composable uses `<script setup>`, no Options API
- [x] **Plain JavaScript**: No TypeScript, all checks use plain JS
- [x] **Functional Component Splitting**: useRoleAccess composable for role checking logic
- [x] **Quasar Integration**: Uses existing Q-components, adds Q-badge for indicator
- [x] **Clean & Readable Code**: Composable < 50 lines, consistent pattern across components

### Testing Standards Compliance

- [x] **Component Isolation**: Each updated component tested independently
- [x] **Vitest + Vue Test Utils**: Tests written in plain JavaScript
- [x] **Realistic Test Scenarios**: Tests cover admin vs non-admin scenarios
- [x] **Security Testing**: Backend endpoints tested with non-admin tokens

### UX Consistency Compliance

- [x] **Design System**: Uses Quasar colors (info blue for "View Only" badge)
- [x] **Quasar Design Language**: Consistent with existing UI patterns
- [x] **Clear Feedback & States**: Error messages for 403 responses
- [x] **Accessibility**: Visual indicators don't rely on color alone
- [x] **Responsive**: Badge/indicators work on mobile viewports

### Performance Requirements Compliance

- [x] **Lazy Loading**: No new routes, updates existing lazy-loaded pages
- [x] **Efficient Reactivity**: Computed properties for role checks, cached in composable
- [x] **Network & Memory Hygiene**: No additional API calls for role checks
- [x] **Bundle Awareness**: No new dependencies, uses existing auth store

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Role indicators tested on narrow viewports
- [x] **Internationalization**: All new UI text uses i18n (error.forbidden, etc.)
- [x] **Progress Indicators**: Uses existing loading states, no new indicators needed

### Google Apps Script Architecture Compliance

- [x] **Project Structure**: Updates existing handlers, no new files
- [x] **Request Flow**: Maintains Security Interceptor → Router → Handler pattern
- [x] **Security**: Admin checks at method start, before any data access
- [x] **Response Format**: Uses ResponseHandler.forbiddenError for consistent errors

## Project Structure

### Documentation (this feature)

```
specs/004-read-only-non-admin/
├── plan.md              # This file
├── research.md          # Phase 0: RBAC patterns, security best practices
├── access-control.md    # Phase 1: Authorization matrix and enforcement rules
├── quickstart.md        # Phase 1: How to test with non-admin user
└── checklists/
    └── requirements.md  # Spec quality checklist (already created)
```

### Source Code

```
src/
├── composables/
│   └── useRoleAccess.js                # NEW: Role checking composable
├── components/
│   ├── layout/
│   │   └── MainLayout.vue              # MODIFIED: Add "View Only" badge
│   ├── clients/
│   │   └── ClientDetails.vue           # MODIFIED: Already has admin check (verify)
│   ├── cases/
│   │   └── CaseList.vue                # MODIFIED: Hide "Create Case" button
│   ├── files/
│   │   ├── FileUploader.vue            # MODIFIED: Hide from non-admin
│   │   ├── FolderBrowser.vue           # MODIFIED: Hide action buttons
│   │   └── FileRenameDialog.vue        # UNCHANGED: Won't be accessible
│   └── search/
│       └── ClientSearchForm.vue        # MODIFIED: Hide "Create Client" button
├── pages/
│   ├── SearchPage.vue                  # MODIFIED: Hide create buttons
│   ├── ClientDetailsPage.vue           # MODIFIED: Hide create case button
│   └── CaseFilesPage.vue               # MODIFIED: Hide upload/edit/delete
└── i18n/
    ├── en-US.js                        # MODIFIED: Add viewOnly.* keys
    └── fr-FR/
        └── index.js                    # MODIFIED: Add French translations

gas/
├── handlers/
│   ├── ClientHandler.gs                # VERIFY: create/update already protected
│   ├── CaseHandler.gs                  # MODIFIED: Add admin check to create
│   └── FileHandler.gs                  # MODIFIED: Restore admin checks
└── utils/
    └── Router.gs                       # UNCHANGED: Dynamic routing handles all

tests/
└── composables/
    └── useRoleAccess.spec.js           # NEW: Test role checking logic
```

## Phase 0: Research & Technical Decisions

**Status**: ⏳ In Progress

**Key Questions to Research**:
1. Current state of admin checks in backend (audit all endpoints)
2. Best practices for role-based UI rendering (v-if vs v-show vs computed)
3. Security considerations for client-side vs server-side authorization
4. Pattern for displaying "View Only" indicators (badge, banner, tooltip)

**Research Outputs**:
- [research.md](./research.md) - Security best practices and implementation patterns
- Backend endpoint audit - Complete list of endpoints needing admin checks

## Phase 1: Design Artifacts

**Status**: ⏳ Pending

**Outputs**:
- [access-control.md](./access-control.md) - Authorization matrix for all operations
- [quickstart.md](./quickstart.md) - Testing guide with non-admin user
- Updated CLAUDE.md with security patterns

### Authorization Matrix

| Endpoint | Current State | Action Required |
|----------|---------------|-----------------|
| `client.search` | No auth check | ✅ Keep as-is (read-only) |
| `client.get` | No auth check | ✅ Keep as-is (read-only) |
| `client.create` | ✅ Admin only | ✅ No change needed |
| `client.update` | ✅ Admin only | ✅ No change needed |
| `case.create` | ⚠️ No check | 🔧 Add admin check |
| `file.listFolderContents` | ⚠️ Check removed | 🔧 Keep as read-only OR add admin |
| `file.uploadFile` | ✅ Admin only | ✅ No change needed |
| `file.deleteFile` | ✅ Admin only | ✅ No change needed |
| `file.renameFile` | ✅ Admin only | ✅ No change needed |
| `file.downloadFile` | ⚠️ Check removed | 🔧 Add admin check |
| `folder.delete` | ✅ Admin only | ✅ No change needed |

**Decision**: `file.listFolderContents` should remain read-only (no admin check) since viewing is allowed.

## Phase 2: Backend Authorization Implementation

**Status**: ⏳ Pending - Start after Phase 1

### Task Breakdown

#### Task 2.1: Add Admin Check to case.create (Priority: P0)
**File**: `gas/handlers/CaseHandler.gs`
**Estimated Time**: 15 minutes

**Changes**:
```javascript
create: function(context) {
  try {
    // NEW: Admin-only authorization check
    if (!context.user || context.user.role !== 'ROLE_ADMIN') {
      throw ResponseHandler.forbiddenError(
        'Admin access required',
        'error.forbidden'
      );
    }

    // ... existing code
  } catch (error) {
    // ... existing error handling
  }
}
```

#### Task 2.2: Restore Admin Check to file.downloadFile (Priority: P0)
**File**: `gas/handlers/FileHandler.gs`
**Estimated Time**: 10 minutes

**Changes**:
```javascript
downloadFile: function(context) {
  try {
    // RESTORE: Admin-only authorization check
    if (!context.user || context.user.role !== 'ROLE_ADMIN') {
      throw ResponseHandler.forbiddenError(
        'Admin access required to download files',
        'error.forbidden'
      );
    }

    // ... existing code
  } catch (error) {
    // ... existing error handling
  }
}
```

#### Task 2.3: Verify All Admin Checks (Priority: P0)
**Files**: All handler files
**Estimated Time**: 30 minutes

**Verification Checklist**:
- [x] `client.create` has admin check
- [x] `client.update` has admin check
- [ ] `case.create` has admin check (to be added)
- [x] `file.uploadFile` has admin check
- [x] `file.deleteFile` has admin check
- [x] `file.renameFile` has admin check
- [ ] `file.downloadFile` has admin check (to be restored)
- [x] `folder.delete` has admin check

#### Task 2.4: Update i18n for Error Messages (Priority: P1)
**Files**: `src/i18n/en-US.js`, `src/i18n/fr-FR/index.js`
**Estimated Time**: 15 minutes

**New Keys**:
```javascript
// en-US.js
error: {
  forbidden: "You don't have permission to perform this action",
  adminRequired: "Admin access required"
}

// fr-FR/index.js
error: {
  forbidden: "Vous n'avez pas la permission d'effectuer cette action",
  adminRequired: "Accès administrateur requis"
}
```

## Phase 3: Frontend Role Access Composable

**Status**: ⏳ Pending

### Task 3.1: Create useRoleAccess Composable (Priority: P0)
**File**: `src/composables/useRoleAccess.js` (NEW)
**Estimated Time**: 30 minutes

**Implementation**:
```javascript
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

/**
 * Composable for role-based access control
 * Provides computed properties for checking user permissions
 *
 * @returns {Object} Role access checks
 */
export function useRoleAccess() {
  const authStore = useAuthStore()

  // Check if current user is admin
  const isAdmin = computed(() => {
    return authStore.user?.role === 'ROLE_ADMIN'
  })

  // Permission checks based on admin role
  const canCreate = computed(() => isAdmin.value)
  const canEdit = computed(() => isAdmin.value)
  const canDelete = computed(() => isAdmin.value)
  const canDownload = computed(() => isAdmin.value)
  const canUpload = computed(() => isAdmin.value)

  // View-only mode indicator
  const isViewOnly = computed(() => !isAdmin.value)

  return {
    isAdmin,
    canCreate,
    canEdit,
    canDelete,
    canDownload,
    canUpload,
    isViewOnly
  }
}
```

### Task 3.2: Write Tests for useRoleAccess (Priority: P1)
**File**: `tests/composables/useRoleAccess.spec.js` (NEW)
**Estimated Time**: 30 minutes

**Test Coverage**:
- Admin user returns true for all permissions
- Non-admin user returns false for all write permissions
- isViewOnly reflects correct state
- Handles missing user gracefully

## Phase 4: Update Frontend Components

**Status**: ⏳ Pending

### Task 4.1: Update SearchPage (Priority: P0)
**File**: `src/pages/SearchPage.vue`
**Estimated Time**: 20 minutes

**Changes**:
1. Import useRoleAccess
2. Hide "Create New Client" button with `v-if="canCreate"`
3. Hide "Create Case" icon in search results with `v-if="canCreate"`

**Code Example**:
```vue
<script setup>
import { useRoleAccess } from 'src/composables/useRoleAccess'

const { canCreate } = useRoleAccess()
</script>

<template>
  <!-- Hide create button for non-admin -->
  <q-btn
    v-if="canCreate"
    label="Create New Client"
    @click="handleCreateClient"
  />
</template>
```

### Task 4.2: Update ClientDetailsPage (Priority: P0)
**File**: `src/pages/ClientDetailsPage.vue`
**Estimated Time**: 15 minutes

**Changes**:
1. Import useRoleAccess
2. Hide "Create New Case" button with `v-if="canCreate"`

**Note**: Edit button already uses `isAdmin` check via ClientDetails component.

### Task 4.3: Update CaseList Component (Priority: P0)
**File**: `src/components/cases/CaseList.vue`
**Estimated Time**: 15 minutes

**Changes**:
1. Import useRoleAccess
2. Hide "Create New Case" button with `v-if="canCreate"`

### Task 4.4: Update CaseFilesPage (Priority: P0)
**File**: `src/pages/CaseFilesPage.vue`
**Estimated Time**: 30 minutes

**Changes**:
1. Import useRoleAccess
2. Hide FileUploader component with `v-if="canUpload"`
3. Hide file action buttons (delete, rename, download) with `v-if` checks
4. Hide folder delete button with `v-if="canDelete"`

### Task 4.5: Update FolderBrowser Component (Priority: P0)
**File**: `src/components/files/FolderBrowser.vue`
**Estimated Time**: 20 minutes

**Changes**:
1. Import useRoleAccess
2. Hide action buttons on file cards with permission checks
3. Show read-only view for non-admin users

### Task 4.6: Update ClientSearchForm (Priority: P0)
**File**: `src/components/search/ClientSearchForm.vue`
**Estimated Time**: 10 minutes

**Changes**:
1. Import useRoleAccess
2. Hide "Create Client" button with `v-if="canCreate"`

## Phase 5: Visual Indicators & Polish

**Status**: ⏳ Pending

### Task 5.1: Add "View Only" Badge to Layout (Priority: P1)
**File**: `src/components/layout/MainLayout.vue` (or header component)
**Estimated Time**: 30 minutes

**Implementation**:
```vue
<script setup>
import { useRoleAccess } from 'src/composables/useRoleAccess'

const { isViewOnly } = useRoleAccess()
</script>

<template>
  <q-header>
    <!-- Existing header content -->

    <!-- View Only Badge -->
    <q-badge
      v-if="isViewOnly"
      color="info"
      :label="$t('common.viewOnly')"
      class="view-only-badge"
    >
      <q-tooltip>{{ $t('common.viewOnlyTooltip') }}</q-tooltip>
    </q-badge>
  </q-header>
</template>
```

### Task 5.2: Add i18n Keys for Visual Indicators (Priority: P1)
**Files**: `src/i18n/en-US.js`, `src/i18n/fr-FR/index.js`
**Estimated Time**: 15 minutes

**New Keys**:
```javascript
// en-US.js
common: {
  viewOnly: "View Only",
  viewOnlyTooltip: "You have read-only access. Contact an administrator to create or edit content."
}

// fr-FR/index.js
common: {
  viewOnly: "Lecture Seule",
  viewOnlyTooltip: "Vous avez un accès en lecture seule. Contactez un administrateur pour créer ou modifier du contenu."
}
```

### Task 5.3: Update Empty States (Priority: P2)
**Files**: Various components with empty states
**Estimated Time**: 30 minutes

**Changes**:
- Update empty state messages to mention "Contact admin to create..." for non-admin
- Use `isViewOnly` to show different messages

## Phase 6: Testing & Security Verification

**Status**: ⏳ Pending

### Task 6.1: Backend Security Testing (Priority: P0)
**Manual Testing**: Use Postman or API testing tool
**Estimated Time**: 1 hour

**Test Cases**:
1. Non-admin attempts `client.create` → expect 403
2. Non-admin attempts `client.update` → expect 403
3. Non-admin attempts `case.create` → expect 403
4. Non-admin attempts `file.uploadFile` → expect 403
5. Non-admin attempts `file.deleteFile` → expect 403
6. Non-admin attempts `file.renameFile` → expect 403
7. Non-admin attempts `file.downloadFile` → expect 403
8. Non-admin attempts `folder.delete` → expect 403
9. Non-admin calls `client.search` → expect 200
10. Non-admin calls `client.get` → expect 200
11. Non-admin calls `file.listFolderContents` → expect 200

### Task 6.2: Frontend Visual Testing (Priority: P0)
**Manual Testing**: Login as non-admin user
**Estimated Time**: 1 hour

**Verification Checklist**:
- [ ] No "Create Client" button visible
- [ ] No "Create Case" button visible
- [ ] No "Edit" button on client details
- [ ] No file upload component visible
- [ ] No delete buttons on files
- [ ] No rename buttons on files
- [ ] No download buttons on files
- [ ] "View Only" badge visible in header
- [ ] Can still navigate all pages
- [ ] Can still view all data

### Task 6.3: Frontend Unit Tests (Priority: P1)
**Files**: Component test files
**Estimated Time**: 1 hour

**Test Coverage**:
- useRoleAccess composable tests
- Component tests for conditional rendering
- Store tests for role-based behavior

### Task 6.4: Security Audit (Priority: P0)
**Estimated Time**: 30 minutes

**Audit Checklist**:
- [ ] All backend write operations have admin checks
- [ ] No client-side logic bypasses server authorization
- [ ] Error messages don't expose sensitive info
- [ ] Role checks use server-provided role, not client-stored
- [ ] No exposed admin endpoints in frontend code

## Dependencies & Risks

### External Dependencies
- **Auth System**: Existing, stable (role stored in JWT)
- **Google Apps Script**: Existing, stable

### Internal Dependencies
- **authStore**: Must correctly parse role from token
- **Existing Admin Checks**: Must not break during changes

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking admin functionality | Critical | Low | Comprehensive testing with admin user |
| Non-admin bypasses via API | Critical | Medium | Enforce ALL checks server-side first |
| Inconsistent UI (some buttons visible) | Medium | Medium | Use composable consistently, test visually |
| Performance impact of role checks | Low | Very Low | Computed properties cached by Vue |
| Confusing UX for non-admin | Medium | Low | Add "View Only" badge and tooltips |

## Success Validation

### Phase 0-1 (Research & Design) Success Criteria
- [x] All backend endpoints audited and categorized
- [ ] Authorization matrix complete and approved
- [ ] Security best practices documented
- [ ] Testing strategy defined

### Phase 2 (Backend) Success Criteria
- [ ] All write operations reject non-admin (403)
- [ ] All read operations allow non-admin (200)
- [ ] Error messages clear and consistent
- [ ] No regressions in admin workflows

### Phase 3-4 (Frontend) Success Criteria
- [ ] useRoleAccess composable works correctly
- [ ] All create/edit/delete buttons hidden from non-admin
- [ ] Navigation still works for non-admin
- [ ] No console errors for non-admin users

### Phase 5 (Polish) Success Criteria
- [ ] "View Only" badge visible to non-admin
- [ ] All new i18n keys translated
- [ ] Empty states updated with helpful messages

### Phase 6 (Testing) Success Criteria
- [ ] All 11 backend security tests pass
- [ ] All 9 frontend visual checks pass
- [ ] No security vulnerabilities identified
- [ ] Admin functionality fully intact

## Implementation Phases Summary

### Phase 0: Research (1 hour)
- Audit all backend endpoints
- Document security patterns
- Create authorization matrix

### Phase 1: Design (1 hour)
- Complete access-control.md
- Create quickstart.md
- Update CLAUDE.md

### Phase 2: Backend (2 hours)
- Add admin check to case.create
- Restore admin check to file.downloadFile
- Verify all existing checks
- Update i18n error messages

### Phase 3: Frontend Composable (1 hour)
- Create useRoleAccess.js
- Write composable tests
- Document usage pattern

### Phase 4: Frontend Components (3 hours)
- Update 6 components with role checks
- Hide buttons based on permissions
- Test each component individually

### Phase 5: Visual Polish (1.5 hours)
- Add "View Only" badge
- Update i18n keys
- Update empty states

### Phase 6: Testing (2.5 hours)
- Backend security testing (11 tests)
- Frontend visual testing (9 checks)
- Security audit
- Admin regression testing

**Total Estimated Time**: 11 hours (1.5 days)

## Rollout Plan

### Step 1: Backend Security (Critical)
1. Deploy backend changes with admin checks
2. Test all endpoints with non-admin token
3. Verify admin workflows still work
4. **Deploy to production immediately** (security critical)

### Step 2: Frontend Restrictions (Important)
1. Deploy frontend changes with hidden buttons
2. Test with non-admin user account
3. Verify admin users see no changes
4. Deploy to production within 1 day

### Step 3: Visual Polish (Optional)
1. Add "View Only" badge
2. Update empty states
3. Deploy within 1 week

### Rollback Plan
- Backend: Revert handler files to previous versions
- Frontend: Remove `v-if` checks, show all buttons
- Risk: Low (changes are additive, not destructive)

## Open Questions & Decisions

### Question 1: Should file.listFolderContents require admin?
**Decision**: NO - Leave as read-only to allow non-admin users to view folder contents.

### Question 2: Should non-admin users be able to download files?
**Decision**: NO - Downloads should require admin access for consistency and security.

### Question 3: Add audit logging for forbidden access attempts?
**Decision**: DEFER - Log to console for now, add full audit trail in future if needed.

### Question 4: Add "Request Access" feature?
**Decision**: OUT OF SCOPE - Document as future enhancement.

## Next Steps

1. ✅ **Phase 0 Complete**: Research patterns (to be documented)
2. ⏳ **Phase 1 Pending**: Create design artifacts
3. ⏳ **Phase 2 Pending**: Implement backend authorization
4. ⏳ **Phase 3 Pending**: Create frontend composable
5. ⏳ **Phase 4 Pending**: Update frontend components
6. ⏳ **Phase 5 Pending**: Add visual polish
7. ⏳ **Phase 6 Pending**: Test and verify security

---

**Plan Status**: ✅ Complete - Ready for Implementation
**Next Command**: Begin Phase 0 research and create research.md
**Estimated Completion**: 1.5-2 days from start
