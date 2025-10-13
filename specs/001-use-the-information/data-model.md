# Data Model: File Management Application with User Authentication

**Feature**: File Management Application with User Authentication
**Date**: 2025-10-13
**Status**: Complete

## Overview

This document defines the data entities, their attributes, relationships, validation rules, and state transitions for the file management application. Data is stored in Google Sheets (structured data) and Google Drive (files).

## Entity Definitions

### 1. User

Represents a system user with authentication credentials and role-based access control.

**Storage**: Google Sheets - "users" sheet

**Attributes**:

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| name | String | Yes | 1-100 chars | - | User's full name |
| email | String | Yes | Valid email, unique | - | User's email address (primary key) |
| password | String | Yes | Hashed (SHA-256+salt) | - | Hashed password |
| salt | String | Yes | UUID | Generated | Unique salt for password hashing |
| type | Enum | Yes | ALLOWED \| BLOCKED | ALLOWED | Account access status |
| url | String | No | Valid URL | null | User profile URL (optional) |
| otp | String | No | 6 digits | null | One-time password for recovery |
| dateOfExpiry | DateTime | No | ISO 8601 | null | OTP expiration timestamp |
| role | Enum | Yes | ROLE_ADMIN \| ROLE_USER | ROLE_USER | User role for access control |
| status | Enum | Yes | PENDING \| VERIFIED | PENDING | Email verification status |
| verificationToken | String | Yes | UUID | Generated | Email verification token |

**Validation Rules**:
- `email`: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `name`: Must not be empty or whitespace-only
- `password`: Minimum 8 characters before hashing
- `otp`: Exactly 6 numeric digits when set
- `dateOfExpiry`: Must be future date when OTP is set

**State Transitions**:

```
NEW USER
  ↓ (signup)
PENDING + ALLOWED + ROLE_USER
  ↓ (click verification link)
VERIFIED + ALLOWED + ROLE_USER
  ↓ (admin action)
VERIFIED + BLOCKED + ROLE_USER (blocked)
  OR
VERIFIED + ALLOWED + ROLE_ADMIN (promoted)
```

**Relationships**:
- One User can have many CaseMetadata entries (via "Assigned To" field)
- One User can have many CaseMetadata entries (via "Last Updated By" field)

---

### 2. CaseMetadata

Represents a client case with associated metadata for tracking and management.

**Storage**: Google Sheets - "metadata" sheet

**Attributes**:

| Field | Type | Required | Constraints | Auto-Updated | Description |
|-------|------|----------|-------------|--------------|-------------|
| clientFirstName | String | Yes | 1-100 chars | No | Client's first name |
| clientLastName | String | Yes | 1-100 chars | No | Client's last name |
| clientEmail | String | No | Valid email | No | Client's email address |
| clientPhoneNumber | String | No | 10-20 chars | No | Client's phone number |
| amountPaid | Number | No | >= 0 | No | Amount paid by client |
| paymentStatus | String | No | Free text | No | Payment status description |
| folderName | String | Yes | Pattern: firstName_lastName_idCardNo | No | Associated folder name |
| folderPath | String | Yes | Format: cases/folderName | No | Full folder path in Drive |
| assignedTo | String | No | Valid user name | No | User assigned to this case |
| assignedAt | DateTime | No | ISO 8601, Africa/Douala | Yes | Timestamp when case was assigned |
| lastUpdatedBy | String | Yes | Valid user name | Yes | User who last modified the case |
| lastUpdatedAt | DateTime | Yes | ISO 8601, Africa/Douala | Yes | Timestamp of last modification |
| tasksRemaining | String | No | Free text | No | Description of remaining tasks |
| nextAction | String | No | Free text | No | Description of next action to take |
| comment | String | No | Free text | No | General comments |
| dueDate | Date | No | YYYY-MM-DD | No | Case due date |
| status | String | No | Free text | No | Case status description |
| caseId | String | Yes | Unique identifier | No | Unique case identifier (primary key) |
| version | Integer | Yes | >= 0 | Yes | Version number for optimistic locking |

**Validation Rules**:
- `clientFirstName`, `clientLastName`: Must not be empty or whitespace-only
- `clientEmail`: Must match email regex if provided
- `amountPaid`: Must be non-negative number if provided
- `folderName`: Must match pattern `^[A-Za-z]+_[A-Za-z]+_[A-Za-z0-9]+$`
- `folderPath`: Must start with "cases/"
- `caseId`: Must be unique across all metadata entries
- `version`: Must match current version for updates (optimistic locking)

**Auto-Update Rules**:
- `assignedAt`: Set to current datetime (Africa/Douala) when `assignedTo` value changes
- `lastUpdatedBy`: Set to current user name on any field modification
- `lastUpdatedAt`: Set to current datetime (Africa/Douala) on any field modification
- `version`: Incremented by 1 on any field modification

**State Transitions**:

