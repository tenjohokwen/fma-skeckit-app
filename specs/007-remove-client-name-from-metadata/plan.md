# Feature 007: Remove clientName from Metadata Sheet - Implementation Plan

**Feature**: Remove clientName redundancy and enforce data consistency
**Date**: 2025-10-18
**Status**: Ready for Implementation
**Estimated Duration**: 8 days
**Dependencies**: Feature 006 must be deployed and stable

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Phases](#implementation-phases)
3. [Phase 0: Prerequisites](#phase-0-prerequisites)
4. [Phase 1: Backend Client Name Enrichment](#phase-1-backend-client-name-enrichment)
5. [Phase 2: Client Folder Renaming](#phase-2-client-folder-renaming)
6. [Phase 3: Frontend UI Updates](#phase-3-frontend-ui-updates)
7. [Phase 4: Testing (With Column)](#phase-4-testing-with-column)
8. [Phase 5: Schema Change](#phase-5-schema-change)
9. [Phase 6: Deployment & Validation](#phase-6-deployment--validation)
10. [Rollback Plan](#rollback-plan)
11. [Checklist](#checklist)

---

## Overview

### Implementation Strategy

**IMPORTANT**: This feature uses a **phased approach** where code is deployed BEFORE schema changes:

```
Phase 1-3: Deploy Code (clientName column still exists)
    ↓
Phase 4: Test Everything (with redundant column)
    ↓
Phase 5: Remove Column (schema change)
    ↓
Phase 6: Final Validation
```

**Why This Approach?**
- Safer: Code tested before irreversible schema change
- Easier rollback: Can revert code without restoring data
- Verifiable: Confirm enrichment works while column still exists

### Key Principles

1. **Backward Compatible**: API responses still include clientName
2. **Performance Optimized**: Batch client lookups for multiple cases
3. **Error Tolerant**: Missing clients handled gracefully
4. **Non-Breaking**: Frontend continues to work as-is

---

## Implementation Phases

```
Phase 0: Prerequisites (0.5 days)
├── Verify Feature 006 deployed and stable
├── Review specification
└── Set up tracking document

Phase 1: Backend Client Name Enrichment (2 days)
├── Add enrichment helpers to SheetsService
├── Update getCaseById()
├── Update searchCasesByName()
├── Update createCase()
└── Update updateCase()

Phase 2: Client Folder Renaming (1 day)
├── Add renameFolder() to DriveService
├── Update ClientHandler.update()
└── Add folder name builder

Phase 3: Frontend UI Updates (1 day)
├── Make client name readonly in case details
├── Add i18n messages
└── Remove clientName from update payloads

Phase 4: Testing (With Column) (1.5 days)
├── Unit tests
├── Integration tests
└── Manual testing

Phase 5: Schema Change (0.5 days)
├── Backup metadata sheet
├── Delete Column D
└── Verify column shift

Phase 6: Deployment & Validation (1.5 days)
├── Deploy to production
├── Smoke testing
└── Monitor for 24 hours

Total: 8 days
```

---

## Phase 0: Prerequisites

**Duration**: 0.5 days (4 hours)
**Owner**: Developer + Admin

### Task 0.1: Verify Feature 006 Status

**Prerequisites**:
- [ ] Feature 006 fully deployed to production
- [ ] Column C (clientId) exists in metadata sheet
- [ ] All cases have valid clientId values
- [ ] No pending Feature 006 issues

**Verification Steps**:
```javascript
// Run in Google Apps Script
function verifyFeature006() {
  const sheet = SheetsService.getMetadataSheet();
  const data = sheet.getDataRange().getValues();

  // Check column count (should be 14 after Feature 006)
  const columnCount = data[0].length;
  Logger.log(`Column count: ${columnCount}`); // Should be 14

  // Check header C is "clientId"
  Logger.log(`Column C header: ${data[0][2]}`); // Should be "clientId"

  // Check header D is "clientName"
  Logger.log(`Column D header: ${data[0][3]}`); // Should be "clientName"

  // Check all cases have clientId
  let missingClientId = 0;
  for (let i = 1; i < data.length; i++) {
    if (!data[i][2]) {
      missingClientId++;
      Logger.log(`Row ${i + 1}: Missing clientId`);
    }
  }

  Logger.log(`Cases missing clientId: ${missingClientId}`); // Should be 0

  return {
    columnCount: columnCount,
    columnCHeader: data[0][2],
    columnDHeader: data[0][3],
    missingClientId: missingClientId
  };
}
```

**Success Criteria**:
- [ ] Column count = 14
- [ ] Column C header = "clientId"
- [ ] Column D header = "clientName"
- [ ] Missing clientId count = 0

---

### Task 0.2: Create Implementation Tracking Document

**File**: `specs/007-remove-client-name-from-metadata/IMPLEMENTATION_TRACKING.md`

**Template**:
```markdown
# Feature 007 Implementation Tracking

## Start Date: [DATE]
## Target Completion: [DATE + 8 days]

### Daily Progress
- Day 1 (Phase 0-1):
- Day 2 (Phase 1):
- Day 3 (Phase 2):
- Day 4 (Phase 3):
- Day 5 (Phase 4):
- Day 6 (Phase 5):
- Day 7 (Phase 6):
- Day 8 (Phase 6):

### Issues Encountered
1. [Issue description] - [Resolution]

### Performance Metrics
- Single case fetch time: _____ ms
- Batch 100 cases fetch time: _____ ms
- Search performance: _____ ms

### Rollback Triggers
- [ ] Enrichment failures > 5%
- [ ] Performance degradation > 50%
- [ ] Folder rename failures affecting users
- [ ] Critical bugs
```

**Checklist**:
- [ ] Tracking document created
- [ ] Shared with team
- [ ] Daily update schedule set

---

## Phase 1: Backend Client Name Enrichment

**Duration**: 2 days
**Files**: `gas/services/SheetsService.gs`

### Task 1.1: Add Enrichment Helper Methods

**Location**: After existing helper methods in SheetsService

**Code to Add**:
```javascript
// ==================== CLIENT NAME ENRICHMENT ====================

/**
 * Enriches case data with client name from clients sheet
 * Feature 007: Dynamic client name lookup for data consistency
 *
 * @param {Object} caseData - Case data object
 * @returns {Object} Case data with clientName added
 */
enrichCaseWithClientName: function(caseData) {
  if (!caseData) {
    return caseData;
  }

  if (caseData.clientId) {
    try {
      const client = this.getClientById(caseData.clientId);
      if (client) {
        caseData.clientName = `${client.firstName} ${client.lastName}`;
      } else {
        caseData.clientName = '[Client Not Found]';
        Logger.log(`WARNING: Client not found for clientId: ${caseData.clientId} in case: ${caseData.caseId}`);
      }
    } catch (error) {
      caseData.clientName = '[Error Loading Client]';
      Logger.log(`ERROR: Failed to fetch client ${caseData.clientId}: ${error.message}`);
    }
  } else {
    caseData.clientName = '[No Client]';
    Logger.log(`WARNING: Case ${caseData.caseId} has no clientId`);
  }

  return caseData;
},

/**
 * Enriches multiple cases with client names (optimized batch lookup)
 * Feature 007: Batch processing for performance
 *
 * @param {Array} cases - Array of case data objects
 * @returns {Array} Cases with clientNames added
 */
enrichCasesWithClientNames: function(cases) {
  if (!Array.isArray(cases) || cases.length === 0) {
    return cases;
  }

  // Extract unique clientIds
  const clientIds = [...new Set(cases.map(c => c.clientId).filter(Boolean))];

  // Build client lookup map for efficiency
  const clientMap = {};
  clientIds.forEach(clientId => {
    try {
      const client = this.getClientById(clientId);
      if (client) {
        clientMap[clientId] = `${client.firstName} ${client.lastName}`;
      }
    } catch (error) {
      Logger.log(`ERROR: Failed to fetch client ${clientId}: ${error.message}`);
    }
  });

  // Enrich each case
  return cases.map(caseData => {
    if (caseData.clientId && clientMap[caseData.clientId]) {
      caseData.clientName = clientMap[caseData.clientId];
    } else if (caseData.clientId) {
      caseData.clientName = '[Client Not Found]';
    } else {
      caseData.clientName = '[No Client]';
    }
    return caseData;
  });
},
```

**Implementation Steps**:
1. Open `gas/services/SheetsService.gs`
2. Locate the section after client management methods
3. Add the two helper methods above
4. Save file

**Verification**:
```javascript
// Test in Apps Script
function testEnrichment() {
  const testCase = {
    caseId: 'TEST-001',
    clientId: 'existing-client-id',
    caseName: 'Test'
  };

  const enriched = SheetsService.enrichCaseWithClientName(testCase);
  Logger.log(`Enriched clientName: ${enriched.clientName}`);
}
```

**Checklist**:
- [ ] `enrichCaseWithClientName()` added
- [ ] `enrichCasesWithClientNames()` added
- [ ] JSDoc comments complete
- [ ] Error handling included
- [ ] Test function executed successfully

---

### Task 1.2: Update getCaseById() Method

**Current Code** (approximate line 160-180):
```javascript
getCaseById: function(caseId) {
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === caseId) {
      const caseData = this.parseRow(row, i + 1, true);
      return caseData;
    }
  }

  return null;
},
```

**Updated Code**:
```javascript
getCaseById: function(caseId) {
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === caseId) {
      const caseData = this.parseRow(row, i + 1, true);

      // Feature 007: Enrich with client name from clients sheet
      return this.enrichCaseWithClientName(caseData);
    }
  }

  return null;
},
```

**Checklist**:
- [ ] Method updated
- [ ] Comment added
- [ ] Tested with existing case

---

### Task 1.3: Update searchCasesByName() Method

**Current Code** (approximate line 97-131):
```javascript
searchCasesByName: function(firstName, lastName) {
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();
  const results = [];

  const searchFirst = firstName ? firstName.toLowerCase().trim() : null;
  const searchLast = lastName ? lastName.toLowerCase().trim() : null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const clientName = (row[3] || '').toLowerCase(); // D: clientName

    let matches = false;
    if (searchFirst && searchLast) {
      matches = clientName.includes(searchFirst) && clientName.includes(searchLast);
    } else if (searchFirst) {
      matches = clientName.includes(searchFirst);
    } else if (searchLast) {
      matches = clientName.includes(searchLast);
    }

    if (matches) {
      results.push(this.parseRow(row, i + 1, false));
    }
  }

  return results;
},
```

**Updated Code**:
```javascript
searchCasesByName: function(firstName, lastName) {
  // Feature 007: Search clients sheet first, then find cases by clientId

  const searchFirst = firstName ? firstName.toLowerCase().trim() : null;
  const searchLast = lastName ? lastName.toLowerCase().trim() : null;

  // Step 1: Find matching clients
  const clients = this.getAllClients();
  const matchingClientIds = [];

  clients.forEach(client => {
    const clientFirstName = (client.firstName || '').toLowerCase();
    const clientLastName = (client.lastName || '').toLowerCase();

    let matches = false;
    if (searchFirst && searchLast) {
      matches = clientFirstName.includes(searchFirst) && clientLastName.includes(searchLast);
    } else if (searchFirst) {
      matches = clientFirstName.includes(searchFirst);
    } else if (searchLast) {
      matches = clientLastName.includes(searchLast);
    }

    if (matches) {
      matchingClientIds.push(client.clientId);
    }
  });

  // Step 2: Find cases for matching clients
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const clientId = row[2]; // Column C: clientId

    if (matchingClientIds.includes(clientId)) {
      results.push(this.parseRow(row, i + 1, false));
    }
  }

  // Step 3: Enrich with client names
  return this.enrichCasesWithClientNames(results);
},
```

**Checklist**:
- [ ] Method updated
- [ ] Searches clients sheet first
- [ ] Batch enrichment applied
- [ ] Tested with client name search

---

### Task 1.4: Update createCase() Method

**Current Code** (lines 248-263):
```javascript
const row = [
  caseData.caseId,                       // A: caseId
  caseData.caseName || '',               // B: caseName
  caseData.clientId,                     // C: clientId (UUID)
  caseData.clientName || '',             // D: clientName (shifted from C)
  caseData.assignedTo || '',             // E: assignedTo (shifted from D)
  caseData.caseType || '',               // F: caseType (shifted from E)
  caseData.status || '',                 // G: status (shifted from F)
  caseData.notes || '',                  // H: notes (shifted from G)
  createdBy,                             // I: createdBy (shifted from H)
  now,                                   // J: createdAt (shifted from I)
  assignedAt,                            // K: assignedAt (shifted from J)
  currentUser,                           // L: lastUpdatedBy (shifted from K)
  now,                                   // M: lastUpdatedAt (shifted from L)
  0                                      // N: version (shifted from M)
];
```

**Updated Code**:
```javascript
// Feature 007: clientName will be enriched dynamically, but still stored for now
// (Column will be removed in Phase 5)
const row = [
  caseData.caseId,                       // A: caseId
  caseData.caseName || '',               // B: caseName
  caseData.clientId,                     // C: clientId (UUID)
  caseData.clientName || '',             // D: clientName (still stored, will be removed)
  caseData.assignedTo || '',             // E: assignedTo
  caseData.caseType || '',               // F: caseType
  caseData.status || '',                 // G: status
  caseData.notes || '',                  // H: notes
  createdBy,                             // I: createdBy
  now,                                   // J: createdAt
  assignedAt,                            // K: assignedAt
  currentUser,                           // L: lastUpdatedBy
  now,                                   // M: lastUpdatedAt
  0                                      // N: version
];

sheet.appendRow(row);

// Return case with dynamically enriched client name
const createdCase = this.getCaseById(caseData.caseId);
return createdCase; // Already enriched by getCaseById()
```

**Note**: clientName still stored during Phase 1-4, will be removed in Phase 5

**Checklist**:
- [ ] Method updated
- [ ] Comment added explaining temporary storage
- [ ] Returns enriched case

---

### Task 1.5: Update updateCase() Method - Add clientName Immutability Check

**Location**: After clientId immutability check (around line 283)

**Add This Code**:
```javascript
updateCase: function(caseId, updates, expectedVersion, currentUser) {
  // Existing: Reject clientId updates
  if (updates.hasOwnProperty('clientId')) {
    throw ResponseHandler.validationError(
      'clientId is immutable and cannot be updated',
      'metadata.update.error.clientIdImmutable'
    );
  }

  // NEW: Feature 007 - Reject clientName updates
  if (updates.hasOwnProperty('clientName')) {
    throw ResponseHandler.validationError(
      'clientName cannot be updated from case details. Update client information from Client Details page.',
      'metadata.update.error.clientNameImmutable'
    );
  }

  // ... rest of method ...

  // At the end, return enriched case
  return this.getCaseById(caseId); // Returns with enriched client name
},
```

**Checklist**:
- [ ] clientName immutability check added
- [ ] Error message clear and helpful
- [ ] Returns enriched case data

---

## Phase 2: Client Folder Renaming

**Duration**: 1 day
**Files**: `gas/services/DriveService.gs`, `gas/handlers/ClientHandler.gs`

### Task 2.1: Add renameFolder() to DriveService

**File**: `gas/services/DriveService.gs`

**Location**: After existing folder methods

**Code to Add**:
```javascript
/**
 * Renames a folder in Google Drive
 * Feature 007: Support automatic folder renaming on client updates
 *
 * @param {string} folderId - Folder ID to rename
 * @param {string} newName - New folder name
 * @returns {Object} Updated folder info
 * @throws {Error} If folder not found or rename fails
 */
renameFolder: function(folderId, newName) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const oldName = folder.getName();

    // Check if name is already correct
    if (oldName === newName) {
      Logger.log(`Folder already has name "${newName}", no rename needed`);
      return {
        folderId: folderId,
        oldName: oldName,
        newName: newName,
        renamed: false,
        folderUrl: folder.getUrl()
      };
    }

    // Rename the folder
    folder.setName(newName);

    Logger.log(`✅ Folder renamed: "${oldName}" → "${newName}"`);

    return {
      folderId: folderId,
      oldName: oldName,
      newName: newName,
      renamed: true,
      folderUrl: folder.getUrl()
    };
  } catch (error) {
    Logger.log(`❌ Failed to rename folder ${folderId}: ${error.message}`);
    throw new Error(`Failed to rename folder: ${error.message}`);
  }
},
```

**Checklist**:
- [ ] Method added to DriveService
- [ ] JSDoc comments complete
- [ ] Error handling included
- [ ] Logging added
- [ ] Returns detailed result

**Test**:
```javascript
function testRenameFolder() {
  // Use a test folder ID
  const testFolderId = 'your-test-folder-id';
  const result = DriveService.renameFolder(testFolderId, 'Test_Name_ID123');
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

### Task 2.2: Update ClientHandler.update() with Folder Renaming

**File**: `gas/handlers/ClientHandler.gs`

**Current Code** (approximate):
```javascript
update: function(context) {
  // ... authorization checks ...

  const { clientId, updates } = context.data;

  // Update client in sheets
  const updatedClient = SheetsService.updateClient(clientId, updates);

  // Generate new token
  const newToken = TokenManager.generateToken(context.user.email);

  return ResponseHandler.successWithToken(
    'client.update.success',
    'Client updated successfully',
    { client: updatedClient },
    context.user,
    newToken.value
  );
},
```

**Updated Code**:
```javascript
update: function(context) {
  // ... authorization checks ...

  const { clientId, updates } = context.data;

  // ========================================
  // Feature 007: Get current client for comparison
  // ========================================
  const currentClient = SheetsService.getClientById(clientId);
  if (!currentClient) {
    throw ResponseHandler.notFoundError(
      'Client not found',
      'client.update.error.notfound'
    );
  }

  // ========================================
  // Feature 007: Check if folder rename is needed
  // ========================================
  const needsFolderRename = (
    (updates.firstName && updates.firstName !== currentClient.firstName) ||
    (updates.lastName && updates.lastName !== currentClient.lastName) ||
    (updates.nationalId && updates.nationalId !== currentClient.nationalId)
  );

  // Update client in sheets
  const updatedClient = SheetsService.updateClient(clientId, updates);

  // ========================================
  // Feature 007: Rename folder if needed
  // ========================================
  if (needsFolderRename && updatedClient.folderId) {
    try {
      const newFolderName = this._buildFolderName(
        updatedClient.firstName,
        updatedClient.lastName,
        updatedClient.nationalId
      );

      const renameResult = DriveService.renameFolder(updatedClient.folderId, newFolderName);

      if (renameResult.renamed) {
        Logger.log(`✅ Client folder renamed for ${updatedClient.firstName} ${updatedClient.lastName}`);
        Logger.log(`   Old: ${renameResult.oldName}`);
        Logger.log(`   New: ${renameResult.newName}`);
      }
    } catch (error) {
      // Log error but don't fail the client update
      Logger.log(`⚠️  WARNING: Client updated but folder rename failed`);
      Logger.log(`   Client: ${updatedClient.firstName} ${updatedClient.lastName}`);
      Logger.log(`   Error: ${error.message}`);
      Logger.log(`   Action: Manual folder rename may be needed`);
      // Continue - client data is already updated
    }
  }

  // Generate new token
  const newToken = TokenManager.generateToken(context.user.email);

  return ResponseHandler.successWithToken(
    'client.update.success',
    'Client updated successfully',
    { client: updatedClient },
    context.user,
    newToken.value
  );
},

/**
 * Helper: Build folder name from client data
 * Feature 007: Consistent folder naming
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} nationalId
 * @returns {string} Folder name in format: firstName_lastName_nationalId
 * @private
 */
_buildFolderName: function(firstName, lastName, nationalId) {
  return `${firstName}_${lastName}_${nationalId}`;
},
```

**Checklist**:
- [ ] Current client fetched for comparison
- [ ] Rename check logic added
- [ ] `_buildFolderName()` helper added
- [ ] Error handling doesn't fail client update
- [ ] Comprehensive logging added

---

## Phase 3: Frontend UI Updates

**Duration**: 1 day
**Files**: Frontend components and i18n files

### Task 3.1: Update Case Details Pages to Make Client Name Read-Only

**File**: `src/pages/CaseEditPage.vue`

**Find**: Client name input field (search for `clientName`)

**Current Code** (approximate):
```vue
<q-input
  v-model="caseData.clientName"
  label="Client"
  outlined
/>
```

**Updated Code**:
```vue
<!-- Feature 007: Client name read-only, editable only from client details -->
<q-input
  v-model="caseData.clientName"
  :label="$t('case.fields.client')"
  readonly
  filled
  disable
  class="q-mb-md"
>
  <template v-slot:hint>
    {{ $t('case.edit.clientNameHint') }}
  </template>
</q-input>
```

**Also Update**: Form submission to exclude clientName

**Find**: Update method (search for `updateCase` or form submit)

**Current Code** (approximate):
```javascript
async function handleSubmit() {
  const updates = {
    caseName: caseData.value.caseName,
    clientName: caseData.value.clientName,  // ← Remove this
    assignedTo: caseData.value.assignedTo,
    caseType: caseData.value.caseType,
    status: caseData.value.status,
    notes: caseData.value.notes
  };

  await metadataApi.updateCase(caseData.value.caseId, updates, caseData.value.version);
}
```

**Updated Code**:
```javascript
async function handleSubmit() {
  // Feature 007: Exclude clientName from updates
  const updates = {
    caseName: caseData.value.caseName,
    // clientName removed - not editable from case details
    assignedTo: caseData.value.assignedTo,
    caseType: caseData.value.caseType,
    status: caseData.value.status,
    notes: caseData.value.notes
  };

  try {
    await metadataApi.updateCase(caseData.value.caseId, updates, caseData.value.version);
    // Success handling...
  } catch (error) {
    // Error handling...
  }
}
```

**Checklist**:
- [ ] Client name input made readonly and disabled
- [ ] Hint text added
- [ ] clientName removed from updates object
- [ ] Tested UI shows read-only field

---

### Task 3.2: Add i18n Messages

**File**: `src/i18n/en-US.js`

**Location**: In metadata section

**Add**:
```javascript
metadata: {
  update: {
    error: {
      // ... existing errors ...
      clientNameImmutable: "Client name cannot be updated from case details. Please update client information from the Client Details page."
    }
  }
},
case: {
  fields: {
    client: "Client"
  },
  edit: {
    // ... existing fields ...
    clientNameHint: "Client name can only be edited from the Client Details page"
  }
}
```

**File**: `src/i18n/fr-FR/index.js`

**Add**:
```javascript
metadata: {
  update: {
    error: {
      // ... existing errors ...
      clientNameImmutable: "Le nom du client ne peut pas être modifié depuis les détails du dossier. Veuillez mettre à jour les informations du client depuis la page Détails du Client."
    }
  }
},
case: {
  fields: {
    client: "Client"
  },
  edit: {
    // ... existing fields ...
    clientNameHint: "Le nom du client ne peut être modifié que depuis la page Détails du Client"
  }
}
```

**Checklist**:
- [ ] English messages added
- [ ] French translations added
- [ ] Messages match error keys in backend

---

### Task 3.3: Update CaseHandler.gs to Remove clientName from Metadata

**File**: `gas/handlers/CaseHandler.gs`

**Find**: caseMetadata object creation (around line 114-125)

**Current Code**:
```javascript
const caseMetadata = {
  caseId: caseId,
  caseName: caseId,
  clientId: clientId,
  clientName: clientName,  // ← Keep for now, will be enriched
  assignedTo: '',
  caseType: '',
  status: '',
  notes: '',
  createdBy: createdBy,
  createdAt: now
};
```

**Updated Code**:
```javascript
// Feature 007: clientName will be enriched by SheetsService.createCase()
const caseMetadata = {
  caseId: caseId,
  caseName: caseId,
  clientId: clientId,
  clientName: clientName,  // Passed for now, stored temporarily (Phase 5 will remove column)
  assignedTo: '',
  caseType: '',
  status: '',
  notes: '',
  createdBy: createdBy,
  createdAt: now
};

// SheetsService.createCase() will return case with enriched clientName
SheetsService.createCase(caseMetadata, createdBy);
```

**Note**: clientName still passed during Phases 1-4, will be removed in Phase 5

**Checklist**:
- [ ] Comment added
- [ ] Code ready for Phase 5 change

---

## Phase 4: Testing (With Column)

**Duration**: 1.5 days
**Critical**: All testing done BEFORE schema change

### Task 4.1: Unit Tests

**Create Test File**: `gas/tests/test_feature_007.gs` (if testing framework exists)

**Test 1: Enrich Single Case**
```javascript
function test_enrichCaseWithClientName() {
  const testCase = {
    caseId: 'TEST-001',
    clientId: 'existing-uuid',
    caseName: 'Test Case'
  };

  const enriched = SheetsService.enrichCaseWithClientName(testCase);

  // Assert clientName was added
  if (!enriched.clientName || enriched.clientName === '[Client Not Found]') {
    throw new Error('Failed to enrich with client name');
  }

  Logger.log('✅ Test passed: enrichCaseWithClientName');
}
```

**Test 2: Enrich Multiple Cases**
```javascript
function test_enrichCasesWithClientNames() {
  const cases = [
    { caseId: 'C1', clientId: 'uuid-1' },
    { caseId: 'C2', clientId: 'uuid-2' },
    { caseId: 'C3', clientId: 'uuid-1' } // Same client
  ];

  const enriched = SheetsService.enrichCasesWithClientNames(cases);

  // Assert all have clientName
  enriched.forEach((c, i) => {
    if (!c.clientName) {
      throw new Error(`Case ${i} missing clientName`);
    }
  });

  // Assert same client has same name
  if (enriched[0].clientName !== enriched[2].clientName) {
    throw new Error('Same client should have same name');
  }

  Logger.log('✅ Test passed: enrichCasesWithClientNames');
}
```

**Test 3: Reject clientName Update**
```javascript
function test_rejectClientNameUpdate() {
  const updates = {
    caseName: 'Updated',
    clientName: 'Hacker Name'
  };

  try {
    SheetsService.updateCase('existing-case-id', updates, 0, 'test@example.com');
    throw new Error('Should have rejected clientName update');
  } catch (error) {
    if (!error.message.includes('clientName cannot be updated')) {
      throw new Error('Wrong error message');
    }
  }

  Logger.log('✅ Test passed: rejectClientNameUpdate');
}
```

**Test 4: Folder Rename**
```javascript
function test_folderRename() {
  const testFolderId = 'test-folder-id';

  const result = DriveService.renameFolder(testFolderId, 'New_Name_ID999');

  if (!result.renamed && result.oldName !== result.newName) {
    throw new Error('Folder should have been renamed');
  }

  Logger.log('✅ Test passed: folderRename');
}
```

**Run All Tests**:
```javascript
function runAllFeature007Tests() {
  const tests = [
    test_enrichCaseWithClientName,
    test_enrichCasesWithClientNames,
    test_rejectClientNameUpdate,
    test_folderRename
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      test();
      passed++;
    } catch (error) {
      failed++;
      Logger.log(`❌ Test failed: ${test.name}`);
      Logger.log(`   Error: ${error.message}`);
    }
  });

  Logger.log('');
  Logger.log('=================================');
  Logger.log(`Tests: ${passed} passed, ${failed} failed`);
  Logger.log('=================================');
}
```

**Checklist**:
- [ ] All unit tests created
- [ ] All unit tests passing
- [ ] Tests cover main scenarios

---

### Task 4.2: Integration Tests

**Test 5: End-to-End Case Creation**
1. [ ] Create new case via frontend
2. [ ] Verify case created in metadata sheet
3. [ ] Verify clientName in metadata sheet (temporary)
4. [ ] View case details
5. [ ] Verify clientName shown correctly (from enrichment)
6. [ ] Verify matches current client name in clients sheet

**Test 6: End-to-End Client Update with Folder Rename**
1. [ ] Update client firstName from "John" to "Jane"
2. [ ] Verify clients sheet updated
3. [ ] Verify folder renamed from "John_..." to "Jane_..."
4. [ ] View existing case for that client
5. [ ] Verify case shows "Jane..." (enriched dynamically)
6. [ ] Verify metadata sheet still shows old name "John..." (temporary)

**Test 7: Search by Client Name**
1. [ ] Search for client "Jane" (after update above)
2. [ ] Verify cases returned
3. [ ] Verify clientName shows "Jane..." in results
4. [ ] Verify enrichment working

**Test 8: Attempt to Update clientName from Case**
1. [ ] Open case for editing
2. [ ] Verify client name field is readonly/disabled
3. [ ] Try to submit update with clientName (via API test)
4. [ ] Verify error returned
5. [ ] Verify error message is user-friendly

**Checklist**:
- [ ] All integration tests passed
- [ ] Enrichment works correctly
- [ ] Folder rename works
- [ ] Read-only UI enforced

---

### Task 4.3: Performance Testing

**Test Performance Impact**:

```javascript
function testPerformance() {
  // Test 1: Single case fetch
  const start1 = Date.now();
  const singleCase = SheetsService.getCaseById('existing-case-id');
  const time1 = Date.now() - start1;
  Logger.log(`Single case fetch: ${time1}ms`);

  // Test 2: Batch case fetch
  const start2 = Date.now();
  const cases = SheetsService.searchCasesByName('', 'Common-LastName'); // Get many cases
  const time2 = Date.now() - start2;
  Logger.log(`Batch fetch (${cases.length} cases): ${time2}ms`);

  // Assert performance acceptable
  if (time1 > 500) {
    Logger.log('⚠️  WARNING: Single case fetch > 500ms');
  }
  if (time2 > 3000) {
    Logger.log('⚠️  WARNING: Batch fetch > 3 seconds');
  }

  return {
    singleCaseTime: time1,
    batchCaseTime: time2,
    batchCaseCount: cases.length
  };
}
```

**Success Criteria**:
- [ ] Single case: < 500ms
- [ ] Batch 100 cases: < 3 seconds
- [ ] No user-perceived slowdown

**If Performance Issues**:
- Consider in-memory caching (short-lived)
- Optimize batch lookup
- Profile slow operations

---

### Task 4.4: Manual UI Testing

**Checklist**:

**Case Details Page**:
- [ ] Client name displayed correctly
- [ ] Client name field is readonly (filled style)
- [ ] Client name field is disabled (grayed out)
- [ ] Hint text shown below field
- [ ] Cannot edit client name
- [ ] Can edit other fields normally
- [ ] Form submission works

**Client Details Page**:
- [ ] Can edit client firstName
- [ ] Can edit client lastName
- [ ] Can edit client nationalId
- [ ] Submit updates successfully
- [ ] See success notification
- [ ] Folder name changed (verify in Drive)

**Case Search**:
- [ ] Search by client first name works
- [ ] Search by client last name works
- [ ] Search by full name works
- [ ] Results show correct client names
- [ ] Client names reflect current data

**Multi-language**:
- [ ] Error messages in English
- [ ] Error messages in French
- [ ] Hint text in both languages

---

## Phase 5: Schema Change

**Duration**: 0.5 days (4 hours)
**Critical**: Only proceed if Phase 4 tests all passed

### Task 5.1: Pre-Schema Change Verification

**Run Final Checks**:
```javascript
function preSchemaChangeChecks() {
  Logger.log('=================================');
  Logger.log('PRE-SCHEMA CHANGE VERIFICATION');
  Logger.log('=================================');

  // Check 1: All tests passing
  Logger.log('1. Run all tests...');
  runAllFeature007Tests();

  // Check 2: Verify enrichment working
  Logger.log('2. Verify enrichment...');
  const testCase = SheetsService.getCaseById('existing-case-id');
  if (!testCase.clientName || testCase.clientName.includes('[')) {
    throw new Error('Enrichment not working correctly');
  }
  Logger.log('   ✅ Enrichment working');

  // Check 3: Verify performance
  Logger.log('3. Check performance...');
  const perf = testPerformance();
  Logger.log(`   Single: ${perf.singleCaseTime}ms, Batch: ${perf.batchCaseTime}ms`);

  // Check 4: Verify folder rename
  Logger.log('4. Check folder rename...');
  // Manual verification - update a test client and check folder

  Logger.log('=================================');
  Logger.log('✅ All pre-checks passed');
  Logger.log('SAFE TO PROCEED WITH SCHEMA CHANGE');
  Logger.log('=================================');
}
```

**Checklist**:
- [ ] All tests passing
- [ ] Enrichment verified working
- [ ] Performance acceptable
- [ ] Folder rename tested
- [ ] No critical issues

---

### Task 5.2: Backup Metadata Sheet

**CRITICAL**: Create backup before schema change

```javascript
function backupBeforeSchemaChange() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metadataSheet = ss.getSheetByName('metadata');

  // Create backup with timestamp
  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd_HHmmss'
  );
  const backupName = `metadata_backup_feature007_${timestamp}`;

  // Copy sheet
  const backup = metadataSheet.copyTo(ss);
  backup.setName(backupName);

  // Protect backup
  const protection = backup.protect().setDescription('Feature 007 Backup - Do Not Edit');
  protection.setWarningOnly(true);

  Logger.log(`✅ Backup created: ${backupName}`);
  Logger.log(`   Columns: ${metadataSheet.getLastColumn()}`); // Should be 14
  Logger.log(`   Rows: ${metadataSheet.getLastRow()}`);

  return backupName;
}
```

**Execute**:
- [ ] Run backup function
- [ ] Verify backup created
- [ ] Note backup name: _________________________
- [ ] Download CSV backup (extra safety)
- [ ] CSV saved to: _________________________

---

### Task 5.3: Delete Column D (clientName)

**MANUAL STEP - Follow Exactly**:

1. **Open metadata sheet** in Google Sheets
2. **Verify current state**:
   - Column C header = "clientId"
   - Column D header = "clientName"
   - Column E header = "assignedTo"
   - Total columns = 14

3. **Click on Column D header** (the letter "D")
4. **Right-click** → Select "Delete column"
5. **Verify new state**:
   - Column C header = "clientId"
   - Column D header = "assignedTo" (shifted from E)
   - Column E header = "caseType" (shifted from F)
   - Total columns = 13

6. **Verify sample data**:
   - Pick 3 random rows
   - Verify Column C has UUID
   - Verify Column D has assignedTo value (or empty)
   - Verify no data looks corrupted

**Checklist**:
- [ ] Column D (clientName) deleted
- [ ] Column count = 13 (was 14)
- [ ] Column D header now "assignedTo"
- [ ] Sample rows verified correct
- [ ] Screenshot taken of first 5 rows
- [ ] No visible data corruption

---

### Task 5.4: Update Backend Code for Schema Change

**File**: `gas/services/SheetsService.gs`

#### Change 5.4.1: Update Schema Documentation

```javascript
/**
 * Metadata Schema (Updated for Feature 007 - Schema Change Complete):
 * A: caseId, B: caseName, C: clientId (UUID), D: assignedTo, E: caseType,
 * F: status, G: notes, H: createdBy, I: createdAt, J: assignedAt,
 * K: lastUpdatedBy, L: lastUpdatedAt, M: version
 *
 * NOTE: clientName removed - fetched dynamically from clients sheet
 * Total columns: 13 (was 14)
 */
```

#### Change 5.4.2: Update parseRow()

```javascript
parseRow: function(row, rowIndex, includeSystemFields) {
  const caseData = {
    caseId: row[0],          // A: caseId
    caseName: row[1],        // B: caseName
    clientId: row[2],        // C: clientId (UUID)
    // clientName REMOVED from sheet, will be enriched
    assignedTo: row[3],      // D: assignedTo (shifted from E)
    caseType: row[4],        // E: caseType (shifted from F)
    status: row[5],          // F: status (shifted from G)
    notes: row[6]            // G: notes (shifted from H)
  };

  if (includeSystemFields) {
    caseData.createdBy = row[7];          // H: createdBy (shifted from I)
    caseData.createdAt = row[8];          // I: createdAt (shifted from J)
    caseData.assignedAt = row[9];         // J: assignedAt (shifted from K)
    caseData.lastUpdatedBy = row[10];     // K: lastUpdatedBy (shifted from L)
    caseData.lastUpdatedAt = row[11];     // L: lastUpdatedAt (shifted from M)
    caseData.version = row[12];           // M: version (shifted from N)
    caseData.rowIndex = rowIndex;
  }

  return caseData;
},
```

#### Change 5.4.3: Update createCase()

```javascript
// Feature 007: clientName NO LONGER stored in sheet
const row = [
  caseData.caseId,                       // A: caseId
  caseData.caseName || '',               // B: caseName
  caseData.clientId,                     // C: clientId (UUID)
  // clientName REMOVED - no longer stored
  caseData.assignedTo || '',             // D: assignedTo (shifted from E)
  caseData.caseType || '',               // E: caseType (shifted from F)
  caseData.status || '',                 // F: status (shifted from G)
  caseData.notes || '',                  // G: notes (shifted from H)
  createdBy,                             // H: createdBy (shifted from I)
  now,                                   // I: createdAt (shifted from J)
  assignedAt,                            // J: assignedAt (shifted from K)
  currentUser,                           // K: lastUpdatedBy (shifted from L)
  now,                                   // L: lastUpdatedAt (shifted from M)
  0                                      // M: version (shifted from N)
];
```

#### Change 5.4.4: Update updateCase() Column Indices

```javascript
// Update all column indices (shift left by 1)
if (updates.caseName !== undefined) {
  sheet.getRange(row, 2).setValue(updates.caseName); // B: caseName
}
// C: clientId - NOT EDITABLE
if (updates.assignedTo !== undefined) {
  sheet.getRange(row, 4).setValue(updates.assignedTo); // D: assignedTo (shifted from E)
}
if (updates.caseType !== undefined) {
  sheet.getRange(row, 5).setValue(updates.caseType); // E: caseType (shifted from F)
}
if (updates.status !== undefined) {
  sheet.getRange(row, 6).setValue(updates.status); // F: status (shifted from G)
}
if (updates.notes !== undefined) {
  sheet.getRange(row, 7).setValue(updates.notes); // G: notes (shifted from H)
}

// Update system fields
if (assignedToChanged) {
  sheet.getRange(row, 10).setValue(now); // J: assignedAt (shifted from K)
}
sheet.getRange(row, 11).setValue(currentUser);         // K: lastUpdatedBy (shifted from L)
sheet.getRange(row, 12).setValue(now);                 // L: lastUpdatedAt (shifted from M)
sheet.getRange(row, 13).setValue(expectedVersion + 1); // M: version (shifted from N)
```

**Checklist**:
- [ ] Schema documentation updated
- [ ] parseRow() updated (indices shifted)
- [ ] createCase() updated (clientName removed from row)
- [ ] updateCase() updated (all indices shifted left by 1)

---

### Task 5.5: Deploy Backend Code

```bash
cd gas/
npx clasp push --force
```

**Checklist**:
- [ ] Backend deployed
- [ ] No deployment errors
- [ ] Timestamp: ______________

---

## Phase 6: Deployment & Validation

**Duration**: 1.5 days

### Task 6.1: Post-Schema Change Smoke Tests

**IMMEDIATELY after schema change**:

```javascript
function postSchemaChangeValidation() {
  Logger.log('=================================');
  Logger.log('POST-SCHEMA CHANGE VALIDATION');
  Logger.log('=================================');

  const sheet = SheetsService.getMetadataSheet();
  const data = sheet.getDataRange().getValues();

  // Check 1: Column count
  const columnCount = data[0].length;
  Logger.log(`1. Column count: ${columnCount}`); // Should be 13
  if (columnCount !== 13) {
    throw new Error(`Expected 13 columns, got ${columnCount}`);
  }

  // Check 2: Column headers
  Logger.log(`2. Column headers:`);
  Logger.log(`   C: ${data[0][2]}`); // Should be "clientId"
  Logger.log(`   D: ${data[0][3]}`); // Should be "assignedTo"
  if (data[0][2] !== 'clientId' || data[0][3] !== 'assignedTo') {
    throw new Error('Column headers incorrect');
  }

  // Check 3: Fetch a case
  Logger.log(`3. Testing case fetch...`);
  const testCase = SheetsService.getCaseById('existing-case-id');
  if (!testCase) {
    throw new Error('Failed to fetch case');
  }
  if (!testCase.clientName) {
    throw new Error('clientName not enriched');
  }
  Logger.log(`   ✅ Case fetched: ${testCase.caseId}`);
  Logger.log(`   ✅ Client name: ${testCase.clientName}`);

  // Check 4: Create a test case
  Logger.log(`4. Testing case creation...`);
  const newCase = {
    caseId: `TEST-${Date.now()}`,
    caseName: 'Test Case',
    clientId: 'existing-client-uuid'
  };
  const created = SheetsService.createCase(newCase, 'test@example.com');
  if (!created.clientName) {
    throw new Error('New case missing clientName');
  }
  Logger.log(`   ✅ Case created: ${created.caseId}`);
  Logger.log(`   ✅ Client name: ${created.clientName}`);

  Logger.log('=================================');
  Logger.log('✅ ALL POST-SCHEMA VALIDATIONS PASSED');
  Logger.log('=================================');
}
```

**Run Immediately**:
- [ ] Validation script executed
- [ ] All checks passed
- [ ] No errors

**If Validation Fails**: Initiate rollback immediately

---

### Task 6.2: Frontend Smoke Tests

**Manual Tests**:

1. **Create New Case**:
   - [ ] Navigate to client details
   - [ ] Click "Create New Case"
   - [ ] Enter case ID
   - [ ] Submit
   - [ ] Success notification shown
   - [ ] Case appears in list
   - [ ] Client name shown correctly

2. **View Case Details**:
   - [ ] Click on existing case
   - [ ] Case details load
   - [ ] Client name shown (readonly)
   - [ ] Client name matches current client data
   - [ ] All other fields load correctly

3. **Edit Case**:
   - [ ] Change case name
   - [ ] Change assignedTo
   - [ ] Submit
   - [ ] Success notification
   - [ ] Changes saved
   - [ ] Client name unchanged (still readonly)

4. **Search Cases**:
   - [ ] Search by client first name
   - [ ] Results returned
   - [ ] Client names shown correctly
   - [ ] Click result loads case

5. **Update Client**:
   - [ ] Go to client details
   - [ ] Change client firstName
   - [ ] Submit
   - [ ] Success notification
   - [ ] Folder renamed (verify in Drive)
   - [ ] View case for that client
   - [ ] Client name updated in case view

**Checklist**:
- [ ] All smoke tests passed
- [ ] No console errors
- [ ] No UI glitches
- [ ] Performance acceptable

---

### Task 6.3: Monitor for 24 Hours

**Hour 1** (Critical):
- [ ] Check error logs
- [ ] Verify case creation working
- [ ] Verify case viewing working
- [ ] No user reports

**Hour 4**:
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify folder renames working
- [ ] User feedback review

**Hour 12**:
- [ ] Full error log review
- [ ] Performance metrics review
- [ ] Data integrity spot check

**Hour 24**:
- [ ] Final error log review
- [ ] Final performance review
- [ ] Run validation script
- [ ] Declare success or issues

**Metrics to Track**:
- Case creation success rate: Target > 98%
- Case view success rate: Target > 99%
- Client name enrichment failures: Target < 1%
- Folder rename failures: Target < 5% (non-critical)

---

## Rollback Plan

### Triggers for Rollback

Initiate rollback if:
- [ ] Post-schema validation fails
- [ ] Case creation failure rate > 10%
- [ ] Enrichment failures > 5%
- [ ] Critical user-blocking bug
- [ ] Data corruption detected

### Rollback Steps

#### Option A: Code Rollback Only (If Schema Not Changed Yet)

```bash
# Revert backend code
cd gas/
git checkout <previous-commit-hash>
npx clasp push --force

# Revert frontend code
cd ..
git checkout <previous-commit-hash>
npm run build
# Deploy
```

#### Option B: Full Rollback (After Schema Change)

**Step 1: Restore Metadata Sheet**
1. Delete current metadata sheet
2. Rename backup sheet to "metadata"
3. Verify data integrity

**Step 2: Revert Code**
```bash
# Backend
cd gas/
git checkout <previous-commit-hash>
npx clasp push --force

# Frontend
cd ..
git checkout <previous-commit-hash>
npm run build
# Deploy
```

**Step 3: Validate**
- [ ] Column count = 14
- [ ] Column D = clientName
- [ ] Case creation works
- [ ] Case viewing works

**Step 4: Communicate**
- [ ] Notify users
- [ ] Post incident report
- [ ] Schedule post-mortem

---

## Checklist

### Pre-Implementation
- [ ] Feature 006 deployed and stable
- [ ] Specification reviewed
- [ ] Plan reviewed
- [ ] Team assigned

### Phase 0: Prerequisites
- [ ] Feature 006 verified (14 columns, clientId populated)
- [ ] Tracking document created

### Phase 1: Backend Client Name Enrichment
- [ ] enrichCaseWithClientName() added
- [ ] enrichCasesWithClientNames() added
- [ ] getCaseById() updated
- [ ] searchCasesByName() updated
- [ ] createCase() updated (comment added)
- [ ] updateCase() updated (clientName immutability)
- [ ] All changes tested

### Phase 2: Client Folder Renaming
- [ ] renameFolder() added to DriveService
- [ ] ClientHandler.update() updated
- [ ] _buildFolderName() helper added
- [ ] Folder rename tested

### Phase 3: Frontend UI Updates
- [ ] Client name made readonly in case details
- [ ] Hint text added
- [ ] clientName removed from updates
- [ ] i18n messages added (English & French)
- [ ] CaseHandler.gs comment updated
- [ ] UI tested

### Phase 4: Testing (With Column)
- [ ] Unit tests created and passing
- [ ] Integration tests passed
- [ ] Performance tests acceptable
- [ ] Manual UI tests passed
- [ ] All Phase 4 tests documented

### Phase 5: Schema Change
- [ ] Pre-schema checks all passed
- [ ] Backup created
- [ ] CSV backup downloaded
- [ ] Column D deleted manually
- [ ] Column shift verified
- [ ] Backend code updated for schema
- [ ] Backend deployed
- [ ] Post-schema validation passed

### Phase 6: Deployment & Validation
- [ ] Smoke tests passed
- [ ] 1-hour monitoring complete
- [ ] 4-hour monitoring complete
- [ ] 12-hour monitoring complete
- [ ] 24-hour monitoring complete
- [ ] No critical issues

### Post-Implementation
- [ ] Feature marked as complete
- [ ] Documentation updated
- [ ] Team trained
- [ ] Monitoring continues

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Status**: Ready for Implementation
**Next Step**: Begin Phase 0 after Feature 006 is stable
