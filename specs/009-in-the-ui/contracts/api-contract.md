# API Contract: Client Status Update Email Notifications

**Feature**: 009-in-the-ui
**Version**: 1.0.0
**Date**: 2025-10-21

## Overview

This document defines the API contract for extending the existing `metadata.updateCaseMetadata` endpoint to support optional email notifications when case status is updated.

## Endpoint Extension

### `metadata.updateCaseMetadata` (Extended)

**Method**: `POST`
**Route**: Via Google Apps Script router → `MetadataHandler.updateCaseMetadata`
**Authentication**: Required (existing token validation via SecurityInterceptor)
**Authorization**: Admin role required (existing)

---

## Request Specification

### Request Body

```json
{
  "caseId": "string (required)",
  "updates": {
    "status": "string (optional)",
    "notes": "string (optional)",
    "assignedTo": "string (optional)",
    "caseType": "string (optional)",
    "caseName": "string (optional)"
  },
  "version": "number (required)",
  "sendEmail": "boolean (optional, default: false)",
  "clientLanguage": "string (optional, required if sendEmail=true)"
}
```

### Field Specifications

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `caseId` | String | Yes | - | Non-empty, must exist in metadata sheet | Unique case identifier |
| `updates` | Object | Yes | - | At least one field must be present | Fields to update |
| `updates.status` | String | No | - | Any string (monitored for email trigger) | New status value |
| `updates.notes` | String | No | - | Max 10,000 characters | Updated notes |
| `updates.assignedTo` | String | No | - | - | Assigned user |
| `updates.caseType` | String | No | - | - | Case type |
| `updates.caseName` | String | No | - | Max 500 characters | Case name |
| `version` | Number | Yes | - | Must match current version in sheet | Optimistic locking version |
| `sendEmail` | Boolean | No | `false` | - | Whether to send email notification |
| `clientLanguage` | String | Conditional | `'en'` | Enum: `['en', 'fr']` | Client's preferred language (required if sendEmail=true) |

### Validation Rules

#### Request-Level Validation

1. **Authentication**: Token must be valid and not expired
2. **Authorization**: User must have admin role
3. **Case Existence**: `caseId` must reference existing case
4. **Version Match**: `version` must equal current case version (optimistic locking)
5. **Updates Object**: At least one field in `updates` must be provided

#### Email-Specific Validation

1. **Send Email Flag**:
   - Must be boolean if provided
   - Defaults to `false` if omitted

2. **Client Language**:
   - Required if `sendEmail` is `true`
   - Must be either `'en'` or `'fr'`
   - Ignored if `sendEmail` is `false`

3. **Notes Requirement** (enforced frontend-side):
   - If `sendEmail` is `true`, `updates.notes` should be provided
   - Backend does not enforce this (allows edge case where notes already exist)

#### Backward Compatibility

- All email-related fields are optional
- Omitting `sendEmail` or setting it to `false` behaves exactly like the original endpoint
- Existing API clients unaffected

### Request Examples

#### Example 1: Update status with email notification (English)

```json
{
  "caseId": "CASE-123",
  "updates": {
    "status": "In Progress",
    "notes": "Client meeting scheduled for next week. Documents have been reviewed and appear complete."
  },
  "version": 5,
  "sendEmail": true,
  "clientLanguage": "en"
}
```

#### Example 2: Update status with email notification (French)

```json
{
  "caseId": "CASE-456",
  "updates": {
    "status": "En attente",
    "notes": "En attente de documents supplémentaires du client."
  },
  "version": 3,
  "sendEmail": true,
  "clientLanguage": "fr"
}
```

#### Example 3: Update status without email notification

```json
{
  "caseId": "CASE-789",
  "updates": {
    "status": "Closed",
    "notes": "Case resolved."
  },
  "version": 8,
  "sendEmail": false
}
```

#### Example 4: Update other fields (no status change, no email)

```json
{
  "caseId": "CASE-101",
  "updates": {
    "assignedTo": "john.doe@example.com",
    "caseType": "Legal"
  },
  "version": 2
}
```

---

## Response Specification

### Success Response (200 OK)