```
NEW CASE
  ↓ (created by admin)
UNASSIGNED (assignedTo = null)
  ↓ (admin assigns user)
ASSIGNED (assignedTo = username, assignedAt = timestamp)
  ↓ (any field updated)
UPDATED (lastUpdatedBy set, lastUpdatedAt set, version++)
  ↓ (reassigned)
REASSIGNED (assignedTo changed, assignedAt updated)
```

**Relationships**:
- Many CaseMetadata belong to one User (via "Assigned To" field)
- Many CaseMetadata belong to one User (via "Last Updated By" field)
- One CaseMetadata has one ClientFolder (via folderPath)
- One CaseMetadata has many CaseFolder entries (via folderName prefix)

---

### 3. ClientFolder

Represents a client's root folder in Google Drive for organizing case files.

**Storage**: Google Drive (folder), metadata in CaseMetadata.folderPath

**Attributes**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| folderId | String | Yes | Google Drive ID | Drive folder unique identifier |
| folderName | String | Yes | Pattern: firstName_lastName_idCardNo | Folder name |
| folderPath | String | Yes | Format: cases/folderName | Full path from root |
| firstName | String | Yes | 1-100 chars | Client's first name |
| lastName | String | Yes | 1-100 chars | Client's last name |
| idCardNo | String | Yes | Alphanumeric | Client's ID card number |
| telephone | String | No | 10-20 chars | Client's phone number |
| email | String | No | Valid email | Client's email |
| createdBy | String | Yes | Admin user name | User who created the folder |
| createdAt | DateTime | Yes | ISO 8601, Africa/Douala | Folder creation timestamp |

**Validation Rules**:
- `folderName`: Must match pattern `^[A-Za-z]+_[A-Za-z]+_[A-Za-z0-9]+$`
- `folderName`: Must be unique under "cases" root folder
- `firstName`, `lastName`: Must not be empty
- `idCardNo`: Required, alphanumeric characters only
- `email`: Must match email regex if provided

**State Transitions**:

```
SEARCH CLIENT
  ↓ (not found)
READY TO CREATE
  ↓ (submit form)
FOLDER CREATED (Drive folder exists, metadata entry created)
  ↓ (case added)
FOLDER WITH CASES (contains CaseFolder children)
```

**Relationships**:
- One ClientFolder has many CaseFolder entries (parent-child in Drive)
- One ClientFolder may have many CaseMetadata entries (via folderPath match)

---

### 4. CaseFolder

Represents a specific case folder within a client folder, containing case-related files.

**Storage**: Google Drive (folder), identified by case ID

**Attributes**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| folderId | String | Yes | Google Drive ID | Drive folder unique identifier |
| folderName | String | Yes | Matches caseId | Case-specific folder name |
| caseId | String | Yes | Matches CaseMetadata.caseId | Associated case identifier |
| parentFolderId | String | Yes | ClientFolder.folderId | Parent client folder ID |
| folderPath | String | Yes | Format: cases/clientFolder/caseId | Full path from root |
| createdBy | String | Yes | Admin user name | User who created the folder |
| createdAt | DateTime | Yes | ISO 8601, Africa/Douala | Folder creation timestamp |

**Validation Rules**:
- `folderName`: Must match an existing `caseId` in CaseMetadata
- `parentFolderId`: Must reference an existing ClientFolder
- `caseId`: Must be unique within parent ClientFolder

**State Transitions**:

```
CLIENT FOLDER EXISTS
  ↓ (provide caseId)
READY TO CREATE CASE FOLDER
  ↓ (create)
CASE FOLDER CREATED (Drive folder exists)
  ↓ (upload file)
CASE FOLDER WITH FILES (contains File children)
```

**Relationships**:
- One CaseFolder belongs to one ClientFolder (parent-child in Drive)
- One CaseFolder has many File entries (parent-child in Drive)
- One CaseFolder references one CaseMetadata entry (via caseId)

---

### 5. File

Represents an uploaded file stored in a case folder.

**Storage**: Google Drive (file)

**Attributes**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| fileId | String | Yes | Google Drive ID | Drive file unique identifier |
| fileName | String | Yes | Valid filename with extension | User-specified file name |
| mimeType | String | Yes | MIME type string | File type (e.g., application/pdf) |
| size | Integer | Yes | > 0, <= 10MB | File size in bytes |
| parentFolderId | String | Yes | CaseFolder.folderId | Parent case folder ID |
| filePath | String | Yes | Format: cases/client/case/fileName | Full path from root |
| uploadedBy | String | Yes | Admin user name | User who uploaded the file |
| uploadedAt | DateTime | Yes | ISO 8601, Africa/Douala | File upload timestamp |
| downloadUrl | String | Yes | Google Drive download URL | Direct download link |

