# Feature 006: Metadata Sheet Client Correlation - Implementation Plan

**Feature**: Add `clientId` field to metadata sheet for proper client-case correlation
**Date**: 2025-10-18
**Status**: Ready for Implementation
**Estimated Duration**: 9 days

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Phases](#implementation-phases)
3. [Phase 0: Pre-Implementation Setup](#phase-0-pre-implementation-setup)
4. [Phase 1: Backend Sheet Structure](#phase-1-backend-sheet-structure)
5. [Phase 2: Backend Handlers](#phase-2-backend-handlers)
6. [Phase 3: Frontend Integration](#phase-3-frontend-integration)
7. [Phase 4: Data Migration](#phase-4-data-migration)
8. [Phase 5: Testing & Validation](#phase-5-testing--validation)
9. [Phase 6: Deployment](#phase-6-deployment)
10. [Rollback Plan](#rollback-plan)
11. [Checklist](#checklist)

---

## Overview

### Objectives

1. Add `clientId` column to metadata sheet (Column C)
2. Update all backend code to handle clientId
3. Ensure clientId is hidden from all user interfaces
4. Migrate existing case data to include clientId
5. Validate data integrity
6. Deploy to production

### Key Principles

- **System-Managed**: clientId is auto-populated, never user-editable
- **Hidden from Users**: clientId never appears in any UI
- **Data Integrity**: clientId must reference valid client in clients sheet
- **Immutable**: clientId cannot be changed after case creation
- **Backward Compatible**: Handle existing cases gracefully during migration

---

## Implementation Phases

```
Phase 0: Pre-Implementation Setup (1 day)
├── Backup metadata sheet
├── Create test environment
└── Set up tracking document

Phase 1: Backend Sheet Structure (2 days)
├── Update column mapping constants
├── Modify SheetsService.createCase()
├── Modify SheetsService.getCaseById()
├── Modify SheetsService.searchCasesByName()
├── Modify SheetsService.updateCase()
└── Add validation helpers

Phase 2: Backend Handlers (1 day)
├── Update MetadataHandler.createCaseMetadata()
├── Update MetadataHandler.updateCaseMetadata()
├── Update MetadataHandler.getCaseForEdit()
├── Update MetadataHandler.searchCasesByName()
└── Add i18n error messages

Phase 3: Frontend Integration (1 day)
├── Update case creation flow (pass clientId)
├── Verify clientId hidden in all UIs
└── Update API call payloads

Phase 4: Data Migration (1 day)
├── Write migration script
├── Test on copy of data
├── Run migration on production
└── Manual review of results

Phase 5: Testing & Validation (2 days)
├── Unit tests (backend)
├── Integration tests (end-to-end)
├── Manual UI testing
└── Data integrity validation

Phase 6: Deployment (1 day)
├── Deploy backend code
├── Deploy frontend code
├── Smoke testing
└── Monitoring

Total: 9 days
```

---

## Phase 0: Pre-Implementation Setup

**Duration**: 1 day
**Owner**: Developer + Admin

### Tasks

#### 0.1: Create Backup

**Action**: Backup metadata sheet before any changes

```javascript
// Script: gas/migrations/backupMetadataSheet.gs
function backupMetadataSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const metadataSheet = ss.getSheetByName('metadata')

  // Create backup copy
  const backupName = `metadata_backup_${new Date().toISOString().split('T')[0]}`
  const backup = metadataSheet.copyTo(ss)
  backup.setName(backupName)

  Logger.log(`Backup created: ${backupName}`)
  return backupName
}
```

**Checklist**:
- [ ] Run backupMetadataSheet()
- [ ] Verify backup sheet exists
- [ ] Note backup sheet name
- [ ] Download backup as CSV (extra safety)

---

#### 0.2: Set Up Test Environment

**Action**: Create test metadata sheet with sample data

**Checklist**:
- [ ] Create test Google Sheet
- [ ] Copy 10-20 sample rows from production
- [ ] Create matching test clients sheet
- [ ] Configure clasp for test environment
- [ ] Verify test data loads in dev environment

---

#### 0.3: Create Tracking Document

**Action**: Document progress and issues

**Template**:
```markdown
# Feature 006 Implementation Tracking

## Start Date: [DATE]
## Target Completion: [DATE + 9 days]

### Daily Progress
- Day 1 (Phase 0):
- Day 2 (Phase 1):
- Day 3 (Phase 1):
...

### Issues Encountered
1. [Issue description] - [Resolution]

### Rollback Triggers
- [ ] Data corruption detected
- [ ] More than 5% orphaned cases
- [ ] Production errors > 10%
```

**Checklist**:
- [ ] Create tracking document
- [ ] Share with team
- [ ] Set daily update reminders

---

## Phase 1: Backend Sheet Structure

**Duration**: 2 days
**Files**: `gas/services/SheetsService.gs`

### Tasks

#### 1.1: Add clientId Column to Metadata Sheet

**Action**: Manually insert column in Google Sheets

**Steps**:
1. Open metadata sheet
2. Right-click on Column C (clientName)
3. Select "Insert 1 column left"
4. Set header in C1: `clientId`
5. Format column as plain text (not formula)

**Verification**:
```
Expected structure:
A: caseId
B: caseName
C: clientId      ← NEW (empty for existing rows)
D: clientName    ← Shifted from C
E: assignedTo    ← Shifted from D
...
```

**Checklist**:
- [ ] Column C inserted
- [ ] Header set to "clientId"
- [ ] All existing data shifted correctly
- [ ] No data loss in adjacent columns

---

#### 1.2: Update Column Mapping Constants

**File**: `gas/services/SheetsService.gs`

**Current Code** (lines ~10-25):
```javascript
const METADATA_COLUMNS = {
  CASE_ID: 0,       // A
  CASE_NAME: 1,     // B
  CLIENT_NAME: 2,   // C ← Will shift to D
  ASSIGNED_TO: 3,   // D ← Will shift to E
  CASE_TYPE: 4,     // E ← Will shift to F
  STATUS: 5,        // F ← Will shift to G
  NOTES: 6,         // G ← Will shift to H
  CREATED_BY: 7,    // H ← Will shift to I
  CREATED_AT: 8,    // I ← Will shift to J
  ASSIGNED_AT: 9,   // J ← Will shift to K
  LAST_UPDATED_BY: 10, // K ← Will shift to L
  LAST_UPDATED_AT: 11, // L ← Will shift to M
  VERSION: 12       // M ← Will shift to N
}
```

**New Code**:
```javascript
const METADATA_COLUMNS = {
  CASE_ID: 0,       // A (unchanged)
  CASE_NAME: 1,     // B (unchanged)
  CLIENT_ID: 2,     // C ← NEW
  CLIENT_NAME: 3,   // D ← Shifted from C
  ASSIGNED_TO: 4,   // E ← Shifted from D
  CASE_TYPE: 5,     // F ← Shifted from E
  STATUS: 6,        // G ← Shifted from F
  NOTES: 7,         // H ← Shifted from G
  CREATED_BY: 8,    // I ← Shifted from H
  CREATED_AT: 9,    // J ← Shifted from I
  ASSIGNED_AT: 10,  // K ← Shifted from J
  LAST_UPDATED_BY: 11, // L ← Shifted from K
  LAST_UPDATED_AT: 12, // M ← Shifted from L
  VERSION: 13       // N ← Shifted from M
}
```

**Implementation**:
```bash
# Use Edit tool to update the constant object
# Ensure all indices are shifted by +1 after CLIENT_NAME
```

**Verification**:
- [ ] All column indices updated
- [ ] CLIENT_ID added at index 2
- [ ] All subsequent indices incremented by 1
- [ ] Comments updated with correct letters

---

#### 1.3: Add Validation Helper Functions

**File**: `gas/services/SheetsService.gs`

**Add After Column Constants**:
```javascript
/**
 * Validates if a string is a valid UUID format
 * @param {string} uuid - The UUID to validate
 * @returns {boolean} True if valid UUID format
 */
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Gets client by clientId from clients sheet
 * @param {string} clientId - The client UUID to lookup
 * @returns {Object|null} Client object or null if not found
 */
function getClientById(clientId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const clientsSheet = ss.getSheetByName('clients')

  if (!clientsSheet) {
    throw new Error('Clients sheet not found')
  }

  const data = clientsSheet.getDataRange().getValues()

  // Search for client by clientId (Column A)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clientId) {
      return {
        clientId: data[i][0],
        firstName: data[i][1],
        lastName: data[i][2],
        nationalId: data[i][3],
        telephone: data[i][4] || '',
        email: data[i][5] || '',
        folderId: data[i][6] || ''
      }
    }
  }

  return null
}
```

**Checklist**:
- [ ] isValidUUID() function added
- [ ] getClientById() function added
- [ ] Functions include JSDoc comments
- [ ] Test both functions with sample data

---

#### 1.4: Update createCase() Method

**File**: `gas/services/SheetsService.gs`

**Current Method** (approximate line 50-100):
```javascript
createCase: function(caseData, currentUser) {
  const sheet = this.getMetadataSheet()
  const now = DateUtil.getCurrentTimestamp()

  const rowData = [
    caseData.caseId,
    caseData.caseName || '',
    caseData.clientName,        // Column C → Will become D
    caseData.assignedTo || '',  // Column D → Will become E
    caseData.caseType || '',
    caseData.status || '',
    caseData.notes || '',
    currentUser,
    now,
    caseData.assignedAt || '',
    currentUser,
    now,
    1  // version
  ]

  sheet.appendRow(rowData)

  return {
    caseId: caseData.caseId,
    caseName: caseData.caseName,
    clientName: caseData.clientName,
    // ... other fields
  }
}
```

**Updated Method**:
```javascript
createCase: function(caseData, currentUser) {
  // ========================================
  // VALIDATION: clientId is required
  // ========================================
  if (!caseData.clientId) {
    throw new Error('clientId is required for case creation')
  }

  // ========================================
  // VALIDATION: clientId must be valid UUID
  // ========================================
  if (!isValidUUID(caseData.clientId)) {
    throw new Error('clientId must be a valid UUID format')
  }

  // ========================================
  // VALIDATION: clientId must exist in clients sheet
  // ========================================
  const client = getClientById(caseData.clientId)
  if (!client) {
    throw new Error(`Client with ID ${caseData.clientId} not found in clients sheet`)
  }

  const sheet = this.getMetadataSheet()
  const now = DateUtil.getCurrentTimestamp()

  // ========================================
  // ROW DATA: Include clientId in Column C
  // ========================================
  const rowData = [
    caseData.caseId,                    // A: caseId
    caseData.caseName || '',            // B: caseName
    caseData.clientId,                  // C: clientId ← NEW
    caseData.clientName,                // D: clientName (shifted)
    caseData.assignedTo || '',          // E: assignedTo (shifted)
    caseData.caseType || '',            // F: caseType (shifted)
    caseData.status || '',              // G: status (shifted)
    caseData.notes || '',               // H: notes (shifted)
    currentUser,                        // I: createdBy (shifted)
    now,                                // J: createdAt (shifted)
    caseData.assignedAt || '',          // K: assignedAt (shifted)
    currentUser,                        // L: lastUpdatedBy (shifted)
    now,                                // M: lastUpdatedAt (shifted)
    1                                   // N: version (shifted)
  ]

  sheet.appendRow(rowData)

  // ========================================
  // RETURN: Include clientId in response
  // ========================================
  return {
    caseId: caseData.caseId,
    caseName: caseData.caseName,
    clientId: caseData.clientId,        // ← NEW: Return clientId
    clientName: caseData.clientName,
    assignedTo: caseData.assignedTo,
    caseType: caseData.caseType,
    status: caseData.status,
    notes: caseData.notes,
    createdBy: currentUser,
    createdAt: now,
    assignedAt: caseData.assignedAt,
    lastUpdatedBy: currentUser,
    lastUpdatedAt: now,
    version: 1
  }
}
```

**Checklist**:
- [ ] clientId validation added (required)
- [ ] clientId format validation added (UUID)
- [ ] clientId existence validation added
- [ ] clientId added to rowData at index 2
- [ ] All subsequent rowData indices shifted
- [ ] clientId included in return object
- [ ] Error messages are clear and actionable

---

#### 1.5: Update getCaseById() Method

**File**: `gas/services/SheetsService.gs`

**Current Method**:
```javascript
getCaseById: function(caseId) {
  const sheet = this.getMetadataSheet()
  const data = sheet.getDataRange().getValues()

  for (let i = 1; i < data.length; i++) {
    if (data[i][METADATA_COLUMNS.CASE_ID] === caseId) {
      return {
        caseId: data[i][METADATA_COLUMNS.CASE_ID],
        caseName: data[i][METADATA_COLUMNS.CASE_NAME],
        clientName: data[i][METADATA_COLUMNS.CLIENT_NAME],
        assignedTo: data[i][METADATA_COLUMNS.ASSIGNED_TO],
        // ... other fields
      }
    }
  }

  return null
}
```

**Updated Method**:
```javascript
getCaseById: function(caseId) {
  const sheet = this.getMetadataSheet()
  const data = sheet.getDataRange().getValues()

  for (let i = 1; i < data.length; i++) {
    if (data[i][METADATA_COLUMNS.CASE_ID] === caseId) {
      return {
        caseId: data[i][METADATA_COLUMNS.CASE_ID],
        caseName: data[i][METADATA_COLUMNS.CASE_NAME],
        clientId: data[i][METADATA_COLUMNS.CLIENT_ID],      // ← NEW
        clientName: data[i][METADATA_COLUMNS.CLIENT_NAME],
        assignedTo: data[i][METADATA_COLUMNS.ASSIGNED_TO],
        caseType: data[i][METADATA_COLUMNS.CASE_TYPE],
        status: data[i][METADATA_COLUMNS.STATUS],
        notes: data[i][METADATA_COLUMNS.NOTES],
        createdBy: data[i][METADATA_COLUMNS.CREATED_BY],
        createdAt: data[i][METADATA_COLUMNS.CREATED_AT],
        assignedAt: data[i][METADATA_COLUMNS.ASSIGNED_AT],
        lastUpdatedBy: data[i][METADATA_COLUMNS.LAST_UPDATED_BY],
        lastUpdatedAt: data[i][METADATA_COLUMNS.LAST_UPDATED_AT],
        version: data[i][METADATA_COLUMNS.VERSION]
      }
    }
  }

  return null
}
```

**Checklist**:
- [ ] clientId added to return object
- [ ] Uses METADATA_COLUMNS.CLIENT_ID constant
- [ ] All other fields still present

---

#### 1.6: Update searchCasesByName() Method

**File**: `gas/services/SheetsService.gs`

**Current Method**:
```javascript
searchCasesByName: function(firstName, lastName) {
  const sheet = this.getMetadataSheet()
  const data = sheet.getDataRange().getValues()
  const results = []

  const searchName = `${firstName} ${lastName}`.toLowerCase()

  for (let i = 1; i < data.length; i++) {
    const clientName = data[i][METADATA_COLUMNS.CLIENT_NAME].toLowerCase()

    if (clientName.includes(searchName)) {
      results.push({
        caseId: data[i][METADATA_COLUMNS.CASE_ID],
        caseName: data[i][METADATA_COLUMNS.CASE_NAME],
        clientName: data[i][METADATA_COLUMNS.CLIENT_NAME],
        // ... other fields
      })
    }
  }

  return results
}
```

**Updated Method**:
```javascript
searchCasesByName: function(firstName, lastName) {
  const sheet = this.getMetadataSheet()
  const data = sheet.getDataRange().getValues()
  const results = []

  const searchName = `${firstName} ${lastName}`.toLowerCase()

  for (let i = 1; i < data.length; i++) {
    const clientName = data[i][METADATA_COLUMNS.CLIENT_NAME].toLowerCase()

    if (clientName.includes(searchName)) {
      results.push({
        caseId: data[i][METADATA_COLUMNS.CASE_ID],
        caseName: data[i][METADATA_COLUMNS.CASE_NAME],
        clientId: data[i][METADATA_COLUMNS.CLIENT_ID],      // ← NEW
        clientName: data[i][METADATA_COLUMNS.CLIENT_NAME],
        assignedTo: data[i][METADATA_COLUMNS.ASSIGNED_TO],
        caseType: data[i][METADATA_COLUMNS.CASE_TYPE],
        status: data[i][METADATA_COLUMNS.STATUS],
        notes: data[i][METADATA_COLUMNS.NOTES],
        createdBy: data[i][METADATA_COLUMNS.CREATED_BY],
        createdAt: data[i][METADATA_COLUMNS.CREATED_AT],
        lastUpdatedBy: data[i][METADATA_COLUMNS.LAST_UPDATED_BY],
        lastUpdatedAt: data[i][METADATA_COLUMNS.LAST_UPDATED_AT],
        version: data[i][METADATA_COLUMNS.VERSION]
      })
    }
  }

  return results
}
```

**Checklist**:
- [ ] clientId added to results
- [ ] Uses METADATA_COLUMNS.CLIENT_ID constant

---

#### 1.7: Update updateCase() Method

**File**: `gas/services/SheetsService.gs`

**Current Method**:
```javascript
updateCase: function(caseId, updates, version, currentUser) {
  const sheet = this.getMetadataSheet()
  const data = sheet.getDataRange().getValues()

  // Find case row
  for (let i = 1; i < data.length; i++) {
    if (data[i][METADATA_COLUMNS.CASE_ID] === caseId) {
      // Version check
      const currentVersion = data[i][METADATA_COLUMNS.VERSION]
      if (currentVersion !== version) {
        throw new Error('Version conflict')
      }

      // Apply updates
      const row = i + 1
      if (updates.caseName !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.CASE_NAME + 1).setValue(updates.caseName)
      }
      if (updates.assignedTo !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.ASSIGNED_TO + 1).setValue(updates.assignedTo)
      }
      // ... other updatable fields

      // Update metadata
      const now = DateUtil.getCurrentTimestamp()
      sheet.getRange(row, METADATA_COLUMNS.LAST_UPDATED_BY + 1).setValue(currentUser)
      sheet.getRange(row, METADATA_COLUMNS.LAST_UPDATED_AT + 1).setValue(now)
      sheet.getRange(row, METADATA_COLUMNS.VERSION + 1).setValue(currentVersion + 1)

      return this.getCaseById(caseId)
    }
  }

  throw new Error('Case not found')
}
```

**Updated Method**:
```javascript
updateCase: function(caseId, updates, version, currentUser) {
  // ========================================
  // VALIDATION: Reject clientId updates
  // ========================================
  if (updates.hasOwnProperty('clientId')) {
    throw new Error('clientId is immutable and cannot be updated')
  }

  const sheet = this.getMetadataSheet()
  const data = sheet.getDataRange().getValues()

  // Find case row
  for (let i = 1; i < data.length; i++) {
    if (data[i][METADATA_COLUMNS.CASE_ID] === caseId) {
      // Version check
      const currentVersion = data[i][METADATA_COLUMNS.VERSION]
      if (currentVersion !== version) {
        throw new Error('Version conflict')
      }

      // Apply updates (clientId NOT allowed)
      const row = i + 1
      if (updates.caseName !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.CASE_NAME + 1).setValue(updates.caseName)
      }
      if (updates.assignedTo !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.ASSIGNED_TO + 1).setValue(updates.assignedTo)
      }
      if (updates.caseType !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.CASE_TYPE + 1).setValue(updates.caseType)
      }
      if (updates.status !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.STATUS + 1).setValue(updates.status)
      }
      if (updates.notes !== undefined) {
        sheet.getRange(row, METADATA_COLUMNS.NOTES + 1).setValue(updates.notes)
      }
      // NOTE: clientId is NOT updatable

      // Update metadata
      const now = DateUtil.getCurrentTimestamp()
      sheet.getRange(row, METADATA_COLUMNS.LAST_UPDATED_BY + 1).setValue(currentUser)
      sheet.getRange(row, METADATA_COLUMNS.LAST_UPDATED_AT + 1).setValue(now)
      sheet.getRange(row, METADATA_COLUMNS.VERSION + 1).setValue(currentVersion + 1)

      return this.getCaseById(caseId)  // Returns with clientId
    }
  }

  throw new Error('Case not found')
}
```

**Checklist**:
- [ ] clientId immutability check added at start
- [ ] Clear error message if clientId in updates
- [ ] Comment added noting clientId is NOT updatable
- [ ] Return value includes clientId (via getCaseById)

---

## Phase 2: Backend Handlers

**Duration**: 1 day
**Files**: `gas/handlers/MetadataHandler.gs`, `src/i18n/*.js`

### Tasks

#### 2.1: Update createCaseMetadata() Handler

**File**: `gas/handlers/MetadataHandler.gs`

**Current Handler** (approximate):
```javascript
createCaseMetadata: function(context) {
  // Admin check
  SecurityInterceptor.requireRole(context.user, 'admin')

  const caseData = context.data

  // Validation
  SecurityInterceptor.validateRequiredFields(caseData, [
    'caseId',
    'clientFirstName',
    'clientLastName',
    'folderName',
    'folderPath'
  ])

  // Create case
  const createdCase = SheetsService.createCase(caseData, context.user.email)

  // Token
  const newToken = TokenManager.generateToken(context.user.email)

  return ResponseHandler.successWithToken(
    'metadata.create.success',
    'Case created successfully',
    { case: createdCase },
    context.user,
    newToken.value
  )
}
```

**Updated Handler**:
```javascript
createCaseMetadata: function(context) {
  // Admin check
  SecurityInterceptor.requireRole(context.user, 'admin')

  const caseData = context.data

  // ========================================
  // VALIDATION: Required fields including clientId
  // ========================================
  SecurityInterceptor.validateRequiredFields(caseData, [
    'caseId',
    'clientId',           // ← NEW: Required field
    'clientFirstName',
    'clientLastName',
    'folderName',
    'folderPath'
  ])

  // ========================================
  // VALIDATION: clientId format (UUID)
  // ========================================
  if (!this._isValidUUID(caseData.clientId)) {
    return ResponseHandler.validationError(
      'clientId must be a valid UUID',
      'metadata.create.error.invalidClientId'
    )
  }

  // ========================================
  // VALIDATION: clientId exists in clients sheet
  // ========================================
  // Note: SheetsService.createCase() will also validate this,
  // but we check here for better error handling
  const client = SheetsService.getClientById(caseData.clientId)
  if (!client) {
    return ResponseHandler.validationError(
      `Client with ID ${caseData.clientId} not found`,
      'metadata.create.error.clientNotFound'
    )
  }

  try {
    // ========================================
    // CREATE: Case with clientId
    // ========================================
    const createdCase = SheetsService.createCase(caseData, context.user.email)

    // Generate new token
    const newToken = TokenManager.generateToken(context.user.email)

    return ResponseHandler.successWithToken(
      'metadata.create.success',
      'Case created successfully',
      {
        case: createdCase  // Includes clientId
      },
      context.user,
      newToken.value
    )
  } catch (error) {
    Logger.log(`Error creating case: ${error.message}`)
    return ResponseHandler.error(
      error.message,
      'metadata.create.error.failed'
    )
  }
},

/**
 * Helper: Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid
 * @private
 */
_isValidUUID: function(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

**Checklist**:
- [ ] clientId added to required fields
- [ ] UUID format validation added
- [ ] Client existence check added
- [ ] Error handling improved
- [ ] _isValidUUID helper method added
- [ ] Comments explain validation steps

---

#### 2.2: Update updateCaseMetadata() Handler

**File**: `gas/handlers/MetadataHandler.gs`

**Current Handler**:
```javascript
updateCaseMetadata: function(context) {
  // Admin check
  SecurityInterceptor.requireRole(context.user, 'admin')

  const { caseId, version, updates } = context.data

  // Validation
  if (!caseId || version === undefined || !updates) {
    return ResponseHandler.validationError(
      'Missing required fields',
      'metadata.update.error.missingFields'
    )
  }

  try {
    const updatedCase = SheetsService.updateCase(
      caseId,
      updates,
      version,
      context.user.email
    )

    const newToken = TokenManager.generateToken(context.user.email)

    return ResponseHandler.successWithToken(
      'metadata.update.success',
      'Case updated successfully',
      { case: updatedCase },
      context.user,
      newToken.value
    )
  } catch (error) {
    // ... error handling
  }
}
```

**Updated Handler**:
```javascript
updateCaseMetadata: function(context) {
  // Admin check
  SecurityInterceptor.requireRole(context.user, 'admin')

  const { caseId, version, updates } = context.data

  // ========================================
  // VALIDATION: Basic required fields
  // ========================================
  if (!caseId || version === undefined || !updates) {
    return ResponseHandler.validationError(
      'Missing required fields',
      'metadata.update.error.missingFields'
    )
  }

  // ========================================
  // VALIDATION: Reject clientId in updates
  // ========================================
  if (updates.hasOwnProperty('clientId')) {
    return ResponseHandler.validationError(
      'clientId is system-managed and cannot be updated',
      'metadata.update.error.clientIdImmutable'
    )
  }

  try {
    const updatedCase = SheetsService.updateCase(
      caseId,
      updates,
      version,
      context.user.email
    )

    const newToken = TokenManager.generateToken(context.user.email)

    return ResponseHandler.successWithToken(
      'metadata.update.success',
      'Case updated successfully',
      {
        case: updatedCase  // Includes clientId (unchanged)
      },
      context.user,
      newToken.value
    )
  } catch (error) {
    Logger.log(`Error updating case: ${error.message}`)

    if (error.message.includes('immutable')) {
      return ResponseHandler.validationError(
        error.message,
        'metadata.update.error.clientIdImmutable'
      )
    }

    if (error.message.includes('Version conflict')) {
      return ResponseHandler.error(
        'Case was modified by another user',
        'metadata.update.error.versionConflict'
      )
    }

    return ResponseHandler.error(
      error.message,
      'metadata.update.error.failed'
    )
  }
}
```

**Checklist**:
- [ ] clientId immutability check added
- [ ] Specific error for clientId update attempt
- [ ] Enhanced error handling for immutability error
- [ ] Comments explain validation

---

#### 2.3: Add i18n Error Messages

**Files**:
- `src/i18n/en-US.js`
- `src/i18n/fr-FR/index.js`

**English** (`src/i18n/en-US.js`):
```javascript
// In metadata section, add:
metadata: {
  create: {
    success: 'Case created successfully',
    error: {
      invalidClientId: 'Invalid client identifier format',
      clientNotFound: 'Client not found in system',
      failed: 'Failed to create case'
    }
  },
  update: {
    success: 'Case updated successfully',
    error: {
      clientIdImmutable: 'Client cannot be changed after case creation',
      missingFields: 'Required fields are missing',
      versionConflict: 'Case was modified by another user. Please refresh and try again.',
      failed: 'Failed to update case'
    }
  }
}
```

**French** (`src/i18n/fr-FR/index.js`):
```javascript
// In metadata section, add:
metadata: {
  create: {
    success: 'Dossier créé avec succès',
    error: {
      invalidClientId: 'Format d\'identifiant client invalide',
      clientNotFound: 'Client introuvable dans le système',
      failed: 'Échec de la création du dossier'
    }
  },
  update: {
    success: 'Dossier mis à jour avec succès',
    error: {
      clientIdImmutable: 'Le client ne peut pas être modifié après la création du dossier',
      missingFields: 'Champs obligatoires manquants',
      versionConflict: 'Le dossier a été modifié par un autre utilisateur. Veuillez actualiser et réessayer.',
      failed: 'Échec de la mise à jour du dossier'
    }
  }
}
```

**Checklist**:
- [ ] English messages added
- [ ] French messages added
- [ ] Messages match error keys in handlers
- [ ] Messages are user-friendly

---

## Phase 3: Frontend Integration

**Duration**: 1 day
**Files**: Case creation/edit components

### Tasks

#### 3.1: Update Case Creation Flow

**File**: `src/pages/ClientDetailsPage.vue` (or wherever cases are created)

**Current Code** (approximate):
```vue
<script setup>
async function createNewCase(caseFormData) {
  try {
    const response = await api.post('metadata.createCaseMetadata', {
      caseId: caseFormData.caseId,
      caseName: caseFormData.caseName,
      clientFirstName: props.client.firstName,
      clientLastName: props.client.lastName,
      folderName: props.client.folderName,
      folderPath: props.client.folderPath,
      caseType: caseFormData.caseType,
      notes: caseFormData.notes
    })

    // Success handling...
  } catch (error) {
    // Error handling...
  }
}
</script>
```

**Updated Code**:
```vue
<script setup>
async function createNewCase(caseFormData) {
  // ========================================
  // VALIDATION: Ensure client context has clientId
  // ========================================
  if (!props.client || !props.client.clientId) {
    $q.notify({
      type: 'negative',
      message: t('errors.clientContextMissing')
    })
    return
  }

  try {
    const response = await api.post('metadata.createCaseMetadata', {
      caseId: caseFormData.caseId,
      caseName: caseFormData.caseName,
      clientId: props.client.clientId,           // ← NEW: Pass clientId
      clientFirstName: props.client.firstName,
      clientLastName: props.client.lastName,
      clientName: `${props.client.firstName} ${props.client.lastName}`,
      folderName: props.client.folderName,
      folderPath: props.client.folderPath,
      caseType: caseFormData.caseType,
      notes: caseFormData.notes
    })

    // Success handling...
    $q.notify({
      type: 'positive',
      message: t('metadata.create.success')
    })

    // Navigate or refresh...
  } catch (error) {
    console.error('Failed to create case:', error)

    // Show appropriate error message
    const errorKey = error.response?.data?.msgKey || 'errors.generic'
    $q.notify({
      type: 'negative',
      message: t(errorKey)
    })
  }
}
</script>
```

**Checklist**:
- [ ] clientId validation added (client context check)
- [ ] clientId passed in API call
- [ ] Error handling enhanced
- [ ] User-friendly error notifications
- [ ] clientId is NOT displayed in UI

---

#### 3.2: Verify Case Edit Page Hides clientId

**File**: `src/pages/CaseEditPage.vue`

**Current Template**:
```vue
<template>
  <q-form @submit="updateCase">
    <!-- Client name (read-only) -->
    <q-input
      v-model="caseData.clientName"
      label="Client"
      readonly
      filled
    />

    <!-- Editable fields -->
    <q-input v-model="caseData.caseName" label="Case Name" />
    <q-input v-model="caseData.assignedTo" label="Assigned To" />
    <!-- ... -->
  </q-form>
</template>
```

**Verification**:
```vue
<template>
  <q-form @submit="updateCase">
    <!-- ✅ CORRECT: Show clientName (read-only) -->
    <q-input
      v-model="caseData.clientName"
      label="Client"
      readonly
      filled
    />

    <!-- ❌ WRONG: Do NOT show clientId -->
    <!-- <q-input v-model="caseData.clientId" label="Client ID" /> -->

    <!-- ✅ CORRECT: Editable fields (clientId NOT included) -->
    <q-input v-model="caseData.caseName" label="Case Name" />
    <q-input v-model="caseData.assignedTo" label="Assigned To" />
    <q-select v-model="caseData.caseType" :options="caseTypes" label="Case Type" />
    <q-select v-model="caseData.status" :options="statuses" label="Status" />
    <q-input v-model="caseData.notes" label="Notes" type="textarea" />
  </q-form>
</template>

<script setup>
const caseData = ref({
  caseId: '',
  caseName: '',
  clientId: '',    // ← Present in data model
  clientName: '',  // ← Displayed in UI
  assignedTo: '',
  caseType: '',
  status: '',
  notes: '',
  version: 0
})

async function updateCase() {
  const updates = {
    caseName: caseData.value.caseName,
    assignedTo: caseData.value.assignedTo,
    caseType: caseData.value.caseType,
    status: caseData.value.status,
    notes: caseData.value.notes
    // ❌ clientId is NOT included in updates
  }

  try {
    await api.post('metadata.updateCaseMetadata', {
      caseId: caseData.value.caseId,
      version: caseData.value.version,
      updates: updates  // Does not contain clientId
    })

    $q.notify({
      type: 'positive',
      message: t('metadata.update.success')
    })
  } catch (error) {
    const errorKey = error.response?.data?.msgKey || 'errors.generic'
    $q.notify({
      type: 'negative',
      message: t(errorKey)
    })
  }
}
</script>
```

**Checklist**:
- [ ] clientId is in data model
- [ ] clientId is NOT in template
- [ ] clientId is NOT in updates object
- [ ] Only clientName is displayed
- [ ] clientName is read-only

---

#### 3.3: Verify Search Results Hide clientId

**File**: `src/components/search/CaseSearchResults.vue` (or similar)

**Check Template**:
```vue
<template>
  <q-list>
    <q-item v-for="caseItem in cases" :key="caseItem.caseId" clickable>
      <q-item-section>
        <q-item-label>{{ caseItem.caseName }}</q-item-label>
        <q-item-label caption>
          Client: {{ caseItem.clientName }}
          <!-- ❌ Do NOT show: {{ caseItem.clientId }} -->
        </q-item-label>
        <q-item-label caption>
          Status: {{ caseItem.status }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
```

**Checklist**:
- [ ] clientId is NOT displayed in search results
- [ ] Only clientName is shown
- [ ] Data model can contain clientId (for internal use)
- [ ] UI never renders clientId

---

## Phase 4: Data Migration

**Duration**: 1 day
**Files**: `gas/migrations/populateClientIds.gs`

### Tasks

#### 4.1: Write Migration Script

**File**: `gas/migrations/populateClientIds.gs`

**Create New File**:
```javascript
/**
 * Feature 006: Migrate existing cases to include clientId
 *
 * This script populates the clientId column (Column C) in the metadata sheet
 * for all existing cases by matching clientName to the clients sheet.
 *
 * IMPORTANT: Run this AFTER inserting Column C manually
 *
 * @author Development Team
 * @date 2025-10-18
 */

/**
 * Main migration function
 * Populates clientId for all existing cases in metadata sheet
 *
 * @returns {Object} Migration results
 */
function migrateClientIds() {
  Logger.log('========================================')
  Logger.log('Starting clientId migration')
  Logger.log('========================================')

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const metadataSheet = ss.getSheetByName('metadata')
  const clientsSheet = ss.getSheetByName('clients')

  if (!metadataSheet) {
    throw new Error('Metadata sheet not found')
  }

  if (!clientsSheet) {
    throw new Error('Clients sheet not found')
  }

  const metadataData = metadataSheet.getDataRange().getValues()
  const clientsData = clientsSheet.getDataRange().getValues()

  // ========================================
  // Build client lookup: fullName -> clientId
  // ========================================
  Logger.log('Building client lookup table...')
  const clientLookup = {}
  const duplicateNames = {}

  for (let i = 1; i < clientsData.length; i++) {
    const clientId = clientsData[i][0]   // Column A
    const firstName = clientsData[i][1]  // Column B
    const lastName = clientsData[i][2]   // Column C
    const fullName = `${firstName} ${lastName}`

    // Track duplicates
    if (clientLookup[fullName]) {
      if (!duplicateNames[fullName]) {
        duplicateNames[fullName] = [clientLookup[fullName]]
      }
      duplicateNames[fullName].push(clientId)
    }

    // Keep last occurrence (will need manual review for duplicates)
    clientLookup[fullName] = clientId
  }

  Logger.log(`Found ${Object.keys(clientLookup).length} unique client names`)

  if (Object.keys(duplicateNames).length > 0) {
    Logger.log('WARNING: Duplicate client names detected:')
    Object.keys(duplicateNames).forEach(name => {
      Logger.log(`  - "${name}": ${duplicateNames[name].length} clients`)
    })
  }

  // ========================================
  // Update metadata rows
  // ========================================
  Logger.log('Updating metadata rows...')
  let updatedCount = 0
  let notFoundCount = 0
  let alreadyPopulatedCount = 0
  const notFoundCases = []

  for (let i = 1; i < metadataData.length; i++) {
    const caseId = metadataData[i][0]         // Column A
    const existingClientId = metadataData[i][2] // Column C
    const clientName = metadataData[i][3]     // Column D (after column insertion)

    // Skip if clientId already populated
    if (existingClientId && existingClientId.toString().trim() !== '') {
      alreadyPopulatedCount++
      continue
    }

    // Lookup clientId by name
    const clientId = clientLookup[clientName]

    if (clientId) {
      // Update Column C with clientId
      metadataSheet.getRange(i + 1, 3).setValue(clientId)
      updatedCount++

      if (updatedCount % 10 === 0) {
        Logger.log(`  Progress: ${updatedCount} cases updated...`)
      }
    } else {
      notFoundCount++
      notFoundCases.push({
        row: i + 1,
        caseId: caseId,
        clientName: clientName
      })
      Logger.log(`  WARNING: No client found for case "${caseId}" (${clientName})`)
    }
  }

  // ========================================
  // Migration summary
  // ========================================
  Logger.log('========================================')
  Logger.log('Migration complete!')
  Logger.log('========================================')
  Logger.log(`Total cases processed: ${metadataData.length - 1}`)
  Logger.log(`  - Updated: ${updatedCount}`)
  Logger.log(`  - Already populated: ${alreadyPopulatedCount}`)
  Logger.log(`  - Not found: ${notFoundCount}`)
  Logger.log('========================================')

  if (notFoundCases.length > 0) {
    Logger.log('Cases requiring manual review:')
    notFoundCases.forEach(item => {
      Logger.log(`  Row ${item.row}: ${item.caseId} - "${item.clientName}"`)
    })
  }

  if (Object.keys(duplicateNames).length > 0) {
    Logger.log('========================================')
    Logger.log('IMPORTANT: Duplicate client names detected!')
    Logger.log('Manual review required for these cases:')
    Object.keys(duplicateNames).forEach(name => {
      Logger.log(`  - "${name}": clientIds = ${duplicateNames[name].join(', ')}`)
    })
  }

  return {
    totalCases: metadataData.length - 1,
    updated: updatedCount,
    alreadyPopulated: alreadyPopulatedCount,
    notFound: notFoundCount,
    notFoundCases: notFoundCases,
    duplicateNames: duplicateNames
  }
}

/**
 * Validation script to check data integrity after migration
 *
 * @returns {Object} Validation results
 */
function validateClientIds() {
  Logger.log('========================================')
  Logger.log('Starting clientId validation')
  Logger.log('========================================')

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const metadataSheet = ss.getSheetByName('metadata')
  const clientsSheet = ss.getSheetByName('clients')

  const metadataData = metadataSheet.getDataRange().getValues()
  const clientsData = clientsSheet.getDataRange().getValues()

  // Build set of valid clientIds
  const validClientIds = new Set()
  for (let i = 1; i < clientsData.length; i++) {
    validClientIds.add(clientsData[i][0])
  }

  Logger.log(`Valid client IDs in system: ${validClientIds.size}`)

  // Check each case
  const issues = []
  let validCount = 0

  for (let i = 1; i < metadataData.length; i++) {
    const caseId = metadataData[i][0]
    const clientId = metadataData[i][2]  // Column C

    if (!clientId || clientId.toString().trim() === '') {
      issues.push({
        row: i + 1,
        caseId: caseId,
        issue: 'Missing clientId'
      })
    } else if (!validClientIds.has(clientId)) {
      issues.push({
        row: i + 1,
        caseId: caseId,
        clientId: clientId,
        issue: 'Orphaned (clientId not found in clients sheet)'
      })
    } else {
      validCount++
    }
  }

  // Validation summary
  Logger.log('========================================')
  Logger.log('Validation complete!')
  Logger.log('========================================')
  Logger.log(`Total cases: ${metadataData.length - 1}`)
  Logger.log(`  - Valid: ${validCount}`)
  Logger.log(`  - Issues: ${issues.length}`)
  Logger.log('========================================')

  if (issues.length > 0) {
    Logger.log('Issues found:')
    issues.forEach(issue => {
      Logger.log(`  Row ${issue.row}: ${issue.caseId} - ${issue.issue}`)
    })
  } else {
    Logger.log('✅ All cases have valid clientId!')
  }

  return {
    totalCases: metadataData.length - 1,
    valid: validCount,
    issues: issues
  }
}

/**
 * Helper: Export migration results to a new sheet for review
 *
 * @param {Object} results - Migration results object
 */
function exportMigrationResults(results) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss')
  const sheetName = `Migration_Results_${timestamp}`

  const resultSheet = ss.insertSheet(sheetName)

  // Write summary
  const summaryData = [
    ['Feature 006: clientId Migration Results'],
    ['Timestamp', new Date()],
    [''],
    ['Summary'],
    ['Total Cases', results.totalCases],
    ['Updated', results.updated],
    ['Already Populated', results.alreadyPopulated],
    ['Not Found', results.notFound],
    [''],
    ['Cases Not Found (Manual Review Required)']
  ]

  resultSheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData)

  // Write not found cases
  if (results.notFoundCases.length > 0) {
    const headers = [['Row', 'Case ID', 'Client Name']]
    const notFoundData = results.notFoundCases.map(item => [
      item.row,
      item.caseId,
      item.clientName
    ])

    resultSheet.getRange(summaryData.length + 1, 1, 1, 3).setValues(headers)
    resultSheet.getRange(summaryData.length + 2, 1, notFoundData.length, 3).setValues(notFoundData)
  }

  Logger.log(`Results exported to sheet: ${sheetName}`)
  return sheetName
}
```

**Checklist**:
- [ ] Migration script created
- [ ] Handles duplicate client names
- [ ] Logs all operations
- [ ] Identifies cases needing manual review
- [ ] Includes validation function
- [ ] Includes results export function

---

#### 4.2: Test Migration on Copy

**Steps**:
1. Create copy of production spreadsheet
2. Insert Column C in metadata sheet
3. Deploy migration script to test environment
4. Run `migrateClientIds()` function
5. Review logs
6. Run `validateClientIds()` function
7. Export results with `exportMigrationResults()`

**Checklist**:
- [ ] Test spreadsheet created
- [ ] Column C inserted
- [ ] Migration script deployed
- [ ] Migration executed successfully
- [ ] Validation passed
- [ ] Results reviewed
- [ ] No data loss confirmed

---

#### 4.3: Run Migration on Production

**Pre-Migration Checklist**:
- [ ] Backup created (Phase 0.1)
- [ ] Test migration successful
- [ ] All stakeholders notified
- [ ] Maintenance window scheduled
- [ ] Rollback plan prepared

**Execution Steps**:
1. Announce maintenance window
2. Verify backup exists
3. Run `migrateClientIds()` in production
4. Monitor logs in real-time
5. Run `validateClientIds()`
6. Export results
7. Review issues

**Post-Migration**:
- [ ] Migration completed
- [ ] Validation passed
- [ ] Issues logged for manual review
- [ ] Success rate > 95%
- [ ] Stakeholders notified

---

#### 4.4: Manual Review and Cleanup

**For Not Found Cases**:
1. Review `notFoundCases` from migration results
2. For each case:
   - Verify client exists in clients sheet
   - Check for name spelling differences
   - Manually set clientId in metadata sheet
3. Re-run validation

**For Duplicate Names**:
1. Review `duplicateNames` from migration results
2. For each duplicate:
   - Examine case details to determine correct client
   - Use additional context (nationalId, folder, dates)
   - Manually update clientId if migration picked wrong client
3. Re-run validation

**Checklist**:
- [ ] All not found cases reviewed
- [ ] All duplicate name cases reviewed
- [ ] Manual corrections applied
- [ ] Final validation passed
- [ ] 100% of cases have valid clientId

---

## Phase 5: Testing & Validation

**Duration**: 2 days

### Tasks

#### 5.1: Backend Unit Tests

**Test File**: `tests/backend/SheetsService.test.js` (if testing framework exists)

**Tests to Write**:

1. **Test: createCase() requires clientId**
```javascript
test('createCase should throw error if clientId missing', () => {
  const caseData = {
    caseId: 'TEST-001',
    caseName: 'Test Case',
    // clientId missing
    clientName: 'John Doe'
  }

  expect(() => {
    SheetsService.createCase(caseData, 'test@example.com')
  }).toThrow('clientId is required')
})
```

2. **Test: createCase() validates UUID format**
```javascript
test('createCase should reject invalid UUID format', () => {
  const caseData = {
    caseId: 'TEST-001',
    clientId: 'not-a-uuid',
    clientName: 'John Doe'
  }

  expect(() => {
    SheetsService.createCase(caseData, 'test@example.com')
  }).toThrow('valid UUID')
})
```

3. **Test: createCase() validates clientId exists**
```javascript
test('createCase should reject non-existent clientId', () => {
  const caseData = {
    caseId: 'TEST-001',
    clientId: '00000000-0000-0000-0000-000000000000',
    clientName: 'John Doe'
  }

  expect(() => {
    SheetsService.createCase(caseData, 'test@example.com')
  }).toThrow('not found')
})
```

4. **Test: updateCase() rejects clientId updates**
```javascript
test('updateCase should reject clientId in updates', () => {
  const updates = {
    caseName: 'Updated Name',
    clientId: 'different-uuid'
  }

  expect(() => {
    SheetsService.updateCase('TEST-001', updates, 1, 'test@example.com')
  }).toThrow('immutable')
})
```

5. **Test: getCaseById() returns clientId**
```javascript
test('getCaseById should include clientId in result', () => {
  const result = SheetsService.getCaseById('TEST-001')

  expect(result).toHaveProperty('clientId')
  expect(result.clientId).toBeDefined()
})
```

**Checklist**:
- [ ] All 5 unit tests written
- [ ] Tests pass
- [ ] Coverage > 90% for modified code

---

#### 5.2: Integration Tests

**Test Scenarios**:

1. **End-to-End Case Creation**
   - Create client in clients sheet
   - Note clientId
   - Create case via API
   - Verify metadata sheet has clientId in Column C
   - Verify clientId matches

2. **Case Update Immutability**
   - Load existing case
   - Attempt to update clientId via API
   - Verify error returned
   - Verify clientId unchanged in sheet

3. **Search Results Include clientId**
   - Search for cases
   - Verify results include clientId
   - Verify clientId not displayed in UI

**Checklist**:
- [ ] E2E case creation test passed
- [ ] Case update immutability test passed
- [ ] Search results test passed

---

#### 5.3: Manual UI Testing

**Test Checklist**:

**Case Creation**:
- [ ] Create case from client details page
- [ ] Verify clientId NOT visible in form
- [ ] Verify case created successfully
- [ ] Check metadata sheet has clientId

**Case Editing**:
- [ ] Open case for editing
- [ ] Verify clientId NOT visible
- [ ] Verify clientName shown (read-only)
- [ ] Edit other fields
- [ ] Save changes
- [ ] Verify clientId unchanged in sheet

**Search Results**:
- [ ] Search for cases
- [ ] Verify results show clientName
- [ ] Verify results do NOT show clientId
- [ ] Click result to view details
- [ ] Verify clientId NOT visible in details

**Error Handling**:
- [ ] Attempt to create case without client context
- [ ] Verify user-friendly error shown
- [ ] Verify error message is localized (English/French)

---

#### 5.4: Data Validation

**Run Validation Script**:
```javascript
// In Google Apps Script
function runFinalValidation() {
  const results = validateClientIds()

  if (results.issues.length === 0) {
    Logger.log('✅ All validations passed!')
  } else {
    Logger.log(`❌ ${results.issues.length} issues found`)
    exportMigrationResults(results)
  }

  return results
}
```

**Success Criteria**:
- [ ] 100% of cases have clientId
- [ ] 100% of clientIds are valid UUIDs
- [ ] 100% of clientIds match clients sheet
- [ ] 0 orphaned cases
- [ ] 0 null/empty clientIds

---

## Phase 6: Deployment

**Duration**: 1 day

### Tasks

#### 6.1: Deploy Backend Code

**Steps**:
1. Verify all backend changes committed
2. Run final tests
3. Deploy to Google Apps Script

```bash
# Deploy backend
cd gas/
npx clasp push --force

# Note: May need to create new version for web app
# Google Apps Script > Deploy > New deployment
```

**Checklist**:
- [ ] Backend code deployed
- [ ] New web app version created (if needed)
- [ ] Deployment logged
- [ ] Smoke test passed (ping endpoint)

---

#### 6.2: Deploy Frontend Code

**Steps**:
1. Verify all frontend changes committed
2. Run lint
3. Run build
4. Deploy

```bash
# Lint
npm run lint

# Build
npm run build

# Deploy (follow your deployment process)
# npm run deploy OR manual upload to hosting
```

**Checklist**:
- [ ] Lint passed
- [ ] Build successful
- [ ] Frontend deployed
- [ ] Deployment verified

---

#### 6.3: Smoke Testing

**Test Scenarios**:

1. **Create New Case**
   - [ ] Navigate to client details
   - [ ] Click "Create New Case"
   - [ ] Fill form
   - [ ] Submit
   - [ ] Verify success notification
   - [ ] Check metadata sheet for clientId

2. **Edit Existing Case**
   - [ ] Open case from search
   - [ ] Edit case name
   - [ ] Save
   - [ ] Verify update successful
   - [ ] Verify clientId unchanged

3. **Session Extension**
   - [ ] Wait for session warning (14 minutes)
   - [ ] Click "Extend Session"
   - [ ] Verify session extended
   - [ ] Verify token includes clientId in next API call

4. **Multi-language**
   - [ ] Switch to French
   - [ ] Create case
   - [ ] Verify French messages shown
   - [ ] Switch to English
   - [ ] Edit case
   - [ ] Verify English messages shown

**Checklist**:
- [ ] All smoke tests passed
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable

---

#### 6.4: Monitoring

**Metrics to Monitor** (first 24 hours):
- Case creation success rate
- Case update success rate
- clientId validation errors
- User-reported issues

**Monitoring Checklist**:
- [ ] No spike in error rate
- [ ] Case creation rate normal
- [ ] No user reports of blocking issues
- [ ] Data integrity maintained

---

## Rollback Plan

### Triggers for Rollback

Initiate rollback if:
- [ ] More than 10% of case creations failing
- [ ] Data corruption detected in metadata sheet
- [ ] Critical user-reported bug blocking case management
- [ ] Performance degradation > 50%

### Rollback Steps

#### 1. Backend Rollback

```bash
# Revert to previous deployment
cd gas/
git checkout <previous-commit-hash>
npx clasp push --force

# Or: Restore from backup script
# Manually revert code changes in Google Apps Script editor
```

#### 2. Frontend Rollback

```bash
# Revert to previous version
git checkout <previous-commit-hash>
npm run build
# Deploy previous build
```

#### 3. Data Rollback

**Option A: Keep clientId column (recommended)**
- Leave Column C in metadata sheet
- Allow null clientIds temporarily
- Fix code issues
- Re-run migration when ready

**Option B: Remove clientId column (if corruption)**
1. Open metadata sheet
2. Delete Column C (clientId)
3. All data shifts back
4. Restore from backup if needed

#### 4. Communication

- [ ] Notify all users of rollback
- [ ] Post incident report
- [ ] Schedule post-mortem
- [ ] Plan re-deployment

---

## Checklist

### Pre-Implementation
- [ ] Specification reviewed and approved
- [ ] Implementation plan reviewed
- [ ] Team assigned
- [ ] Timeline confirmed
- [ ] Backup strategy confirmed

### Phase 0: Pre-Implementation Setup
- [ ] Metadata sheet backed up
- [ ] Test environment created
- [ ] Tracking document created

### Phase 1: Backend Sheet Structure
- [ ] Column C inserted in metadata sheet
- [ ] Column mapping constants updated
- [ ] Validation helpers added
- [ ] createCase() updated
- [ ] getCaseById() updated
- [ ] searchCasesByName() updated
- [ ] updateCase() updated
- [ ] All backend changes tested

### Phase 2: Backend Handlers
- [ ] createCaseMetadata() updated
- [ ] updateCaseMetadata() updated
- [ ] i18n messages added (English)
- [ ] i18n messages added (French)
- [ ] Handler changes tested

### Phase 3: Frontend Integration
- [ ] Case creation flow updated
- [ ] Case edit page verified
- [ ] Search results verified
- [ ] clientId hidden from all UIs
- [ ] Frontend changes tested

### Phase 4: Data Migration
- [ ] Migration script written
- [ ] Migration tested on copy
- [ ] Migration run on production
- [ ] Manual review completed
- [ ] Final validation passed

### Phase 5: Testing & Validation
- [ ] Backend unit tests passed
- [ ] Integration tests passed
- [ ] Manual UI testing passed
- [ ] Data validation passed

### Phase 6: Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Smoke testing passed
- [ ] Monitoring in place
- [ ] No critical issues

### Post-Deployment
- [ ] Final validation run
- [ ] Stakeholders notified
- [ ] Documentation updated
- [ ] Feature marked as complete

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Status**: Ready for Implementation
**Next Step**: Begin Phase 0 - Pre-Implementation Setup