```json
{
  "status": 200,
  "msgKey": "metadata.caseUpdated",
  "message": "Case updated successfully",
  "data": {
    "case": {
      "caseId": "string",
      "caseName": "string",
      "clientId": "string",
      "clientName": "string (enriched)",
      "status": "string",
      "notes": "string",
      "assignedTo": "string",
      "caseType": "string",
      "createdBy": "string",
      "createdAt": "number (timestamp)",
      "lastUpdatedBy": "string",
      "lastUpdatedAt": "number (timestamp)",
      "version": "number (incremented)"
    },
    "emailSent": "boolean",
    "emailSkipped": "boolean",
    "emailFailed": "boolean",
    "skipReason": "string (optional)",
    "failureReason": "string (optional)"
  },
  "token": {
    "value": "string (encrypted)",
    "ttl": "number (currentUTCTime + 15 minutes)",
    "username": "string"
  }
}
```

### Email Response Fields

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `emailSent` | Boolean | Yes | `true` if email was successfully sent |
| `emailSkipped` | Boolean | Yes | `true` if email sending was skipped |
| `emailFailed` | Boolean | Yes | `true` if email send was attempted but failed |
| `skipReason` | String | Conditional | Reason code if `emailSkipped=true` |
| `failureReason` | String | Conditional | Error message if `emailFailed=true` |

### Email Response States

| Scenario | emailSent | emailSkipped | emailFailed | skipReason | failureReason |
|----------|-----------|--------------|-------------|------------|---------------|
| User declined email | `false` | `true` | `false` | `'USER_DECLINED'` | - |
| Email sent successfully | `true` | `false` | `false` | - | - |
| Client has no email | `false` | `true` | `false` | `'NO_EMAIL'` | - |
| Invalid email format | `false` | `true` | `false` | `'INVALID_EMAIL'` | - |
| Email send failed | `false` | `false` | `true` | - | `'Service communication failure...'` |

### Skip Reason Codes

| Code | Description |
|------|-------------|
| `USER_DECLINED` | User chose not to send email |
| `NO_EMAIL` | Client record has no email address |
| `INVALID_EMAIL` | Client email address fails format validation |
| `CLIENT_NOT_FOUND` | Client record not found (rare, should not happen) |

### Success Response Examples

#### Example 1: Email sent successfully

```json
{
  "status": 200,
  "msgKey": "metadata.caseUpdated",
  "message": "Case updated successfully",
  "data": {
    "case": {
      "caseId": "CASE-123",
      "caseName": "Smith Property Dispute",
      "clientId": "CLIENT-456",
      "clientName": "John Smith",
      "status": "In Progress",
      "notes": "Client meeting scheduled for next week.",
      "assignedTo": "lawyer@example.com",
      "caseType": "Property",
      "createdBy": "admin@example.com",
      "createdAt": 1697500000000,
      "lastUpdatedBy": "admin@example.com",
      "lastUpdatedAt": 1697600000000,
      "version": 6
    },
    "emailSent": true,
    "emailSkipped": false,
    "emailFailed": false
  },
  "token": {
    "value": "encrypted_token_string",
    "ttl": 1697600900000,
    "username": "admin@example.com"
  }
}
```

#### Example 2: Email skipped (no email address)

```json
{
  "status": 200,
  "msgKey": "metadata.caseUpdated",
  "message": "Case updated successfully",
  "data": {
    "case": { "...": "..." },
    "emailSent": false,
    "emailSkipped": true,
    "emailFailed": false,
    "skipReason": "NO_EMAIL"
  },
  "token": { "...": "..." }
}
```

#### Example 3: Email send failed

```json
{
  "status": 200,
  "msgKey": "metadata.caseUpdated",
  "message": "Case updated successfully",
  "data": {
    "case": { "...": "..." },
    "emailSent": false,
    "emailSkipped": false,
    "emailFailed": true,
    "failureReason": "Service communication failure. Check the message and try again."
  },
  "token": { "...": "..." }
}
```

---

## Error Response Specifications

### Error Response (4xx, 5xx)