**Validation Rules**:
- `fileName`: Must not contain invalid characters (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
- `fileName`: Must have valid extension
- `size`: Must not exceed 10MB (10,485,760 bytes)
- `parentFolderId`: Must reference an existing CaseFolder

**Conflict Resolution**:
When a file with the same `fileName` exists in `parentFolderId`:
1. **Overwrite**: Delete existing file, upload new file with same name
2. **Rename**: Auto-generate name with timestamp: `baseName_YYYYMMDD_HHmmss.ext`
3. **Cancel**: Abort upload, return error

**State Transitions**:

```
UPLOAD INITIATED
  ↓ (check for conflicts)
NO CONFLICT → UPLOAD COMPLETE
  OR
CONFLICT DETECTED
  ↓ (user chooses resolution)
OVERWRITE → DELETE OLD → UPLOAD NEW
  OR
RENAME → GENERATE NEW NAME → UPLOAD WITH NEW NAME
  OR
CANCEL → UPLOAD ABORTED
```

**Relationships**:
- One File belongs to one CaseFolder (parent-child in Drive)
- Many Files can belong to one CaseFolder

---

## Indexes and Lookups

### Users Sheet
- **Primary Key**: `email` (unique)
- **Lookups**: By email for login, signup check, password recovery

### Metadata Sheet
- **Primary Key**: `caseId` (unique)
- **Lookups**:
  - By `clientFirstName` + `clientLastName` (search)
  - By `caseId` (search, edit)
  - By `folderPath` (folder-to-case mapping)

### Google Drive
- **ClientFolder**: By name pattern under "cases" root
- **CaseFolder**: By caseId under specific ClientFolder
- **File**: By fileName within CaseFolder

## Data Integrity Rules

### Referential Integrity
1. **CaseMetadata.assignedTo** → Must reference existing User.name (if set)
2. **CaseMetadata.lastUpdatedBy** → Must reference existing User.name
3. **CaseFolder.parentFolderId** → Must reference existing ClientFolder.folderId
4. **File.parentFolderId** → Must reference existing CaseFolder.folderId

### Concurrency Control
- **CaseMetadata.version**: Optimistic locking - updates fail if version mismatch detected

### Cascade Rules
- **Delete ClientFolder**: Warn before deletion (contains CaseFolder + File children)
- **Delete CaseFolder**: Warn before deletion (contains File children)
- **Delete File**: Direct deletion, no cascades
- **Block User**: User can no longer log in, existing assignments remain

## Query Patterns

### Common Queries

**Q1: Find user by email (login)**
```javascript
SheetsService.getUserByEmail(email)
```

**Q2: Search cases by client name**
```javascript
SheetsService.searchCases({ firstName, lastName })
```

**Q3: Search case by caseId**
```javascript
SheetsService.getCaseByCaseId(caseId)
```

**Q4: Update case metadata with version check**
```javascript
SheetsService.updateCaseMetadata(caseId, updates, expectedVersion)
```

**Q5: Create client folder**
```javascript
DriveService.createClientFolder(firstName, lastName, idCardNo)
```

**Q6: List files in case folder**
```javascript
DriveService.listFilesInCaseFolder(caseFolderId)
```

**Q7: Upload file with conflict check**
```javascript
DriveService.uploadFileWithConflictCheck(caseFolderId, fileName, fileBlob)
```

---

## Data Flow Diagrams

### User Registration Flow

```
User Input (name, email, password)
  ↓
1. Validate email uniqueness
  ↓
2. Generate salt
  ↓
3. Hash password with salt
  ↓
4. Generate verificationToken
  ↓
5. Create User record (PENDING, ALLOWED, ROLE_USER)
  ↓
6. Send verification email
  ↓
User in database (pending verification)
```

### Case Metadata Update Flow

```
Admin edits case fields
  ↓
1. Fetch current case by caseId
  ↓
2. Check version matches (optimistic lock)
  ↓
3. Apply user updates
  ↓
4. Auto-set lastUpdatedBy = current user
5. Auto-set lastUpdatedAt = current datetime
6. Auto-increment version
7. If assignedTo changed → set assignedAt
  ↓
8. Write updated row to Sheets
  ↓
Updated case in database
```

### File Upload Flow

```
Admin uploads file to case folder
  ↓
1. Validate file size (<= 10MB)
  ↓
2. Check for filename conflict in folder
  ↓
3a. NO CONFLICT → Upload file
  OR
3b. CONFLICT → Prompt user (overwrite/rename/cancel)
  ↓
4a. Overwrite → Delete old + Upload new
4b. Rename → Generate unique name + Upload
4c. Cancel → Abort
  ↓
File stored in case folder
```

---

## Data Model Validation Checklist

- [x] All entities defined with complete attributes
- [x] All validation rules specified
- [x] All relationships documented
- [x] State transitions mapped
- [x] Auto-update rules defined for metadata tracking fields
- [x] Optimistic locking strategy defined (version number)
- [x] Conflict resolution strategy defined (file uploads)
- [x] Timezone handling specified (Africa/Douala)
- [x] Data integrity rules documented
- [x] Common query patterns identified

**Status**: Data model complete and ready for contract definition.
