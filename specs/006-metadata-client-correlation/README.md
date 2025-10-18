# Feature 006: Metadata Sheet Client Correlation

**Status**: 📋 Planning Complete - Ready for Implementation
**Priority**: High
**Estimated Duration**: 9 days

---

## 🎯 Quick Overview

Add `clientId` column to metadata sheet to establish proper foreign key relationship between cases and clients, enabling accurate data correlation and analytics.

### Problem
- Cases currently linked to clients via `clientName` (string)
- Names are not unique - multiple clients can have same name
- No data integrity guarantees
- Analytics and charts are unreliable

### Solution
- Add `clientId` column (Column C) to metadata sheet
- Auto-populate clientId from clients sheet on case creation
- Hide clientId from all user interfaces (system-managed field)
- Ensure clientId is immutable (cannot be changed after creation)

---

## 📚 Documentation

| Document | Purpose | Status |
|----------|---------|--------|
| [spec.md](spec.md) | Complete technical specification | ✅ Complete |
| [plan.md](plan.md) | Detailed implementation plan | ✅ Complete |
| README.md | This overview document | ✅ Complete |

---

## 🗓️ Implementation Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                    9-Day Implementation                     │
├─────────────────────────────────────────────────────────────┤
│ Day 1  │ Phase 0: Pre-Implementation Setup                 │
├────────┼────────────────────────────────────────────────────┤
│ Day 2-3│ Phase 1: Backend Sheet Structure                  │
├────────┼────────────────────────────────────────────────────┤
│ Day 4  │ Phase 2: Backend Handlers                         │
├────────┼────────────────────────────────────────────────────┤
│ Day 5  │ Phase 3: Frontend Integration                     │
├────────┼────────────────────────────────────────────────────┤
│ Day 6  │ Phase 4: Data Migration                           │
├────────┼────────────────────────────────────────────────────┤
│ Day 7-8│ Phase 5: Testing & Validation                     │
├────────┼────────────────────────────────────────────────────┤
│ Day 9  │ Phase 6: Deployment                               │
└────────┴────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Changes

### Sheet Schema Update

**Before** (13 columns):
```
A: caseId
B: caseName
C: clientName      ← Will shift to D
D: assignedTo      ← Will shift to E
...
```

**After** (14 columns):
```
A: caseId
B: caseName
C: clientId        ← NEW (UUID from clients sheet)
D: clientName      ← Shifted from C
E: assignedTo      ← Shifted from D
...
```

### Key Characteristics

| Property | Value |
|----------|-------|
| **Data Type** | String (UUID format) |
| **Required** | Yes |
| **Visible to Users** | ❌ No (hidden in all UIs) |
| **Editable by Users** | ❌ No (system-managed) |
| **Source** | Clients sheet (Column A) |
| **Validation** | Must exist in clients sheet |

---

## 📋 Requirements Summary

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | clientId auto-populated on case creation | Critical |
| FR-002 | clientId never visible to users | Critical |
| FR-003 | clientId never editable by users | Critical |
| FR-004 | clientId must match clients sheet | High |
| FR-005 | Support chart generation with clientId | Medium |

### Non-Functional Requirements

- **Backward Compatibility**: Existing cases handled via migration
- **Performance**: No degradation (< 2s case creation)
- **Data Integrity**: 100% of cases must have valid clientId

---

## 🔧 Code Changes

### Backend Files

| File | Changes | LOC |
|------|---------|-----|
| `gas/services/SheetsService.gs` | Column mapping, CRUD methods, validation | ~150 |
| `gas/handlers/MetadataHandler.gs` | Create/update handlers, validation | ~80 |
| `gas/migrations/populateClientIds.gs` | Migration script | ~200 |

### Frontend Files

| File | Changes | LOC |
|------|---------|-----|
| `src/pages/ClientDetailsPage.vue` | Pass clientId on case creation | ~10 |
| `src/pages/CaseEditPage.vue` | Verify clientId hidden | ~5 |
| `src/i18n/en-US.js` | Error messages | ~15 |
| `src/i18n/fr-FR/index.js` | Error messages (French) | ~15 |

**Total Estimated LOC**: ~475 lines

---

## 🧪 Testing Strategy

### Unit Tests (Backend)
- ✅ createCase() requires clientId
- ✅ createCase() validates UUID format
- ✅ createCase() validates clientId exists
- ✅ updateCase() rejects clientId updates
- ✅ getCaseById() returns clientId

### Integration Tests
- ✅ End-to-end case creation with clientId
- ✅ Case update immutability
- ✅ Search results include clientId (but hidden in UI)

### Manual Tests
- ✅ UI verification (clientId never visible)
- ✅ Error handling (localized messages)
- ✅ Data migration validation
- ✅ Multi-language support

---

## 📊 Success Criteria

### Must Have
- [x] Specification complete
- [x] Implementation plan complete
- [ ] clientId column added to metadata sheet
- [ ] All new cases auto-populate clientId
- [ ] clientId never visible in UI
- [ ] clientId cannot be edited by users
- [ ] Backend validates clientId exists
- [ ] Existing cases migrated successfully
- [ ] All tests passing
- [ ] Deployed to production

### Metrics
- **Migration Success Rate**: > 95%
- **Data Integrity**: 100% (all cases have valid clientId)
- **Test Coverage**: > 90%
- **Performance**: No degradation

---

## 🚀 Next Steps

### To Begin Implementation

1. **Review Documentation**
   - Read [spec.md](spec.md) for technical details
   - Read [plan.md](plan.md) for step-by-step instructions

2. **Request Approval**
   - Present specification to stakeholders
   - Get sign-off on 9-day timeline
   - Schedule maintenance window for migration

3. **Start Implementation**
   - Begin with Phase 0: Pre-Implementation Setup
   - Create backup of metadata sheet
   - Set up test environment

4. **Execute Command**
   ```
   /speckit.implement
   ```

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | High | Low | Backup + test on copy first |
| Orphaned cases (clientId not found) | Medium | Medium | Migration script logs + manual review |
| Performance impact | Low | Low | Adding 1 column has minimal impact |

---

## 📞 Support

**Feature Owner**: Development Team
**Start Date**: TBD (pending approval)
**Target Completion**: TBD + 9 days

---

**Last Updated**: 2025-10-18
**Version**: 1.0
**Status**: Ready for Approval and Implementation
