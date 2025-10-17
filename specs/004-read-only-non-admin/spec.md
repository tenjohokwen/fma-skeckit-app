# Feature Specification: Read-Only Access for Non-Admin Users

**Feature ID**: 004
**Status**: Draft
**Created**: 2025-10-17
**Priority**: P0 (Critical - Security & Access Control)

## Overview

Implement proper role-based access control (RBAC) to ensure non-admin users have read-only access to the application. Non-admin users should only be able to view information and navigate the application, but not create, edit, or delete any data.

## User Stories

### User Story 1: Non-Admin View Access (P0 - Must Have)

**As a** non-admin user
**I want to** view client information, cases, and files
**So that** I can access information relevant to my work without accidentally modifying data

**Acceptance Criteria:**
1. ✅ Non-admin users can log in to the application
2. ✅ Non-admin users can search for clients by name and national ID
3. ✅ Non-admin users can view client details pages
4. ✅ Non-admin users can view case folders and their contents
5. ✅ Non-admin users can view file listings
6. ⚠️ Non-admin users CANNOT see "Create Client" button
7. ⚠️ Non-admin users CANNOT see "Edit" button on client details
8. ⚠️ Non-admin users CANNOT see "Create Case" button
9. ⚠️ Non-admin users CANNOT see file upload functionality
10. ⚠️ Non-admin users CANNOT see edit/delete/download buttons for files
11. ⚠️ Non-admin users CANNOT see folder deletion functionality

**Scenarios:**

#### Scenario 1.1: Non-Admin Searches for Client
```gherkin
Given I am logged in as a non-admin user
When I navigate to the search page
Then I should see the search form
And I should NOT see "Create New Client" button
When I search for a client by name
Then I should see matching results
And each result should show a "View Details" icon only
And each result should NOT show "Create Case" icon
```

#### Scenario 1.2: Non-Admin Views Client Details
```gherkin
Given I am logged in as a non-admin user
And I am viewing a client details page
Then I should see client personal information (read-only)
And I should NOT see "Edit" button
And I should see the list of cases for this client
And each case should be clickable to view files
And I should NOT see "Create New Case" button
```

#### Scenario 1.3: Non-Admin Views Case Files
```gherkin
Given I am logged in as a non-admin user
And I am viewing a case folder
Then I should see the list of files and folders
And I should NOT see "Upload File" button
And I should NOT see "Delete" button on any file
And I should NOT see "Rename" button on any file
And I should NOT see "Download" button on any file
And I should NOT see "Delete Folder" button
```

### User Story 2: Backend Authorization Enforcement (P0 - Must Have)

**As a** system administrator
**I want** all backend endpoints to enforce admin-only restrictions
**So that** non-admin users cannot bypass frontend restrictions via API calls

**Acceptance Criteria:**
1. ⚠️ All CREATE operations require `ROLE_ADMIN`
2. ⚠️ All UPDATE operations require `ROLE_ADMIN`
3. ⚠️ All DELETE operations require `ROLE_ADMIN`
4. ⚠️ All DOWNLOAD operations require `ROLE_ADMIN`
5. ✅ All READ operations allow non-admin users
6. ⚠️ Backend returns `403 Forbidden` when non-admin attempts restricted operation
7. ⚠️ Error messages clearly indicate "Admin access required"

**Scenarios:**

#### Scenario 2.1: Non-Admin Attempts Restricted API Call
```gherkin
Given I am authenticated as a non-admin user
When I attempt to call "client.create" endpoint
Then I should receive a 403 Forbidden error
And the error message should say "Admin access required"
And no data should be created

When I attempt to call "client.update" endpoint
Then I should receive a 403 Forbidden error

When I attempt to call "file.uploadFile" endpoint
Then I should receive a 403 Forbidden error

When I attempt to call "file.deleteFile" endpoint
Then I should receive a 403 Forbidden error

When I attempt to call "file.downloadFile" endpoint
Then I should receive a 403 Forbidden error
```

#### Scenario 2.2: Non-Admin Can Access Read Endpoints
```gherkin
Given I am authenticated as a non-admin user
When I call "client.search" endpoint
Then I should receive a 200 OK response
And I should see matching client data

When I call "client.get" endpoint
Then I should receive a 200 OK response
And I should see client details and cases

When I call "file.listFolderContents" endpoint
Then I should receive a 200 OK response
And I should see folder contents
```

### User Story 3: Clear Visual Indicators (P1 - Should Have)

**As a** non-admin user
**I want** clear visual indicators that I'm in read-only mode
**So that** I understand my access limitations