```json
{
  "status": "number (HTTP status code)",
  "msgKey": "string (i18n key)",
  "message": "string (error description)",
  "data": {},
  "token": {
    "value": "string (encrypted)",
    "ttl": "number",
    "username": "string"
  }
}
```

### Common Error Scenarios

#### 400 Bad Request

**Scenario**: Invalid request parameters

```json
{
  "status": 400,
  "msgKey": "validation.invalidRequest",
  "message": "clientLanguage must be 'en' or 'fr' when sendEmail is true",
  "data": {},
  "token": { "...": "..." }
}
```

#### 401 Unauthorized

**Scenario**: Missing or invalid token

```json
{
  "status": 401,
  "msgKey": "auth.unauthorized",
  "message": "Invalid or expired token",
  "data": {},
  "token": null
}
```

#### 403 Forbidden

**Scenario**: User lacks admin role

```json
{
  "status": 403,
  "msgKey": "auth.forbidden",
  "message": "Admin role required",
  "data": {},
  "token": { "...": "..." }
}
```

#### 404 Not Found

**Scenario**: Case does not exist

```json
{
  "status": 404,
  "msgKey": "metadata.caseNotFound",
  "message": "Case not found",
  "data": {},
  "token": { "...": "..." }
}
```

#### 409 Conflict

**Scenario**: Version mismatch (concurrent edit)

```json
{
  "status": 409,
  "msgKey": "metadata.versionConflict",
  "message": "Version conflict detected",
  "data": {
    "currentVersion": 7,
    "requestedVersion": 5
  },
  "token": { "...": "..." }
}
```

#### 500 Internal Server Error

**Scenario**: Unexpected server error

```json
{
  "status": 500,
  "msgKey": "server.internalError",
  "message": "An unexpected error occurred",
  "data": {},
  "token": { "...": "..." }
}
```

---

## Email Content Contract

### Email Subject Line

**English Template**:
```
Status Update: {caseName}
```

**French Template**:
```
Mise à jour du statut: {caseName}
```

### Email Body (HTML)

**English Template**:
```html
<html>
  <head>
    <style>
      body { font-family: sans-serif; line-height: 1.6; color: #1e293b; }
      .info-box { background-color: #f1f5f9; padding: 16px; margin: 16px 0; border-left: 4px solid #2563eb; }
    </style>
  </head>
  <body>
    <p>Dear Client,</p>
    <p>We would like to inform you of a status update for your case:</p>
    <div class="info-box">
      <p><strong>Case:</strong> {caseName}</p>
      <p><strong>New Status:</strong> {status}</p>
      <p><strong>Notes:</strong> {notes}</p>
    </div>
    {signature}
  </body>
</html>
```

**French Template**:
```html
<html>
  <head>
    <style>
      body { font-family: sans-serif; line-height: 1.6; color: #1e293b; }
      .info-box { background-color: #f1f5f9; padding: 16px; margin: 16px 0; border-left: 4px solid #2563eb; }
    </style>
  </head>
  <body>
    <p>Cher client,</p>
    <p>Nous tenons à vous informer d'une mise à jour du statut de votre dossier:</p>
    <div class="info-box">
      <p><strong>Dossier:</strong> {caseName}</p>
      <p><strong>Nouveau statut:</strong> {status}</p>
      <p><strong>Notes:</strong> {notes}</p>
    </div>
    {signature}
  </body>
</html>
```

### Email Body (Plain Text Fallback)

**English Template**:
```
Dear Client,

We would like to inform you of a status update for your case:

Case: {caseName}
New Status: {status}
Notes: {notes}

{signature}
```

**French Template**:
```
Cher client,

Nous tenons à vous informer d'une mise à jour du statut de votre dossier:

Dossier: {caseName}
Nouveau statut: {status}
Notes: {notes}

{signature}
```

### Placeholder Values

| Placeholder | Source | Description |
|-------------|--------|-------------|
| `{caseName}` | `updates.caseName` or existing case name | Display name of the case |
| `{status}` | `updates.status` | New status value |
| `{notes}` | `updates.notes` | Updated notes content |
| `{signature}` | PropertiesService `SIGNATURE` key | Email signature (optional, can be empty) |

