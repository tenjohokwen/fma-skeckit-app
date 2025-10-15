# Research Document: Improved File Navigation UX

**Feature**: 002-improved-file-navigation
**Date**: 2025-10-15
**Phase**: Phase 0 - Technical Research

## Overview

This document captures the research and technical decisions for implementing the improved file navigation UX feature. The research focuses on five key technical areas that are critical to the feature's success.

---

## 1. Fuzzy Search Implementation

### Problem Statement

Users need to search for clients even when they have minor typos in names or partial information. The system must return relevant results quickly (under 2 seconds) for databases containing up to 1000 clients.

### Decision

**Use Fuse.js library for fuzzy search**

### Rationale

Fuse.js is a lightweight (18KB minified, 6KB gzipped), pure JavaScript fuzzy-search library that provides:

- **Levenshtein distance algorithm** for typo tolerance
- **Configurable threshold** to control match strictness (default: 0.6)
- **Multiple key searching** (firstName, lastName, nationalId simultaneously)
- **Performance optimization** with pre-indexing
- **Vue integration** via computed properties for reactive search
- **No backend dependencies** - runs entirely in the browser

**Implementation approach**:
```javascript
import Fuse from 'fuse.js'

const fuseOptions = {
  keys: ['firstName', 'lastName', 'nationalId'],
  threshold: 0.4,  // 0.4 allows ~2 character typos
  ignoreLocation: true,
  minMatchCharLength: 2
}

const fuse = new Fuse(clientList, fuseOptions)
const results = fuse.search(searchQuery)
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Custom Levenshtein algorithm** | Would require ~200+ lines of implementation, testing, and optimization. Fuse.js provides this out-of-box with better performance. |
| **Server-side search with Google Sheets Query** | Increases latency (network round-trip), limited fuzzy matching capabilities in Sheets, harder to tune relevance scoring. |
| **Simple string.includes() filtering** | No typo tolerance, poor user experience when exact matches not found. |

### Performance Considerations

- Initial index creation: ~50ms for 1000 clients
- Search execution: ~10-50ms per query
- Memory footprint: ~2MB for 1000 client index
- Debounce search input (300ms) to avoid excessive re-indexing

### Testing Strategy

- Test with 0, 1, and 2 character typos
- Test with partial matches (first name only, last name only)
- Test with special characters and accented characters (é, ñ, etc.)
- Performance test with 1000+ client records

---

## 2. Client Data Storage Approach

### Problem Statement

Client metadata (name, contact info, national ID) needs to be stored persistently and synchronized with Google Drive folder structure. The system must enforce unique national IDs and support quick lookups.

### Decision

**Store client metadata in Google Sheets via Google Apps Script, with corresponding Drive folder creation**

### Rationale

**Google Sheets as database**:
- **Native GAS integration** with SpreadsheetApp service
- **Structured data storage** with columns for each field
- **Query capabilities** via filtering and searching
- **Concurrent access handling** built into Sheets
- **Version history** and audit trail automatically maintained
- **No quota concerns** for <10,000 clients

**Folder synchronization**:
- Create Drive folder when client created: `cases/{firstName}_{lastName}_{nationalId}/`
- Store folder ID in Sheets for fast lookup
- Folder ID provides direct navigation without path searching

**Schema in Google Sheets**:
```
Column A: clientId (auto-generated UUID)
Column B: firstName
Column C: lastName
Column D: nationalId (unique constraint enforced in code)
Column E: telephone
Column F: email
Column G: folderId (Google Drive folder ID)
Column H: createdAt (ISO timestamp)
Column I: updatedAt (ISO timestamp)
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Properties Service** | 500KB limit insufficient for 1000 clients (~500KB at 500 bytes/client). No query capabilities. |
| **Drive folder metadata** | Poor query performance, no relational capabilities, harder to enforce uniqueness constraints. |
| **External database (Firebase, MongoDB)** | Adds external dependency, authentication complexity, additional cost, network latency. |

### Implementation Details

**Unique constraint enforcement**:
```javascript
function checkNationalIdUnique(nationalId, excludeClientId = null) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {  // Skip header row
    if (data[i][3] === nationalId && data[i][0] !== excludeClientId) {
      return false;  // Duplicate found
    }
  }
  return true;
}
```