**Acceptance Criteria:**
1. ⚠️ Non-admin users see a subtle badge/indicator showing "View Only" mode
2. ⚠️ Tooltips explain why certain actions are disabled
3. ⚠️ Empty states mention "Contact admin to create..." instead of showing create buttons

**Scenarios:**

#### Scenario 3.1: View-Only Badge Display
```gherkin
Given I am logged in as a non-admin user
When I view any page in the application
Then I should see a "View Only" badge in the header/navigation
And the badge should be styled as informational (blue/gray)
```

## Functional Requirements

### FR1: Frontend Access Control
- **FR1.1**: Hide all create buttons from non-admin users
- **FR1.2**: Hide all edit buttons from non-admin users
- **FR1.3**: Hide all delete buttons from non-admin users
- **FR1.4**: Hide all download buttons from non-admin users
- **FR1.5**: Hide upload file components from non-admin users
- **FR1.6**: Show read-only views of all data to non-admin users
- **FR1.7**: Display "View Only" indicator for non-admin users

### FR2: Backend Authorization
- **FR2.1**: `client.create` - Enforce admin-only access
- **FR2.2**: `client.update` - Enforce admin-only access
- **FR2.3**: `case.create` - Enforce admin-only access
- **FR2.4**: `file.uploadFile` - Enforce admin-only access
- **FR2.5**: `file.deleteFile` - Enforce admin-only access
- **FR2.6**: `file.renameFile` - Enforce admin-only access
- **FR2.7**: `file.downloadFile` - Enforce admin-only access
- **FR2.8**: `folder.delete` - Enforce admin-only access
- **FR2.9**: All READ operations allow non-admin access
- **FR2.10**: Return 403 with clear error message for unauthorized operations

### FR3: Navigation & UX
- **FR3.1**: Non-admin users can navigate all pages
- **FR3.2**: Non-admin users see same layout but with restricted actions
- **FR3.3**: Empty states guide non-admin users appropriately
- **FR3.4**: No confusing error messages when features are hidden

## Non-Functional Requirements

### NFR1: Security
- Backend must be the source of truth for authorization
- Frontend restrictions are for UX only, not security
- All API endpoints must validate user role server-side
- No sensitive data exposure in frontend code

### NFR2: Performance
- Role checks should not add significant overhead
- Frontend should conditionally render based on role (not hide with CSS)

### NFR3: Maintainability
- Centralize role checking logic in composables
- Use consistent pattern across all components
- Document authorization rules clearly

## Success Criteria

### P0 (Must Have) - Security
- [ ] All backend CREATE/UPDATE/DELETE operations reject non-admin users
- [ ] Non-admin users cannot bypass frontend restrictions via API
- [ ] Security audit confirms no privilege escalation vulnerabilities

### P1 (Should Have) - UX
- [ ] Non-admin users see clean, uncluttered interfaces
- [ ] All action buttons properly hidden based on role
- [ ] "View Only" indicator visible to non-admin users

### P2 (Nice to Have) - User Guidance
- [ ] Tooltips explain why actions are unavailable
- [ ] Empty states provide helpful guidance
- [ ] Help documentation explains role differences

## Out of Scope

- Role management (creating/editing user roles)
- Fine-grained permissions (different access levels within non-admin)
- Temporary permission grants
- Permission inheritance or delegation

## Technical Notes

### Current State Analysis

**Already Admin-Only (Backend):**
- `file.uploadFile` (line 797 in FileHandler.gs) - ✅ Already has admin check
- `file.deleteFile` - ✅ Already has admin check
- `file.renameFile` - ✅ Already has admin check
- `client.update` (recently added) - ✅ Already has admin check
- `client.create` - ✅ Already has admin check
- `folder.delete` - ✅ Already has admin check

**Missing Admin-Only (Backend):**
- `file.downloadFile` (line 579) - ⚠️ Admin check was REMOVED (needs restoration)
- `file.listFolderContents` (line 579) - ⚠️ Admin check was REMOVED (needs restoration)
- `case.create` - ⚠️ Needs admin check added

**Frontend Issues:**
- Search page shows "Create New Client" button to all users
- Search results show "Create Case" icon to all users
- Client details page shows "Edit" button based on role (✅ correct)
- Client details shows "Create New Case" button to all users
- File upload component visible to all users
- File operations (delete, rename, download) visible to all users

### Implementation Pattern

