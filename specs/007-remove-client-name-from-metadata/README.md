# Feature 007: Remove clientName from Metadata Sheet

**Status**: 📋 Specification Complete
**Priority**: High
**Dependencies**: Feature 006 (clientId in metadata sheet)
**Estimated Duration**: 8 days

---

## 🎯 Quick Overview

### Problem
After Feature 006, the metadata sheet has BOTH `clientId` and `clientName`, creating data redundancy and inconsistency:
- Client name stored in two places (clients sheet + metadata sheet)
- When client name changes in clients sheet, metadata sheet becomes stale
- Client name editable from case details instead of client details
- Folder names don't update when client info changes

### Solution
Remove `clientName` from metadata sheet and fetch it dynamically from clients sheet using `clientId`:
- **Single source of truth**: Client name only in clients sheet
- **Automatic consistency**: Name changes immediately reflected everywhere
- **Correct edit location**: Client name only editable from client details page
- **Auto folder rename**: Client folder renamed when name/nationalId changes

---

## 📊 Schema Changes

### Before (14 columns)
```
A: caseId
B: caseName
C: clientId
D: clientName       ← REMOVE THIS
E: assignedTo
...
```

### After (13 columns)
```
A: caseId
B: caseName
C: clientId
D: assignedTo       ← Shifted from E
E: caseType         ← Shifted from F
...
```

**All columns after clientId shift left by 1**

---

## 🔑 Key Features

### 1. Dynamic Client Name Lookup
```javascript
// Backend automatically fetches client name
const caseData = getCaseById('TAX-2024');
// Returns: { clientId: "uuid-123", clientName: "John Smith" }
// clientName fetched from clients sheet, NOT stored in metadata
```

### 2. Read-Only Client Name in Case Details
```vue
<!-- Frontend: Case details page -->
<q-input
  v-model="caseData.clientName"
  label="Client"
  readonly                    ← Cannot edit from here
  disable
  hint="Edit from Client Details page"
/>
```

### 3. Automatic Folder Renaming
```javascript
// When client name/ID changes:
Before: John_Doe_ID12345
After:  Jane_Smith_ID99999

// Triggered by:
- firstName change
- lastName change
- nationalId change
```

---

## 📋 Requirements Summary

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Remove clientName column from metadata sheet | Critical |
| FR-002 | Implement dynamic client name lookup | Critical |
| FR-003 | Make client name read-only in case details | Critical |
| FR-004 | Auto-rename client folder on name/ID change | High |
| FR-005 | Backward compatibility for existing code | Medium |

---

## 🔧 Code Changes

### Backend (4 files)

1. **gas/services/SheetsService.gs**
   - Update `parseRow()` - remove clientName, shift indices
   - Add `enrichCaseWithClientName()` - fetch name from clients sheet
   - Add `enrichCasesWithClientNames()` - batch enrichment
   - Update `getCaseById()` - auto-enrich with client name
   - Update `searchCasesByName()` - search clients sheet, then cases
   - Update `createCase()` - don't store clientName
   - Update `updateCase()` - reject clientName updates, shift indices

2. **gas/handlers/ClientHandler.gs**
   - Add folder rename logic to `update()` method
   - Detect firstName/lastName/nationalId changes
   - Trigger `DriveService.renameFolder()`

3. **gas/services/DriveService.gs**
   - Add `renameFolder(folderId, newName)` method
   - Handle errors gracefully

4. **gas/handlers/CaseHandler.gs**
   - Remove clientName from caseMetadata object

### Frontend (2-3 files)

1. **src/pages/CaseEditPage.vue**
   - Make client name input readonly and disabled
   - Add hint text
   - Exclude clientName from updates object

2. **src/i18n/en-US.js + fr-FR/index.js**
   - Add error message: `clientNameImmutable`
   - Add hint text: `clientNameHint`

---

## 🚀 Implementation Flow

### Phase 1: Code Deployment (Keep Column)
1. Deploy enrichment logic
2. Deploy read-only UI
3. Deploy folder renaming
4. Test everything works WITH clientName column still present

### Phase 2: Schema Change
1. Backup metadata sheet
2. Delete Column D (clientName)
3. Verify column shift

### Phase 3: Validation
1. Test case creation
2. Test case viewing
3. Test client updates
4. Test folder renaming

---

## 🎯 Benefits

### Data Consistency
✅ **Before**: Client name in 2 places, can diverge
✅ **After**: Client name in 1 place, always consistent

### Correct Edit Location
✅ **Before**: Client name editable from case details (wrong!)
✅ **After**: Client name only editable from client details (correct!)

### Automatic Folder Updates
✅ **Before**: Folder name never updated, becomes stale
✅ **After**: Folder renamed automatically when client info changes

### Reduced Storage
✅ **Before**: 14 columns in metadata sheet
✅ **After**: 13 columns in metadata sheet

---

## ⚠️ Important Notes

### Performance
- Dynamic lookup adds slight overhead
- Mitigated by batch client lookup for multiple cases
- Single case: < 500ms (acceptable)
- Batch cases: < 3s for 100 cases

### Backward Compatibility
- API responses still include `clientName` (fetched dynamically)
- Frontend components work without changes
- Only internal storage mechanism changes

### Folder Renaming
- Triggered only when firstName, lastName, or nationalId changes
- Other field updates (telephone, email) do NOT trigger rename
- Case subfolders automatically move with parent
- Errors logged but don't fail client update

---

## 📚 Documentation

- **[spec.md](spec.md)** - Complete technical specification (this is comprehensive!)
- **README.md** - This quick overview

---

## 🏁 Next Steps

1. **Review** specification with team
2. **Approve** approach and timeline
3. **Create** implementation plan
4. **Implement** in phases (code first, schema change last)
5. **Test** thoroughly before schema change
6. **Deploy** carefully with rollback plan

---

**Status**: Ready for Review
**Estimated Effort**: 8 days
**Risk Level**: Medium (schema change + folder renaming)
**Dependencies**: Feature 006 must be deployed first

**Last Updated**: 2025-10-18
