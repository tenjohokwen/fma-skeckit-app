# Feature 007: Specification Phase Complete

**Feature**: Remove clientName from Metadata Sheet
**Date**: 2025-10-18
**Status**: ✅ Specification & Planning Complete | ⏳ Implementation Pending

---

## 📋 What Was Completed

### 1. Specification Document ✅
**File**: [spec.md](spec.md)

**Content**:
- Complete problem statement (data redundancy, inconsistency)
- Solution design (dynamic enrichment, folder renaming)
- Schema changes (14 columns → 13 columns, remove Column D)
- 5 functional requirements (FR-001 to FR-005)
- Data flow diagrams
- Complete code changes for 7 files
- Migration strategy
- Testing plan
- ~1000+ lines of comprehensive documentation

**Key Features**:
- Remove clientName column from metadata sheet
- Fetch client name dynamically from clients sheet using clientId
- Make client name read-only in case details UI
- Automatic client folder renaming on firstName/lastName/nationalId changes
- Batch optimization for performance

---

### 2. Implementation Plan ✅
**File**: [plan.md](plan.md)

**Content**:
- 6 implementation phases (8 days total)
- Detailed task breakdown with code snippets
- Complete rollback procedures
- Verification scripts for each phase
- Performance testing guidelines
- Comprehensive checklists

**Key Strategy**:
```
Phase 1-3: Deploy Code (clientName column still exists)
    ↓
Phase 4: Test Everything (with redundant column)
    ↓
Phase 5: Remove Column (schema change)
    ↓
Phase 6: Final Validation
```

**Phase Breakdown**:
- Phase 0 (0.5 days): Prerequisites - verify Feature 006 stable
- Phase 1 (2 days): Backend enrichment helpers
- Phase 2 (1 day): Client folder renaming
- Phase 3 (1 day): Frontend UI updates
- Phase 4 (1.5 days): Testing with column still present
- Phase 5 (0.5 days): Schema change - delete Column D
- Phase 6 (1.5 days): Deployment & 24-hour monitoring

---

### 3. Quick Reference Document ✅
**File**: [README.md](README.md)

**Content**:
- Executive summary
- Quick overview of changes
- Benefits and risks
- Key decision: Deploy code BEFORE schema change

---

## 🎯 Problem Being Solved

### Current Problem
1. **Data Redundancy**: clientName stored in BOTH metadata sheet and clients sheet
2. **Data Inconsistency**: When client name changes in clients sheet, metadata sheet becomes stale
3. **Wrong Edit Location**: Users can edit client name from case details (should be client details only)
4. **Folder Name Inconsistency**: Client folder name doesn't update when client info changes

### Solution Design
1. **Remove Redundancy**: Delete clientName column (Column D) from metadata sheet
2. **Dynamic Enrichment**: Fetch client name from clients sheet at runtime using clientId
3. **Read-Only UI**: Make client name non-editable in case details page
4. **Auto Folder Rename**: Rename client folder when firstName/lastName/nationalId changes

---

## 📊 Impact Summary

### Files to Modify
1. **Backend** (4 files):
   - `gas/services/SheetsService.gs` - Add enrichment helpers, update CRUD methods
   - `gas/services/DriveService.gs` - Add renameFolder() method
   - `gas/handlers/ClientHandler.gs` - Add folder rename logic
   - `gas/handlers/CaseHandler.gs` - Update comments

2. **Frontend** (2+ files):
   - `src/pages/CaseEditPage.vue` - Make client name readonly
   - `src/i18n/en-US.js` - Add English messages
   - `src/i18n/fr-FR/index.js` - Add French translations

### Schema Changes
```
BEFORE (14 columns):
A: caseId
B: caseName
C: clientId
D: clientName       ← TO BE REMOVED
E: assignedTo
...

AFTER (13 columns):
A: caseId
B: caseName
C: clientId
D: assignedTo       ← Shifted from E
E: caseType         ← Shifted from F
...
```

### Code Changes Summary
| Component | LOC Added | LOC Modified | Key Changes |
|-----------|-----------|--------------|-------------|
| SheetsService | ~120 | ~80 | Enrichment helpers, updated indices |
| DriveService | ~40 | 0 | renameFolder() method |
| ClientHandler | ~50 | ~30 | Folder rename logic |
| CaseHandler | ~5 | ~5 | Comments updated |
| Frontend UI | ~10 | ~20 | Readonly field, remove from updates |
| i18n | ~20 | ~10 | Error messages |
| **Total** | **~245** | **~145** | **~390 LOC total** |

---

## 🔑 Key Implementation Decisions

### 1. Phased Deployment Strategy
**Decision**: Deploy and test code WHILE Column D still exists, then remove column.

**Rationale**:
- Safer: Code tested before irreversible schema change
- Easier rollback: Can revert code without restoring data
- Verifiable: Confirm enrichment works while column still exists

### 2. Dynamic Enrichment Pattern
**Decision**: Enrich client name at data retrieval time, not storage time.

**Functions**:
- `enrichCaseWithClientName(caseData)` - Single case
- `enrichCasesWithClientNames(cases)` - Batch with optimization

