# Access Control Matrix: Read-Only Non-Admin Users

**Feature ID**: 004
**Phase**: 1 (Design)
**Date**: 2025-10-17

## Authorization Matrix

Complete mapping of all operations and their required permissions.

### Backend Endpoints

| Endpoint | Operation | Current Auth | Required Auth | Status | Action |
|----------|-----------|--------------|---------------|--------|--------|
| **Client Operations** |
| `client.search` | READ | None | None | ✅ Correct | No change |
| `client.get` | READ | None | None | ✅ Correct | No change |
| `client.create` | CREATE | None | ROLE_ADMIN | ⚠️ Missing | Add check |
| `client.update` | UPDATE | ROLE_ADMIN | ROLE_ADMIN | ✅ Protected | No change |
| **Case Operations** |
| `case.create` | CREATE | None | ROLE_ADMIN | ⚠️ Missing | Add check |
| **File Operations** |
| `file.listFolderContents` | READ | None | None | ✅ Correct | No change |
| `file.uploadFile` | CREATE | ROLE_ADMIN | ROLE_ADMIN | ✅ Protected | No change |
| `file.downloadFile` | READ | None | ROLE_ADMIN | ⚠️ Missing | Add check |
| `file.deleteFile` | DELETE | ROLE_ADMIN | ROLE_ADMIN | ✅ Protected | No change |
| `file.renameFile` | UPDATE | ROLE_ADMIN | ROLE_ADMIN | ✅ Protected | No change |
| **Folder Operations** |
| `folder.delete` | DELETE | ROLE_ADMIN | ROLE_ADMIN | ✅ Protected | No change |

**Summary**:
- ✅ Already Protected: 5 endpoints
- ⚠️ Need Protection: 3 endpoints (client.create, case.create, file.downloadFile)
- ✅ Correctly Open: 3 endpoints (read operations)

---

### Frontend Components

| Component | UI Element | Current Visibility | Required Visibility | Action |
|-----------|------------|-------------------|---------------------|--------|
| **SearchPage.vue** |
| | "Create New Client" button | All users | Admin only | Add v-if="canCreate" |
| | "Create Case" icon | All users | Admin only | Add v-if="canCreate" |
| | "View Details" icon | All users | All users | No change |
| **ClientDetailsPage.vue** |
| | Client info (read-only) | All users | All users | No change |
| | "Edit" button | Admin only | Admin only | ✅ Already correct |
| | "Create New Case" button | All users | Admin only | Add v-if="canCreate" |
| | Case list (read-only) | All users | All users | No change |
| **CaseFilesPage.vue** |
| | FileUploader component | All users | Admin only | Add v-if="canUpload" |
| | File list (read-only) | All users | All users | No change |
| | "Download" button | All users | Admin only | Add v-if="canDownload" |
| | "Delete" button | All users | Admin only | Add v-if="canDelete" |
| | "Rename" button | All users | Admin only | Add v-if="canEdit" |
| | "Delete Folder" button | All users | Admin only | Add v-if="canDelete" |
| **FolderBrowser.vue** |
| | Folder/file cards | All users | All users | No change |
| | Action buttons on cards | All users | Admin only | Add permission checks |
| **CaseList.vue** |
| | "Create New Case" button | All users | Admin only | Add v-if="canCreate" |
| | Case cards (read-only) | All users | All users | No change |
| **ClientSearchForm.vue** |
| | Search form | All users | All users | No change |
| | "Create Client" button | All users | Admin only | Add v-if="canCreate" |

**Summary**:
- Need Updates: 6 components
- Total UI Elements to Restrict: 11 buttons/features

---

## Permission Definitions

### Admin Users (ROLE_ADMIN)
**Can Perform**:
- ✅ All READ operations
- ✅ All CREATE operations
- ✅ All UPDATE operations
- ✅ All DELETE operations
- ✅ DOWNLOAD files

**Cannot Perform**:
- (None - full access)

### Non-Admin Users (ROLE_USER)
**Can Perform**:
- ✅ All READ operations
  - Search clients
  - View client details
  - View case folders
  - View file listings
  - Navigate all pages

**Cannot Perform**:
- ❌ CREATE operations (clients, cases, files, folders)
- ❌ UPDATE operations (edit client info, rename files)
- ❌ DELETE operations (delete files, folders)
- ❌ DOWNLOAD files

---

## Operation-Level Authorization Rules