### Email Metadata

| Field | Value |
|-------|-------|
| **From** | System email (configured in GmailApp) |
| **To** | Client email from client record |
| **Subject** | Rendered subject template |
| **HTML Body** | Rendered HTML template |
| **Plain Text Body** | Rendered plain text template |
| **Reply-To** | Not set (uses default) |

---

## Frontend Integration Contract

### API Client Method

```javascript
// src/services/api.js
export default {
  // ... existing methods

  updateCase: (caseId, updates, version, emailOptions = null) => {
    const payload = {
      caseId,
      updates,
      version
    }

    if (emailOptions) {
      payload.sendEmail = emailOptions.sendEmail
      payload.clientLanguage = emailOptions.clientLanguage
    }

    return api.post('metadata.updateCaseMetadata', payload)
  }
}
```

### Usage Examples

```javascript
// Update with email notification
await api.updateCase('CASE-123',
  { status: 'In Progress', notes: 'Updated notes' },
  5,
  { sendEmail: true, clientLanguage: 'en' }
)

// Update without email notification
await api.updateCase('CASE-123',
  { status: 'In Progress', notes: 'Updated notes' },
  5,
  { sendEmail: false }
)

// Update without email options (backward compatible)
await api.updateCase('CASE-123',
  { status: 'In Progress' },
  5
)
```

---

## Testing Contract

### Test Scenarios

#### 1. Email Sent Successfully
- **Request**: `sendEmail=true`, `clientLanguage='en'`, client has valid email
- **Expected**: `emailSent=true`, `emailSkipped=false`, `emailFailed=false`

#### 2. Email Skipped (User Declined)
- **Request**: `sendEmail=false`
- **Expected**: `emailSent=false`, `emailSkipped=true`, `skipReason='USER_DECLINED'`

#### 3. Email Skipped (No Email Address)
- **Request**: `sendEmail=true`, client email is null/empty
- **Expected**: `emailSent=false`, `emailSkipped=true`, `skipReason='NO_EMAIL'`

#### 4. Email Skipped (Invalid Email)
- **Request**: `sendEmail=true`, client email is 'invalid-email'
- **Expected**: `emailSent=false`, `emailSkipped=true`, `skipReason='INVALID_EMAIL'`

#### 5. Email Send Failed
- **Request**: `sendEmail=true`, GmailApp throws exception
- **Expected**: `emailSent=false`, `emailSkipped=false`, `emailFailed=true`, `failureReason` populated

#### 6. Backward Compatibility
- **Request**: Omit all email fields
- **Expected**: `emailSent=false`, `emailSkipped=true`, `skipReason='USER_DECLINED'`

#### 7. French Language Template
- **Request**: `sendEmail=true`, `clientLanguage='fr'`
- **Expected**: Email sent with French subject/body

#### 8. Signature Injection
- **Request**: `sendEmail=true`, SIGNATURE property is set
- **Expected**: Email body includes signature at the bottom

#### 9. Missing Signature
- **Request**: `sendEmail=true`, SIGNATURE property is not set
- **Expected**: Email sent without signature, no error

### Mock Data

```javascript
// Test fixtures
const validRequest = {
  caseId: 'CASE-TEST-001',
  updates: {
    status: 'In Progress',
    notes: 'Test notes for email notification'
  },
  version: 1,
  sendEmail: true,
  clientLanguage: 'en'
}

const mockClient = {
  clientId: 'CLIENT-TEST-001',
  name: 'Test Client',
  email: 'test@example.com'
}

const mockSignature = '<p>Best regards,<br>Test Team</p>'
```

---

## Rate Limits & Quotas

### Google Apps Script Quotas

| Resource | Limit (Consumer) | Limit (Workspace) | Impact |
|----------|------------------|-------------------|--------|
| Email send | 100/day | 1500/day | May limit notifications for high-volume users |
| Email recipients | 100/email | 100/email | Not applicable (1 recipient per notification) |
| Script runtime | 6 min/execution | 6 min/execution | Email send completes in <3 seconds |

### Recommendations