**Composable for Role Checking:**
```javascript
// src/composables/useRoleAccess.js
export function useRoleAccess() {
  const authStore = useAuthStore()

  const isAdmin = computed(() => {
    return authStore.user?.role === 'ROLE_ADMIN'
  })

  const canCreate = computed(() => isAdmin.value)
  const canEdit = computed(() => isAdmin.value)
  const canDelete = computed(() => isAdmin.value)
  const canDownload = computed(() => isAdmin.value)

  return {
    isAdmin,
    canCreate,
    canEdit,
    canDelete,
    canDownload
  }
}
```

**Backend Pattern:**
```javascript
// Consistent admin check at method start
if (!context.user || context.user.role !== 'ROLE_ADMIN') {
  throw ResponseHandler.forbiddenError(
    'Admin access required',
    'error.forbidden'
  );
}
```

## Dependencies

- **Blocks**: None (security critical - should be implemented ASAP)
- **Blocked By**: None
- **Related**: Feature 003 (Admin Client Editing) - uses same admin check pattern

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Non-admin bypass restrictions via API | Critical | Medium | Enforce ALL checks server-side |
| Breaking existing admin functionality | High | Low | Comprehensive testing of admin workflows |
| Confusing UX for non-admin users | Medium | Medium | Add "View Only" indicators and tooltips |
| Inconsistent enforcement across features | Medium | Medium | Use centralized composable pattern |

## Testing Strategy

### Backend Testing
1. Test each admin-only endpoint with non-admin token → expect 403
2. Test each admin-only endpoint with admin token → expect success
3. Test read-only endpoints with both roles → expect success
4. Test no authentication → expect 401

### Frontend Testing
1. Visual regression testing with non-admin user
2. Verify no create/edit/delete buttons visible
3. Verify navigation still works
4. Verify data displays correctly in read-only mode

### Security Testing
1. Attempt direct API calls with non-admin token
2. Verify frontend restrictions cannot be bypassed
3. Check browser console for exposed role logic
4. Penetration testing for privilege escalation

## Acceptance Testing Checklist

### For Non-Admin Users:
- [ ] Can log in successfully
- [ ] Can search for clients
- [ ] Can view client details
- [ ] Can navigate to case folders
- [ ] Can view file lists
- [ ] CANNOT see any create buttons
- [ ] CANNOT see any edit buttons
- [ ] CANNOT see any delete buttons
- [ ] CANNOT see any download buttons
- [ ] CANNOT see upload file functionality

### For Admin Users:
- [ ] All existing functionality still works
- [ ] Can create clients
- [ ] Can edit clients
- [ ] Can create cases
- [ ] Can upload files
- [ ] Can download files
- [ ] Can delete files
- [ ] Can rename files
- [ ] Can delete folders

### Backend Authorization:
- [ ] Non-admin gets 403 on client.create
- [ ] Non-admin gets 403 on client.update
- [ ] Non-admin gets 403 on case.create
- [ ] Non-admin gets 403 on file.uploadFile
- [ ] Non-admin gets 403 on file.deleteFile
- [ ] Non-admin gets 403 on file.renameFile
- [ ] Non-admin gets 403 on file.downloadFile
- [ ] Non-admin gets 403 on folder.delete
- [ ] Non-admin gets 200 on all read operations

## Rollout Plan

### Phase 1: Backend Authorization (Critical)
1. Add admin checks to missing endpoints
2. Restore admin checks that were removed
3. Test all endpoints with non-admin user
4. Deploy backend changes

### Phase 2: Frontend Restrictions (Important)
1. Create useRoleAccess composable
2. Update all components to hide buttons based on role
3. Add "View Only" indicator
4. Test with non-admin user account

### Phase 3: Polish & Documentation (Optional)
1. Add tooltips for disabled actions
2. Update help documentation
3. Create admin guide for role management

## Open Questions

1. Should non-admin users be able to download files? (Leaning towards NO for consistency)
2. Should we add a middle "Viewer" role in the future with download permissions?
3. Should non-admin users see file metadata (size, dates) or just names?
4. Do we need audit logging when non-admin attempts restricted actions?

## Related Documentation

- [Feature 003: Admin Client Editing](../003-as-a-user/spec.md) - Uses admin role check pattern
- [Authentication Documentation](../../docs/authentication.md) - User roles and tokens
- [Security Guidelines](../../docs/security.md) - Authorization best practices

---

**Specification Status**: ✅ Ready for Planning
**Next Step**: Run planning phase to create implementation tasks
**Estimated Effort**: 2-3 days (1 day backend, 1-2 days frontend + testing)
