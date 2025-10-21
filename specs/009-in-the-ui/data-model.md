# Data Model: Client Status Update Email Notifications

**Feature**: 009-in-the-ui
**Date**: 2025-10-21
**Purpose**: Define data structures, entities, and relationships for email notification feature

## Overview

This feature introduces new data structures for email notifications while leveraging existing entities (Case, Client). No database schema changes required - all new data is transient (request/response payloads).

## Entities

### 1. EmailNotificationRequest (Transient)

**Purpose**: Captures user's email notification intent during case status update

**Lifecycle**: Created in EmailNotificationDialog, sent to backend as part of case update request, discarded after processing

**Fields**:

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `sendEmail` | Boolean | Yes | - | - | Whether to send email notification |
| `clientLanguage` | String | Conditional | 'en' | Enum: ['en', 'fr'] | Client's preferred language (required if sendEmail=true) |

**Validation Rules**:
- If `sendEmail` is `true`, `clientLanguage` must be provided
- `clientLanguage` must be either 'en' or 'fr'
- If `sendEmail` is `false`, `clientLanguage` is ignored

**Usage**:
```javascript
// User accepts email notification
{
  sendEmail: true,
  clientLanguage: 'en'
}

// User declines email notification
{
  sendEmail: false
}
```

---

### 2. EmailNotificationResponse (Transient)

**Purpose**: Communicates email sending outcome back to frontend

**Lifecycle**: Created by backend handler after email attempt, included in API response, consumed by frontend for user notification

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `emailSent` | Boolean | Yes | True if email was successfully sent |
| `emailSkipped` | Boolean | Yes | True if email was skipped (no address, sendEmail=false) |
| `emailFailed` | Boolean | Yes | True if email send was attempted but failed |
| `skipReason` | String | Conditional | Reason code if emailSkipped=true (e.g., 'NO_EMAIL', 'INVALID_EMAIL') |
| `failureReason` | String | Conditional | Error message if emailFailed=true |

**State Transitions**:
```
sendEmail=false → emailSent=false, emailSkipped=true, skipReason='USER_DECLINED'
sendEmail=true + no client email → emailSent=false, emailSkipped=true, skipReason='NO_EMAIL'
sendEmail=true + send succeeds → emailSent=true, emailSkipped=false, emailFailed=false
sendEmail=true + send fails → emailSent=false, emailSkipped=false, emailFailed=true, failureReason='...'
```

**Usage**:
```javascript
// Success scenario
{
  emailSent: true,
  emailSkipped: false,
  emailFailed: false
}

// No email address scenario
{
  emailSent: false,
  emailSkipped: true,
  emailFailed: false,
  skipReason: 'NO_EMAIL'
}

// Send failure scenario
{
  emailSent: false,
  emailSkipped: false,
  emailFailed: true,
  failureReason: 'Service communication failure. Check the message and try again.'
}
```

---

### 3. EmailTemplate (Configuration)

**Purpose**: Defines structure and content for status notification emails

**Storage**: Code-based (gas/utils/emailTemplates.gs), future: PropertiesService

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `language` | String | Yes | Template language ('en' or 'fr') |
| `subject` | String | Yes | Email subject line with placeholders |
| `bodyHtml` | String | Yes | HTML email body with placeholders |
| `bodyText` | String | Yes | Plain text fallback with placeholders |

**Placeholders**:
- `{caseName}`: Name of the case
- `{status}`: New status value
- `{notes}`: Updated notes content
- `{signature}`: Email signature from PropertiesService (optional)

**Template Structure**:
```javascript
{
  language: 'en',
  subject: 'Status Update: {caseName}',
  bodyHtml: `
    <html>
      <body style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
        <p>Dear Client,</p>
        <p>We would like to inform you of a status update for your case:</p>
        <div style="background-color: #f1f5f9; padding: 16px; margin: 16px 0; border-left: 4px solid #2563eb;">
          <p><strong>Case:</strong> {caseName}</p>
          <p><strong>New Status:</strong> {status}</p>
          <p><strong>Notes:</strong> {notes}</p>
        </div>
        {signature}
      </body>
    </html>
  `,
  bodyText: `
    Dear Client,

    We would like to inform you of a status update for your case:

    Case: {caseName}
    New Status: {status}
    Notes: {notes}

    {signature}
  `
}
```

---

### 4. Case (Existing - Extended)

**Purpose**: Represents a case in the metadata sheet

**Storage**: Google Sheets (Metadata sheet)

**Relevant Fields** (for this feature):

| Field | Type | Column | Description |
|-------|------|--------|-------------|
| `caseId` | String | A | Unique identifier |
| `caseName` | String | B | Display name |
| `clientId` | String | C | UUID linking to client record |
| `status` | String | F | **Monitored field** - triggers email prompt when changed |
| `notes` | String | G | **Required field** when sending email |
| `version` | Number | M | Optimistic locking version |

