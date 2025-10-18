# Feature 006: Deployment Checklist

**Feature**: Metadata Sheet Client Correlation
**Date Created**: 2025-10-18
**Status**: Ready for Deployment

---

## ⚠️ IMPORTANT: Read Before Proceeding

This feature requires a **manual schema change** to the metadata sheet before deployment. Follow this checklist **in order** to ensure safe deployment.

---

## 📋 Pre-Deployment Checklist

### Step 1: Review Implementation
- [ ] Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- [ ] Review all code changes:
  - [ ] [gas/services/SheetsService.gs](../../../gas/services/SheetsService.gs)
  - [ ] [gas/handlers/MetadataHandler.gs](../../../gas/handlers/MetadataHandler.gs)
  - [ ] [src/i18n/en-US.js](../../../src/i18n/en-US.js)
  - [ ] [src/i18n/fr-FR/index.js](../../../src/i18n/fr-FR/index.js)
  - [ ] [gas/migrations/populateClientIds.gs](../../../gas/migrations/populateClientIds.gs)
  - [ ] [gas/migrations/backupMetadataSheet.gs](../../../gas/migrations/backupMetadataSheet.gs)
- [ ] Understand the schema change (Column C insertion)
- [ ] Understand the migration process

### Step 2: Schedule Maintenance Window
- [ ] Notify all users of upcoming maintenance
- [ ] Schedule 1-2 hour maintenance window
- [ ] Ensure admin is available during window
- [ ] Have rollback plan ready

---

## 🔧 Deployment Steps

### PHASE 1: Backup (Duration: 5 minutes)

#### 1.1: Create Sheet Backup
```
Location: Google Apps Script Editor
Function: backupMetadataSheetWithExport()
```

**Steps**:
1. Open Google Apps Script editor
2. Open file: `gas/migrations/backupMetadataSheet.gs`
3. Run function: `backupMetadataSheetWithExport()`
4. Check execution log:
   - Note backup sheet name (e.g., "metadata_backup_2025-10-18_143022")
   - Verify row count matches original
   - Verify column count = 13 (before migration)

**Verification**:
- [ ] Backup sheet created
- [ ] Backup sheet name noted: ___________________________
- [ ] Row count matches: _____ rows
- [ ] Backup sheet is protected (warning-only)

#### 1.2: Download CSV Backup
**Steps**:
1. Open the backup sheet in Google Sheets
2. File → Download → CSV
3. Save to secure location with timestamp in filename
4. Verify file size > 0 bytes

**Verification**:
- [ ] CSV downloaded
- [ ] CSV saved to: ___________________________________
- [ ] CSV file size: _____ KB
- [ ] CSV opens correctly in text editor

---

### PHASE 2: Manual Schema Change (Duration: 5 minutes)

#### 2.1: Insert Column C
```
Location: Google Sheets (metadata sheet)
Action: Insert 1 column between B and C
```

**CRITICAL STEPS** (Follow exactly):
1. Open metadata sheet in Google Sheets
2. Click on column header **C** (clientName)
3. Right-click → "Insert 1 column left"
4. New empty column appears at position C
5. Click on cell **C1** (header row)
6. Type: `clientId`
7. Press Enter

**Expected Result**:
```
Before:
A: caseId | B: caseName | C: clientName | D: assignedTo | ...

After:
A: caseId | B: caseName | C: clientId (empty) | D: clientName | E: assignedTo | ...
```

**Verification**:
- [ ] Column C is empty (except header)
- [ ] Column C header = "clientId"
- [ ] Column D header = "clientName" (shifted from C)
- [ ] All data in columns D onwards looks correct
- [ ] Total columns = 14 (was 13)
- [ ] No data appears corrupted
- [ ] Take screenshot of first 5 rows

#### 2.2: Verify Data Integrity
**Check a few sample rows manually**:

Pick 3 random rows and verify data is in correct columns:

Row #___:
- [ ] Column A (caseId): ____________________
- [ ] Column B (caseName): __________________
- [ ] Column C (clientId): (should be empty)
- [ ] Column D (clientName): ________________
- [ ] Column E (assignedTo): ________________

Row #___:
- [ ] Column A (caseId): ____________________
- [ ] Column B (caseName): __________________
- [ ] Column C (clientId): (should be empty)
- [ ] Column D (clientName): ________________
- [ ] Column E (assignedTo): ________________

