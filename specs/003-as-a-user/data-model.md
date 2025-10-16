# Data Model: Client Entity

**Feature**: Admin Client Information Editing
**Date**: 2025-10-16

## Overview

The Client entity represents a person receiving services. This document defines the data structure, validation rules, and state transitions for client information editing.

## Client Entity

### Storage Location
- **Backend**: Google Sheets (`clients` sheet)
- **Frontend**: Pinia store (`src/stores/client.js`)

### Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `clientId` | String | Yes | Unique, Auto-generated UUID | Primary identifier |
| `firstName` | String | Yes | 1-50 characters | Client's first name |
| `lastName` | String | Yes | 1-50 characters | Client's last name |
| `nationalId` | String | Yes | 5-20 characters, Unique | Government-issued ID number |
| `telephone` | String | No | 10-15 digits, E.164 format | Contact phone number |
| `email` | String | No | Valid email format (RFC 5322) | Contact email address |
| `folderId` | String | Yes | Google Drive folder ID | Associated cases folder |
| `createdAt` | DateTime | Yes | ISO 8601 format | Creation timestamp |
| `updatedAt` | DateTime | Yes | ISO 8601 format | Last modification timestamp |

### Google Sheets Column Mapping

| Column | Field | Index |
|--------|-------|-------|
| A | clientId | 0 |
| B | firstName | 1 |
| C | lastName | 2 |
| D | nationalId | 3 |
| E | telephone | 4 |
| F | email | 5 |
| G | folderId | 6 |
| H | createdAt | 7 |
| I | updatedAt | 8 |

## Validation Rules

### Frontend Validation (Vuelidate)

```javascript
// useClientValidation.js
import { required, email, minLength, maxLength, helpers } from '@vuelidate/validators'

export const clientValidationRules = {
  firstName: {
    required: helpers.withMessage('First name is required', required),
    minLength: minLength(1),
    maxLength: maxLength(50)
  },
  lastName: {
    required: helpers.withMessage('Last name is required', required),
    minLength: minLength(1),
    maxLength: maxLength(50)
  },
  nationalId: {
    required: helpers.withMessage('National ID is required', required),
    minLength: minLength(5),
    maxLength: maxLength(20),
    // Async validator for uniqueness (calls backend)
    uniqueNationalId: helpers.withAsync(async (value, siblings, vm) => {
      if (!value) return true
      // Only check if national ID changed
      if (value === vm.originalNationalId) return true
      
      try {
        const response = await checkNationalIdUnique(value)
        return response.isUnique
      } catch (error) {
        return false
      }
    })
  },
  telephone: {
    minLength: minLength(10),
    maxLength: maxLength(15),
    // Optional: E.164 format validation
    e164Format: helpers.withMessage(
      'Invalid phone format',
      (value) => !value || /^\+?[1-9]\d{9,14}$/.test(value)
    )
  },
  email: {
    email: helpers.withMessage('Invalid email format', email),
    maxLength: maxLength(100)
  }
}
```

### Backend Validation (Google Apps Script)

```javascript
// In SheetsService.updateClient()
function validateClientData(clientData, existingClientId) {
  const errors = []
  
  // Required fields
  if (!clientData.firstName || clientData.firstName.trim().length === 0) {
    errors.push('First name is required')
  }
  if (!clientData.lastName || clientData.lastName.trim().length === 0) {
    errors.push('Last name is required')
  }
  if (!clientData.nationalId || clientData.nationalId.trim().length === 0) {
    errors.push('National ID is required')
  }
  
  // Length constraints
  if (clientData.firstName && clientData.firstName.length > 50) {
    errors.push('First name must be 50 characters or less')
  }
  if (clientData.lastName && clientData.lastName.length > 50) {
    errors.push('Last name must be 50 characters or less')
  }
  if (clientData.nationalId && (clientData.nationalId.length < 5 || clientData.nationalId.length > 20)) {
    errors.push('National ID must be between 5 and 20 characters')
  }
  
  // Format validation
  if (clientData.email && !isValidEmail(clientData.email)) {
    errors.push('Invalid email format')
  }
  if (clientData.telephone && !isValidPhone(clientData.telephone)) {
    errors.push('Invalid telephone format')
  }
  
  // Uniqueness check (excluding current client)
  if (clientData.nationalId) {
    const duplicate = findClientByNationalId(clientData.nationalId)
    if (duplicate && duplicate.clientId !== existingClientId) {
      errors.push('This National ID is already registered to another client')
    }
  }
  
  return errors
}
```

## State Transitions

### Edit Workflow States