**Status Change Detection**:
```javascript
// In CaseEditor component
const originalStatus = props.caseData.status
const currentStatus = formData.status

if (originalStatus !== currentStatus) {
  // Show EmailNotificationDialog
}
```

**Notes Validation**:
```javascript
// In EmailNotificationDialog
const notesChanged = formData.notes !== originalNotes && formData.notes.trim() !== ''
if (sendEmail && !notesChanged) {
  // Show validation error
}
```

---

### 5. Client (Existing - Referenced)

**Purpose**: Represents a client in the clients sheet

**Storage**: Google Sheets (Clients sheet)

**Relevant Fields** (for this feature):

| Field | Type | Description |
|-------|------|-------------|
| `clientId` | String | Unique identifier (matches Case.clientId) |
| `email` | String | **Email address** for notifications (may be null/empty) |
| `name` | String | Client name for display |

**Email Retrieval**:
```javascript
// Backend: gas/services/SheetsService.gs
function getClientEmail(clientId) {
  const client = getClientById(clientId)
  if (!client) {
    throw new Error('Client not found')
  }
  return client.email || null  // Handle missing email gracefully
}
```

---

### 6. ScriptProperties (Existing - Referenced)

**Purpose**: Server-side configuration storage

**Storage**: Google Apps Script PropertiesService

**Relevant Properties** (for this feature):

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `SIGNATURE` | String | No | Email signature appended to all notifications |

**Retrieval**:
```javascript
// Backend: gas/utils/emailTemplates.gs
function getEmailSignature() {
  const props = PropertiesService.getScriptProperties()
  const signature = props.getProperty('SIGNATURE')
  return signature || ''  // Return empty string if not configured
}
```

---

## Relationships

```
Case (1) ──┬─── (1) Client
           │       └─── email: String (nullable)
           │
           └─── status: String (monitored)
           └─── notes: String (required for email)

EmailNotificationRequest
    ├─── sendEmail: Boolean
    └─── clientLanguage: 'en' | 'fr'
           │
           └─→ EmailTemplate (selected by language)
                    ├─── subject
                    ├─── bodyHtml
                    └─── bodyText
                          │
                          └─→ Placeholders filled from Case + ScriptProperties
```

---

## State Transitions

### Dialog State Machine

```
[Initial: Dialog Closed]
         │
         ├─ Status Changed → [Dialog Open]
         │                        │
         │                        ├─ User selects "Yes"
         │                        │    └─→ [Language Selection: en/fr]
         │                        │           └─→ Validate notes
         │                        │                 ├─ Valid → [Confirm: sendEmail=true]
         │                        │                 └─ Invalid → [Show Error, stay in dialog]
         │                        │
         │                        ├─ User selects "No"
         │                        │    └─→ [Confirm: sendEmail=false]
         │                        │
         │                        └─ User clicks Cancel
         │                             └─→ [Cancelled: abort save]
         │
         └─ No Status Change → [Skip Dialog, proceed with save]
```

### Backend Processing State

```
[Receive Request]
      │
      ├─ sendEmail = false
      │    └─→ Update case only → [Success: emailSkipped=true]
      │
      └─ sendEmail = true
           │
           ├─ Retrieve client email
           │    ├─ Email exists
           │    │    └─→ Send email
           │    │         ├─ Success → [emailSent=true]
           │    │         └─ Failure → [emailFailed=true, case still updated]
           │    │
           │    └─ Email missing → [emailSkipped=true, skipReason='NO_EMAIL']
           │
           └─ Case update always succeeds (graceful degradation)
```

---

## Validation Rules Summary

### Frontend Validation (EmailNotificationDialog)

1. **Language Selection** (if sendEmail=true):
   - Must select either 'en' or 'fr'
   - Default to 'en' to reduce clicks

2. **Notes Field** (if sendEmail=true):
   - Must be non-empty: `notes.trim() !== ''`
   - Must differ from original value: `notes !== originalNotes`
   - Error message: `$t('emailDialog.notesRequired')`

3. **Send Email Toggle**:
   - Boolean, defaults to false (user must opt-in)
   - If false, skip language and notes validation

### Backend Validation (MetadataHandler)

1. **Request Structure**:
   - `sendEmail` must be boolean if present
   - `clientLanguage` must be 'en' or 'fr' if `sendEmail=true`

2. **Email Address**:
   - Format validation (basic regex): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - If invalid: skip email, set `emailSkipped=true, skipReason='INVALID_EMAIL'`

3. **Case Update**:
   - Standard validation applies (version check, required fields)
   - Email validation errors don't block case update

---

## Data Flow Diagrams

### Request Flow

