# Metadata API Contract

**Version**: 1.0.0
**Base URL**: `{GAS_WEB_APP_URL}`
**Protocol**: HTTPS POST
**Content-Type**: application/json
**Authentication**: Required (Bearer token in request)

## Overview

API endpoints for searching and managing client case metadata.

## Authentication

All metadata endpoints require valid session token:

```json
{
  "action": "searchCases",
  "token": "base64EncodedSessionToken",
  "data": { ... }
}
```

---

## Endpoints

### 1. Search Cases by Client Name

**Action**: `searchCasesByName`

**Description**: Search for cases by client first name and/or last name.

**Authorization**: All authenticated users (ROLE_USER, ROLE_ADMIN)

**Request**:
```json
{
  "action": "searchCasesByName",
  "token": "session-token",
  "data": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Request Fields**:
- `firstName` (string, optional): Client's first name (partial match supported)
- `lastName` (string, optional): Client's last name (partial match supported)
- At least one of `firstName` or `lastName` must be provided

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "metadata.search.success",
  "message": "Search completed successfully",
  "data": {
    "cases": [
      {
        "caseId": "CASE-001",
        "clientFirstName": "John",
        "clientLastName": "Doe",
        "clientEmail": "john@example.com",
        "clientPhoneNumber": "+1234567890",
        "amountPaid": 5000,
        "paymentStatus": "Paid",
        "folderName": "John_Doe_ID123",
        "folderPath": "cases/John_Doe_ID123",
        "assignedTo": "Jane Admin",
        "tasksRemaining": "Review documents",
        "nextAction": "Contact client",
        "comment": "Urgent case",
        "dueDate": "2025-11-01",
        "status": "In Progress"
      }
    ],
    "count": 1
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "user@example.com"
  }
}
```

**Note**: Response excludes system-generated fields: `assignedAt`, `lastUpdatedBy`, `lastUpdatedAt`, `version`

**Error Responses**:

Missing Parameters (400):
```json
{
  "status": 400,
  "msgKey": "metadata.search.error.params",
  "message": "At least one search parameter required",
  "data": null,
  "token": null
}
```

---

### 2. Search Case by Case ID

**Action**: `searchCaseByCaseId`

**Description**: Find a specific case by its unique case ID.

**Authorization**: All authenticated users (ROLE_USER, ROLE_ADMIN)

**Request**:
```json
{
  "action": "searchCaseByCaseId",
  "token": "session-token",
  "data": {
    "caseId": "CASE-001"
  }
}
```

**Request Fields**:
- `caseId` (string, required): Unique case identifier

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "metadata.search.success",
  "message": "Case found",
  "data": {
    "case": {
      "caseId": "CASE-001",
      "clientFirstName": "John",
      "clientLastName": "Doe",
      "clientEmail": "john@example.com",
      "clientPhoneNumber": "+1234567890",
      "amountPaid": 5000,
      "paymentStatus": "Paid",
      "folderName": "John_Doe_ID123",
      "folderPath": "cases/John_Doe_ID123",
      "assignedTo": "Jane Admin",
      "tasksRemaining": "Review documents",
      "nextAction": "Contact client",
      "comment": "Urgent case",
      "dueDate": "2025-11-01",
      "status": "In Progress"
    }
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Error Responses**:

Case Not Found (404):
```json
{
  "status": 404,
  "msgKey": "metadata.search.error.notfound",
  "message": "Case not found",
  "data": null,
  "token": null
}
```

---

### 3. Get Case for Editing (Admin Only)

**Action**: `getCaseForEdit`

**Description**: Retrieve case with version number for optimistic locking.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "getCaseForEdit",
  "token": "admin-session-token",
  "data": {
    "caseId": "CASE-001"
  }
}
```

**Request Fields**:
- `caseId` (string, required): Unique case identifier

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "metadata.edit.fetch.success",
  "message": "Case retrieved for editing",
  "data": {
    "case": {
      "caseId": "CASE-001",
      "clientFirstName": "John",
      "clientLastName": "Doe",
      "clientEmail": "john@example.com",
      "clientPhoneNumber": "+1234567890",
      "amountPaid": 5000,
      "paymentStatus": "Paid",
      "folderName": "John_Doe_ID123",
      "folderPath": "cases/John_Doe_ID123",
      "assignedTo": "Jane Admin",
      "tasksRemaining": "Review documents",
      "nextAction": "Contact client",
      "comment": "Urgent case",
      "dueDate": "2025-11-01",
      "status": "In Progress",
      "version": 5
    }
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Note**: Includes `version` field for optimistic locking

**Error Responses**:

Forbidden (403):
```json
{
  "status": 403,
  "msgKey": "metadata.edit.error.forbidden",
  "message": "Admin role required",
  "data": null,
  "token": null
}
```

---

### 4. Update Case Metadata (Admin Only)

**Action**: `updateCaseMetadata`

**Description**: Update case fields with automatic metadata tracking.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "updateCaseMetadata",
  "token": "admin-session-token",
  "data": {
    "caseId": "CASE-001",
    "version": 5,
    "updates": {
      "clientPhoneNumber": "+9876543210",
      "amountPaid": 7500,
      "paymentStatus": "Paid in Full",
      "assignedTo": "New Admin",
      "tasksRemaining": "Finalize documents",
      "nextAction": "Schedule meeting",
      "comment": "Updated after payment",
      "dueDate": "2025-11-15",
      "status": "Pending Closure"
    }
  }
}
```

**Request Fields**:
- `caseId` (string, required): Unique case identifier
- `version` (integer, required): Current version number for optimistic locking
- `updates` (object, required): Fields to update (can include any editable field)