- Monitor daily email count if approaching quota limits
- Consider implementing daily digest emails for high-frequency status updates (future enhancement)
- No artificial rate limiting implemented in V1 (rely on Google's quotas)

---

## Security Considerations

### Authentication & Authorization

- All requests require valid authentication token
- Admin role required (inherits from existing `updateCaseMetadata` endpoint)
- Email addresses not exposed to frontend (retrieved server-side only)

### Data Privacy

- Email addresses retrieved from client records (no new PII collected)
- Email content contains case name, status, notes (already accessible to case manager)
- No email content logging (for privacy)
- Sent emails stored in sender's Gmail Sent folder (Google default behavior)

### Input Sanitization

- HTML escaping applied to all placeholders in email templates (prevent XSS)
- Email format validation before sending (prevent invalid recipients)
- Notes field truncation (prevent excessively large emails)

---

## Versioning & Compatibility

### API Version

**Current**: 1.0.0

### Breaking Changes Policy

- Adding new optional fields: **Minor version bump**
- Changing required fields: **Major version bump**
- Changing response structure: **Major version bump**

### Backward Compatibility Guarantee

- Omitting `sendEmail` and `clientLanguage` behaves identically to pre-feature API
- Existing API clients require no changes
- Email-related response fields always present (even if `false`)

---

## Appendix: Complete Example Flows

### Flow 1: Successful Email Notification (English)

**Request**:
```json
POST /metadata.updateCaseMetadata
{
  "caseId": "CASE-123",
  "updates": {
    "status": "Under Review",
    "notes": "All documents received and under legal review."
  },
  "version": 3,
  "sendEmail": true,
  "clientLanguage": "en"
}
```

**Backend Processing**:
1. Authenticate request (validate token)
2. Authorize user (check admin role)
3. Validate request (caseId exists, version matches)
4. Update case in Google Sheets
5. Retrieve client email from client record → `client@example.com`
6. Retrieve SIGNATURE from PropertiesService → `<p>Best regards,<br>Support Team</p>`
7. Generate English email template with placeholders filled
8. Send email via GmailApp
9. Return success response

**Response**:
```json
{
  "status": 200,
  "msgKey": "metadata.caseUpdated",
  "message": "Case updated successfully",
  "data": {
    "case": {
      "caseId": "CASE-123",
      "status": "Under Review",
      "notes": "All documents received and under legal review.",
      "version": 4
    },
    "emailSent": true,
    "emailSkipped": false,
    "emailFailed": false
  },
  "token": { "...": "..." }
}
```

**Email Sent**:
```
To: client@example.com
Subject: Status Update: Smith Property Dispute

<HTML email with case details and signature>
```

---

### Flow 2: Email Skipped (No Email Address)

**Request**:
```json
POST /metadata.updateCaseMetadata
{
  "caseId": "CASE-456",
  "updates": {
    "status": "Pending",
    "notes": "Awaiting client response."
  },
  "version": 2,
  "sendEmail": true,
  "clientLanguage": "fr"
}
```

**Backend Processing**:
1-4. Same as Flow 1
5. Retrieve client email → `null` (no email in client record)
6. Skip email sending, set `emailSkipped=true`, `skipReason='NO_EMAIL'`
7. Return success response with skip reason

**Response**:
```json
{
  "status": 200,
  "msgKey": "metadata.caseUpdated",
  "message": "Case updated successfully",
  "data": {
    "case": {
      "caseId": "CASE-456",
      "status": "Pending",
      "version": 3
    },
    "emailSent": false,
    "emailSkipped": true,
    "emailFailed": false,
    "skipReason": "NO_EMAIL"
  },
  "token": { "...": "..." }
}
```

**Frontend Handling**:
```javascript
if (response.data.emailSkipped && response.data.skipReason === 'NO_EMAIL') {
  $q.notify({
    type: 'warning',
    message: $t('emailDialog.warnNoEmail')
  })
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-21 | Initial contract specification |

---

## References

- [Feature Specification](../spec.md)
- [Data Model](../data-model.md)
- [Research & Decisions](../research.md)
- [Google Apps Script Email Service](https://developers.google.com/apps-script/reference/gmail/gmail-app)