**Folder creation**:
```javascript
function createClientFolder(firstName, lastName, nationalId) {
  const rootFolder = DriveApp.getFoldersByName('cases').next();
  const folderName = `${firstName}_${lastName}_${nationalId}`;
  const folder = rootFolder.createFolder(folderName);
  return folder.getId();
}
```

### Performance Considerations

- Sheet read operations: ~200-500ms for 1000 rows
- Cache frequently accessed data using CacheService (6 hours TTL)
- Use batch operations for multiple client lookups

### Testing Strategy

- Test unique constraint enforcement (duplicate national IDs rejected)
- Test folder creation and ID storage
- Test with special characters in names (spaces, accents, hyphens)
- Test concurrent client creation scenarios

---

## 3. File Upload Handling with Google Drive API

### Problem Statement

Users need to upload single or multiple files to case folders with:
- Progress indication for each file
- Optional display name assignment
- Error handling for individual file failures
- Support for files up to 50MB
- Compliance with Drive API quotas

### Decision

**Use Google Drive API via Google Apps Script with multipart upload for files, client-side progress tracking via chunked uploads**

### Rationale

**Google Apps Script approach**:
- **Native Drive integration** with DriveApp service
- **No authentication complexity** - runs under service account
- **Automatic quota management** by Google
- **Blob handling** for file content
- **Folder organization** via folder ID references

**Client-side implementation**:
```javascript
// Frontend: Split large files into chunks for progress tracking
async function uploadFile(file, caseFolderId, displayName) {
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const progress = ((i + 1) / totalChunks) * 100;

    // Send chunk to GAS endpoint
    await uploadChunk(chunk, i, totalChunks, caseFolderId, displayName);

    // Update progress UI
    updateProgress(file.name, progress);
  }
}
```

**Backend GAS endpoint**:
```javascript
function handleFileUpload(e) {
  const { caseFolderId, fileName, displayName, fileContent, mimeType } = e.parameter;

  const folder = DriveApp.getFolderById(caseFolderId);
  const blob = Utilities.newBlob(
    Utilities.base64Decode(fileContent),
    mimeType,
    displayName || fileName
  );

  const file = folder.createFile(blob);

  return {
    fileId: file.getId(),
    fileName: displayName || fileName,
    size: file.getSize(),
    mimeType: file.getMimeType()
  };
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Direct Drive API from frontend** | Requires OAuth2 flow, complex token management, exposes API keys to client, harder to enforce security. |
| **Google Picker API** | Limited to file selection, doesn't provide upload progress, requires separate upload mechanism. |
| **Single monolithic upload** | No progress indication, timeout risk for large files (>10MB), poor UX. |

### Implementation Details

**File size limits**:
- GAS payload limit: 50MB per request
- Recommend chunking for files >5MB
- Show warning for files >50MB (not supported)

**MIME type detection**:
```javascript
const mimeTypes = {
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'jpg': 'image/jpeg',
  'png': 'image/png'
};
```

**Error handling**:
- Individual file failures don't block other uploads
- Return array of results: `[{ fileName, status: 'success'|'error', error }]`
- Frontend displays per-file status via `$q.notify()`

### Performance Considerations

- Concurrent upload limit: 3 files at a time (browser connection limit)
- Chunk size: 1MB for optimal progress granularity vs. overhead
- Network timeout: 60 seconds per chunk
- Use AbortController for upload cancellation

### Quota Awareness

- Drive API: 1 billion queries/day (well above needs)
- Apps Script execution: 90 minutes/day (sufficient for expected usage)
- Monitor quota usage via Apps Script dashboard

### Testing Strategy

- Test single file upload (<1MB)
- Test multiple file upload (5 files)
- Test large file upload (25MB) with progress
- Test file upload failure scenarios (network error, quota exceeded)
- Test display name assignment vs. original filename

---

## 4. Breadcrumb State Management

### Problem Statement

Users need persistent breadcrumb navigation showing current location in folder hierarchy (e.g., "Cases > John_Doe_12345 > Tax_2024"). The breadcrumb must:
- Update when navigating into folders
- Support click navigation to any parent level
- Persist across component re-renders
- Work with browser back/forward buttons

### Decision

**Use Pinia store to track navigation path, with Vue Router integration for URL-based navigation**

### Rationale

**Pinia store approach**:
- **Centralized state** accessible from any component
- **Reactive updates** trigger automatic UI re-renders
- **Devtools integration** for debugging navigation state
- **Composition API support** via `setup()` stores
- **TypeScript-like type inference** even in JavaScript

**Store structure**:
```javascript
// stores/navigation.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const currentPath = ref([])  // Array of { folderId, folderName, type }

  const breadcrumbs = computed(() => {
    return currentPath.value.map((segment, index) => ({
      ...segment,
      isClickable: index < currentPath.value.length - 1,
      route: `/files/${currentPath.value.slice(0, index + 1).map(s => s.folderId).join('/')}`
    }))
  })

  function navigateToFolder(folderId, folderName, type) {
    currentPath.value.push({ folderId, folderName, type })
  }

  function navigateToIndex(index) {
    currentPath.value = currentPath.value.slice(0, index + 1)
  }

  function reset() {
    currentPath.value = [{ folderId: 'root', folderName: 'Cases', type: 'root' }]
  }

  return { currentPath, breadcrumbs, navigateToFolder, navigateToIndex, reset }
})
```

**Component integration**:
```vue
<script setup>
import { useNavigationStore } from '@/stores/navigation'
const navStore = useNavigationStore()

