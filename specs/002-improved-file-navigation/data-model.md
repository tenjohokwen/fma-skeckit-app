# Data Model: Improved File Navigation UX

**Feature**: 002-improved-file-navigation
**Date**: 2025-10-15
**Phase**: Phase 1 - Design Artifacts

## Overview

This document defines the data structures and entities used throughout the improved file navigation feature. All models follow plain JavaScript patterns (no TypeScript) and align with the project's architecture using Google Sheets for persistence and Google Drive for file storage.

---

## Entity Definitions

### 1. Client Entity

Represents an individual or organization receiving legal services.

**Storage Location**: Google Sheets (worksheet: "Clients")

**Schema**:

```javascript
{
  // Unique identifier (UUID v4 format)
  clientId: "550e8400-e29b-41d4-a716-446655440000",

  // Personal information (required)
  firstName: "John",
  lastName: "Doe",
  nationalId: "AB123456",  // Unique constraint enforced

  // Contact information (optional)
  telephone: "+1-555-123-4567",
  email: "john.doe@example.com",

  // Google Drive integration
  folderId: "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV",  // Drive folder ID

  // Audit timestamps (ISO 8601 format)
  createdAt: "2025-10-15T14:30:00.000Z",
  updatedAt: "2025-10-15T14:30:00.000Z"
}
```

**Field Specifications**:

| Field | Type | Required | Unique | Validation | Max Length |
|-------|------|----------|--------|------------|------------|
| `clientId` | String (UUID) | Yes | Yes | UUID v4 format | 36 |
| `firstName` | String | Yes | No | Non-empty, trimmed | 100 |
| `lastName` | String | Yes | No | Non-empty, trimmed | 100 |
| `nationalId` | String | Yes | Yes | Non-empty, alphanumeric | 50 |
| `telephone` | String | No | No | Phone format (flexible) | 20 |
| `email` | String | No | No | Email format or empty | 100 |
| `folderId` | String | Yes | Yes | Drive folder ID format | 50 |
| `createdAt` | String (ISO) | Yes | No | ISO 8601 timestamp | 24 |
| `updatedAt` | String (ISO) | Yes | No | ISO 8601 timestamp | 24 |

**Google Sheets Column Mapping**:
```
Column A: clientId
Column B: firstName
Column C: lastName
Column D: nationalId
Column E: telephone
Column F: email
Column G: folderId
Column H: createdAt
Column I: updatedAt
```

**Business Rules**:
1. National ID must be unique across all clients
2. Folder naming convention: `{firstName}_{lastName}_{nationalId}`
3. Folder created in root "cases" folder when client created
4. First and last names sanitized to remove special chars for folder names
5. Client cannot be deleted if associated cases exist

**Indexes** (for search optimization):
- Primary index: `clientId`
- Unique index: `nationalId`
- Search indexes: `firstName`, `lastName` (for fuzzy search)

---

### 2. Case Entity

Represents a specific legal matter or project for a client.

**Storage Location**: Google Drive folder structure (metadata inferred from folders)

**Schema**:

```javascript
{
  // Unique identifier (folder name within client folder)
  caseId: "Tax_2024",

  // Parent relationship
  clientId: "550e8400-e29b-41d4-a716-446655440000",

  // Google Drive integration
  folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",  // Drive folder ID

  // Computed properties
  fileCount: 15,  // Number of files in case folder
  folderPath: "cases/John_Doe_AB123456/Tax_2024",  // Full path

  // Audit timestamps (from Drive metadata)
  createdAt: "2025-10-15T14:35:00.000Z",
  modifiedAt: "2025-10-15T16:20:00.000Z"
}
```

**Field Specifications**:

| Field | Type | Required | Unique | Validation | Max Length |
|-------|------|----------|--------|------------|------------|
| `caseId` | String | Yes | Yes (per client) | Alphanumeric + underscore | 100 |
| `clientId` | String (UUID) | Yes | No | Must exist in Clients | 36 |
| `folderId` | String | Yes | Yes | Drive folder ID format | 50 |
| `fileCount` | Number | No | No | >= 0 | N/A |
| `folderPath` | String | Yes | Yes | Valid path format | 500 |
| `createdAt` | String (ISO) | Yes | No | ISO 8601 timestamp | 24 |
| `modifiedAt` | String (ISO) | Yes | No | ISO 8601 timestamp | 24 |