```
[CaseEditor]
     │
     ├─ Detect status change
     │      │
     │      └─→ [EmailNotificationDialog]
     │              │
     │              ├─ User confirms with email
     │              │    └─→ emit('confirm', { sendEmail: true, language: 'en' })
     │              │
     │              └─ User confirms without email
     │                   └─→ emit('confirm', { sendEmail: false })
     │
     └─→ [CaseEditor.handleSave()]
            │
            └─→ [api.updateCase()]
                   │
                   └─→ POST /metadata.updateCaseMetadata
                        {
                          caseId: "...",
                          updates: { status: "...", notes: "..." },
                          version: 5,
                          sendEmail: true,
                          clientLanguage: "en"
                        }
```

### Response Flow

```
[MetadataHandler]
     │
     ├─→ Update case in Google Sheets
     │      │
     │      └─→ [SheetsService.updateCase()]
     │
     ├─→ If sendEmail=true:
     │      │
     │      ├─→ [SheetsService.getClientById()] → retrieve email
     │      │
     │      ├─→ [emailTemplates.generateTemplate()] → render template
     │      │
     │      ├─→ [PropertiesService] → get SIGNATURE
     │      │
     │      └─→ [EmailService.sendStatusNotification()]
     │             └─→ [GmailApp.sendEmail()]
     │
     └─→ Return response
          {
            status: 200,
            data: {
              case: { updated case },
              emailSent: true,
              emailSkipped: false,
              emailFailed: false
            }
          }
```

---

## Performance Characteristics

### Data Volume

- **EmailNotificationRequest**: ~50 bytes per request
- **EmailNotificationResponse**: ~150 bytes per response
- **Email Template**: ~2KB per language (loaded once, cached)
- **Email Content**: ~3-5KB per sent email (HTML + text)

### Throughput Expectations

- **Concurrent status updates**: Low (<10/minute typical)
- **Email send rate**: Limited by GmailApp quota (500-1500/day depending on account type)
- **Dialog latency**: <100ms (pure frontend, no API calls)
- **Email send latency**: 1-3 seconds (GmailApp API call)

### Scaling Considerations

- No database growth (transient data only)
- Email quota monitoring recommended if usage exceeds 100 emails/day
- Client email lookup is O(n) but acceptable for current scale
- Consider indexing/caching if client sheet exceeds 10,000 rows

---

## Error Handling & Edge Cases

### Missing Data Scenarios

| Scenario | Detection | Handling | User Notification |
|----------|-----------|----------|-------------------|
| Client not found | Backend: getClientById() returns null | Skip email, update case | Warning: "Client record not found" |
| Client email null/empty | Backend: client.email falsy | Skip email, update case | Warning: "Client has no email address" |
| Invalid email format | Backend: regex validation fails | Skip email, update case | Warning: "Client email is invalid" |
| SIGNATURE not configured | Backend: PropertiesService returns null | Send email without signature | No user notification (transparent) |
| Notes unchanged | Frontend: validation in dialog | Block confirmation | Error: "Please update notes field" |

### Concurrent Modification

- **Status**: Handled by existing optimistic locking (version field)
- **Email race condition**: Not applicable (email send is idempotent per status change)

### Network Failures

- **Frontend → Backend**: Standard API error handling (retry, timeout)
- **Backend → GmailApp**: Catch exception, set `emailFailed=true`, return success for case update

---

## Testing Data Requirements

### Test Cases (Component Tests)

```javascript
// EmailNotificationDialog test fixtures
const mockCaseData = {
  caseId: 'CASE-001',
  caseName: 'Test Case',
  status: 'In Progress',
  notes: 'Original notes',
  clientId: 'CLIENT-001'
}

const mockClientData = {
  clientId: 'CLIENT-001',
  name: 'John Doe',
  email: 'john.doe@example.com'
}

const mockNoEmailClient = {
  clientId: 'CLIENT-002',
  name: 'Jane Smith',
  email: null
}
```

### Test Scenarios

1. **Happy path**: status changed, email sent successfully
2. **No email**: status changed, client has no email
3. **Send failure**: status changed, GmailApp throws error
4. **Notes validation**: email selected, notes not updated
5. **Cancellation**: dialog cancelled, save aborted
6. **No status change**: dialog never shown

---

## Migration & Deployment

### Data Migration

**Not required**: No schema changes, no data migration needed

### Configuration Setup

1. **SIGNATURE Property** (optional):
   ```
   Key: SIGNATURE
   Value: <p>Best regards,<br>Your Support Team<br>support@example.com</p>
   ```
   Set via: Google Apps Script → Project Settings → Script Properties

2. **Client Email Validation** (pre-deployment):
   - Run validation script to identify clients with missing/invalid emails
   - Notify admins to update client records

### Rollback Procedure

1. Remove `EmailNotificationDialog` import from `CaseEditor.vue`
2. Remove status change detection logic from `handleSave()`
3. Backend remains compatible (ignores unused email parameters)

---

## Conclusion

All data structures defined with validation rules, relationships, and state transitions. No database schema changes required. All new data is transient (request/response payloads). Ready for API contract generation (Phase 1).