function handleBreadcrumbClick(index) {
  navStore.navigateToIndex(index)
  // Fetch folder contents for the selected level
}
</script>

<template>
  <div class="breadcrumb">
    <span
      v-for="(crumb, index) in navStore.breadcrumbs"
      :key="crumb.folderId"
      :class="{ clickable: crumb.isClickable }"
      @click="crumb.isClickable && handleBreadcrumbClick(index)"
    >
      {{ crumb.folderName }}
      <span v-if="index < navStore.breadcrumbs.length - 1"> > </span>
    </span>
  </div>
</template>
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Component-local state (ref)** | Breadcrumb state lost when component unmounts, can't be shared across pages, no browser back/forward support. |
| **Vue Router params** | URL becomes very long with deep hierarchies, encoding issues with special characters, harder to manipulate programmatically. |
| **LocalStorage** | Not reactive, requires manual serialization/deserialization, synchronization issues across tabs. |

### Implementation Details

**URL synchronization**:
```javascript
// In router/routes.js
{
  path: '/files/:pathMatch(.*)*',
  component: () => import('pages/FileManagementPage.vue'),
  props: route => ({
    folderPath: route.params.pathMatch
  })
}

// In FileManagementPage.vue
watch(() => props.folderPath, (newPath) => {
  // Reconstruct breadcrumb from URL path
  navStore.reconstructFromPath(newPath)
})
```

**Browser history integration**:
- Push to history when navigating forward
- Pop history when navigating backward via breadcrumb
- Listen to `popstate` event for browser back/forward buttons

### Performance Considerations

- Store is lightweight (<1KB in memory)
- Breadcrumb computation is O(n) where n = depth (typically <5)
- Memoized via `computed()` - only recalculates when path changes

### Testing Strategy

- Test navigation forward (add to path)
- Test navigation backward (click earlier breadcrumb)
- Test reset to root
- Test deep navigation (5+ levels)
- Test special characters in folder names

---

## 5. File Type Icon Mapping

### Problem Statement

Users need visual cues to distinguish file types at a glance. The system must display appropriate icons for common file types (PDF, Word, Excel, images, etc.) and a generic icon for unknown types.

### Decision

**Use Quasar's Material Icons with file extension mapping**

### Rationale

**Material Icons via Quasar**:
- **Already included** in Quasar framework (no additional dependency)
- **Comprehensive icon set** covering all common file types
- **Consistent design language** matching Quasar components
- **Accessible** with proper ARIA labels
- **Performant** (SVG icons, ~2KB per icon)