**Business Rules**:
1. Case ID must be unique within a client's folder
2. Case ID can contain letters, numbers, underscores, hyphens
3. Case folder created inside client folder
4. Case cannot be deleted if it contains files (must delete files first OR use folder delete with "DELETE" confirmation)
5. File count updated dynamically when listing folder contents

**Folder Structure Example**:
```
cases/
└── John_Doe_AB123456/           # Client folder
    ├── Tax_2024/                # Case folder
    │   ├── return_2024.pdf
    │   └── receipts/            # Subfolder within case
    └── Immigration_2024/        # Another case folder
        └── application.docx
```

**Relationships**:
- One-to-Many: One Client has many Cases
- Parent-Child: Case belongs to exactly one Client

---

### 3. File Entity

Represents a document or file stored in Google Drive within a case folder.

**Storage Location**: Google Drive (metadata retrieved via Drive API)

**Schema**:

```javascript
{
  // Google Drive file identifier
  fileId: "3cD4eF5gG6hH7iI8jJ9kK0lL1mM2nN3oO",

  // File information
  name: "contract_2024.pdf",  // Original filename
  displayName: "Client Contract 2024",  // Optional custom name
  mimeType: "application/pdf",
  extension: "pdf",

  // Size and metadata
  size: 2457600,  // Bytes (e.g., ~2.4 MB)
  sizeFormatted: "2.4 MB",  // Human-readable

  // Timestamps (from Drive metadata)
  createdAt: "2025-10-15T14:40:00.000Z",
  modifiedAt: "2025-10-15T15:10:00.000Z",

  // Parent relationships
  caseFolderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
  parentPath: "cases/John_Doe_AB123456/Tax_2024",

  // Drive URLs
  webViewLink: "https://drive.google.com/file/d/3cD4eF5gG6hH7iI8jJ9kK0lL1mM2nN3oO/view",
  downloadUrl: "https://drive.google.com/uc?id=3cD4eF5gG6hH7iI8jJ9kK0lL1mM2nN3oO&export=download",

  // UI properties (computed)
  iconName: "picture_as_pdf",  // Material icon name
  iconColor: "red-7",  // Quasar color class
  isFolder: false
}
```

**Field Specifications**:

| Field | Type | Required | Computed | Notes |
|-------|------|----------|----------|-------|
| `fileId` | String | Yes | No | Google Drive file ID |
| `name` | String | Yes | No | Original filename from Drive |
| `displayName` | String | No | No | Custom name if provided during upload |
| `mimeType` | String | Yes | No | Standard MIME type |
| `extension` | String | Yes | Yes | Extracted from filename |
| `size` | Number | Yes | No | File size in bytes |
| `sizeFormatted` | String | No | Yes | Human-readable size (KB, MB, GB) |
| `createdAt` | String (ISO) | Yes | No | From Drive metadata |
| `modifiedAt` | String (ISO) | Yes | No | From Drive metadata |
| `caseFolderId` | String | Yes | No | Parent folder ID |
| `parentPath` | String | No | Yes | Full folder path |
| `webViewLink` | String | Yes | No | Drive preview URL |
| `downloadUrl` | String | Yes | No | Direct download URL |
| `iconName` | String | No | Yes | Material icon based on extension |
| `iconColor` | String | No | Yes | Quasar color class |
| `isFolder` | Boolean | Yes | No | Always false for files |

**Helper Functions**:

```javascript
// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}
```

**Business Rules**:
1. Files with same name in same folder: Drive auto-renames (adds " (1)", " (2)", etc.)
2. Display name takes precedence over original name in UI
3. Maximum file size: 50MB (GAS payload limit)
4. File deletion is permanent (no trash recovery in UI)

---

### 4. Folder Entity

Represents a directory in the Google Drive folder structure (subfolders within cases).

**Storage Location**: Google Drive (metadata retrieved via Drive API)

**Schema**:

```javascript
{
  // Google Drive folder identifier
  folderId: "4dE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO",

  // Folder information
  name: "receipts",
  path: "cases/John_Doe_AB123456/Tax_2024/receipts",

  // Computed properties
  itemCount: 8,  // Files + subfolders
  fileCount: 6,  // Files only
  folderCount: 2,  // Subfolders only

  // Timestamps (from Drive metadata)
  createdAt: "2025-10-15T14:45:00.000Z",
  modifiedAt: "2025-10-15T16:00:00.000Z",

  // Parent relationship
  parentFolderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",

  // UI properties
  iconName: "folder",
  iconColor: "blue-6",
  isFolder: true
}
```

**Field Specifications**:

| Field | Type | Required | Computed | Notes |
|-------|------|----------|----------|-------|
| `folderId` | String | Yes | No | Google Drive folder ID |
| `name` | String | Yes | No | Folder name |
| `path` | String | Yes | Yes | Full path from root |
| `itemCount` | Number | Yes | Yes | Total items (files + folders) |
| `fileCount` | Number | No | Yes | Files only |
| `folderCount` | Number | No | Yes | Subfolders only |
| `createdAt` | String (ISO) | Yes | No | From Drive metadata |
| `modifiedAt` | String (ISO) | Yes | No | From Drive metadata |
| `parentFolderId` | String | Yes | No | Parent folder ID |
| `iconName` | String | No | No | Always "folder" |
| `iconColor` | String | No | No | Always "blue-6" |
| `isFolder` | Boolean | Yes | No | Always true for folders |

**Business Rules**:
1. Folders sorted before files in lists
2. Empty folders allowed
3. Folder deletion requires "DELETE" confirmation (deletes all contents)
4. Root "cases" folder is system-managed (cannot be deleted)

---

### 5. FolderNavigation State

Represents the current navigation state for breadcrumb trail and folder browsing.

**Storage Location**: Pinia store (`stores/navigation.js`)

**Schema**:

```javascript
{
  // Navigation path (array of path segments)
  currentPath: [
    {
      folderId: "root",
      folderName: "Cases",
      type: "root"
    },
    {
      folderId: "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV",
      folderName: "John_Doe_AB123456",
      type: "client"
    },
    {
      folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
      folderName: "Tax_2024",
      type: "case"
    }
  ],

  // Computed breadcrumbs (derived from currentPath)
  breadcrumbs: [
    {
      folderId: "root",
      folderName: "Cases",
      type: "root",
      isClickable: true,
      route: "/files/root"
    },
    {
      folderId: "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV",
      folderName: "John_Doe_AB123456",
      type: "client",
      isClickable: true,
      route: "/files/root/1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV"
    },
    {
      folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
      folderName: "Tax_2024",
      type: "case",
      isClickable: false,  // Current location
      route: "/files/root/1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV/2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT"
    }
  ]
}
```

**PathSegment Schema**:

```javascript
{
  folderId: "string",        // Google Drive folder ID or "root"
  folderName: "string",      // Display name for breadcrumb
  type: "root|client|case|subfolder",  // Segment type for context
  isClickable: boolean,      // False for current location
  route: "string"            // Vue Router path
}
```

**State Actions**:

```javascript
// Navigate into a folder
function navigateToFolder(folderId, folderName, type) {
  currentPath.value.push({ folderId, folderName, type });
}

// Navigate to a breadcrumb level
function navigateToIndex(index) {
  currentPath.value = currentPath.value.slice(0, index + 1);
}

// Reset to root
function reset() {
  currentPath.value = [{ folderId: 'root', folderName: 'Cases', type: 'root' }];
}

// Get current folder ID
function getCurrentFolderId() {
  return currentPath.value[currentPath.value.length - 1].folderId;
}

// Get parent folder ID
function getParentFolderId() {
  if (currentPath.value.length <= 1) return null;
  return currentPath.value[currentPath.value.length - 2].folderId;
}
```

**Business Rules**:
1. Root level always present (cannot navigate above "Cases")
2. Current location (last segment) is not clickable
3. Path persists across page refreshes via router integration
4. Maximum depth: unlimited (but typically 3-5 levels)

---

## Relationships Diagram