### CREATE Operations
**Rule**: Require `ROLE_ADMIN`
**Endpoints**:
- `client.create`
- `case.create`
- `file.uploadFile`

**Enforcement**:
```javascript
// Backend (all CREATE handlers)
if (!context.user || context.user.role !== 'ROLE_ADMIN') {
  throw ResponseHandler.forbiddenError(
    'Admin access required to create resources',
    'error.forbidden'
  );
}
```

**Frontend**:
```vue
<q-btn v-if="canCreate" @click="handleCreate" />
```

---

### UPDATE Operations
**Rule**: Require `ROLE_ADMIN`
**Endpoints**:
- `client.update`
- `file.renameFile`

**Enforcement**: (Already implemented, verify only)
```javascript
// Backend (all UPDATE handlers)
if (!context.user || context.user.role !== 'ROLE_ADMIN') {
  throw ResponseHandler.forbiddenError(
    'Admin access required to edit resources',
    'error.forbidden'
  );
}
```

**Frontend**:
```vue
<q-btn v-if="canEdit" @click="handleEdit" />
```

---

### DELETE Operations
**Rule**: Require `ROLE_ADMIN`
**Endpoints**:
- `file.deleteFile`
- `folder.delete`

**Enforcement**: (Already implemented, verify only)
```javascript
// Backend (all DELETE handlers)
if (!context.user || context.user.role !== 'ROLE_ADMIN') {
  throw ResponseHandler.forbiddenError(
    'Admin access required to delete resources',
    'error.forbidden'
  );
}
```

**Frontend**:
```vue
<q-btn v-if="canDelete" @click="handleDelete" />
```

---

### DOWNLOAD Operations
**Rule**: Require `ROLE_ADMIN`
**Endpoints**:
- `file.downloadFile`

**Rationale**:
- Prevents unauthorized data exfiltration
- Consistent with other write operations
- Non-admin can view but not extract

**Enforcement**:
```javascript
// Backend
if (!context.user || context.user.role !== 'ROLE_ADMIN') {
  throw ResponseHandler.forbiddenError(
    'Admin access required to download files',
    'error.forbidden'
  );
}
```

**Frontend**:
```vue
<q-btn v-if="canDownload" icon="download" @click="handleDownload" />
```

---

### READ Operations
**Rule**: Allow all authenticated users
**Endpoints**:
- `client.search`
- `client.get`
- `file.listFolderContents`

**Enforcement**:
```javascript
// Backend - No additional role check
// SecurityInterceptor already validates token
// Any authenticated user can read
```

**Frontend**:
```vue
<!-- No permission check needed -->
<div class="client-info">{{ client.firstName }}</div>
```

---

## Role Check Implementation Pattern

### Backend Pattern (Consistent Across All Handlers)

```javascript
/**
 * Standard admin-only check
 * Place at the start of every CREATE/UPDATE/DELETE/DOWNLOAD handler
 */
function checkAdminRole(context, operationName) {
  if (!context.user || context.user.role !== 'ROLE_ADMIN') {
    Logger.log(
      'Forbidden: Non-admin attempted ' + operationName,
      context.user ? context.user.email : 'unknown'
    );

    throw ResponseHandler.forbiddenError(
      'Admin access required',
      'error.forbidden'
    );
  }
}

// Usage in handler
create: function(context) {
  try {
    checkAdminRole(context, 'client.create');

    // ... rest of handler logic
  } catch (error) {
    if (error.status) throw error;
    throw ResponseHandler.serverError(...);
  }
}
```

### Frontend Pattern (Composable)

```javascript
// composables/useRoleAccess.js
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

export function useRoleAccess() {
  const authStore = useAuthStore()

  const isAdmin = computed(() => {
    return authStore.user?.role === 'ROLE_ADMIN'
  })

  // All write operations require admin
  const canCreate = computed(() => isAdmin.value)
  const canEdit = computed(() => isAdmin.value)
  const canDelete = computed(() => isAdmin.value)
  const canUpload = computed(() => isAdmin.value)
  const canDownload = computed(() => isAdmin.value)

  // Inverse for UI messaging
  const isViewOnly = computed(() => !isAdmin.value)

  return {
    isAdmin,
    canCreate,
    canEdit,
    canDelete,
    canUpload,
    canDownload,
    isViewOnly
  }
}
```