**Icon mapping implementation**:
```javascript
// composables/useFileIcons.js
import { computed } from 'vue'

export function useFileIcons() {
  const iconMap = {
    // Documents
    'pdf': { icon: 'picture_as_pdf', color: 'red-7' },
    'doc': { icon: 'description', color: 'blue-7' },
    'docx': { icon: 'description', color: 'blue-7' },
    'txt': { icon: 'article', color: 'grey-7' },

    // Spreadsheets
    'xls': { icon: 'table_chart', color: 'green-7' },
    'xlsx': { icon: 'table_chart', color: 'green-7' },
    'csv': { icon: 'table_view', color: 'green-6' },

    // Presentations
    'ppt': { icon: 'slideshow', color: 'orange-7' },
    'pptx': { icon: 'slideshow', color: 'orange-7' },

    // Images
    'jpg': { icon: 'image', color: 'purple-6' },
    'jpeg': { icon: 'image', color: 'purple-6' },
    'png': { icon: 'image', color: 'purple-6' },
    'gif': { icon: 'gif', color: 'purple-6' },
    'svg': { icon: 'image', color: 'purple-6' },

    // Archives
    'zip': { icon: 'folder_zip', color: 'amber-8' },
    'rar': { icon: 'folder_zip', color: 'amber-8' },

    // Default
    'folder': { icon: 'folder', color: 'blue-6' },
    'default': { icon: 'insert_drive_file', color: 'grey-6' }
  }

  function getIconForFile(fileName) {
    const extension = fileName.split('.').pop().toLowerCase()
    return iconMap[extension] || iconMap.default
  }

  function getIconForFolder() {
    return iconMap.folder
  }

  return { getIconForFile, getIconForFolder }
}
```

**Component usage**:
```vue
<script setup>
import { useFileIcons } from '@/composables/useFileIcons'
const { getIconForFile, getIconForFolder } = useFileIcons()
</script>

<template>
  <q-item v-for="item in items" :key="item.id">
    <q-item-section avatar>
      <q-icon
        :name="item.isFolder ? getIconForFolder().icon : getIconForFile(item.name).icon"
        :color="item.isFolder ? getIconForFolder().color : getIconForFile(item.name).color"
        size="md"
      />
    </q-item-section>
    <q-item-section>{{ item.name }}</q-item-section>
  </q-item>
</template>
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Font Awesome** | Additional 900KB dependency, not part of design system, icon naming inconsistency with Quasar. |
| **Custom SVG icons** | Requires designing/sourcing ~20+ icons, increases maintenance burden, no consistency with UI framework. |
| **File thumbnails from Drive** | API quota intensive, slow loading, unnecessary complexity for simple file identification. |
| **MIME type detection** | Requires backend call for each file, adds latency, overcomplicated for visual indication. |

### Implementation Details

**Extensibility**:
- Easy to add new file types by updating `iconMap`
- Centralized in composable for consistency across app

**Accessibility**:
```vue
<q-icon
  :name="iconInfo.icon"
  :color="iconInfo.color"
  size="md"
  :aria-label="`${extension.toUpperCase()} file`"
/>
```

**Performance**:
- Icon lookup is O(1) hash map operation
- Icons loaded once and cached by browser
- No network requests required

### Testing Strategy

- Test all mapped file types display correct icon
- Test unknown file type displays default icon
- Test folder displays folder icon
- Test icon colors match design system
- Test accessibility labels are present

---

## Summary of Research Decisions

| Technical Area | Decision | Key Benefit |
|----------------|----------|-------------|
| **Fuzzy Search** | Fuse.js library | Lightweight, typo-tolerant, pre-built optimization |
| **Client Storage** | Google Sheets + Drive folders | Native integration, no external deps, auto audit trail |
| **File Upload** | GAS multipart with client progress | Secure, quota-managed, granular UX feedback |
| **Breadcrumb State** | Pinia store | Centralized, reactive, devtools-debuggable |
| **File Icons** | Quasar Material Icons | Zero deps, design consistency, performant |

All decisions align with the project constitution requirements:
- Plain JavaScript (no TypeScript)
- Vue 3 Composition API
- Quasar component integration
- Performance-conscious (lazy loading, debouncing, caching)
- No unnecessary external dependencies
- Mobile-responsive design considerations

---

## Next Steps (Phase 1)

1. Create data model definitions (data-model.md)
2. Define API contracts for GAS endpoints (contracts/api-spec.md)
3. Create quickstart guide for developers
4. Validate research decisions against constitution compliance