**Rationale**:
- Always current data (no staleness)
- Single source of truth enforced
- Batch optimization for performance

### 3. Performance Optimization
**Decision**: Build in-memory client lookup map for batch operations.

**Targets**:
- Single case fetch: < 500ms
- Batch 100 cases: < 3 seconds

**Approach**:
- Extract unique clientIds
- Build lookup map once
- Apply to all cases

### 4. Automatic Folder Renaming
**Decision**: Trigger folder rename on firstName/lastName/nationalId changes.

**Pattern**: `firstName_lastName_nationalId`

**Safety**:
- Rename failure doesn't fail client update
- Comprehensive logging for manual review
- Non-blocking error handling

### 5. UI Enforcement
**Decision**: Make client name readonly in case details, editable only from client details.

**Implementation**:
- Input field with `readonly` and `disable` attributes
- Hint text directing users to client details page
- clientName excluded from update payloads

---

## ⏳ Dependencies

### Hard Dependencies
1. **Feature 006 Must Be Complete**:
   - Column C (clientId) exists in metadata sheet
   - All cases have valid clientId values
   - Feature 006 deployed and stable in production

2. **Specification Approval**:
   - Team review of spec.md
   - Approval from stakeholders
   - Sign-off to begin implementation

### Soft Dependencies
- None (Feature 007 is self-contained after Feature 006)

---

## 🚀 Next Steps

### Immediate Next Steps
1. **Wait for Feature 006 Deployment**
   - Feature 006 must be deployed to production
   - Feature 006 must be tested and stable
   - Column C (clientId) must exist and be populated

2. **Team Review**
   - Review spec.md with team
   - Review plan.md with team
   - Get approval to proceed

3. **Begin Implementation** (After approval)
   - Start with Phase 0 (Prerequisites verification)
   - Follow plan.md phases 1-6
   - Estimated duration: 8 days

### Implementation Command
When ready to begin:
```
/speckit.implement
```

This will start the implementation process following the plan in plan.md.

---

## 📏 Success Criteria

### Specification Phase (✅ Complete)
- [x] Problem statement documented
- [x] Solution design documented
- [x] Schema changes defined
- [x] Functional requirements listed
- [x] Implementation plan created
- [x] Code changes specified
- [x] Migration strategy defined
- [x] Testing plan created
- [x] Rollback procedures documented

### Implementation Phase (⏳ Pending)
- [ ] Phase 0: Prerequisites verified
- [ ] Phase 1: Backend enrichment implemented
- [ ] Phase 2: Folder renaming implemented
- [ ] Phase 3: Frontend UI updated
- [ ] Phase 4: All tests passing (with column)
- [ ] Phase 5: Schema change completed
- [ ] Phase 6: Deployment validated, 24-hour monitoring

### Production Phase (⏳ Pending)
- [ ] No enrichment failures
- [ ] Performance targets met
- [ ] Client folder renames working
- [ ] UI correctly enforces read-only
- [ ] No user-reported issues
- [ ] 100% data consistency

---

## 📚 Documentation Files

### Created in This Phase
1. [spec.md](spec.md) - Complete technical specification (~1000+ lines)
2. [plan.md](plan.md) - 6-phase implementation plan (~1700+ lines)
3. [README.md](README.md) - Quick overview (~150 lines)
4. [SPECIFICATION_COMPLETE.md](SPECIFICATION_COMPLETE.md) - This file

### To Be Created During Implementation
- `IMPLEMENTATION_TRACKING.md` - Daily progress tracking (Phase 0)
- `gas/tests/test_feature_007.gs` - Unit tests (Phase 4)
- Test results documentation (Phase 4)
- Backup logs (Phase 5)
- Deployment logs (Phase 6)

---

## 📞 Related Features

### Feature 006: Metadata Sheet Client Correlation
**Status**: Backend & Migration Complete | Frontend Integration Complete | Deployment Pending
**Relationship**: Feature 007 depends on Feature 006 (requires clientId column)

**Feature 006 Files**:
- [Implementation Summary](../006-metadata-client-correlation/IMPLEMENTATION_SUMMARY.md)
- [Deployment Checklist](../006-metadata-client-correlation/DEPLOYMENT_CHECKLIST.md)

---

## ⚠️ Important Notes

### Warnings
1. **DO NOT begin implementation until Feature 006 is deployed and stable**
2. **DO NOT skip Phase 4 testing** - critical to verify before schema change
3. **DO NOT delete Column D manually until Phase 5**
4. **DO ensure backup exists before schema change**

### Critical Success Factors
1. Team approval of specification
2. Feature 006 stability in production
3. Comprehensive testing before schema change
4. Proper backup procedures followed
5. 24-hour monitoring after deployment

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-18 | Initial specification created | Development Team |
| 2025-10-18 | Implementation plan created | Development Team |
| 2025-10-18 | Specification phase marked complete | Development Team |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Status**: Specification Complete, Ready for Team Review
**Next Action**: Wait for Feature 006 deployment, then seek team approval to implement
**Estimated Implementation Time**: 8 days (after approval)

