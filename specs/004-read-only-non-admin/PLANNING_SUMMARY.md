# Feature 004 Planning Summary: Read-Only Access for Non-Admin Users

**Status**: ✅ Planning Complete - Ready for Implementation
**Date**: 2025-10-17
**Priority**: P0 (Critical - Security)

## Executive Summary

Feature 004 implements comprehensive role-based access control (RBAC) to enforce read-only access for non-admin users. This security-critical feature ensures that only administrators can create, edit, delete, or download data, while non-admin users maintain full read access to view and navigate the application.

## Planning Artifacts Created

### ✅ Phase 0: Research Complete
**Document**: [research.md](./research.md)

**Key Findings**:
- **2 Critical Security Gaps** identified:
  1. `case.create` - Missing admin check
  2. `file.downloadFile` - Admin check was removed (needs restoration)
- **Recommended Pattern**: useRoleAccess composable for frontend, server-side checks for backend
- **Decision**: Use v-if (not v-show) for security + performance
- **Visual Indicator**: Badge in header with tooltip

### ✅ Phase 1: Design Complete
**Documents**:
- [plan.md](./plan.md) - Complete implementation plan
- [access-control.md](./access-control.md) - Authorization matrix
- [quickstart.md](./quickstart.md) - Testing procedures
- [CLAUDE.md](../../CLAUDE.md) - Updated with security patterns

**Authorization Matrix Summary**:
- **3 endpoints need protection**: client.create, case.create, file.downloadFile
- **5 endpoints already protected**: file.upload, file.delete, file.rename, client.update, folder.delete
- **3 endpoints stay open**: client.search, client.get, file.listFolderContents
- **11 UI elements to restrict**: Create/edit/delete buttons across 6 components

## Implementation Roadmap

### Phase 2: Backend Security (Priority: P0, Time: 2 hours)
**Critical Security Fixes**:
1. Add admin check to `case.create` (CaseHandler.gs)
2. Restore admin check to `file.downloadFile` (FileHandler.gs)
3. Verify admin check in `client.create` (ClientHandler.gs)
4. Update i18n error messages

**Files to Modify**:
- `gas/handlers/CaseHandler.gs`
- `gas/handlers/FileHandler.gs`
- `gas/handlers/ClientHandler.gs` (verification)
- `src/i18n/en-US.js`
- `src/i18n/fr-FR/index.js`

### Phase 3: Frontend Composable (Priority: P0, Time: 1 hour)
**Create useRoleAccess Composable**:
- File: `src/composables/useRoleAccess.js` (NEW)
- Returns: `{ isAdmin, canCreate, canEdit, canDelete, canDownload, canUpload, isViewOnly }`
- Test file: `tests/composables/useRoleAccess.spec.js` (NEW)

### Phase 4: Frontend Components (Priority: P0, Time: 3 hours)
**6 Components to Update**:
1. `src/pages/SearchPage.vue` - Hide create buttons
2. `src/pages/ClientDetailsPage.vue` - Hide create case button
3. `src/components/cases/CaseList.vue` - Hide create button
4. `src/pages/CaseFilesPage.vue` - Hide upload/download/edit/delete
5. `src/components/files/FolderBrowser.vue` - Hide action buttons
6. `src/components/search/ClientSearchForm.vue` - Hide create button

### Phase 5: Visual Polish (Priority: P1, Time: 1.5 hours)
**UI Enhancements**:
1. Add "View Only" badge to MainLayout.vue
2. Add i18n keys for badge and tooltips
3. Update empty states with helpful messages

### Phase 6: Testing (Priority: P0, Time: 2.5 hours)
**Security Verification**:
1. Backend: 11 API tests (8 forbidden, 3 allowed)
2. Frontend: 9 visual checks (buttons hidden/visible)
3. Security audit: No bypass vulnerabilities
4. Admin regression: All existing features work

**Total Estimated Time**: 10 hours (1.25 days)

## Security Impact Analysis

### Critical Security Fixes
| Issue | Current Risk | After Fix | Priority |
|-------|-------------|-----------|----------|
| Non-admin can create cases | HIGH - Data pollution | ✅ Blocked | P0 |
| Non-admin can download files | HIGH - Data exfiltration | ✅ Blocked | P0 |
| Non-admin can create clients | MEDIUM - Bypassed via API | ✅ Blocked | P0 |

### Defense Layers
1. **Server-Side** (Primary): All write operations check `ROLE_ADMIN`
2. **Client-Side** (Secondary): UI buttons hidden from non-admin
3. **Error Handling**: Clear 403 Forbidden messages
4. **Audit Logging** (Future): Track unauthorized attempts

## Testing Strategy

### Backend Security Tests (10 minutes)
**Test Suite**: 11 API calls via Postman/curl
- 8 write operations with non-admin token → expect 403
- 3 read operations with non-admin token → expect 200
- All operations with admin token → expect 200

**Pass Criteria**: 100% tests pass

### Frontend Visual Tests (15 minutes)
**Test Suite**: Manual UI verification
- Login as non-admin → expect 9 buttons hidden
- Login as admin → expect all buttons visible
- Check "View Only" badge → expect visible for non-admin only

**Pass Criteria**: All checklists complete

### Security Audit (5 minutes)
**Verify**:
- No client-side logic bypasses server authorization
- Error messages don't expose sensitive info
- Role checks use server-provided role (JWT)
- No admin endpoints exposed in frontend code