Row #___:
- [ ] Column A (caseId): ____________________
- [ ] Column B (caseName): __________________
- [ ] Column C (clientId): (should be empty)
- [ ] Column D (clientName): ________________
- [ ] Column E (assignedTo): ________________

**Verification Complete**:
- [ ] All sample rows verified
- [ ] No data corruption detected
- [ ] Schema change successful

---

### PHASE 3: Deploy Backend Code (Duration: 10 minutes)

#### 3.1: Deploy Google Apps Script
```bash
cd /Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas
npx clasp push --force
```

**Steps**:
1. Navigate to gas directory
2. Run clasp push
3. Check for errors in output
4. Verify all files pushed successfully

**Verification**:
- [ ] Command completed successfully
- [ ] No errors in output
- [ ] Files pushed count: _____ files
- [ ] Timestamp of deployment: _______________

#### 3.2: Test Backend (Smoke Test)
```
Location: Google Apps Script Editor
Function: Test in Apps Script console
```

**Test Script** (Run in Apps Script editor):
```javascript
function testClientIdSupport() {
  // Test 1: Verify UUID validation
  const isValid = SheetsService.isValidUUID('123e4567-e89b-12d3-a456-426614174000');
  Logger.log('UUID validation works: ' + isValid); // Should be true

  // Test 2: Try to get a client (should not error)
  try {
    const client = SheetsService.getClientById('any-id-here');
    Logger.log('getClientById works: ' + (client !== undefined));
  } catch (e) {
    Logger.log('getClientById ERROR: ' + e.message);
  }

  Logger.log('✅ Backend smoke test complete');
}
```

**Run Test**:
- [ ] Test function created
- [ ] Test executed successfully
- [ ] UUID validation works
- [ ] No critical errors

---

### PHASE 4: Frontend Integration (Duration: 1-2 hours)

**Note**: Frontend changes are minimal - only need to pass clientId from client context.

#### 4.1: Locate Case Creation Flow
**Files to check**:
- `src/pages/ClientDetailsPage.vue`
- `src/components/cases/` (if exists)
- Any component that calls `metadata.createCaseMetadata`

**Search for API call**:
```bash
cd /Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app
grep -r "createCaseMetadata" src/
```

#### 4.2: Update Case Creation
**Example change needed**:

**Before**:
```javascript
const response = await api.post('metadata.createCaseMetadata', {
  caseId: caseFormData.caseId,
  caseName: caseFormData.caseName,
  clientFirstName: props.client.firstName,
  clientLastName: props.client.lastName,
  folderName: props.client.folderName,
  folderPath: props.client.folderPath,
  // ... other fields
})
```

**After**:
```javascript
// Validate client context has clientId
if (!props.client || !props.client.clientId) {
  $q.notify({
    type: 'negative',
    message: t('metadata.create.error.clientIdRequired')
  })
  return
}

const response = await api.post('metadata.createCaseMetadata', {
  caseId: caseFormData.caseId,
  caseName: caseFormData.caseName,
  clientId: props.client.clientId,              // ← NEW: Add this line
  clientFirstName: props.client.firstName,
  clientLastName: props.client.lastName,
  clientName: `${props.client.firstName} ${props.client.lastName}`,
  folderName: props.client.folderName,
  folderPath: props.client.folderPath,
  // ... other fields
})
```

**Changes Checklist**:
- [ ] Located case creation code
- [ ] Added clientId validation
- [ ] Added clientId to API call payload
- [ ] Added clientName to payload (composite field)
- [ ] Tested locally (if possible)

#### 4.3: Verify Case Edit Page
**File**: `src/pages/CaseEditPage.vue`

**Verify**:
- [ ] clientId is in data model (okay)
- [ ] clientId is NOT in template (must be hidden)
- [ ] clientId is NOT in updates object sent to API
- [ ] Only clientName is displayed (read-only)

#### 4.4: Run Lint
```bash
cd /Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app
npm run lint
```

**Verification**:
- [ ] Lint passes with 0 errors
- [ ] Lint warnings (if any): _____ warnings
- [ ] All warnings reviewed and acceptable

---

### PHASE 5: Deploy Frontend (Duration: 15 minutes)

#### 5.1: Build Frontend
```bash
cd /Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app
npm run build
```

