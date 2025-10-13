# File Operations API Contract

**Version**: 1.0.0
**Base URL**: `{GAS_WEB_APP_URL}`
**Protocol**: HTTPS POST
**Content-Type**: application/json (metadata), multipart/form-data (file uploads)
**Authentication**: Required (Bearer token in request)

## Overview

API endpoints for client folder creation, case folder creation, file upload/download/delete, and folder navigation.

## Authorization

All file operation endpoints require ROLE_ADMIN.

---

## Endpoints

### 1. Search Client Folder

**Action**: `searchClientFolder`

**Description**: Check if client folder exists by name and ID card number.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "searchClientFolder",
  "token": "admin-session-token",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "idCardNo": "ID123"
  }
}
```

**Request Fields**:
- `firstName` (string, required): Client's first name
- `lastName` (string, required): Client's last name
- `idCardNo` (string, required): Client's ID card number

**Success Response - Folder Exists** (200):
```json
{
  "status": 200,
  "msgKey": "file.search.found",
  "message": "Client folder found",
  "data": {
    "exists": true,
    "folder": {
      "folderId": "drive-folder-id-123",
      "folderName": "John_Doe_ID123",
      "folderPath": "cases/John_Doe_ID123",
      "createdAt": "2025-09-15 10:30:00"
    }
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Success Response - Folder Not Found** (200):
```json
{
  "status": 200,
  "msgKey": "file.search.notfound",
  "message": "No folder found for this client",
  "data": {
    "exists": false
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

---

### 2. Create Client Folder

**Action**: `createClientFolder`

**Description**: Create new client root folder in Google Drive.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "createClientFolder",
  "token": "admin-session-token",
  "data": {
    "firstName": "Jane",
    "lastName": "Smith",
    "idCardNo": "ID456",
    "telephone": "+1234567890",
    "email": "jane@example.com"
  }
}
```

**Request Fields**:
- `firstName` (string, required): Client's first name
- `lastName` (string, required): Client's last name
- `idCardNo` (string, required): Client's ID card number (alphanumeric)
- `telephone` (string, optional): Client's phone number
- `email` (string, optional): Client's email address

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "file.folder.create.success",
  "message": "Client folder created successfully",
  "data": {
    "folder": {
      "folderId": "drive-folder-id-456",
      "folderName": "Jane_Smith_ID456",
      "folderPath": "cases/Jane_Smith_ID456",
      "createdBy": "John Admin",
      "createdAt": "2025-10-13 15:00:00"
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

Folder Already Exists (400):
```json
{
  "status": 400,
  "msgKey": "file.folder.create.error.exists",
  "message": "Client folder already exists",
  "data": {
    "existingFolderId": "drive-folder-id-456"
  },
  "token": null
}
```

---

### 3. Create Case Folder

**Action**: `createCaseFolder`

**Description**: Create case-specific folder within client folder.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "createCaseFolder",
  "token": "admin-session-token",
  "data": {
    "clientFolderId": "drive-folder-id-456",
    "caseId": "CASE-003"
  }
}
```

**Request Fields**:
- `clientFolderId` (string, required): Parent client folder Drive ID
- `caseId` (string, required): Case identifier (becomes folder name)

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "file.casefolder.create.success",
  "message": "Case folder created successfully",
  "data": {
    "folder": {
      "folderId": "drive-folder-id-789",
      "folderName": "CASE-003",
      "caseId": "CASE-003",
      "parentFolderId": "drive-folder-id-456",
      "folderPath": "cases/Jane_Smith_ID456/CASE-003",
      "createdBy": "John Admin",
      "createdAt": "2025-10-13 15:05:00"
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

Case Folder Already Exists (400):
```json
{
  "status": 400,
  "msgKey": "file.casefolder.create.error.exists",
  "message": "Case folder already exists",
  "data": {
    "existingFolderId": "drive-folder-id-789"
  },
  "token": null
}
```

---

### 4. Upload File

**Action**: `uploadFile`

**Description**: Upload file to case folder with conflict detection.

**Authorization**: ROLE_ADMIN only

**Request** (multipart/form-data):
```
POST {GAS_WEB_APP_URL}
Content-Type: multipart/form-data

token: admin-session-token
action: uploadFile
caseFolderId: drive-folder-id-789
fileName: contract.pdf
file: [binary file data]
```

**Request Fields**:
- `token` (string, required): Admin session token
- `action` (string, required): "uploadFile"
- `caseFolderId` (string, required): Case folder Drive ID
- `fileName` (string, required): Desired file name
- `file` (binary, required): File binary data

**Success Response - No Conflict** (200):
```json
{
  "status": 200,
  "msgKey": "file.upload.success",
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "fileId": "drive-file-id-111",
      "fileName": "contract.pdf",
      "mimeType": "application/pdf",
      "size": 2048576,
      "parentFolderId": "drive-folder-id-789",
      "filePath": "cases/Jane_Smith_ID456/CASE-003/contract.pdf",
      "uploadedBy": "John Admin",
      "uploadedAt": "2025-10-13 15:10:00",
      "downloadUrl": "https://drive.google.com/uc?export=download&id=drive-file-id-111"
    },
    "conflict": false
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Success Response - Conflict Detected** (200):
```json
{
  "status": 200,
  "msgKey": "file.upload.conflict",
  "message": "File with this name already exists",
  "data": {
    "conflict": true,
    "existingFileId": "drive-file-id-100",
    "fileName": "contract.pdf"
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Error Responses**:

File Too Large (400):
```json
{
  "status": 400,
  "msgKey": "file.upload.error.size",
  "message": "File exceeds maximum size of 10MB",
  "data": {
    "maxSize": 10485760,
    "actualSize": 15000000
  },
  "token": null
}
```

Invalid File Name (400):
```json
{
  "status": 400,
  "msgKey": "file.upload.error.filename",
  "message": "File name contains invalid characters",
  "data": null,
  "token": null
}
```

---

### 5. Resolve File Conflict

**Action**: `resolveFileConflict`

**Description**: Handle file name conflict during upload.

**Authorization**: ROLE_ADMIN only

**Request** (multipart/form-data):
```
POST {GAS_WEB_APP_URL}
Content-Type: multipart/form-data

token: admin-session-token
action: resolveFileConflict
caseFolderId: drive-folder-id-789
fileName: contract.pdf
resolution: overwrite|rename|cancel
file: [binary file data]
```

**Request Fields**:
- `token` (string, required): Admin session token
- `action` (string, required): "resolveFileConflict"
- `caseFolderId` (string, required): Case folder Drive ID
- `fileName` (string, required): Original file name
- `resolution` (enum, required): "overwrite", "rename", or "cancel"
- `file` (binary, required): File binary data

**Success Response - Overwrite** (200):
```json
{
  "status": 200,
  "msgKey": "file.conflict.overwrite.success",
  "message": "File overwritten successfully",
  "data": {
    "file": {
      "fileId": "drive-file-id-112",
      "fileName": "contract.pdf",
      "mimeType": "application/pdf",
      "size": 2048576,
      "parentFolderId": "drive-folder-id-789",
      "filePath": "cases/Jane_Smith_ID456/CASE-003/contract.pdf",
      "uploadedBy": "John Admin",
      "uploadedAt": "2025-10-13 15:12:00",
      "downloadUrl": "https://drive.google.com/uc?export=download&id=drive-file-id-112"
    },
    "action": "overwrite",
    "previousFileDeleted": true
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Success Response - Rename** (200):
```json
{
  "status": 200,
  "msgKey": "file.conflict.rename.success",
  "message": "File uploaded with new name",
  "data": {
    "file": {
      "fileId": "drive-file-id-113",
      "fileName": "contract_20251013_151200.pdf",
      "mimeType": "application/pdf",
      "size": 2048576,
      "parentFolderId": "drive-folder-id-789",
      "filePath": "cases/Jane_Smith_ID456/CASE-003/contract_20251013_151200.pdf",
      "uploadedBy": "John Admin",
      "uploadedAt": "2025-10-13 15:12:00",
      "downloadUrl": "https://drive.google.com/uc?export=download&id=drive-file-id-113"
    },
    "action": "rename",
    "originalFileName": "contract.pdf",
    "newFileName": "contract_20251013_151200.pdf"
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Success Response - Cancel** (200):
```json
{
  "status": 200,
  "msgKey": "file.conflict.cancel.success",
  "message": "Upload cancelled",
  "data": {
    "action": "cancel"
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

---

### 6. List Folder Contents

**Action**: `listFolderContents`

**Description**: Navigate folder structure and list files/subfolders.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "listFolderContents",
  "token": "admin-session-token",
  "data": {
    "folderId": "drive-folder-id-789"
  }
}
```

**Request Fields**:
- `folderId` (string, required): Drive folder ID to list

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "file.list.success",
  "message": "Folder contents retrieved",
  "data": {
    "folderId": "drive-folder-id-789",
    "folderName": "CASE-003",
    "folderPath": "cases/Jane_Smith_ID456/CASE-003",
    "folders": [
      {
        "folderId": "drive-folder-id-790",
        "folderName": "subfolder",
        "createdAt": "2025-10-13 15:20:00"
      }
    ],
    "files": [
      {
        "fileId": "drive-file-id-111",
        "fileName": "contract.pdf",
        "mimeType": "application/pdf",
        "size": 2048576,
        "uploadedAt": "2025-10-13 15:10:00",
        "downloadUrl": "https://drive.google.com/uc?export=download&id=drive-file-id-111"
      },
      {
        "fileId": "drive-file-id-114",
        "fileName": "invoice.xlsx",
        "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "size": 512000,
        "uploadedAt": "2025-10-13 15:15:00",
        "downloadUrl": "https://drive.google.com/uc?export=download&id=drive-file-id-114"
      }
    ]
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

---

### 7. Download File

**Action**: `downloadFile`

**Description**: Get file download URL or binary content.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "downloadFile",
  "token": "admin-session-token",
  "data": {
    "fileId": "drive-file-id-111"
  }
}
```

**Request Fields**:
- `fileId` (string, required): Drive file ID

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "file.download.success",
  "message": "File ready for download",
  "data": {
    "fileId": "drive-file-id-111",
    "fileName": "contract.pdf",
    "mimeType": "application/pdf",
    "size": 2048576,
    "downloadUrl": "https://drive.google.com/uc?export=download&id=drive-file-id-111"
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Note**: Frontend can use `downloadUrl` to trigger browser download

---

### 8. Delete File

**Action**: `deleteFile`

**Description**: Permanently delete file from Drive.

**Authorization**: ROLE_ADMIN only

**Request**:
```json
{
  "action": "deleteFile",
  "token": "admin-session-token",
  "data": {
    "fileId": "drive-file-id-111"
  }
}
```

**Request Fields**:
- `fileId` (string, required): Drive file ID to delete

**Success Response** (200):
```json
{
  "status": 200,
  "msgKey": "file.delete.success",
  "message": "File deleted successfully",
  "data": {
    "fileId": "drive-file-id-111",
    "fileName": "contract.pdf",
    "deletedAt": "2025-10-13 15:30:00"
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1697234567890,
    "username": "admin@example.com"
  }
}
```

**Error Responses**:

File Not Found (404):
```json
{
  "status": 404,
  "msgKey": "file.delete.error.notfound",
  "message": "File not found",
  "data": null,
  "token": null
}
```

---

## File Upload Flow

### Standard Upload (No Conflict)
```
1. User selects file
2. Frontend: POST uploadFile
3. Backend: Check for duplicate filename
4. Backend: No conflict → Upload file
5. Backend: Return file info
6. Frontend: Show success message
```

### Upload with Conflict
```
1. User selects file
2. Frontend: POST uploadFile
3. Backend: Check for duplicate filename
4. Backend: Conflict detected → Return conflict response
5. Frontend: Show dialog with options (overwrite/rename/cancel)
6. User selects option
7. Frontend: POST resolveFileConflict with resolution
8. Backend: Execute resolution
   - overwrite: Delete old + upload new
   - rename: Generate unique name + upload
   - cancel: Return success with cancel action
9. Backend: Return result
10. Frontend: Show appropriate message
```

## Conflict Resolution Naming Pattern

When resolution is "rename":
- Original: `document.pdf`
- Renamed: `document_YYYYMMDD_HHmmss.pdf`
- Example: `document_20251013_151200.pdf`

Format: `{baseName}_{timestamp}.{extension}`
Timestamp: Africa/Douala timezone, format `YYYYMMDDHHmmss`

## File Size Limits

- Maximum file size: 10MB (10,485,760 bytes)
- Enforced on frontend and backend
- Larger files rejected with 400 error

## Testing Checklist

- [ ] Search for existing client folder
- [ ] Search for non-existent client folder
- [ ] Create new client folder
- [ ] Create duplicate client folder (should fail)
- [ ] Create case folder within client folder
- [ ] Create duplicate case folder (should fail)
- [ ] Upload file with unique name (no conflict)
- [ ] Upload file with duplicate name (conflict detected)
- [ ] Resolve conflict with overwrite
- [ ] Resolve conflict with rename (verify timestamp format)
- [ ] Resolve conflict with cancel
- [ ] Upload file exceeding 10MB (should fail)
- [ ] Upload file with invalid characters in name (should fail)
- [ ] List folder contents with files and subfolders
- [ ] Download file (verify URL works)
- [ ] Delete file successfully
- [ ] Delete non-existent file (should fail with 404)
- [ ] Verify all operations as non-admin (should fail with 403)