```
┌─────────────┐
│   Viewing   │  (Initial state)
└──────┬──────┘
       │ Admin clicks "Edit"
       ▼
┌─────────────┐
│   Editing   │  (Fields become editable)
└──────┬──────┘
       │
       ├──► Admin clicks "Cancel" ──► Return to Viewing (discard changes)
       │
       ├──► Admin clicks "Save" ──► Validating
       │
       └──► Admin navigates away ──► Show unsaved changes warning
                                    │
                                    ├─► User confirms ──► Navigate away
                                    └─► User cancels ──► Stay in Editing
       
┌─────────────┐
│ Validating  │  (Client-side validation running)
└──────┬──────┘
       │
       ├──► Validation fails ──► Return to Editing (show errors)
       │
       └──► Validation passes ──► Saving

┌─────────────┐
│   Saving    │  (Server request in flight)
└──────┬──────┘
       │
       ├──► Save succeeds ──► Return to Viewing (show success)
       │
       └──► Save fails ──► Return to Editing (show error, keep changes)
```

### State Flags

| Flag | Type | Description |
|------|------|-------------|
| `isEditMode` | Boolean | Whether edit mode is active |
| `isSaving` | Boolean | Whether save operation is in progress |
| `hasUnsavedChanges` | Boolean | Whether user has modified fields |
| `validationErrors` | Object | Map of field names to error messages |

## Data Flow

### Update Operation Flow

```
1. User clicks "Edit" button
   ├─► Set isEditMode = true
   ├─► Store original values for cancel/comparison
   └─► Enable form fields

2. User modifies field
   ├─► Update reactive form data
   ├─► Run client-side validation (debounced)
   ├─► Set hasUnsavedChanges = true
   └─► Display validation errors (if any)

3. User clicks "Save"
   ├─► Run full validation
   ├─► If validation fails:
   │   └─► Display errors, stay in edit mode
   └─► If validation passes:
       ├─► Set isSaving = true
       ├─► Disable form
       ├─► Call backend API: client.update
       │   ├─► Backend validates data
       │   ├─► Backend checks national ID uniqueness
       │   ├─► Backend updates Google Sheets
       │   └─► Backend returns updated client data
       ├─► If backend succeeds:
       │   ├─► Update Pinia store with new data
       │   ├─► Set isEditMode = false
       │   ├─► Set hasUnsavedChanges = false
       │   ├─► Show success notification
       │   └─► Refresh view with updated data
       └─► If backend fails:
           ├─► Keep isEditMode = true
           ├─► Display error notification
           └─► Allow user to retry or cancel
```

## Relationships

### Client → Case Folders (One-to-Many)

A client can have multiple case folders, but each folder belongs to exactly one client.

**Storage**:
- Client entity stores `folderId` (parent folder in Google Drive)
- Case folders are subfolders within the client's folder
- Case metadata stored separately (not part of client entity)

**Access Pattern**:
- When loading client details, also fetch associated cases
- Cases displayed in separate section below client information
- Editing client info does NOT affect case data

## Indexes & Performance

### Current Implementation (P1)
- **No indexes**: Linear scan through clients sheet (< 100 clients, acceptable performance)
- **National ID uniqueness check**: O(n) scan, < 1 second for typical dataset

### Future Optimization (P3)
- **Add client lookup cache**: Use CacheService to cache clientId → row mapping
- **Add national ID index**: Separate sheet with nationalId → clientId mapping for O(1) uniqueness checks
- **Implement pagination**: If client count exceeds 1000

## Audit Trail

### P1 Implementation (Minimal)
- `updatedAt` timestamp updated on every save
- No detailed change history
- No tracking of who made changes (can be inferred from token but not persisted)

### P3 Enhancement (Full Audit)
- Add `lastModifiedBy` field with admin email
- Create separate `client_audit` sheet with columns:
  - clientId, field, oldValue, newValue, changedBy, changedAt
- Store each field change as separate audit record
- Display change history in client details view

## Error Handling

### Validation Errors
- **Display**: Inline below each field using Quasar Q-input error prop
- **Color**: Red (#ef4444) per design system
- **Clear timing**: On field blur or value change

### Save Errors
- **Network Error**: "Unable to connect to server. Please check your connection."
- **Validation Error**: Specific field errors + notification
- **Permission Error**: "You do not have permission to edit this client."
- **Conflict Error** (future): "This client was modified by another user. Please refresh and try again."

### Recovery Strategy
- **Validation failures**: Keep user in edit mode, highlight errors, allow corrections
- **Network failures**: Keep edits intact, suggest retry
- **Permission failures**: Close edit mode, show error notification
- **Unexpected errors**: Keep edits intact, log error details, suggest contacting support