**Verification**:
- [ ] Build completed successfully
- [ ] No build errors
- [ ] Build warnings reviewed
- [ ] Build output size acceptable

#### 5.2: Deploy to Hosting
```bash
# Follow your deployment process
# Example: npm run deploy OR manual upload
```

**Verification**:
- [ ] Frontend deployed
- [ ] Deployment timestamp: _______________
- [ ] Deployment URL: ____________________

---

### PHASE 6: Data Migration (Duration: 30 minutes)

#### 6.1: Test Migration on Copy (Recommended)
**Create test environment**:
1. Create copy of spreadsheet
2. Configure clasp to point to copy
3. Run migration on copy first

**Steps**:
```javascript
// In Google Apps Script editor (test spreadsheet)
function testMigration() {
  const results = migrateClientIds();
  Logger.log(JSON.stringify(results, null, 2));
  exportMigrationResults(results);
}
```

**Verification**:
- [ ] Test migration run
- [ ] Results sheet created
- [ ] Results reviewed
- [ ] Migration success rate: _____%
- [ ] Ready for production

#### 6.2: Run Production Migration
```javascript
// In Google Apps Script editor (production)
function runProductionMigration() {
  Logger.log('Starting production migration...');
  const results = migrateClientIds();

  Logger.log('Migration results:');
  Logger.log(JSON.stringify(results, null, 2));

  // Export results to sheet
  exportMigrationResults(results);

  Logger.log('✅ Migration complete!');
  return results;
}
```

**Steps**:
1. Open Google Apps Script editor
2. Create function above
3. Run `runProductionMigration()`
4. Monitor execution log
5. Check for errors

**Record Results**:
- [ ] Migration executed
- [ ] Total cases: _____
- [ ] Cases updated: _____
- [ ] Cases already populated: _____
- [ ] Cases not found: _____
- [ ] Duplicate names: _____
- [ ] Results sheet created: ____________________

#### 6.3: Review Migration Results
**Open the results sheet created by migration**

**Check**:
- [ ] Summary section looks correct
- [ ] Not found cases listed (if any)
- [ ] Review each not-found case
- [ ] Note cases requiring manual fix: _____

**For each not-found case**:
1. Find the case row in metadata sheet
2. Find matching client in clients sheet (by name or other identifier)
3. Copy clientId from clients sheet
4. Paste into metadata sheet Column C for that case
5. Mark as resolved

- [ ] All not-found cases resolved
- [ ] No orphaned cases remain

#### 6.4: Run Validation
```javascript
// In Google Apps Script editor
function runValidation() {
  const results = validateClientIds();
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}
```

**Expected Result**:
```
Validation complete!
Total cases: X
  - Valid: X
  - Issues: 0
✅ All cases have valid clientId!
```

**Verification**:
- [ ] Validation executed
- [ ] Total cases: _____
- [ ] Valid cases: _____
- [ ] Issues: _____ (should be 0)
- [ ] 100% success achieved

---

### PHASE 7: Smoke Testing (Duration: 30 minutes)

#### 7.1: Test Case Creation
**Manual Test**:
1. Log in as admin
2. Navigate to a client details page
3. Click "Create New Case"
4. Fill in case details
5. Submit

**Verify**:
- [ ] Case creation successful
- [ ] Success notification shown
- [ ] Check metadata sheet:
  - [ ] New row exists
  - [ ] Column C (clientId) is populated
  - [ ] clientId matches client's UUID
  - [ ] All other columns correct

#### 7.2: Test Case Editing
**Manual Test**:
1. Open existing case for editing
2. Change case name
3. Save changes

**Verify**:
- [ ] Update successful
- [ ] Success notification shown
- [ ] Check metadata sheet:
  - [ ] Case name updated
  - [ ] Column C (clientId) UNCHANGED
  - [ ] Version incremented

#### 7.3: Test Case Search
**Manual Test**:
1. Search for cases by client name
2. View search results
3. Click on a result

**Verify**:
- [ ] Search returns results
- [ ] clientId NOT visible in results
- [ ] Only clientName shown
- [ ] Case details page loads
- [ ] clientId NOT visible on details page

