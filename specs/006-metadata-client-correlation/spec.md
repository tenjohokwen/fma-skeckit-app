# Feature 006: Metadata Sheet Client Correlation

**Feature**: Add `clientId` field to metadata sheet for proper client-case correlation
**Date**: 2025-10-17
**Priority**: High
**Status**: Specification Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Sheet Schema](#sheet-schema)
5. [Requirements](#requirements)
6. [Data Flow](#data-flow)
7. [Code Changes Required](#code-changes-required)
8. [Migration Strategy](#migration-strategy)
9. [Testing Plan](#testing-plan)
10. [Success Criteria](#success-criteria)

---

## Overview

### Current State

The metadata sheet currently uses `clientName` (a composite of first name and last name) to associate cases with clients. This approach has limitations:
- Names are not unique identifiers
- Multiple clients can have the same name
- Name changes require updating all related cases
- Difficult to generate accurate charts and analytics

### Desired State

Add a `clientId` field to the metadata sheet that:
- Establishes a proper foreign key relationship with the clients sheet
- Enables accurate data correlation for analytics and charts
- Remains hidden from users (system-managed field)
- Is automatically populated when case metadata is created

---

## Problem Statement

### Current Limitations

1. **No Unique Correlation**: Cases are linked to clients via `clientName` (string), which is not unique
   - Client "John Doe" could refer to multiple different people
   - No guarantee of data integrity

2. **Fragile Relationships**: If client name changes, case records become orphaned
   - Updating client name in clients sheet doesn't update related cases
   - Manual reconciliation required

3. **Analytics Challenges**: Generating charts and reports is unreliable
   - Aggregating cases by client requires string matching
   - Name variations (typos, formatting) cause data fragmentation

4. **Data Integrity**: No referential integrity between clients and cases
   - Cases can reference non-existent clients
   - No cascade updates or validation

### Example Scenario

```
Clients Sheet:
┌──────────┬───────────┬──────────┬─────────────┐
│ clientId │ firstName │ lastName │ nationalId  │
├──────────┼───────────┼──────────┼─────────────┤
│ uuid-001 │ John      │ Doe      │ ID12345     │
│ uuid-002 │ John      │ Doe      │ ID67890     │ ← Different person!
└──────────┴───────────┴──────────┴─────────────┘

Metadata Sheet (Current):
┌────────┬──────────┬────────────┬───────┐
│ caseId │ caseName │ clientName │ notes │
├────────┼──────────┼────────────┼───────┤
│ C-001  │ Tax Case │ John Doe   │ ...   │ ← Which John Doe?
└────────┴──────────┴────────────┴───────┘

Metadata Sheet (Desired):
┌────────┬──────────┬──────────┬────────────┬───────┐
│ caseId │ caseName │ clientId │ clientName │ notes │
├────────┼──────────┼──────────┼────────────┼───────┤
│ C-001  │ Tax Case │ uuid-001 │ John Doe   │ ...   │ ← Exact match!
└────────┴──────────┴──────────┴────────────┴───────┘
```

---

## Solution

### Add `clientId` Column to Metadata Sheet

**Column Position**: Between `caseName` and `clientName` (Column C)

**Updated Schema**:
```
Column A: caseId
Column B: caseName
Column C: clientId          ← NEW FIELD
Column D: clientName
Column E: assignedTo
Column F: caseType
Column G: status
Column H: notes
Column I: createdBy
Column J: createdAt
Column K: assignedAt
Column L: lastUpdatedBy
Column M: lastUpdatedAt
Column N: version
```

### Key Characteristics

| Aspect | Specification |
|--------|--------------|
| **Data Type** | String (UUID format) |
| **Required** | Yes (when case is created) |
| **Editable by User** | No (system-managed) |
| **Visible to User** | No (hidden in UI) |
| **Source** | Copied from clients sheet during case creation |
| **Validation** | Must match existing clientId in clients sheet |
| **Nullable** | No (must always have a value) |
| **Unique** | No (one client can have multiple cases) |

---

## Sheet Schema

### Updated Metadata Sheet Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        METADATA SHEET                                   │
├───────┬──────────┬──────────┬────────────┬────────────┬──────────┬─────┤
│ COL   │ FIELD    │ TYPE     │ REQUIRED   │ EDITABLE   │ VISIBLE  │ SRC │
├───────┼──────────┼──────────┼────────────┼────────────┼──────────┼─────┤
│ A     │ caseId   │ String   │ Yes        │ Yes (UI)   │ Yes      │ UI  │
│ B     │ caseName │ String   │ Yes        │ Yes (UI)   │ Yes      │ UI  │
│ C     │ clientId │ UUID     │ Yes        │ No (Auto)  │ No       │ SYS │ ← NEW
│ D     │ clientName│String   │ Yes        │ No (Auto)  │ Yes      │ SYS │
│ E     │ assignedTo│String   │ No         │ Yes (UI)   │ Yes      │ UI  │
│ F     │ caseType │ String   │ No         │ Yes (UI)   │ Yes      │ UI  │
│ G     │ status   │ String   │ No         │ Yes (UI)   │ Yes      │ UI  │
│ H     │ notes    │ String   │ No         │ Yes (UI)   │ Yes      │ UI  │
│ I     │ createdBy│ String   │ Yes        │ No (Auto)  │ Yes      │ SYS │
│ J     │ createdAt│ DateTime │ Yes        │ No (Auto)  │ Yes      │ SYS │
│ K     │ assignedAt│DateTime │ No         │ No (Auto)  │ Yes      │ SYS │
│ L     │ lastUpdatedBy│String│ Yes        │ No (Auto)  │ Yes      │ SYS │
│ M     │ lastUpdatedAt│DateTime│Yes       │ No (Auto)  │ Yes      │ SYS │
│ N     │ version  │ Number   │ Yes        │ No (Auto)  │ No       │ SYS │
└───────┴──────────┴──────────┴────────────┴────────────┴──────────┴─────┘

Legend:
- UI: User Input (via frontend form)
- SYS: System-managed (auto-populated)
```

### Clients Sheet Reference

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENTS SHEET                               │
├───────┬──────────────┬──────────┬────────────┬──────────┬─────────┤
│ COL   │ FIELD        │ TYPE     │ REQUIRED   │ UNIQUE   │ VISIBLE │
├───────┼──────────────┼──────────┼────────────┼──────────┼─────────┤
│ A     │ clientId     │ UUID     │ Yes        │ Yes      │ No      │ ← PRIMARY KEY
│ B     │ firstName    │ String   │ Yes        │ No       │ Yes     │
│ C     │ lastName     │ String   │ Yes        │ No       │ Yes     │
│ D     │ nationalId   │ String   │ Yes        │ Yes      │ Yes     │
│ E     │ telephone    │ String   │ No         │ No       │ Yes     │
│ F     │ email        │ String   │ No         │ No       │ Yes     │
│ G     │ folderId     │ String   │ Yes        │ No       │ Yes     │
└───────┴──────────────┴──────────┴────────────┴──────────┴─────────┘
```

### Relationship Diagram

```
┌─────────────────────────┐
│   CLIENTS SHEET         │
│                         │
│ • clientId (PK)         │───────┐
│ • firstName             │       │
│ • lastName              │       │ Foreign Key
│ • nationalId            │       │ Relationship
│ • telephone             │       │
│ • email                 │       │
│ • folderId              │       │
└─────────────────────────┘       │
                                  │
                                  ▼
                        ┌─────────────────────────┐
                        │   METADATA SHEET        │
                        │                         │
                        │ • caseId                │
                        │ • caseName              │
                        │ • clientId (FK) ────────┤
                        │ • clientName            │
                        │ • assignedTo            │
                        │ • caseType              │
                        │ • status                │
                        │ • notes                 │
                        │ • createdBy             │
                        │ • createdAt             │
                        │ • assignedAt            │
                        │ • lastUpdatedBy         │
                        │ • lastUpdatedAt         │
                        │ • version               │
                        └─────────────────────────┘
```

---

## Requirements

### Functional Requirements

#### FR-001: clientId Must Be Populated on Case Creation
**Priority**: Critical
**Description**: When a new case is created, the system must automatically populate the `clientId` field with the UUID from the clients sheet.

**Acceptance Criteria**:
- ✅ Backend retrieves clientId from clients sheet based on client folder context
- ✅ clientId is written to metadata sheet Column C
- ✅ clientId matches the exact UUID from clients sheet
- ✅ If clientId cannot be determined, case creation fails with clear error
- ✅ clientId is never null or empty

**Test Case**:
```javascript
// Given: Client exists with clientId = "abc-123-def-456"
// When: User creates case for this client
// Then: Metadata row should have clientId = "abc-123-def-456" in Column C
```

---

#### FR-002: clientId Must Never Be Visible to Users
**Priority**: Critical
**Description**: The `clientId` field must be completely hidden from all user interfaces.

**Acceptance Criteria**:
- ✅ Frontend does NOT display clientId in case view/edit forms
- ✅ Frontend does NOT include clientId in editable fields
- ✅ Search results do NOT show clientId
- ✅ API responses include clientId in data, but UI ignores it
- ✅ Only `clientName` is visible to users

**UI Specification**:
```vue
<!-- ❌ WRONG: Don't show clientId -->
<div>
  <label>Client ID:</label>
  <input v-model="caseData.clientId" />
</div>

<!-- ✅ CORRECT: Only show clientName -->
<div>
  <label>Client:</label>
  <div>{{ caseData.clientName }}</div>
</div>
```

---

#### FR-003: clientId Must Never Be Editable by Users
**Priority**: Critical
**Description**: Users cannot modify the `clientId` field through any interface.

**Acceptance Criteria**:
- ✅ Case edit forms do NOT allow changing clientId
- ✅ API update endpoints reject clientId in updates object
- ✅ Backend enforces clientId immutability
- ✅ Attempting to update clientId returns validation error

**Backend Validation**:
```javascript
// In updateCaseMetadata handler
if (updates.clientId !== undefined) {
  throw ResponseHandler.validationError(
    'clientId is system-managed and cannot be updated',
    'metadata.update.error.clientIdImmutable'
  )
}
```

---

#### FR-004: clientId Must Match Clients Sheet
**Priority**: High
**Description**: The clientId in metadata sheet must reference a valid, existing clientId in the clients sheet.

**Acceptance Criteria**:
- ✅ Backend validates clientId exists in clients sheet
- ✅ Creating case with non-existent clientId fails
- ✅ Orphaned cases (clientId not found) are flagged in admin tools
- ✅ Data integrity reports include clientId validation

---

#### FR-005: Support Chart Generation with clientId
**Priority**: Medium
**Description**: Analytics and chart generation must use `clientId` for accurate aggregation.

**Acceptance Criteria**:
- ✅ Backend provides chart data endpoints using clientId
- ✅ "Cases per Client" chart groups by clientId, displays clientName
- ✅ "Client Activity" timeline uses clientId for correlation
- ✅ Analytics correctly handle multiple clients with same name

**Example Query**:
```javascript
// Get case count per client
function getCasesPerClient() {
  const metadata = getAllCases()
  const clientCounts = {}

  metadata.forEach(caseRow => {
    const clientId = caseRow.clientId
    const clientName = caseRow.clientName

    if (!clientCounts[clientId]) {
      clientCounts[clientId] = {
        clientId: clientId,
        clientName: clientName,
        count: 0
      }
    }
    clientCounts[clientId].count++
  })

  return Object.values(clientCounts)
}
```

---

### Non-Functional Requirements

#### NFR-001: Backward Compatibility
**Description**: Existing cases without clientId must be handled gracefully.

**Strategy**:
- Migration script populates clientId for existing cases
- Fallback to clientName matching if clientId missing (temporary)
- Admin tools to identify and fix cases with missing clientId

---

#### NFR-002: Performance
**Description**: Adding clientId must not degrade system performance.

**Metrics**:
- Case creation: < 2 seconds (unchanged)
- Case search: < 1 second (unchanged)
- Chart generation: < 3 seconds (improved with proper indexing)

---

#### NFR-003: Data Integrity
**Description**: Ensure clientId values remain consistent and valid.

**Measures**:
- Validation on case creation
- Periodic data integrity checks
- Admin reports for orphaned cases
- Audit logs for clientId-related operations

---

## Data Flow

### Case Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER CREATES CASE                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: ClientDetailsPage.vue                                │
│  User clicks "Create New Case" for a client                     │
│                                                                 │
│  Context Available:                                             │
│  - Client object with clientId: "abc-123"                       │
│  - Client name: "John Doe"                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: API Call                                             │
│                                                                 │
│  api.post('metadata.createCaseMetadata', {                      │
│    caseId: 'CASE-001',                                          │
│    caseName: 'Tax Case',                                        │
│    clientId: 'abc-123',        ← Passed from client context    │
│    clientName: 'John Doe',     ← For display/audit             │
│    caseType: 'Tax',                                             │
│    notes: '...'                                                 │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: MetadataHandler.createCaseMetadata()                  │
│                                                                 │
│  1. Validate clientId is provided                               │
│  2. Validate clientId exists in clients sheet                   │
│  3. Prepare case data object                                    │
│  4. Call SheetsService.createCase()                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: SheetsService.createCase()                            │
│                                                                 │
│  1. Get metadata sheet                                          │
│  2. Append new row with ALL columns:                            │
│     [caseId, caseName, clientId, clientName, ...]              │
│                                ↑                                │
│                                │                                │
│                         Column C gets clientId                  │
│  3. Return created case object                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Metadata Sheet Updated                                         │
│                                                                 │
│  Row N: [CASE-001, Tax Case, abc-123, John Doe, ...]          │
│                              ↑                                  │
│                         clientId stored                         │
└─────────────────────────────────────────────────────────────────┘
```

### Case Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User updates case details (name, status, notes, etc.)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: api.post('metadata.updateCaseMetadata', {            │
│    caseId: 'CASE-001',                                          │
│    version: 5,                                                  │
│    updates: {                                                   │
│      caseName: 'Updated Tax Case',                              │
│      status: 'In Progress'                                      │
│      // ❌ clientId NOT included (immutable)                    │
│    }                                                            │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: MetadataHandler.updateCaseMetadata()                  │
│                                                                 │
│  1. Validate clientId NOT in updates object                     │
│  2. If clientId present → throw validation error                │
│  3. Otherwise proceed with update                               │
│  4. clientId remains unchanged in sheet                         │
└─────────────────────────────────────────────────────────────────┘
```

### Chart Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin requests "Cases Per Client" chart                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: ChartHandler.getCasesPerClient()                      │
│                                                                 │
│  1. Fetch all cases from metadata sheet                         │
│  2. Group by clientId (NOT clientName)                          │
│  3. Aggregate counts                                            │
│  4. Lookup clientName for display                               │
│  5. Return chart data                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Chart Data Response:                                           │
│                                                                 │
│  [                                                              │
│    {                                                            │
│      clientId: "abc-123",        ← Used for grouping           │
│      clientName: "John Doe",     ← Displayed in chart          │
│      caseCount: 5                                               │
│    },                                                           │
│    {                                                            │
│      clientId: "def-456",                                       │
│      clientName: "Jane Smith",                                  │
│      caseCount: 3                                               │
│    }                                                            │
│  ]                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Changes Required

### 1. Backend: SheetsService.gs

**File**: `gas/services/SheetsService.gs`

**Changes**:

1. Update column mapping constants
2. Update `createCase()` to handle clientId
3. Update `getCaseById()` to return clientId
4. Update `searchCasesByName()` to return clientId
5. Update `updateCase()` to validate clientId immutability

**Column Mapping Update**:
```javascript
// OLD
const METADATA_COLUMNS = {
  CASE_ID: 0,       // A
  CASE_NAME: 1,     // B
  CLIENT_NAME: 2,   // C ← This shifts!
  ASSIGNED_TO: 3,   // D
  // ...
}

// NEW
const METADATA_COLUMNS = {
  CASE_ID: 0,       // A
  CASE_NAME: 1,     // B
  CLIENT_ID: 2,     // C ← NEW
  CLIENT_NAME: 3,   // D ← Shifted from C
  ASSIGNED_TO: 4,   // E ← Shifted from D
  CASE_TYPE: 5,     // F
  STATUS: 6,        // G
  NOTES: 7,         // H
  CREATED_BY: 8,    // I
  CREATED_AT: 9,    // J
  ASSIGNED_AT: 10,  // K
  LAST_UPDATED_BY: 11, // L
  LAST_UPDATED_AT: 12, // M
  VERSION: 13       // N
}
```

**createCase() Update**:
```javascript
createCase: function(caseData, currentUser) {
  // Validate clientId is provided
  if (!caseData.clientId) {
    throw new Error('clientId is required for case creation')
  }

  // Validate clientId exists in clients sheet
  const client = this.getClientById(caseData.clientId)
  if (!client) {
    throw new Error(`Client with ID ${caseData.clientId} not found`)
  }

  const sheet = this.getMetadataSheet()
  const now = DateUtil.getCurrentTimestamp()

  const rowData = [
    caseData.caseId,                    // A: caseId
    caseData.caseName || '',            // B: caseName
    caseData.clientId,                  // C: clientId ← NEW
    caseData.clientName,                // D: clientName
    caseData.assignedTo || '',          // E: assignedTo
    caseData.caseType || '',            // F: caseType
    caseData.status || '',              // G: status
    caseData.notes || '',               // H: notes
    currentUser,                        // I: createdBy
    now,                                // J: createdAt
    caseData.assignedAt || '',          // K: assignedAt
    currentUser,                        // L: lastUpdatedBy
    now,                                // M: lastUpdatedAt
    1                                   // N: version
  ]

  sheet.appendRow(rowData)

  return {
    caseId: caseData.caseId,
    caseName: caseData.caseName,
    clientId: caseData.clientId,        // ← Return in response
    clientName: caseData.clientName,
    // ... other fields
  }
}
```

**getCaseById() Update**:
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
        // ... other fields
      }
    }
  }

  return null
}
```

**updateCase() Validation**:
```javascript
updateCase: function(caseId, updates, version, currentUser) {
  // Prevent clientId updates
  if (updates.hasOwnProperty('clientId')) {
    throw new Error('clientId is immutable and cannot be updated')
  }

  // Rest of update logic...
}
```

---

### 2. Backend: MetadataHandler.gs

**File**: `gas/handlers/MetadataHandler.gs`

**Changes**:

1. Update `createCaseMetadata()` to require and validate clientId
2. Update `updateCaseMetadata()` to reject clientId in updates
3. Ensure all responses include clientId

**createCaseMetadata() Update**:
```javascript
createCaseMetadata: function(context) {
  // ... admin check ...

  const caseData = context.data

  SecurityInterceptor.validateRequiredFields(caseData, [
    'caseId',
    'clientId',      // ← NEW: Required field
    'clientFirstName',
    'clientLastName',
    'folderName',
    'folderPath'
  ])

  // Validate clientId format (UUID)
  if (!this._isValidUUID(caseData.clientId)) {
    throw ResponseHandler.validationError(
      'clientId must be a valid UUID',
      'metadata.create.error.invalidClientId'
    )
  }

  // Create case
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
},

_isValidUUID: function(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

**updateCaseMetadata() Validation**:
```javascript
updateCaseMetadata: function(context) {
  // ... admin check ...

  const { caseId, version, updates } = context.data

  // Validate clientId is NOT in updates
  if (updates.hasOwnProperty('clientId')) {
    throw ResponseHandler.validationError(
      'clientId is system-managed and cannot be updated',
      'metadata.update.error.clientIdImmutable'
    )
  }

  // Rest of update logic...
}
```

---

### 3. Frontend: Store (Optional Enhancement)

**File**: `src/stores/case.js` (if exists, or create)

**Purpose**: Type definitions and validation

```javascript
// Case data structure
export const useCaseStore = defineStore('case', () => {
  const cases = ref([])

  // Case schema
  const caseSchema = {
    caseId: String,
    caseName: String,
    clientId: String,    // ← NEW: System-managed, hidden from UI
    clientName: String,  // Display only
    assignedTo: String,
    caseType: String,
    status: String,
    notes: String,
    createdBy: String,
    createdAt: String,
    lastUpdatedBy: String,
    lastUpdatedAt: String,
    version: Number
  }

  // Filter out clientId for UI display
  function sanitizeForUI(caseData) {
    const { clientId, ...uiData } = caseData
    // clientId removed, not shown in UI
    return uiData
  }

  return {
    cases,
    caseSchema,
    sanitizeForUI
  }
})
```

---

### 4. Frontend: Case Creation Components

**File**: `src/pages/ClientDetailsPage.vue` or case creation form

**Change**: Pass clientId when creating case

```vue
<script setup>
import { ref } from 'vue'
import { api } from 'src/services/api'

const props = defineProps({
  client: Object  // Contains clientId, firstName, lastName
})

async function createCase(caseData) {
  try {
    const response = await api.post('metadata.createCaseMetadata', {
      caseId: caseData.caseId,
      caseName: caseData.caseName,
      clientId: props.client.clientId,        // ← Pass from client context
      clientFirstName: props.client.firstName,
      clientLastName: props.client.lastName,
      clientName: `${props.client.firstName} ${props.client.lastName}`,
      folderName: props.client.folderName,
      folderPath: props.client.folderPath,
      caseType: caseData.caseType,
      notes: caseData.notes
    })

    // Success!
    return response.data
  } catch (error) {
    console.error('Failed to create case:', error)
    throw error
  }
}
</script>

<template>
  <!-- Case creation form -->
  <!-- ❌ Do NOT show clientId field -->
  <!-- ✅ Only show clientName for reference -->
  <div>
    <label>Client:</label>
    <div>{{ client.firstName }} {{ client.lastName }}</div>
  </div>
</template>
```

---

### 5. Frontend: Case Display Components

**File**: `src/pages/CaseEditPage.vue`

**Change**: Ensure clientId is not displayed or editable

```vue
<script setup>
const caseData = ref({
  caseId: '',
  caseName: '',
  clientId: '',    // ← Present in data, but NOT in UI
  clientName: '',  // ← Display this instead
  assignedTo: '',
  caseType: '',
  status: '',
  notes: ''
})

// When loading case
async function loadCase(caseId) {
  const response = await api.post('metadata.getCaseForEdit', { caseId })
  caseData.value = response.data.case
  // clientId is in the data, but we don't render it
}

// When updating case
async function updateCase() {
  const updates = {
    caseName: caseData.value.caseName,
    assignedTo: caseData.value.assignedTo,
    caseType: caseData.value.caseType,
    status: caseData.value.status,
    notes: caseData.value.notes
    // ❌ clientId NOT included in updates
  }

  await api.post('metadata.updateCaseMetadata', {
    caseId: caseData.value.caseId,
    version: caseData.value.version,
    updates: updates
  })
}
</script>

<template>
  <q-form @submit="updateCase">
    <!-- Client is READ-ONLY, show name only -->
    <q-input
      v-model="caseData.clientName"
      label="Client"
      readonly
      filled
    />

    <!-- ❌ Do NOT render clientId input -->

    <!-- Editable fields -->
    <q-input v-model="caseData.caseName" label="Case Name" />
    <q-input v-model="caseData.assignedTo" label="Assigned To" />
    <!-- ... other fields ... -->
  </q-form>
</template>
```

---

## Migration Strategy

### Phase 1: Add Column to Metadata Sheet

**Manual Step** (Google Sheets):
1. Open metadata sheet
2. Insert new column C (between caseName and clientName)
3. Set header: "clientId"
4. Existing rows will have empty clientId initially

---

### Phase 2: Populate Existing Cases

**Migration Script**: `gas/migrations/populateClientIds.gs`

```javascript
function migrateClientIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const metadataSheet = ss.getSheetByName('metadata')
  const clientsSheet = ss.getSheetByName('clients')

  const metadataData = metadataSheet.getDataRange().getValues()
  const clientsData = clientsSheet.getDataRange().getValues()

  // Build client lookup: name -> clientId
  const clientLookup = {}
  for (let i = 1; i < clientsData.length; i++) {
    const firstName = clientsData[i][1]  // Column B
    const lastName = clientsData[i][2]   // Column C
    const clientId = clientsData[i][0]   // Column A
    const fullName = `${firstName} ${lastName}`

    // Note: If multiple clients have same name, this will only keep the last one
    // Manual review needed for duplicates
    clientLookup[fullName] = clientId
  }

  // Update metadata rows
  let updatedCount = 0
  let notFoundCount = 0

  for (let i = 1; i < metadataData.length; i++) {
    const clientName = metadataData[i][3]  // Column D (after migration, was C)
    const clientId = clientLookup[clientName]

    if (clientId) {
      metadataSheet.getRange(i + 1, 3).setValue(clientId)  // Column C
      updatedCount++
    } else {
      Logger.log(`No client found for case row ${i + 1}: ${clientName}`)
      notFoundCount++
    }
  }

  Logger.log(`Migration complete:`)
  Logger.log(`  - Updated: ${updatedCount}`)
  Logger.log(`  - Not found: ${notFoundCount}`)

  return {
    updated: updatedCount,
    notFound: notFoundCount
  }
}
```

**Run Migration**:
1. Deploy migration script to Google Apps Script
2. Run `migrateClientIds()` function
3. Review logs for cases where clientId couldn't be matched
4. Manually fix orphaned cases

---

### Phase 3: Deploy Code Changes

1. Deploy backend changes (`npx clasp push`)
2. Deploy frontend changes (`npm run build`)
3. Test case creation with new clientId field
4. Test case updates (ensure clientId is immutable)

---

### Phase 4: Validation

**Data Integrity Check Script**:
```javascript
function validateClientIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const metadataSheet = ss.getSheetByName('metadata')
  const clientsSheet = ss.getSheetByName('clients')

  const metadataData = metadataSheet.getDataRange().getValues()
  const clientsData = clientsSheet.getDataRange().getValues()

  // Get all valid clientIds
  const validClientIds = new Set()
  for (let i = 1; i < clientsData.length; i++) {
    validClientIds.add(clientsData[i][0])
  }

  // Check each case
  const issues = []
  for (let i = 1; i < metadataData.length; i++) {
    const caseId = metadataData[i][0]
    const clientId = metadataData[i][2]  // Column C

    if (!clientId) {
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
    }
  }

  Logger.log(`Validation found ${issues.length} issues:`)
  issues.forEach(issue => Logger.log(JSON.stringify(issue)))

  return issues
}
```

---

## Testing Plan

### Unit Tests

#### Test 1: Backend - Create Case with clientId
```javascript
function testCreateCaseWithClientId() {
  const caseData = {
    caseId: 'TEST-001',
    caseName: 'Test Case',
    clientId: 'abc-123-def-456',
    clientFirstName: 'John',
    clientLastName: 'Doe',
    clientName: 'John Doe',
    folderName: 'John_Doe_ID123',
    folderPath: '/cases/John_Doe_ID123'
  }

  const result = SheetsService.createCase(caseData, 'test@example.com')

  // Assertions
  assert(result.clientId === 'abc-123-def-456', 'clientId should be set')
  assert(result.clientName === 'John Doe', 'clientName should be set')
}
```

#### Test 2: Backend - Reject clientId Update
```javascript
function testRejectClientIdUpdate() {
  const updates = {
    caseName: 'Updated Name',
    clientId: 'different-id'  // Should be rejected
  }

  try {
    SheetsService.updateCase('TEST-001', updates, 1, 'test@example.com')
    assert(false, 'Should have thrown error')
  } catch (error) {
    assert(error.message.includes('immutable'), 'Should reject clientId update')
  }
}
```

#### Test 3: Backend - Validate clientId Exists
```javascript
function testValidateClientIdExists() {
  const caseData = {
    caseId: 'TEST-002',
    clientId: 'non-existent-id',
    // ... other fields
  }

  try {
    SheetsService.createCase(caseData, 'test@example.com')
    assert(false, 'Should have thrown error')
  } catch (error) {
    assert(error.message.includes('not found'), 'Should validate clientId')
  }
}
```

### Integration Tests

#### Test 4: End-to-End Case Creation
1. Create client in clients sheet
2. Note the clientId (UUID)
3. Create case via API with that clientId
4. Verify metadata sheet row has clientId in Column C
5. Verify clientId matches client's UUID

#### Test 5: Case Update Immutability
1. Load existing case
2. Attempt to update clientId via API
3. Verify API returns validation error
4. Verify clientId unchanged in sheet

#### Test 6: Chart Generation
1. Create multiple cases for same client
2. Request "Cases Per Client" chart
3. Verify cases are grouped by clientId
4. Verify correct count displayed

### Manual Tests

#### Test 7: UI Verification
- [ ] Verify clientId is NOT visible in case creation form
- [ ] Verify clientId is NOT visible in case edit form
- [ ] Verify clientId is NOT visible in search results
- [ ] Verify only clientName is displayed to users

#### Test 8: Data Migration
- [ ] Run migration script on test data
- [ ] Verify all cases have clientId populated
- [ ] Verify clientIds match clients sheet
- [ ] Check for orphaned cases (clientId not found)

---

## Success Criteria

### Must Have (Critical)

- ✅ clientId column added to metadata sheet (Column C)
- ✅ All new cases have clientId automatically populated
- ✅ clientId is never null or empty for new cases
- ✅ clientId is never visible in any UI
- ✅ clientId cannot be edited by users
- ✅ Backend validates clientId exists in clients sheet
- ✅ Backend rejects attempts to update clientId
- ✅ Existing cases migrated to have clientId

### Should Have (Important)

- ✅ Chart generation uses clientId for grouping
- ✅ Data integrity validation script available
- ✅ Admin tools to identify orphaned cases
- ✅ Migration script handles edge cases
- ✅ Comprehensive test coverage

### Nice to Have (Optional)

- ⬜ Automated clientId validation on sheet edit
- ⬜ Real-time data integrity monitoring
- ⬜ Admin dashboard showing clientId statistics
- ⬜ Cascade updates if client UUID changes

---

## Risks and Mitigation

### Risk 1: Data Loss During Migration

**Impact**: High
**Probability**: Low

**Mitigation**:
- Backup metadata sheet before migration
- Test migration on copy of data first
- Manual review of migration results
- Rollback plan if issues found

---

### Risk 2: Orphaned Cases

**Impact**: Medium
**Probability**: Medium

**Mitigation**:
- Migration script logs cases without matching clientId
- Admin tools to identify and fix orphans
- Manual review and cleanup process
- Consider "Unknown Client" placeholder for unmatched cases

---

### Risk 3: Performance Impact

**Impact**: Low
**Probability**: Low

**Mitigation**:
- Adding one column has minimal performance impact
- Google Sheets handles 14 columns efficiently
- No additional API calls required
- Chart generation may actually improve (better indexing)

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Specification** | 1 day | ✅ Complete |
| **Backend Development** | 2 days | Update SheetsService, handlers |
| **Frontend Development** | 1 day | Update case creation/edit forms |
| **Migration Script** | 1 day | Write and test migration |
| **Testing** | 2 days | Unit, integration, manual tests |
| **Migration Execution** | 1 day | Run migration, validation |
| **Deployment** | 1 day | Deploy to production |
| **Total** | **9 days** | |

---

## Appendix

### A. Column Mapping Reference

```
BEFORE (13 columns):
A: caseId
B: caseName
C: clientName        ← This becomes D
D: assignedTo        ← This becomes E
E: caseType          ← This becomes F
F: status            ← This becomes G
G: notes             ← This becomes H
H: createdBy         ← This becomes I
I: createdAt         ← This becomes J
J: assignedAt        ← This becomes K
K: lastUpdatedBy     ← This becomes L
L: lastUpdatedAt     ← This becomes M
M: version           ← This becomes N

AFTER (14 columns):
A: caseId
B: caseName
C: clientId          ← NEW
D: clientName
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

### B. Example Data

**Clients Sheet**:
```
┌──────────────────────┬───────────┬──────────┬─────────────┐
│ clientId             │ firstName │ lastName │ nationalId  │
├──────────────────────┼───────────┼──────────┼─────────────┤
│ abc-123-def-456      │ John      │ Doe      │ ID12345     │
│ ghi-789-jkl-012      │ Jane      │ Smith    │ ID67890     │
└──────────────────────┴───────────┴──────────┴─────────────┘
```

**Metadata Sheet (After)**:
```
┌────────┬──────────┬─────────────────┬────────────┬────────────┐
│ caseId │ caseName │ clientId        │ clientName │ assignedTo │
├────────┼──────────┼─────────────────┼────────────┼────────────┤
│ C-001  │ Tax Case │ abc-123-def-456 │ John Doe   │ Alice      │
│ C-002  │ Legal    │ abc-123-def-456 │ John Doe   │ Bob        │
│ C-003  │ Finance  │ ghi-789-jkl-012 │ Jane Smith │ Alice      │
└────────┴──────────┴─────────────────┴────────────┴────────────┘
```

**Chart Query Result**:
```json
[
  {
    "clientId": "abc-123-def-456",
    "clientName": "John Doe",
    "caseCount": 2
  },
  {
    "clientId": "ghi-789-jkl-012",
    "clientName": "Jane Smith",
    "caseCount": 1
  }
]
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-17
**Status**: Ready for Implementation
**Next Steps**: Review and approve specification, then proceed to implementation
