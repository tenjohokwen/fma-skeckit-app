# Feature 007: Remove clientName from Metadata Sheet

**Feature**: Remove clientName redundancy and enforce data consistency
**Date**: 2025-10-18
**Priority**: High
**Status**: Specification
**Depends On**: Feature 006 (clientId in metadata sheet)

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Schema Changes](#schema-changes)
5. [Requirements](#requirements)
6. [Data Flow](#data-flow)
7. [Code Changes Required](#code-changes-required)
8. [Migration Strategy](#migration-strategy)
9. [Client Folder Renaming](#client-folder-renaming)
10. [Testing Plan](#testing-plan)
11. [Success Criteria](#success-criteria)

---

## Overview

### Current State (After Feature 006)

The metadata sheet currently stores BOTH `clientId` and `clientName`:
```
Column C: clientId (UUID)
Column D: clientName (firstName + lastName)
```

**Problems**:
1. **Data Redundancy**: clientName duplicates data already in clients sheet
2. **Data Inconsistency**: If client name changes in clients sheet, metadata sheet becomes stale
3. **Manual Sync Required**: No automatic update mechanism
4. **Editable in Wrong Place**: Client name editable in case details instead of client details

### Desired State

Remove `clientName` from metadata sheet and fetch it dynamically:
```
Column C: clientId (UUID only)
Column D: assignedTo (clientName removed, columns shift left)
```

**Benefits**:
1. **Single Source of Truth**: Client name only in clients sheet
2. **Automatic Consistency**: Name changes immediately reflected everywhere
3. **Correct Edit Location**: Client name only editable from client details page
4. **Folder Auto-Rename**: Client folder renamed when name/nationalId changes

---

## Problem Statement

### Current Issues

#### Issue 1: Data Inconsistency
```
Scenario:
1. Client "John Doe" has case "TAX-2024"
2. Metadata sheet stores: clientName = "John Doe"
3. Admin changes client name to "John Smith" in clients sheet
4. Metadata sheet still shows: clientName = "John Doe"
5. Case details page shows outdated "John Doe"
```

**Impact**: Users see incorrect client names, data integrity violated

#### Issue 2: Wrong Edit Location
```
Current Behavior:
- Client name editable from case details page
- Changes made in case details don't update clients sheet
- Creates divergence between sheets

Expected Behavior:
- Client name only editable from client details page
- Changes propagate to all cases automatically
- Single source of truth maintained
```

#### Issue 3: Folder Name Mismatch
```
Scenario:
1. Client folder created: "John_Doe_ID12345"
2. Client name changed to "John Smith"
3. Folder still named: "John_Doe_ID12345" ← Outdated!
4. NationalId changed to "ID99999"
5. Folder still named: "John_Doe_ID12345" ← Double outdated!
```

**Impact**: Folder names don't match current client information

---

## Solution

### 1. Remove clientName Column from Metadata Sheet

**Action**: Delete Column D (clientName) from metadata sheet

**Before** (14 columns):
```
A: caseId
B: caseName
C: clientId
D: clientName       ← REMOVE THIS
E: assignedTo
F: caseType
G: status
H: notes
I: createdBy
J: createdAt
K: assignedAt
L: lastUpdatedBy
M: lastUpdatedAt
N: version
```

**After** (13 columns):
```
A: caseId
B: caseName
C: clientId
D: assignedTo       ← Shifted from E
E: caseType         ← Shifted from F
F: status           ← Shifted from G
G: notes            ← Shifted from H
H: createdBy        ← Shifted from I
I: createdAt        ← Shifted from J
J: assignedAt       ← Shifted from K
K: lastUpdatedBy    ← Shifted from L
L: lastUpdatedAt    ← Shifted from M
M: version          ← Shifted from N
```

### 2. Fetch Client Name Dynamically

**Backend**: When returning case data, lookup client name from clients sheet
```javascript
// OLD: Return clientName from metadata sheet
{
  caseId: "TAX-2024",
  caseName: "Tax Case",
  clientId: "uuid-123",
  clientName: "John Doe"  // From metadata sheet
}

// NEW: Fetch clientName from clients sheet
{
  caseId: "TAX-2024",
  caseName: "Tax Case",
  clientId: "uuid-123",
  clientName: "John Smith"  // From clients sheet (current name)
}
```

### 3. Make Client Name Read-Only in Case Details

**Frontend**: Case details page shows client name but doesn't allow editing
```vue
<!-- Case Details Page -->
<q-input
  v-model="caseData.clientName"
  label="Client"
  readonly             ← Always read-only
  filled
  disable
/>
```

### 4. Implement Client Folder Renaming

**Trigger**: When client firstName, lastName, or nationalId changes
**Action**: Rename client folder to match new format
```
Old: John_Doe_ID12345
New: John_Smith_ID99999
```

---

## Schema Changes

### Metadata Sheet Schema Change

#### Current Schema (14 columns)
```
┌────────┬──────────┬──────────┬────────────┬────────────┬──────────┬────────┬───────┬───────────┬───────────┬────────────┬───────────────┬───────────────┬─────────┐
│ caseId │ caseName │ clientId │ clientName │ assignedTo │ caseType │ status │ notes │ createdBy │ createdAt │ assignedAt │ lastUpdatedBy │ lastUpdatedAt │ version │
├────────┼──────────┼──────────┼────────────┼────────────┼──────────┼────────┼───────┼───────────┼───────────┼────────────┼───────────────┼───────────────┼─────────┤
│ A      │ B        │ C        │ D          │ E          │ F        │ G      │ H     │ I         │ J         │ K          │ L             │ M             │ N       │
└────────┴──────────┴──────────┴────────────┴────────────┴──────────┴────────┴───────┴───────────┴───────────┴────────────┴───────────────┴───────────────┴─────────┘
```

#### New Schema (13 columns)
```
┌────────┬──────────┬──────────┬────────────┬──────────┬────────┬───────┬───────────┬───────────┬────────────┬───────────────┬───────────────┬─────────┐
│ caseId │ caseName │ clientId │ assignedTo │ caseType │ status │ notes │ createdBy │ createdAt │ assignedAt │ lastUpdatedBy │ lastUpdatedAt │ version │
├────────┼──────────┼──────────┼────────────┼──────────┼────────┼───────┼───────────┼───────────┼────────────┼───────────────┼───────────────┼─────────┤
│ A      │ B        │ C        │ D          │ E        │ F      │ G     │ H         │ I         │ J          │ K             │ L             │ M       │
└────────┴──────────┴──────────┴────────────┴──────────┴────────┴───────┴───────────┴───────────┴────────────┴───────────────┴───────────────┴─────────┘
```

**Column Shift**: All columns after clientId shift left by 1

---

## Requirements

### Functional Requirements

#### FR-001: Remove clientName from Metadata Sheet
**Priority**: Critical
**Description**: Delete Column D (clientName) from metadata sheet

**Acceptance Criteria**:
- ✅ Column D deleted from metadata sheet
- ✅ All subsequent columns shifted left by 1
- ✅ No data loss in other columns
- ✅ Total columns = 13 (was 14)

---

#### FR-002: Dynamic Client Name Lookup
**Priority**: Critical
**Description**: Fetch client name from clients sheet when returning case data

**Acceptance Criteria**:
- ✅ Backend methods fetch clientName from clients sheet using clientId
- ✅ If clientId not found, return appropriate error/placeholder
- ✅ Client name always reflects current data in clients sheet
- ✅ No caching of client names

**Implementation**:
```javascript
// In SheetsService or new helper
function enrichCaseWithClientName(caseData) {
  if (caseData.clientId) {
    const client = SheetsService.getClientById(caseData.clientId);
    if (client) {
      caseData.clientName = `${client.firstName} ${client.lastName}`;
    } else {
      caseData.clientName = '[Client Not Found]';
    }
  }
  return caseData;
}
```

---

#### FR-003: Client Name Read-Only in Case Details
**Priority**: Critical
**Description**: Case details page shows client name but doesn't allow editing

**Acceptance Criteria**:
- ✅ Client name displayed in case details page
- ✅ Client name input field is readonly and disabled
- ✅ UI indicates field is not editable
- ✅ Attempting to update clientName in case update returns error

**Frontend**:
```vue
<q-input
  v-model="caseData.clientName"
  label="Client"
  readonly
  filled
  disable
  hint="Edit client name from Client Details page"
/>
```

**Backend**:
```javascript
// In MetadataHandler.updateCaseMetadata()
if (updates.hasOwnProperty('clientName')) {
  throw ResponseHandler.validationError(
    'Client name cannot be updated from case details. Update client information from Client Details page.',
    'metadata.update.error.clientNameImmutable'
  );
}
```

---

#### FR-004: Client Folder Renaming on Client Update
**Priority**: High
**Description**: Automatically rename client folder when firstName, lastName, or nationalId changes

**Acceptance Criteria**:
- ✅ Folder renamed when firstName changes
- ✅ Folder renamed when lastName changes
- ✅ Folder renamed when nationalId changes
- ✅ New folder name follows format: `firstName_lastName_nationalId`
- ✅ All case subfolders preserved
- ✅ Folder path updated in clients sheet
- ✅ Error handling if folder doesn't exist

**Trigger Points**:
- ClientHandler.update() method
- Only when firstName, lastName, or nationalId changes

**Folder Name Format**:
```
Pattern: {firstName}_{lastName}_{nationalId}
Example: John_Smith_ID99999
```

---

#### FR-005: Backward Compatibility for Existing Code
**Priority**: Medium
**Description**: Ensure existing code that expects clientName continues to work

**Acceptance Criteria**:
- ✅ API responses include clientName (fetched dynamically)
- ✅ Search results include clientName
- ✅ Case details include clientName
- ✅ Frontend components receive clientName as before

---

### Non-Functional Requirements

#### NFR-001: Performance
**Description**: Dynamic client name lookup must not degrade performance

**Metrics**:
- Single case fetch: < 500ms (includes client lookup)
- Batch case fetch (100 cases): < 3 seconds
- Search results: < 2 seconds

**Optimization**:
- Batch client lookups where possible
- Consider caching client names in memory (short-lived)

---

#### NFR-002: Data Integrity
**Description**: Ensure client names are always accurate and up-to-date

**Measures**:
- No caching of client names in persistent storage
- Always fetch from clients sheet
- Handle missing clients gracefully

---

## Data Flow

### Case Retrieval Flow (New)

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Request case details                                  │
│ api.post('metadata.getCaseForEdit', { caseId: 'TAX-2024' })    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: MetadataHandler.getCaseForEdit()                       │
│ 1. Call SheetsService.getCaseById('TAX-2024')                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: SheetsService.getCaseById()                            │
│ 1. Fetch case row from metadata sheet                          │
│ 2. Parse row data (NO clientName in sheet)                     │
│ 3. Result: { caseId, caseName, clientId, assignedTo, ... }    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: Enrich with client name                                │
│ 1. Extract clientId from case data                             │
│ 2. Call SheetsService.getClientById(clientId)                  │
│ 3. Get client: { firstName: "John", lastName: "Smith" }       │
│ 4. Compute clientName: "John Smith"                            │
│ 5. Add to case data: caseData.clientName = "John Smith"       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: Return to frontend                                     │
│ {                                                               │
│   caseId: "TAX-2024",                                          │
│   caseName: "Tax Case",                                        │
│   clientId: "uuid-123",                                        │
│   clientName: "John Smith",  ← Dynamically fetched            │
│   assignedTo: "Alice",                                         │
│   ...                                                          │
│ }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Display case details                                  │
│ - Client name shown: "John Smith" (read-only)                  │
│ - All other fields editable (if admin)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Client Update Flow (New)

```
┌─────────────────────────────────────────────────────────────────┐
│ User: Updates client name from Client Details page              │
│ firstName: "John" → "Jane"                                      │
│ lastName: "Doe" → "Smith"                                       │
│ nationalId: "ID12345" → "ID99999"                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: ClientHandler.update()                                 │
│ 1. Detect changes in firstName, lastName, or nationalId        │
│ 2. Update clients sheet                                        │
│ 3. Trigger folder rename if name/id changed                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: DriveService.renameClientFolder()                      │
│ 1. Get current folder by folderId                              │
│ 2. Old name: "John_Doe_ID12345"                               │
│ 3. New name: "Jane_Smith_ID99999"                             │
│ 4. Rename folder in Drive                                      │
│ 5. All case subfolders automatically move with parent          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Result: Consistency maintained                                  │
│ - Clients sheet: "Jane Smith", "ID99999"                       │
│ - Folder name: "Jane_Smith_ID99999"                           │
│ - All cases show: clientName = "Jane Smith" (dynamic lookup)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Changes Required

### 1. Backend: SheetsService.gs

**File**: `gas/services/SheetsService.gs`

#### Change 1.1: Update Schema Documentation
```javascript
/**
 * Metadata Schema (Updated for Feature 007):
 * A: caseId, B: caseName, C: clientId (UUID), D: assignedTo, E: caseType,
 * F: status, G: notes, H: createdBy, I: createdAt, J: assignedAt,
 * K: lastUpdatedBy, L: lastUpdatedAt, M: version
 *
 * NOTE: clientName removed - fetched dynamically from clients sheet
 */
```

#### Change 1.2: Update parseRow() Method
```javascript
parseRow: function(row, rowIndex, includeSystemFields) {
  const caseData = {
    caseId: row[0],          // A: caseId
    caseName: row[1],        // B: caseName
    clientId: row[2],        // C: clientId (UUID)
    // clientName removed - will be fetched separately
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

#### Change 1.3: Add enrichCaseWithClientName() Helper
```javascript
/**
 * Enriches case data with client name from clients sheet
 * @param {Object} caseData - Case data object
 * @returns {Object} Case data with clientName added
 */
enrichCaseWithClientName: function(caseData) {
  if (!caseData) {
    return caseData;
  }

  if (caseData.clientId) {
    const client = this.getClientById(caseData.clientId);
    if (client) {
      caseData.clientName = `${client.firstName} ${client.lastName}`;
    } else {
      caseData.clientName = '[Client Not Found]';
      Logger.log(`WARNING: Client not found for clientId: ${caseData.clientId}`);
    }
  } else {
    caseData.clientName = '[No Client]';
  }

  return caseData;
},

/**
 * Enriches multiple cases with client names
 * @param {Array} cases - Array of case data objects
 * @returns {Array} Cases with clientNames added
 */
enrichCasesWithClientNames: function(cases) {
  if (!Array.isArray(cases)) {
    return cases;
  }

  // Build client lookup map for efficiency
  const clientIds = [...new Set(cases.map(c => c.clientId).filter(Boolean))];
  const clientMap = {};

  clientIds.forEach(clientId => {
    const client = this.getClientById(clientId);
    if (client) {
      clientMap[clientId] = `${client.firstName} ${client.lastName}`;
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

#### Change 1.4: Update getCaseById()
```javascript
getCaseById: function(caseId) {
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === caseId) {
      const caseData = this.parseRow(row, i + 1, true);
      // Enrich with client name
      return this.enrichCaseWithClientName(caseData);
    }
  }

  return null;
},
```

#### Change 1.5: Update searchCasesByName()
```javascript
searchCasesByName: function(firstName, lastName) {
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();
  const results = [];

  // Build client lookup for faster searching
  const clients = this.getAllClients();
  const matchingClientIds = [];

  // Normalize search terms
  const searchFirst = firstName ? firstName.toLowerCase().trim() : null;
  const searchLast = lastName ? lastName.toLowerCase().trim() : null;

  // Find matching clients
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

  // Find cases for matching clients
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const clientId = row[2]; // Column C

    if (matchingClientIds.includes(clientId)) {
      results.push(this.parseRow(row, i + 1, false));
    }
  }

  // Enrich with client names
  return this.enrichCasesWithClientNames(results);
},
```

#### Change 1.6: Update createCase()
```javascript
createCase: function(caseData, currentUser) {
  // ... existing validation ...

  const row = [
    caseData.caseId,                       // A: caseId
    caseData.caseName || '',               // B: caseName
    caseData.clientId,                     // C: clientId (UUID)
    // clientName removed - no longer stored
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

  sheet.appendRow(row);

  // Return case with client name enriched
  const createdCase = this.getCaseById(caseData.caseId);
  return createdCase; // Already enriched by getCaseById()
},
```

#### Change 1.7: Update updateCase()
```javascript
updateCase: function(caseId, updates, expectedVersion, currentUser) {
  // Reject clientId updates (existing)
  if (updates.hasOwnProperty('clientId')) {
    throw ResponseHandler.validationError(
      'clientId is immutable and cannot be updated',
      'metadata.update.error.clientIdImmutable'
    );
  }

  // NEW: Reject clientName updates
  if (updates.hasOwnProperty('clientName')) {
    throw ResponseHandler.validationError(
      'clientName cannot be updated from case details. Update client information from Client Details page.',
      'metadata.update.error.clientNameImmutable'
    );
  }

  // ... rest of update logic ...
  // Note: Column indices shifted left by 1

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

  // Update system fields (indices shifted left by 1)
  if (assignedToChanged) {
    sheet.getRange(row, 10).setValue(now); // J: assignedAt (shifted from K)
  }
  sheet.getRange(row, 11).setValue(currentUser);         // K: lastUpdatedBy (shifted from L)
  sheet.getRange(row, 12).setValue(now);                 // L: lastUpdatedAt (shifted from M)
  sheet.getRange(row, 13).setValue(expectedVersion + 1); // M: version (shifted from N)

  return this.getCaseById(caseId); // Returns with enriched client name
},
```

---

### 2. Backend: ClientHandler.gs

**File**: `gas/handlers/ClientHandler.gs`

#### Change 2.1: Add Folder Renaming Logic to update()

```javascript
update: function(context) {
  // ... existing authorization and validation ...

  const { clientId, updates } = context.data;

  // Get current client data
  const currentClient = SheetsService.getClientById(clientId);
  if (!currentClient) {
    throw ResponseHandler.notFoundError(
      'Client not found',
      'client.update.error.notfound'
    );
  }

  // ========================================
  // Check if folder rename is needed
  // ========================================
  const needsFolderRename = (
    (updates.firstName && updates.firstName !== currentClient.firstName) ||
    (updates.lastName && updates.lastName !== currentClient.lastName) ||
    (updates.nationalId && updates.nationalId !== currentClient.nationalId)
  );

  // Update client in sheets
  const updatedClient = SheetsService.updateClient(clientId, updates);

  // ========================================
  // Rename folder if needed
  // ========================================
  if (needsFolderRename && updatedClient.folderId) {
    try {
      const newFolderName = this._buildFolderName(
        updatedClient.firstName,
        updatedClient.lastName,
        updatedClient.nationalId
      );

      DriveService.renameFolder(updatedClient.folderId, newFolderName);

      Logger.log(`Client folder renamed: ${currentClient.firstName}_${currentClient.lastName}_${currentClient.nationalId} → ${newFolderName}`);
    } catch (error) {
      Logger.log(`WARNING: Failed to rename client folder: ${error.message}`);
      // Don't fail the whole update if folder rename fails
      // Client data is already updated in sheet
    }
  }

  // Generate new token
  const newToken = TokenManager.generateToken(context.user.email);

  return ResponseHandler.successWithToken(
    'client.update.success',
    'Client updated successfully',
    {
      client: updatedClient
    },
    context.user,
    newToken.value
  );
},

/**
 * Helper: Build folder name from client data
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

---

### 3. Backend: DriveService.gs

**File**: `gas/services/DriveService.gs`

#### Change 3.1: Add renameFolder() Method

```javascript
/**
 * Renames a folder in Google Drive
 * @param {string} folderId - Folder ID to rename
 * @param {string} newName - New folder name
 * @returns {Object} Updated folder info
 */
renameFolder: function(folderId, newName) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const oldName = folder.getName();

    // Rename the folder
    folder.setName(newName);

    Logger.log(`Folder renamed: "${oldName}" → "${newName}"`);

    return {
      folderId: folderId,
      oldName: oldName,
      newName: newName,
      folderUrl: folder.getUrl()
    };
  } catch (error) {
    throw new Error(`Failed to rename folder: ${error.message}`);
  }
},
```

---

### 4. Backend: CaseHandler.gs

**File**: `gas/handlers/CaseHandler.gs`

#### Change 4.1: Remove clientName from Metadata Creation

```javascript
create: function(context) {
  // ... existing validation ...

  const caseMetadata = {
    caseId: caseId,
    caseName: caseId,
    clientId: clientId,
    // clientName removed - will be fetched dynamically
    assignedTo: '',
    caseType: '',
    status: '',
    notes: '',
    createdBy: createdBy,
    createdAt: now
  };

  // SheetsService.createCase() will enrich with clientName
  SheetsService.createCase(caseMetadata, createdBy);

  // ... rest of method ...
},
```

---

### 5. Frontend: Case Details Pages

**Files**:
- `src/pages/CaseEditPage.vue`
- Any component displaying case details

#### Change 5.1: Make Client Name Read-Only

```vue
<template>
  <q-form @submit="handleSubmit">
    <!-- Client Name - Read-Only -->
    <q-input
      v-model="caseData.clientName"
      label="Client"
      readonly
      filled
      disable
      class="q-mb-md"
    >
      <template v-slot:hint>
        {{ $t('case.edit.clientNameHint') }}
      </template>
    </q-input>

    <!-- Other editable fields -->
    <q-input
      v-model="caseData.caseName"
      label="Case Name"
      outlined
    />
    <!-- ... -->
  </q-form>
</template>

<script setup>
async function handleSubmit() {
  const updates = {
    caseName: caseData.value.caseName,
    assignedTo: caseData.value.assignedTo,
    caseType: caseData.value.caseType,
    status: caseData.value.status,
    notes: caseData.value.notes
    // clientName explicitly excluded
  };

  await metadataApi.updateCase(caseData.value.caseId, updates, caseData.value.version);
}
</script>
```

---

### 6. i18n Updates

**Files**:
- `src/i18n/en-US.js`
- `src/i18n/fr-FR/index.js`

#### Change 6.1: Add New Messages

**English**:
```javascript
metadata: {
  update: {
    error: {
      clientNameImmutable: "Client name cannot be updated from case details. Please update client information from the Client Details page."
    }
  }
},
case: {
  edit: {
    clientNameHint: "Client name can only be edited from the Client Details page"
  }
}
```

**French**:
```javascript
metadata: {
  update: {
    error: {
      clientNameImmutable: "Le nom du client ne peut pas être modifié depuis les détails du dossier. Veuillez mettre à jour les informations du client depuis la page Détails du Client."
    }
  }
},
case: {
  edit: {
    clientNameHint: "Le nom du client ne peut être modifié que depuis la page Détails du Client"
  }
}
```

---

## Migration Strategy

### Phase 1: Code Deployment (No Schema Change Yet)

**Deploy all code changes EXCEPT schema change**:
1. Deploy backend with enrichment logic
2. Deploy frontend with read-only client name
3. System works with BOTH clientId and clientName in sheet

**Testing**:
- Verify dynamic client name lookup works
- Verify client name read-only in UI
- Verify folder renaming works

### Phase 2: Schema Change

**AFTER confirming Phase 1 works**:

1. **Backup**: Run backup script
2. **Delete Column D**: Manually delete clientName column from metadata sheet
3. **Verify**: All columns shifted correctly

### Phase 3: Validation

1. Test case creation (clientName fetched dynamically)
2. Test case viewing (clientName shown correctly)
3. Test case search (finds cases by client name)
4. Test client update (folder renamed correctly)

---

## Client Folder Renaming

### Trigger Conditions

Folder rename triggered when ANY of these fields change:
- `firstName`
- `lastName`
- `nationalId`

### Rename Logic

```javascript
// Before
{
  firstName: "John",
  lastName: "Doe",
  nationalId: "ID12345",
  folderId: "folder-123"
}
Folder name: "John_Doe_ID12345"

// User updates
updates = {
  firstName: "Jane",
  nationalId: "ID99999"
}

// After
{
  firstName: "Jane",
  lastName: "Doe",
  nationalId: "ID99999",
  folderId: "folder-123"  // Same folder, renamed
}
Folder name: "Jane_Doe_ID99999"
```

### Case Folders Behavior

**Important**: Case subfolders automatically move with parent folder when renamed
- No need to update case folder references
- Case folders remain as subfolders
- Folder structure preserved

```
Before:
└── John_Doe_ID12345/
    ├── TAX-2024/
    └── LEGAL-2024/

After rename:
└── Jane_Doe_ID99999/
    ├── TAX-2024/        ← Automatically moved
    └── LEGAL-2024/      ← Automatically moved
```

### Error Handling

**If folder rename fails**:
- Log warning
- DO NOT fail the client update
- Client data in sheet is already updated
- Admin can manually rename folder later

**Reasons for failure**:
- Folder doesn't exist
- Folder already has that name
- Permission issues
- Drive API error

---

## Testing Plan

### Unit Tests

#### Test 1: Dynamic Client Name Lookup
```javascript
function testEnrichCaseWithClientName() {
  const caseData = {
    caseId: 'TEST-001',
    clientId: 'uuid-123',
    caseName: 'Test Case'
  };

  const enriched = SheetsService.enrichCaseWithClientName(caseData);

  assert(enriched.clientName === 'John Doe', 'Client name should be fetched');
  assert(enriched.clientId === 'uuid-123', 'ClientId should be preserved');
}
```

#### Test 2: Batch Enrichment
```javascript
function testEnrichCasesWithClientNames() {
  const cases = [
    { caseId: 'C1', clientId: 'uuid-1' },
    { caseId: 'C2', clientId: 'uuid-2' },
    { caseId: 'C3', clientId: 'uuid-1' } // Same client
  ];

  const enriched = SheetsService.enrichCasesWithClientNames(cases);

  assert(enriched[0].clientName === 'Client One');
  assert(enriched[1].clientName === 'Client Two');
  assert(enriched[2].clientName === 'Client One');
  assert(enriched.length === 3);
}
```

#### Test 3: Folder Rename
```javascript
function testClientFolderRename() {
  const updates = {
    firstName: 'Jane',
    lastName: 'Smith'
  };

  const result = ClientHandler.update({
    data: { clientId: 'uuid-123', updates: updates },
    user: { email: 'admin@example.com', role: 'ROLE_ADMIN' }
  });

  const folder = DriveApp.getFolderById(result.data.client.folderId);
  assert(folder.getName() === 'Jane_Smith_ID12345');
}
```

#### Test 4: clientName Update Rejected
```javascript
function testRejectClientNameUpdate() {
  const updates = {
    caseName: 'Updated',
    clientName: 'Hacker Name' // Should be rejected
  };

  try {
    SheetsService.updateCase('C-001', updates, 1, 'admin@example.com');
    assert(false, 'Should have thrown error');
  } catch (error) {
    assert(error.message.includes('clientName cannot be updated'));
  }
}
```

### Integration Tests

#### Test 5: End-to-End Client Name Update
1. Create client "John Doe"
2. Create case for that client
3. View case details - verify shows "John Doe"
4. Update client to "Jane Smith"
5. View case details again - verify shows "Jane Smith"
6. Verify folder renamed to "Jane_Smith_..."

#### Test 6: Search by Client Name
1. Create clients "Alice Cooper" and "Bob Cooper"
2. Create cases for each
3. Search by lastName "Cooper"
4. Verify both cases returned
5. Verify clientName correctly shown for each

### Manual Tests

#### Test 7: UI Verification
- [ ] Case details page shows client name
- [ ] Client name field is readonly and disabled
- [ ] Hint text displayed
- [ ] Cannot submit form with clientName in updates
- [ ] Error message shown if attempt to update clientName

#### Test 8: Folder Rename Verification
- [ ] Update client firstName - folder renamed
- [ ] Update client lastName - folder renamed
- [ ] Update client nationalId - folder renamed
- [ ] Update other fields - folder NOT renamed
- [ ] Case subfolders still accessible
- [ ] Folder URL still works

---

## Success Criteria

### Must Have
- [ ] Column D (clientName) removed from metadata sheet
- [ ] All columns after clientId shifted left by 1
- [ ] Dynamic client name lookup implemented
- [ ] Client name shown in case details (fetched dynamically)
- [ ] Client name read-only in case details UI
- [ ] Client name updates rejected from case update endpoint
- [ ] Client folder renamed when firstName/lastName/nationalId changes
- [ ] All existing functionality still works
- [ ] No data loss

### Should Have
- [ ] Performance acceptable (< 500ms per case fetch)
- [ ] Batch operations optimized
- [ ] Error handling for missing clients
- [ ] Comprehensive test coverage
- [ ] Folder rename error handling

### Nice to Have
- [ ] Cache client names in memory (short-lived)
- [ ] Admin tool to verify all cases have valid clientIds
- [ ] Audit log of folder renames

---

## Risks and Mitigation

### Risk 1: Performance Degradation
**Impact**: Medium
**Probability**: Medium

**Mitigation**:
- Implement batch client lookup for multiple cases
- Use client map for efficiency
- Monitor performance metrics
- Consider short-lived caching if needed

### Risk 2: Folder Rename Failures
**Impact**: Low
**Probability**: Low

**Mitigation**:
- Error handling that doesn't fail client update
- Logging of all rename attempts
- Admin notification of failures
- Manual rename process documented

### Risk 3: Missing Clients
**Impact**: Low
**Probability**: Low

**Mitigation**:
- Show "[Client Not Found]" placeholder
- Log warnings for missing clients
- Admin tool to identify orphaned cases
- Validation during case creation

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Specification** | 1 day | ✅ Complete |
| **Backend Development** | 2 days | SheetsService, ClientHandler, DriveService |
| **Frontend Development** | 1 day | Make client name read-only |
| **Testing** | 2 days | Unit, integration, manual tests |
| **Schema Migration** | 1 day | Delete column, validation |
| **Deployment** | 1 day | Deploy to production |
| **Total** | **8 days** | |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Status**: Specification Complete
**Next Steps**: Review and approve, then create implementation plan