#### 7.4: Test Error Scenarios
**Test A: Try to update clientId** (should fail):
```javascript
// Using browser console or API test tool
api.post('metadata.updateCaseMetadata', {
  caseId: 'SOME-CASE-ID',
  version: 0,
  updates: {
    caseName: 'Updated Name',
    clientId: 'different-uuid'  // This should be rejected
  }
})
```

**Expected**:
- [ ] Error returned
- [ ] Error message: "Client cannot be changed after case creation"
- [ ] clientId unchanged in sheet

**Test B: Try to create case without clientId** (should fail if manually crafted):
- [ ] Error returned
- [ ] Error message: "Client identifier is required"

---

## 📊 Post-Deployment Monitoring

### 24-Hour Monitoring Checklist

**Hour 1**:
- [ ] Check error logs for clientId-related errors
- [ ] Monitor case creation success rate
- [ ] Check for user-reported issues
- [ ] Verify no data corruption

**Hour 4**:
- [ ] Review error logs again
- [ ] Check case creation metrics
- [ ] Verify data integrity (random sample)

**Hour 12**:
- [ ] Full error log review
- [ ] Case creation/update metrics review
- [ ] User feedback review

**Hour 24**:
- [ ] Final error log review
- [ ] Final data integrity check
- [ ] Run validateClientIds() again
- [ ] Document any issues

**Metrics to Track**:
- Case creation success rate: Target > 95%
- clientId validation errors: Target = 0
- User-reported issues: Target = 0
- Data integrity: Target = 100%

---

## 🚨 Rollback Procedure

### Triggers for Rollback
Initiate rollback if any of:
- [ ] Case creation failure rate > 10%
- [ ] Data corruption detected
- [ ] Critical user-blocking bug
- [ ] More than 5% orphaned cases after migration

### Rollback Steps

#### 1. Restore Data (if needed)
```
1. Open Google Sheets
2. Delete current metadata sheet
3. Rename backup sheet to "metadata"
4. Verify data integrity
```

#### 2. Rollback Backend Code
```bash
cd gas/
git checkout <previous-commit-hash>
npx clasp push --force
```

#### 3. Rollback Frontend Code
```bash
git checkout <previous-commit-hash>
npm run build
# Deploy previous build
```

#### 4. Communication
- [ ] Notify all users of rollback
- [ ] Post incident report
- [ ] Schedule post-mortem
- [ ] Plan re-deployment

---

## ✅ Deployment Success Criteria

### Must Have
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Column C inserted in metadata sheet
- [ ] Migration completed with > 95% success
- [ ] All orphaned cases resolved
- [ ] Validation shows 100% data integrity
- [ ] Smoke tests all passed
- [ ] No critical errors in first hour

### Should Have
- [ ] Case creation success rate > 95% in first 24h
- [ ] Zero clientId validation errors
- [ ] Zero user-reported critical issues
- [ ] Documentation updated
- [ ] Team trained on new flow

### Nice to Have
- [ ] Migration completed with 100% automatic success
- [ ] Zero manual fixes required
- [ ] User feedback positive
- [ ] Performance metrics unchanged

---

## 📞 Support Contacts

**During Deployment**:
- Developer: _______________________
- Admin: __________________________
- Backup Contact: _________________

**Emergency Contacts** (if rollback needed):
- Primary: ________________________
- Secondary: ______________________

---

## 📝 Deployment Log

| Step | Status | Timestamp | Duration | Notes |
|------|--------|-----------|----------|-------|
| Phase 1.1: Create Backup | ⬜ | | | |
| Phase 1.2: Download CSV | ⬜ | | | |
| Phase 2.1: Insert Column C | ⬜ | | | |
| Phase 2.2: Verify Data | ⬜ | | | |
| Phase 3.1: Deploy Backend | ⬜ | | | |
| Phase 3.2: Test Backend | ⬜ | | | |
| Phase 4: Frontend Integration | ⬜ | | | |
| Phase 5: Deploy Frontend | ⬜ | | | |
| Phase 6.2: Run Migration | ⬜ | | | |
| Phase 6.3: Review Results | ⬜ | | | |
| Phase 6.4: Run Validation | ⬜ | | | |
| Phase 7: Smoke Testing | ⬜ | | | |

**Deployment Complete**: ⬜
**Timestamp**: _______________________
**Deployed By**: _____________________
**Verification**: ____________________

---

**Last Updated**: 2025-10-18
**Document Version**: 1.0
**Status**: Ready for Execution