**Pass Criteria**: Zero vulnerabilities found

## Rollout Plan

### Step 1: Backend Deployment (ASAP)
```bash
# Deploy critical security fixes
npx clasp push

# Verify in Google Apps Script execution logs
# Test with non-admin token
```
**Critical**: Deploy within 1 day of approval

### Step 2: Frontend Deployment (Within 1 day)
```bash
# Deploy UI restrictions
npm run build
# Deploy to hosting
```
**Important**: Deploy within 1 day of backend

### Step 3: Visual Polish (Within 1 week)
- Add "View Only" badge
- Update empty states
- Full regression testing

## Success Metrics

### Security Goals
- ✅ Zero unauthorized data modifications
- ✅ Zero data exfiltration by non-admin users
- ✅ 100% admin-only operations protected

### UX Goals
- ✅ Non-admin users see clean, uncluttered UI
- ✅ Admin users see no changes
- ✅ Clear visual indicator of read-only mode

### Performance Goals
- ✅ Role checks < 1ms
- ✅ No impact on page load times
- ✅ Computed properties cached by Vue

## Risk Assessment

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Non-admin bypasses restrictions | Critical | Medium | Server-side enforcement | ✅ Planned |
| Breaking admin functionality | High | Low | Comprehensive testing | ✅ Planned |
| Inconsistent UI (some buttons visible) | Medium | Medium | useRoleAccess composable | ✅ Planned |
| Confusing UX for non-admin | Medium | Low | "View Only" badge | ✅ Planned |

## Open Questions & Decisions

### Q1: Should file.listFolderContents require admin?
**Decision**: ❌ NO - Leave as read-only to allow viewing folder contents

### Q2: Should non-admin users be able to download files?
**Decision**: ❌ NO - Downloads require admin for security consistency

### Q3: Add audit logging for forbidden access attempts?
**Decision**: ⏳ DEFER - Log to console for now, add full audit trail later if needed

### Q4: Add "Request Access" feature for non-admin?
**Decision**: ⏳ OUT OF SCOPE - Document as future enhancement

## Constitution Compliance

### ✅ All Checks Passed
- [x] Vue 3 Composition API (useRoleAccess composable)
- [x] Plain JavaScript (no TypeScript)
- [x] Functional component splitting (clean composable pattern)
- [x] Quasar integration (Q-badge for indicator)
- [x] Testing standards (Vitest tests planned)
- [x] UX consistency (Quasar design language)
- [x] Performance (computed properties cached)
- [x] Mobile-first (badge works on mobile)
- [x] i18n (all new text translated)
- [x] Security (server-side enforcement)

## Files Summary

### New Files (4)
1. `specs/004-read-only-non-admin/spec.md` - Feature specification
2. `specs/004-read-only-non-admin/plan.md` - Implementation plan
3. `specs/004-read-only-non-admin/research.md` - Technical research
4. `specs/004-read-only-non-admin/access-control.md` - Authorization matrix
5. `specs/004-read-only-non-admin/quickstart.md` - Testing guide
6. `specs/004-read-only-non-admin/checklists/requirements.md` - Quality checklist
7. `specs/004-read-only-non-admin/PLANNING_SUMMARY.md` - This file

### Files to Create During Implementation (2)
1. `src/composables/useRoleAccess.js` - Role checking composable
2. `tests/composables/useRoleAccess.spec.js` - Composable tests

### Files to Modify During Implementation (11)
**Backend (3)**:
1. `gas/handlers/CaseHandler.gs`
2. `gas/handlers/FileHandler.gs`
3. `gas/handlers/ClientHandler.gs` (verify only)

**Frontend (6)**:
4. `src/pages/SearchPage.vue`
5. `src/pages/ClientDetailsPage.vue`
6. `src/pages/CaseFilesPage.vue`
7. `src/components/cases/CaseList.vue`
8. `src/components/files/FolderBrowser.vue`
9. `src/components/search/ClientSearchForm.vue`

**i18n (2)**:
10. `src/i18n/en-US.js`
11. `src/i18n/fr-FR/index.js`

**Total Lines of Code**: ~400 lines (100 backend, 200 frontend, 100 composable/tests)

## Next Steps

### For Developers:
1. ✅ **Planning Complete** - All design artifacts ready
2. ⏳ **Ready for Phase 2** - Begin backend security fixes
3. ⏳ **Use Todo List** - Track progress through implementation phases
4. ⏳ **Follow quickstart.md** - Testing procedures documented

### For Reviewers:
1. ✅ **Specification approved** - 24/24 requirements passed
2. ✅ **Security reviewed** - Defense in depth strategy
3. ✅ **Constitution compliant** - All checks passed
4. ✅ **Ready for implementation** - Clear roadmap and timeline

### For Stakeholders:
1. **Timeline**: 1.25 days development + 0.5 days testing = 1.75 days total
2. **Priority**: Critical security feature (P0)
3. **Impact**: Protects against unauthorized data modifications
4. **Risk**: Low (additive changes, comprehensive testing planned)

## Approval

**Planning Phase**: ✅ Complete
**Design Review**: ✅ Passed
**Security Review**: ✅ Passed
**Constitution Check**: ✅ Passed

**Status**: 🚀 **APPROVED FOR IMPLEMENTATION**

---

**Planned By**: System
**Planning Date**: 2025-10-17
**Estimated Completion**: 2 days from start
**Next Command**: Begin Phase 2 implementation (backend security fixes)