**Usage in Components**:
```vue
<script setup>
import { useRoleAccess } from 'src/composables/useRoleAccess'

const { canCreate, canEdit, canDelete, canDownload } = useRoleAccess()
</script>

<template>
  <!-- Conditionally render based on permissions -->
  <q-btn v-if="canCreate" label="Create" />
  <q-btn v-if="canEdit" label="Edit" />
  <q-btn v-if="canDelete" label="Delete" />
  <q-btn v-if="canDownload" label="Download" />

  <!-- Read-only content always visible -->
  <div class="info">{{ data }}</div>
</template>
```

---

## Error Response Format

### 403 Forbidden Response

```javascript
{
  "status": 403,
  "msgKey": "error.forbidden",
  "message": "Admin access required",
  "data": {},
  "token": {
    "value": "...",
    "ttl": 1234567890,
    "username": "user@example.com"
  }
}
```

**Frontend Handling**:
```javascript
// In API service
if (error.response?.status === 403) {
  $q.notify({
    type: 'negative',
    message: t('error.forbidden'),
    position: 'top'
  });
}
```

---

## Navigation Access

All pages remain accessible to non-admin users for viewing:

| Page | Non-Admin Access | Notes |
|------|------------------|-------|
| Dashboard | ✅ Yes | Home page |
| Search | ✅ Yes | Can search and view results |
| Client Details | ✅ Yes | Read-only view |
| Case Files | ✅ Yes | Can view file lists |
| Profile | ✅ Yes | Own profile settings |

**No pages are blocked** - only actions within pages are restricted.

---

## Testing Authorization Rules

### Backend Test Matrix

| Test Case | User Role | Endpoint | Expected Status | Expected Message |
|-----------|-----------|----------|-----------------|------------------|
| 1 | ROLE_USER | client.create | 403 | Admin access required |
| 2 | ROLE_USER | client.update | 403 | Admin access required |
| 3 | ROLE_USER | case.create | 403 | Admin access required |
| 4 | ROLE_USER | file.uploadFile | 403 | Admin access required |
| 5 | ROLE_USER | file.deleteFile | 403 | Admin access required |
| 6 | ROLE_USER | file.renameFile | 403 | Admin access required |
| 7 | ROLE_USER | file.downloadFile | 403 | Admin access required |
| 8 | ROLE_USER | folder.delete | 403 | Admin access required |
| 9 | ROLE_USER | client.search | 200 | Success |
| 10 | ROLE_USER | client.get | 200 | Success |
| 11 | ROLE_USER | file.listFolderContents | 200 | Success |
| 12 | ROLE_ADMIN | All endpoints | 200 | Success |

### Frontend Test Matrix

| Test Case | User Role | Component | Element | Visible? |
|-----------|-----------|-----------|---------|----------|
| 1 | ROLE_USER | SearchPage | "Create Client" button | No |
| 2 | ROLE_USER | SearchPage | "Create Case" icon | No |
| 3 | ROLE_USER | ClientDetailsPage | "Edit" button | No |
| 4 | ROLE_USER | ClientDetailsPage | "Create Case" button | No |
| 5 | ROLE_USER | CaseFilesPage | FileUploader | No |
| 6 | ROLE_USER | CaseFilesPage | Delete buttons | No |
| 7 | ROLE_USER | CaseFilesPage | Download buttons | No |
| 8 | ROLE_USER | CaseFilesPage | Rename buttons | No |
| 9 | ROLE_USER | MainLayout | "View Only" badge | Yes |
| 10 | ROLE_ADMIN | All components | All buttons | Yes |

---

## Compliance & Audit

### Security Compliance Checklist

- [ ] All CREATE operations enforce admin role (backend)
- [ ] All UPDATE operations enforce admin role (backend)
- [ ] All DELETE operations enforce admin role (backend)
- [ ] All DOWNLOAD operations enforce admin role (backend)
- [ ] All READ operations allow authenticated users (backend)
- [ ] All admin-only UI elements hidden from non-admin (frontend)
- [ ] Error messages don't expose sensitive information
- [ ] Authorization checks happen before data access
- [ ] Role checks use server-provided role, not client-stored
- [ ] No bypass mechanisms exist (direct API calls)

### Audit Logging (Future)

**Recommended**: Log all 403 responses for security monitoring

```javascript
// Example audit log entry
{
  timestamp: "2025-10-17T10:30:00Z",
  event: "FORBIDDEN_ACCESS_ATTEMPT",
  user: "user@example.com",
  role: "ROLE_USER",
  endpoint: "client.create",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

---

**Document Status**: ✅ Complete
**Next Step**: Create quickstart.md for testing procedures