**Editable Fields**:
- `clientFirstName`, `clientLastName`, `clientEmail`, `clientPhoneNumber`
- `amountPaid`, `paymentStatus`
- `folderName`, `folderPath`
- `assignedTo`, `tasksRemaining`, `nextAction`, `comment`, `dueDate`, `status`

**Auto-Updated Fields** (not in request, set by server):
- `assignedAt`: Set to current datetime if `assignedTo` value changes
- `lastUpdatedBy`: Set to current user name
- `lastUpdatedAt`: Set to current datetime (Africa/Douala)
- `version`: Incremented by 1

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "metadata.update.success",
  "message": "Case updated successfully",
  "data": {
    "case": {
      "caseId": "CASE-001",
      "clientFirstName": "John",
      "clientLastName": "Doe",
      "clientEmail": "john@example.com",
      "clientPhoneNumber": "+9876543210",
      "amountPaid": 7500,
      "paymentStatus": "Paid in Full",
      "folderName": "John_Doe_ID123",
      "folderPath": "cases/John_Doe_ID123",
      "assignedTo": "New Admin",
      "assignedAt": "2025-10-13 14:30:00",
      "lastUpdatedBy": "Jane Admin",
      "lastUpdatedAt": "2025-10-13 14:30:00",
      "tasksRemaining": "Finalize documents",
      "nextAction": "Schedule meeting",
      "comment": "Updated after payment",
      "dueDate": "2025-11-15",
      "status": "Pending Closure",
      "version": 6
    }
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Error Responses**:

Version Conflict (409):
```json
{
  "status": 409,
  "msgKey": "metadata.update.error.conflict",
  "message": "Case was modified by another user. Please refresh and try again.",
  "data": {
    "currentVersion": 7,
    "expectedVersion": 5
  },
  "token": null
}
```

Forbidden (403):
```json
{
  "status": 403,
  "msgKey": "metadata.update.error.forbidden",
  "message": "Admin role required",
  "data": null,
  "token": null
}
```

Case Not Found (404):
```json
{
  "status": 404,
  "msgKey": "metadata.update.error.notfound",
  "message": "Case not found",
  "data": null,
  "token": null
}
```

---

### 5. Create Case Metadata

**Action**: `createCaseMetadata`

**Description**: Create new case metadata entry (typically after creating folders).

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "createCaseMetadata",
  "token": "admin-session-token",
  "data": {
    "caseId": "CASE-002",
    "clientFirstName": "Jane",
    "clientLastName": "Smith",
    "clientEmail": "jane@example.com",
    "clientPhoneNumber": "+1234567890",
    "folderName": "Jane_Smith_ID456",
    "folderPath": "cases/Jane_Smith_ID456",
    "amountPaid": 0,
    "paymentStatus": "Pending",
    "assignedTo": "John Admin",
    "tasksRemaining": "Initial review",
    "nextAction": "Contact client",
    "dueDate": "2025-11-30",
    "status": "New"
  }
}
```

**Request Fields**:
- `caseId` (string, required): Unique case identifier
- `clientFirstName` (string, required): Client's first name
- `clientLastName` (string, required): Client's last name
- `folderName` (string, required): Associated folder name
- `folderPath` (string, required): Full folder path
- Other fields optional

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "metadata.create.success",
  "message": "Case created successfully",
  "data": {
    "case": {
      "caseId": "CASE-002",
      "clientFirstName": "Jane",
      "clientLastName": "Smith",
      "clientEmail": "jane@example.com",
      "clientPhoneNumber": "+1234567890",
      "amountPaid": 0,
      "paymentStatus": "Pending",
      "folderName": "Jane_Smith_ID456",
      "folderPath": "cases/Jane_Smith_ID456",
      "assignedTo": "John Admin",
      "assignedAt": "2025-10-13 14:35:00",
      "lastUpdatedBy": "Jane Admin",
      "lastUpdatedAt": "2025-10-13 14:35:00",
      "tasksRemaining": "Initial review",
      "nextAction": "Contact client",
      "dueDate": "2025-11-30",
      "status": "New",
      "version": 1
    }
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Error Responses**:

Duplicate Case ID (400):
```json
{
  "status": 400,
  "msgKey": "metadata.create.error.duplicate",
  "message": "Case ID already exists",
  "data": null,
  "token": null
}
```

---

## Authorization Matrix

| Endpoint | ROLE_USER | ROLE_ADMIN |
|----------|-----------|------------|
| searchCasesByName | ✅ Read-only | ✅ Read-only |
| searchCaseByCaseId | ✅ Read-only | ✅ Read-only |
| getCaseForEdit | ❌ | ✅ |
| updateCaseMetadata | ❌ | ✅ |
| createCaseMetadata | ❌ | ✅ |

## Optimistic Locking Flow

1. Admin fetches case with `getCaseForEdit` → receives `version: 5`
2. Admin makes changes in UI
3. Admin submits with `updateCaseMetadata` including `version: 5`
4. Server checks current version:
   - If still `5` → update succeeds, version becomes `6`
   - If now `7` (another user updated) → returns 409 conflict error
5. On conflict, frontend refreshes case data and asks user to re-apply changes

## Testing Checklist

- [ ] Search cases by first name only
- [ ] Search cases by last name only
- [ ] Search cases by both names
- [ ] Search cases with no results
- [ ] Search case by valid case ID
- [ ] Search case by invalid case ID
- [ ] Get case for edit as admin
- [ ] Get case for edit as regular user (should fail)
- [ ] Update case with matching version
- [ ] Update case with outdated version (should fail with 409)
- [ ] Update assignedTo field (verify assignedAt is set)
- [ ] Update other fields (verify lastUpdatedBy/At and version)
- [ ] Create new case with unique case ID
- [ ] Create new case with duplicate case ID (should fail)
- [ ] Verify auto-fields are set correctly (assignedAt, lastUpdatedBy, etc.)
