# API Specification: Improved File Navigation UX

**Feature**: 002-improved-file-navigation
**Date**: 2025-10-15
**Phase**: Phase 1 - API Contracts

## Overview

This document specifies all Google Apps Script (GAS) API endpoints required for the improved file navigation feature. All endpoints follow the GAS architecture pattern defined in the constitution:

```
Request → SecurityInterceptor → Router → Handler → ResponseHandler → Response
```

All responses follow the standardized format:
```javascript
{
  status: number,        // HTTP status code
  msgKey: string,        // i18n key for localization
  message: string,       // English error/success message
  data: object | null,   // Response payload
  token: {
    value: string,       // Encrypted token
    ttl: number,         // Unix timestamp (current + 15 minutes)
    username: string     // User identifier
  }
}
```

---

## Authentication

All endpoints except public endpoints require a valid token in the request payload.

**Token Location**: `e.parameter.token`

**Token Validation**: Handled by `SecurityInterceptor.validateRequest(e)` before routing.

**Token Refresh**: Every successful authenticated response includes a refreshed token with 15-minute TTL.

---

## Endpoint Specifications

### 1. Client Search

Search for clients using fuzzy matching on first name, last name, and national ID.

**Endpoint**: `client.search`

**Method**: `POST`

**Handler**: `ClientHandler.search()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `action` | String | Yes | Must be "client.search" | "client.search" |
| `token` | String | Yes | Authentication token | "encrypted_token" |
| `firstName` | String | No | First name to search | "John" |
| `lastName` | String | No | Last name to search | "Doe" |
| `nationalId` | String | No | National ID to search | "AB123" |

**Request Example**:
```javascript
{
  action: "client.search",
  token: "encrypted_token_here",
  firstName: "John",
  lastName: "Doe",
  nationalId: ""
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "client.search.success",
  message: "Search completed successfully",
  data: {
    clients: [
      {
        clientId: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "John",
        lastName: "Doe",
        nationalId: "AB123456",
        telephone: "+1-555-123-4567",
        email: "john.doe@example.com",
        folderId: "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV",
        createdAt: "2025-10-15T14:30:00.000Z",
        updatedAt: "2025-10-15T14:30:00.000Z"
      }
    ],
    count: 1
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (400 - No search criteria):
```javascript
{
  status: 400,
  msgKey: "client.search.noCriteria",
  message: "At least one search criterion must be provided",
  data: null,
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. At least one search field must be non-empty
2. Search is case-insensitive
3. Returns all clients matching ANY of the provided criteria
4. Results ordered by: exact matches first, then by creation date (newest first)
5. Maximum 100 results returned

---

### 2. Create Client

Create a new client record and corresponding Google Drive folder.

**Endpoint**: `client.create`

**Method**: `POST`

**Handler**: `ClientHandler.create()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `action` | String | Yes | Must be "client.create" | Exact match |
| `token` | String | Yes | Authentication token | Valid token |
| `firstName` | String | Yes | Client first name | 1-100 chars, trimmed |
| `lastName` | String | Yes | Client last name | 1-100 chars, trimmed |
| `nationalId` | String | Yes | Unique national ID | 1-50 chars, unique |
| `telephone` | String | No | Contact phone | Max 20 chars |
| `email` | String | No | Contact email | Valid email format |

**Request Example**:
```javascript
{
  action: "client.create",
  token: "encrypted_token_here",
  firstName: "Jane",
  lastName: "Smith",
  nationalId: "XY789012",
  telephone: "+1-555-987-6543",
  email: "jane.smith@example.com"
}
```

**Success Response** (201):
```javascript
{
  status: 201,
  msgKey: "client.create.success",
  message: "Client created successfully",
  data: {
    client: {
      clientId: "660f9511-f3ac-52e5-b827-557766551111",
      firstName: "Jane",
      lastName: "Smith",
      nationalId: "XY789012",
      telephone: "+1-555-987-6543",
      email: "jane.smith@example.com",
      folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
      createdAt: "2025-10-15T15:00:00.000Z",
      updatedAt: "2025-10-15T15:00:00.000Z"
    },
    folderPath: "cases/Jane_Smith_XY789012"
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (409 - Duplicate National ID):
```javascript
{
  status: 409,
  msgKey: "client.nationalId.duplicate",
  message: "A client with this National ID already exists",
  data: {
    existingClientId: "550e8400-e29b-41d4-a716-446655440000"
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (400 - Validation Error):
```javascript
{
  status: 400,
  msgKey: "client.validation.failed",
  message: "Validation failed",
  data: {
    errors: [
      { field: "firstName", msgKey: "validation.required" },
      { field: "email", msgKey: "validation.email" }
    ]
  },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate all required fields
2. Check national ID uniqueness
3. Generate UUID for clientId
4. Sanitize names for folder creation (remove special chars)
5. Create folder: `cases/{firstName}_{lastName}_{nationalId}`
6. Store folder ID in Sheets
7. Set createdAt and updatedAt to current timestamp

---

### 3. Get Client Details

Retrieve detailed information about a specific client, including list of their cases.

**Endpoint**: `client.get`

**Method**: `POST`

**Handler**: `ClientHandler.get()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `action` | String | Yes | Must be "client.get" | "client.get" |
| `token` | String | Yes | Authentication token | "encrypted_token" |
| `clientId` | String | Yes | Client UUID | "550e8400-..." |

**Request Example**:
```javascript
{
  action: "client.get",
  token: "encrypted_token_here",
  clientId: "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "client.get.success",
  message: "Client retrieved successfully",
  data: {
    client: {
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      firstName: "John",
      lastName: "Doe",
      nationalId: "AB123456",
      telephone: "+1-555-123-4567",
      email: "john.doe@example.com",
      folderId: "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV",
      createdAt: "2025-10-15T14:30:00.000Z",
      updatedAt: "2025-10-15T14:30:00.000Z"
    },
    cases: [
      {
        caseId: "Tax_2024",
        folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
        fileCount: 15,
        createdAt: "2025-10-15T14:35:00.000Z",
        modifiedAt: "2025-10-15T16:20:00.000Z"
      },
      {
        caseId: "Immigration_2024",
        folderId: "3cD4eF5gG6hH7iI8jJ9kK0lL1mM2nN3oO",
        fileCount: 3,
        createdAt: "2025-10-14T10:00:00.000Z",
        modifiedAt: "2025-10-14T11:30:00.000Z"
      }
    ],
    caseCount: 2
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - Client Not Found):
```javascript
{
  status: 404,
  msgKey: "client.notFound",
  message: "Client not found",
  data: { clientId: "550e8400-..." },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Look up client in Sheets by clientId
2. Retrieve client's Drive folder using folderId
3. List all subfolders (cases) in client folder
4. Count files in each case folder
5. Sort cases by creation date (newest first)

---

### 4. Create Case

Create a new case folder for an existing client.

**Endpoint**: `case.create`

**Method**: `POST`

**Handler**: `CaseHandler.create()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `action` | String | Yes | Must be "case.create" | Exact match |
| `token` | String | Yes | Authentication token | Valid token |
| `clientId` | String | Yes | Parent client UUID | Must exist |
| `caseId` | String | Yes | Case identifier | 1-100 chars, alphanumeric+underscore |

**Request Example**:
```javascript
{
  action: "case.create",
  token: "encrypted_token_here",
  clientId: "550e8400-e29b-41d4-a716-446655440000",
  caseId: "Estate_Planning_2024"
}
```

**Success Response** (201):
```javascript
{
  status: 201,
  msgKey: "case.create.success",
  message: "Case created successfully",
  data: {
    case: {
      caseId: "Estate_Planning_2024",
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      folderId: "4dE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO",
      folderPath: "cases/John_Doe_AB123456/Estate_Planning_2024",
      fileCount: 0,
      createdAt: "2025-10-15T16:00:00.000Z",
      modifiedAt: "2025-10-15T16:00:00.000Z"
    }
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (409 - Duplicate Case ID):
```javascript
{
  status: 409,
  msgKey: "case.caseId.duplicate",
  message: "A case with this ID already exists for this client",
  data: {
    clientId: "550e8400-...",
    caseId: "Estate_Planning_2024"
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - Client Not Found):
```javascript
{
  status: 404,
  msgKey: "client.notFound",
  message: "Client not found",
  data: { clientId: "550e8400-..." },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate clientId exists in Sheets
2. Get client's folder ID from Sheets
3. Check case ID uniqueness within client folder
4. Create subfolder in client folder with caseId as name
5. Return folder ID and path

---

### 5. Upload File

Upload one or more files to a case folder.

**Endpoint**: `file.upload`

**Method**: `POST`

**Handler**: `FileHandler.upload()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `action` | String | Yes | Must be "file.upload" | Exact match |
| `token` | String | Yes | Authentication token | Valid token |
| `caseFolderId` | String | Yes | Target folder ID | Must exist |
| `files` | Array | Yes | Array of file data | Max 50MB per file |
| `files[].fileName` | String | Yes | Original filename | Non-empty |
| `files[].displayName` | String | No | Custom display name | Optional |
| `files[].content` | String | Yes | Base64-encoded file | Non-empty |
| `files[].mimeType` | String | Yes | File MIME type | Valid MIME type |

**Request Example**:
```javascript
{
  action: "file.upload",
  token: "encrypted_token_here",
  caseFolderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
  files: [
    {
      fileName: "contract.pdf",
      displayName: "Client Contract 2024",
      content: "JVBERi0xLjQKJeLjz9M...",  // Base64
      mimeType: "application/pdf"
    },
    {
      fileName: "receipt.jpg",
      displayName: "",
      content: "/9j/4AAQSkZJRgABAQEA...",  // Base64
      mimeType: "image/jpeg"
    }
  ]
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "file.upload.success",
  message: "Files uploaded successfully",
  data: {
    results: [
      {
        fileName: "Client Contract 2024",
        status: "success",
        fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP",
        size: 2457600,
        mimeType: "application/pdf"
      },
      {
        fileName: "receipt.jpg",
        status: "success",
        fileId: "6fG7hH8iI9jJ0kK1lL2mM3nN4oO5pP6qQ",
        size: 1548320,
        mimeType: "image/jpeg"
      }
    ],
    successCount: 2,
    failureCount: 0
  },
  token: { /* refreshed token */ }
}
```

**Partial Success Response** (207 - Multi-Status):
```javascript
{
  status: 207,
  msgKey: "file.upload.partial",
  message: "Some files uploaded successfully",
  data: {
    results: [
      {
        fileName: "contract.pdf",
        status: "success",
        fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP"
      },
      {
        fileName: "large_file.pdf",
        status: "error",
        error: "File size exceeds 50MB limit"
      }
    ],
    successCount: 1,
    failureCount: 1
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (400 - Validation Error):
```javascript
{
  status: 400,
  msgKey: "file.upload.validation",
  message: "Invalid file data",
  data: {
    errors: [
      { index: 0, error: "File content is empty" }
    ]
  },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate case folder exists
2. Decode base64 content for each file
3. Create blob with content and MIME type
4. Use displayName if provided, otherwise use fileName
5. Create file in Drive folder
6. Return individual results for each file (success or error)
7. Handle duplicate filenames (Drive auto-renames)

---

### 6. List Folder Contents

Retrieve all files and subfolders in a specific folder.

**Endpoint**: `file.list`

**Method**: `POST`

**Handler**: `FileHandler.list()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `action` | String | Yes | Must be "file.list" | "file.list" |
| `token` | String | Yes | Authentication token | "encrypted_token" |
| `folderId` | String | Yes | Folder ID to list | "2bC3dE4f..." |

**Request Example**:
```javascript
{
  action: "file.list",
  token: "encrypted_token_here",
  folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT"
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "file.list.success",
  message: "Folder contents retrieved successfully",
  data: {
    folders: [
      {
        folderId: "7gH8iI9jJ0kK1lL2mM3nN4oO5pP6qQ7rR",
        name: "Receipts",
        itemCount: 8,
        createdAt: "2025-10-15T14:45:00.000Z",
        modifiedAt: "2025-10-15T16:00:00.000Z",
        isFolder: true
      }
    ],
    files: [
      {
        fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP",
        name: "Client Contract 2024",
        mimeType: "application/pdf",
        extension: "pdf",
        size: 2457600,
        sizeFormatted: "2.4 MB",
        createdAt: "2025-10-15T14:40:00.000Z",
        modifiedAt: "2025-10-15T15:10:00.000Z",
        webViewLink: "https://drive.google.com/file/d/5eF6gG7h.../view",
        downloadUrl: "https://drive.google.com/uc?id=5eF6gG7h...&export=download",
        isFolder: false
      },
      {
        fileId: "6fG7hH8iI9jJ0kK1lL2mM3nN4oO5pP6qQ",
        name: "receipt.jpg",
        mimeType: "image/jpeg",
        extension: "jpg",
        size: 1548320,
        sizeFormatted: "1.5 MB",
        createdAt: "2025-10-15T15:00:00.000Z",
        modifiedAt: "2025-10-15T15:00:00.000Z",
        webViewLink: "https://drive.google.com/file/d/6fG7hH8i.../view",
        downloadUrl: "https://drive.google.com/uc?id=6fG7hH8i...&export=download",
        isFolder: false
      }
    ],
    folderCount: 1,
    fileCount: 2
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - Folder Not Found):
```javascript
{
  status: 404,
  msgKey: "folder.notFound",
  message: "Folder not found",
  data: { folderId: "2bC3dE4f..." },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate folder exists and is accessible
2. Get all files in folder using DriveApp
3. Get all subfolders in folder
4. For each file: extract name, size, MIME type, timestamps, URLs
5. For each folder: get name, item count, timestamps
6. Sort folders first (alphabetically), then files (alphabetically)
7. Format file sizes (bytes → KB/MB/GB)

---

### 7. Download File

Get download URL for a specific file.

**Endpoint**: `file.download`

**Method**: `POST`

**Handler**: `FileHandler.download()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `action` | String | Yes | Must be "file.download" | "file.download" |
| `token` | String | Yes | Authentication token | "encrypted_token" |
| `fileId` | String | Yes | File ID to download | "5eF6gG7h..." |

**Request Example**:
```javascript
{
  action: "file.download",
  token: "encrypted_token_here",
  fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP"
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "file.download.success",
  message: "Download URL generated successfully",
  data: {
    fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP",
    fileName: "Client Contract 2024.pdf",
    downloadUrl: "https://drive.google.com/uc?id=5eF6gG7h...&export=download",
    mimeType: "application/pdf",
    size: 2457600
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - File Not Found):
```javascript
{
  status: 404,
  msgKey: "file.notFound",
  message: "File not found",
  data: { fileId: "5eF6gG7h..." },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate file exists using DriveApp
2. Generate download URL
3. Return file metadata with download URL
4. Frontend triggers download via `window.open(downloadUrl)`

---

### 8. Delete File

Permanently delete a file from Google Drive.

**Endpoint**: `file.delete`

**Method**: `POST`

**Handler**: `FileHandler.delete()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `action` | String | Yes | Must be "file.delete" | "file.delete" |
| `token` | String | Yes | Authentication token | "encrypted_token" |
| `fileId` | String | Yes | File ID to delete | "5eF6gG7h..." |

**Request Example**:
```javascript
{
  action: "file.delete",
  token: "encrypted_token_here",
  fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP"
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "file.delete.success",
  message: "File deleted successfully",
  data: {
    fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP",
    fileName: "Client Contract 2024.pdf",
    deletedAt: "2025-10-15T17:00:00.000Z"
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - File Not Found):
```javascript
{
  status: 404,
  msgKey: "file.notFound",
  message: "File not found",
  data: { fileId: "5eF6gG7h..." },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate file exists
2. Get file name before deletion (for response)
3. Call `file.setTrashed(true)` to move to trash
4. Return confirmation with file details
5. Note: File goes to Drive trash, not permanently deleted immediately

---

### 9. Rename File

Change the name of a file in Google Drive.

**Endpoint**: `file.rename`

**Method**: `POST`

**Handler**: `FileHandler.rename()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `action` | String | Yes | Must be "file.rename" | Exact match |
| `token` | String | Yes | Authentication token | Valid token |
| `fileId` | String | Yes | File ID to rename | Must exist |
| `newName` | String | Yes | New filename | 1-255 chars, non-empty |

**Request Example**:
```javascript
{
  action: "file.rename",
  token: "encrypted_token_here",
  fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP",
  newName: "Final Contract 2024.pdf"
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "file.rename.success",
  message: "File renamed successfully",
  data: {
    fileId: "5eF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP",
    oldName: "Client Contract 2024.pdf",
    newName: "Final Contract 2024.pdf",
    modifiedAt: "2025-10-15T17:05:00.000Z"
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - File Not Found):
```javascript
{
  status: 404,
  msgKey: "file.notFound",
  message: "File not found",
  data: { fileId: "5eF6gG7h..." },
  token: { /* refreshed token */ }
}
```

**Error Response** (400 - Invalid Name):
```javascript
{
  status: 400,
  msgKey: "file.rename.invalid",
  message: "Invalid filename",
  data: { error: "Filename cannot be empty" },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate file exists
2. Validate new name is non-empty and within length limit
3. Get old name before renaming
4. Call `file.setName(newName)`
5. Return old and new names for UI update

---

### 10. Delete Folder

Permanently delete a folder and all its contents.

**Endpoint**: `folder.delete`

**Method**: `POST`

**Handler**: `FolderHandler.delete()`

**Authentication**: Required

**Request Parameters**:

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `action` | String | Yes | Must be "folder.delete" | Exact match |
| `token` | String | Yes | Authentication token | Valid token |
| `folderId` | String | Yes | Folder ID to delete | Must exist |
| `confirmation` | String | Yes | Must be exactly "DELETE" | Case-sensitive |

**Request Example**:
```javascript
{
  action: "folder.delete",
  token: "encrypted_token_here",
  folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
  confirmation: "DELETE"
}
```

**Success Response** (200):
```javascript
{
  status: 200,
  msgKey: "folder.delete.success",
  message: "Folder deleted successfully",
  data: {
    folderId: "2bC3dE4fG5hI6jK7lM8nO9pQ0rR1sS2tT",
    folderName: "Tax_2024",
    itemsDeleted: 15,  // Total files + subfolders
    deletedAt: "2025-10-15T17:10:00.000Z"
  },
  token: { /* refreshed token */ }
}
```

**Error Response** (400 - Missing Confirmation):
```javascript
{
  status: 400,
  msgKey: "folder.delete.confirmationRequired",
  message: "Confirmation required: type DELETE to confirm",
  data: { provided: "delete", expected: "DELETE" },
  token: { /* refreshed token */ }
}
```

**Error Response** (403 - Protected Folder):
```javascript
{
  status: 403,
  msgKey: "folder.delete.protected",
  message: "Cannot delete protected system folder",
  data: { folderId: "root_cases_folder" },
  token: { /* refreshed token */ }
}
```

**Error Response** (404 - Folder Not Found):
```javascript
{
  status: 404,
  msgKey: "folder.notFound",
  message: "Folder not found",
  data: { folderId: "2bC3dE4f..." },
  token: { /* refreshed token */ }
}
```

**Business Logic**:
1. Validate folder exists
2. Check folder is not the root "cases" folder (protected)
3. Validate confirmation is exactly "DELETE"
4. Count total items (files + subfolders recursively)
5. Call `folder.setTrashed(true)` to move folder and all contents to trash
6. Return confirmation with item count
7. Frontend should navigate to parent folder after deletion

---

## Error Codes Summary

| Status Code | Use Case | Example msgKey |
|-------------|----------|----------------|
| **200** | Success | `client.search.success` |
| **201** | Created | `client.create.success` |
| **207** | Multi-Status | `file.upload.partial` |
| **400** | Bad Request | `client.validation.failed` |
| **401** | Unauthorized | `auth.token.invalid` |
| **403** | Forbidden | `folder.delete.protected` |
| **404** | Not Found | `client.notFound` |
| **409** | Conflict | `client.nationalId.duplicate` |
| **500** | Server Error | `server.error` |

---

## Rate Limiting & Quotas

Google Apps Script quotas apply to all endpoints:

| Quota | Limit | Notes |
|-------|-------|-------|
| **Execution time** | 6 minutes | Per doPost invocation |
| **Daily execution time** | 90 minutes | Per user per day |
| **URL fetch calls** | 20,000 | Per day |
| **Drive API queries** | 1 billion | Per day (shared across project) |
| **Payload size** | 50 MB | Per request |

**Mitigation strategies**:
- Use CacheService to cache frequently accessed data (client list, folder structures)
- Batch operations where possible (file upload supports multiple files)
- Implement client-side debouncing for search inputs
- Show appropriate error messages when quotas exceeded

---

## Testing Recommendations

### Unit Tests (GAS Backend)

Test each handler method in isolation:
- Mock DriveApp and SpreadsheetApp services
- Verify request parameter validation
- Test error handling paths
- Verify response format compliance

### Integration Tests (Frontend → Backend)

Test complete request/response cycles:
- Client search with various criteria
- Client creation with valid/invalid data
- File upload with single and multiple files
- Folder navigation and listing
- File operations (download, delete, rename)
- Folder deletion with confirmation

### Contract Tests

Verify API contracts:
- Request parameter types and requirements
- Response structure matches specification
- Error codes and messages are correct
- Token refresh on every response

---

## i18n Message Keys

All `msgKey` values used in responses must have corresponding translations in:
- `/src/i18n/en-US/index.js` (English)
- `/src/i18n/fr-FR/index.js` (French)

**Example i18n entries**:
```javascript
// en-US/index.js
export default {
  client: {
    search: {
      success: 'Search completed successfully',
      noCriteria: 'At least one search criterion must be provided'
    },
    create: {
      success: 'Client created successfully'
    },
    nationalId: {
      duplicate: 'A client with this National ID already exists'
    },
    notFound: 'Client not found',
    validation: {
      failed: 'Validation failed'
    }
  },
  // ... other keys
}
```

---

## Summary

This API specification defines:

1. **10 endpoints** covering all file navigation operations
2. **Standardized request/response formats** following GAS constitution
3. **Comprehensive error handling** with appropriate HTTP status codes
4. **Validation rules** for all input parameters
5. **Business logic** for each operation
6. **i18n support** with msgKey references
7. **Quota awareness** and mitigation strategies

All endpoints are designed to work seamlessly with the Vue 3 frontend, providing a clean separation between presentation and business logic while maintaining security through token-based authentication.