```
┌─────────────────┐
│     Client      │
│  (Google Sheets)│
└────────┬────────┘
         │ 1
         │
         │ has many
         │
         ∨ N
┌─────────────────┐
│      Case       │
│ (Drive Folder)  │
└────────┬────────┘
         │ 1
         │
         │ contains
         │
         ∨ N
┌─────────────────┐         ┌─────────────────┐
│      File       │         │     Folder      │
│  (Drive File)   │         │ (Drive Folder)  │
└─────────────────┘         └─────────────────┘
```

**Cardinality**:
- Client → Case: One-to-Many (1:N)
- Case → File: One-to-Many (1:N)
- Case → Folder: One-to-Many (1:N)
- Folder → File: One-to-Many (1:N)
- Folder → Folder: One-to-Many (1:N, recursive)

---

## Frontend State Management

### Pinia Stores

**1. Client Store** (`stores/client.js`):
```javascript
{
  clients: [],          // Array of Client entities
  selectedClient: null, // Currently selected Client entity
  searchQuery: "",      // Current search input
  searchResults: [],    // Filtered/fuzzy search results
  loading: false,       // Loading state
  error: null          // Error message
}
```

**2. Files Store** (`stores/files.js`):
```javascript
{
  currentFolderContents: {
    files: [],         // Array of File entities
    folders: []        // Array of Folder entities
  },
  uploadProgress: {},  // { fileName: percentage }
  loading: false,
  error: null
}
```

**3. Navigation Store** (`stores/navigation.js`):
```javascript
{
  currentPath: [],     // Array of PathSegment
  breadcrumbs: []      // Computed from currentPath
}
```

---

## Data Validation

### Client Validation

```javascript
function validateClient(client) {
  const errors = [];

  // Required fields
  if (!client.firstName?.trim()) {
    errors.push({ field: 'firstName', msgKey: 'validation.required' });
  }
  if (!client.lastName?.trim()) {
    errors.push({ field: 'lastName', msgKey: 'validation.required' });
  }
  if (!client.nationalId?.trim()) {
    errors.push({ field: 'nationalId', msgKey: 'validation.required' });
  }

  // Field lengths
  if (client.firstName?.length > 100) {
    errors.push({ field: 'firstName', msgKey: 'validation.maxLength', max: 100 });
  }
  if (client.lastName?.length > 100) {
    errors.push({ field: 'lastName', msgKey: 'validation.maxLength', max: 100 });
  }
  if (client.nationalId?.length > 50) {
    errors.push({ field: 'nationalId', msgKey: 'validation.maxLength', max: 50 });
  }

  // Email format
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.push({ field: 'email', msgKey: 'validation.email' });
  }

  return errors;
}
```

### File Upload Validation

```javascript
function validateFileUpload(file) {
  const errors = [];
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  if (file.size > MAX_SIZE) {
    errors.push({ field: 'file', msgKey: 'validation.fileSize', max: '50MB' });
  }

  if (file.size === 0) {
    errors.push({ field: 'file', msgKey: 'validation.emptyFile' });
  }

  return errors;
}
```

---

## API Response Formats

All API responses follow the GAS standardized format defined in the constitution:

```javascript
{
  status: 200,  // HTTP status code
  msgKey: "client.created.success",  // i18n key
  message: "Client created successfully",  // English message
  data: {
    // Entity-specific data (Client, Case, File, etc.)
  },
  token: {
    value: "encrypted_token_string",
    ttl: 1729012345000,  // Unix timestamp (15 minutes from now)
    username: "user@example.com"
  }
}
```

**Error Response Example**:
```javascript
{
  status: 400,
  msgKey: "client.nationalId.duplicate",
  message: "National ID already exists",
  data: null,
  token: { /* ... */ }
}
```

---

## Summary

This data model provides:

1. **Clear entity definitions** for Client, Case, File, Folder, and Navigation state
2. **Validation rules** for data integrity
3. **Field specifications** with types, constraints, and lengths
4. **Relationship mappings** between entities
5. **Storage strategy** using Google Sheets and Drive
6. **Frontend state management** using Pinia stores
7. **Standardized API formats** following constitution requirements

All models use plain JavaScript (no TypeScript) and integrate seamlessly with Vue 3 Composition API, Quasar components, and Google Apps Script backend.
