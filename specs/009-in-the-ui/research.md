# Research & Design Decisions: Client Status Update Email Notifications

**Feature**: 009-in-the-ui
**Date**: 2025-10-21
**Purpose**: Document key technical decisions and research findings for implementation

## Overview

This document captures architectural decisions, design patterns, and best practices for implementing status update email notifications with bilingual support.

## Key Design Decisions

### 1. Dialog Trigger Mechanism

**Decision**: Intercept save operation in CaseEditor and show dialog before API call

**Rationale**:
- Allows user to cancel entire operation if they change their mind
- Prevents partial state (case saved but email not sent decision lost)
- Maintains transactional integrity from user perspective
- Simpler state management than post-save dialog

**Alternatives Considered**:
- **Post-save dialog**: Would require storing "pending email" state, risk of lost notifications if user navigates away
- **Checkbox in form**: Less prominent, users might miss the notification opportunity
- **Automatic email on all status changes**: No user control, potential spam

**Implementation Approach**:
- Add status change detection in CaseEditor `handleSave()`
- If status changed: show EmailNotificationDialog, await user decision
- If accepted: proceed with save + email send in single API call
- If declined: proceed with save only
- If cancelled: abort save operation

---

### 2. Notes Field Validation Strategy

**Decision**: Conditional validation - notes required only if user accepts email notification

**Rationale**:
- Ensures meaningful content in client emails
- Doesn't break existing save flows where notes might be optional
- Validation logic centralized in dialog component
- Clear error messaging for incomplete data

**Alternatives Considered**:
- **Always require notes**: Too restrictive for non-email updates
- **Pre-populate notes with status**: Generic messages may not provide useful context
- **Allow empty notes in email**: Unprofessional, defeats purpose of notification

**Implementation Approach**:
- Validate notes in EmailNotificationDialog before confirming
- Compare notes value against original case data
- Show inline error message: "Please update the notes field to provide context for this notification"
- Prevent dialog confirmation until validation passes

---

### 3. Email Template Architecture

**Decision**: Server-side template rendering with placeholders replaced in backend

**Rationale**:
- Signature injection requires server-side access to PropertiesService
- Reduces frontend bundle size
- Centralizes email content logic for easier updates
- Security: email content generation controlled server-side

**Alternatives Considered**:
- **Frontend template generation**: Can't access SIGNATURE property, would need separate API call
- **Hardcoded templates**: Inflexible, requires code changes for content updates
- **External template service**: Over-engineered for 2 simple templates

**Template Structure**:
```javascript
// Backend: gas/utils/emailTemplates.gs
function generateStatusNotificationEmail(language, data, signature) {
  const templates = {
    en: {
      subject: `Status Update: ${data.caseName}`,
      body: `
        <p>Dear Client,</p>
        <p>We would like to inform you of a status update for your case:</p>
        <p><strong>Case:</strong> ${data.caseName}</p>
        <p><strong>New Status:</strong> ${data.status}</p>
        <p><strong>Notes:</strong> ${data.notes}</p>
        ${signature ? `<br><p>${signature}</p>` : ''}
      `
    },
    fr: {
      subject: `Mise à jour du statut: ${data.caseName}`,
      body: `
        <p>Cher client,</p>
        <p>Nous tenons à vous informer d'une mise à jour du statut de votre dossier:</p>
        <p><strong>Dossier:</strong> ${data.caseName}</p>
        <p><strong>Nouveau statut:</strong> ${data.status}</p>
        <p><strong>Notes:</strong> ${data.notes}</p>
        ${signature ? `<br><p>${signature}</p>` : ''}
      `
    }
  }
  return templates[language]
}
```

---

### 4. Client Email Address Resolution

**Decision**: Retrieve client email from existing client record using clientId

**Rationale**:
- Client data already includes email addresses (assumption validated)
- Reuses existing SheetsService infrastructure
- No new data entry fields needed
- Maintains single source of truth for client contact info

**Alternatives Considered**:
- **Manual email entry in dialog**: Tedious, error-prone, duplicates data
- **Store last-used email in case record**: Data inconsistency risk
- **Lookup from external directory**: Over-engineered, unnecessary dependency

**Implementation Approach**:
- Backend handler retrieves case data including clientId
- Use SheetsService to fetch client record by clientId
- Extract email from client record
- If email missing: return warning, proceed with case update only
- Error response includes flag `emailSkipped: true` for frontend notification

---

### 5. Error Handling Strategy

**Decision**: Graceful degradation - save case even if email fails, notify user of email failure

**Rationale**:
- Case update is primary operation, email is enhancement
- Prevents data loss due to transient email issues
- User can manually contact client if email fails
- Clear feedback about what succeeded/failed

**Alternatives Considered**:
- **Rollback case update on email failure**: Too aggressive, loses work
- **Retry email automatically**: May hit rate limits, delays response
- **Queue for background processing**: Over-engineered for current scale

**Error Scenarios**:

| Scenario | Backend Behavior | Frontend Notification |
|----------|------------------|----------------------|
| Email missing | Save case, skip email | Warning: "Case updated but client has no email address" |
| Email send fails | Save case, catch error | Error: "Case updated but email notification failed to send" |
| SIGNATURE missing | Save case, send email without signature | Success (log warning backend) |
| Invalid email format | Save case, skip email | Warning: "Case updated but client email is invalid" |

**Implementation Approach**:
```javascript
// Backend pseudo-code
try {
  updateCase(caseId, updates)
  if (sendEmail) {
    const client = getClient(clientId)
    if (!client.email) {
      return { success: true, emailSkipped: true, reason: 'NO_EMAIL' }
    }
    try {
      sendStatusEmail(client.email, language, caseData, signature)
      return { success: true, emailSent: true }
    } catch (emailError) {
      return { success: true, emailFailed: true, reason: emailError.message }
    }
  }
  return { success: true }
} catch (updateError) {
  return { success: false, error: updateError.message }
}
```

---

### 6. Language Selection UX

**Decision**: Radio buttons for English/French selection, English as default

**Rationale**:
- Only 2 options: radio buttons are standard pattern
- Single selection enforced by radio group
- Visual clarity of current selection
- Default reduces clicks for English-speaking clients

**Alternatives Considered**:
- **Dropdown/select**: Overkill for 2 options
- **Toggle switch**: Less clear labeling for EN/FR
- **Auto-detect from client profile**: Would require storing language preference (not in scope)

**Implementation**:
```vue
<q-radio
  v-model="selectedLanguage"
  val="en"
  :label="$t('emailDialog.languageEnglish')"
/>
<q-radio
  v-model="selectedLanguage"
  val="fr"
  :label="$t('emailDialog.languageFrench')"
/>
```

---

### 7. i18n Key Structure

**Decision**: Namespace all dialog strings under `emailDialog.*` key

**Rationale**:
- Clear organization in translation files
- Avoids key collisions with existing translations
- Easy to locate all related strings
- Consistent with existing i18n patterns in codebase

**Translation Keys**:
```javascript
// en/index.js additions
emailDialog: {
  title: 'Send Status Update Email?',
  message: 'Would you like to notify the client about this status change?',
  languageLabel: 'Client language:',
  languageEnglish: 'English',
  languageFrench: 'French',
  notesRequired: 'Please update the notes field to provide context for this notification',
  btnYes: 'Yes, send email',
  btnNo: 'No, update case only',
  btnCancel: 'Cancel',
  successSent: 'Case updated and email notification sent',
  successNoEmail: 'Case updated successfully',
  warnNoEmail: 'Case updated but client has no email address',
  errorEmailFailed: 'Case updated but email notification failed to send'
}

// fr/index.js additions
emailDialog: {
  title: 'Envoyer un courriel de mise à jour du statut?',
  message: 'Souhaitez-vous informer le client de ce changement de statut?',
  languageLabel: 'Langue du client:',
  languageEnglish: 'Anglais',
  languageFrench: 'Français',
  notesRequired: 'Veuillez mettre à jour le champ des notes pour fournir un contexte pour cette notification',
  btnYes: 'Oui, envoyer un courriel',
  btnNo: 'Non, mettre à jour le dossier uniquement',
  btnCancel: 'Annuler',
  successSent: 'Dossier mis à jour et notification envoyée',
  successNoEmail: 'Dossier mis à jour avec succès',
  warnNoEmail: 'Dossier mis à jour mais le client n\'a pas d\'adresse courriel',
  errorEmailFailed: 'Dossier mis à jour mais l\'envoi de la notification a échoué'
}
```

---

### 8. API Endpoint Design

**Decision**: Extend existing `metadata.updateCaseMetadata` to accept optional email parameters

**Rationale**:
- Single atomic operation from client perspective
- Reuses existing security, validation, and error handling
- Simpler state management than separate endpoints
- Maintains backward compatibility (email params optional)

**Alternatives Considered**:
- **Separate endpoint `metadata.sendStatusEmail`**: Would require duplicate case update logic or two-phase commit
- **Separate service for emails**: Over-architected for simple feature
- **Client-side email orchestration**: Can't access SIGNATURE property

**Request Schema**:
```javascript
{
  caseId: "CASE-123",
  updates: {
    status: "In Progress",
    notes: "Updated notes explaining the status change"
  },
  version: 5,
  // Optional email parameters
  sendEmail: true,
  clientLanguage: "en"  // or "fr"
}
```

**Response Schema**:
```javascript
{
  status: 200,
  msgKey: "metadata.caseUpdated",
  message: "Case updated successfully",
  data: {
    case: { /* updated case data */ },
    version: 6,
    emailSent: true,      // or false if sendEmail was false
    emailSkipped: false,  // true if no email address
    emailFailed: false    // true if send attempt failed
  },
  token: { /* refreshed token */ }
}
```

---

### 9. Component State Management

**Decision**: Dialog manages its own state, emits events to parent for action handling

**Rationale**:
- Encapsulation: dialog owns language selection and validation logic
- Parent (CaseEditor) owns save orchestration
- Clean separation of concerns
- Testable in isolation

**Event Contract**:
```javascript
// EmailNotificationDialog emits:
emit('confirm', { sendEmail: true, language: 'en' })
emit('confirm', { sendEmail: false })
emit('cancel')

// CaseEditor handles:
- confirm with sendEmail=true: call API with email params
- confirm with sendEmail=false: call API without email params
- cancel: abort save operation
```

---

### 10. Testing Strategy

**Decision**: Component tests for dialog behavior, integration test for full flow

**Rationale**:
- Dialog testable in isolation with mocked props
- Integration test validates end-to-end workflow
- No need for E2E test (feature not user-facing journey, internal workflow)

**Test Coverage**:

**EmailNotificationDialog.test.js**:
- Renders with correct i18n strings
- Language selection updates reactive state
- Validation prevents confirmation when notes unchanged
- Emits correct events for Yes/No/Cancel
- Switches between EN/FR correctly

**CaseEditor integration test** (extend existing):
- Status change triggers dialog
- No status change skips dialog
- Dialog confirmation with email calls API with email params
- Dialog confirmation without email calls API without email params
- Dialog cancellation aborts save

**Backend handler test**:
- Mock SheetsService and EmailService
- Verify email sent when requested
- Verify graceful handling of missing email
- Verify case updates even when email fails

---

## Best Practices Applied

### Vue 3 + Quasar Patterns
- **Composition API**: Use `ref`, `computed`, `watch` for reactive state
- **Quasar Composables**: `useQuasar()` for `$q.notify()`
- **q-dialog**: Persistent mode for modal, `@hide` event for cleanup
- **Accessibility**: Proper labels, keyboard navigation, focus management

### Google Apps Script Patterns
- **Error Boundaries**: Wrap email operations in try-catch
- **PropertiesService**: Retrieve SIGNATURE, handle missing gracefully
- **Logging**: Log email attempts and failures for debugging
- **Quota Awareness**: Single email per status update (not batching)

### Code Organization
- **Single Responsibility**: Dialog = UI/validation, Service = email logic
- **DRY**: Template generation function reused for both languages
- **Configuration**: Email templates can be moved to PropertiesService if frequent updates needed (not implemented initially)

---

## Dependencies & Integration Points

### Existing Code Dependencies
- **CaseEditor.vue**: Modify save handler to detect status changes and show dialog
- **useMetadata.js**: No changes needed (uses existing updateCase method)
- **api.js**: Add optional parameters to updateCase endpoint
- **MetadataHandler.gs**: Extend updateCaseMetadata handler
- **EmailService.gs**: Add sendStatusNotificationEmail method
- **SheetsService.gs**: Use existing getClientById method

### New Code Modules
- **EmailNotificationDialog.vue**: New component
- **emailTemplates.gs**: New utility for template generation
- **EmailNotificationDialog.test.js**: New test file

### External Dependencies
- **GmailApp API**: Native Google Apps Script service (no additional setup)
- **PropertiesService**: Existing Google Apps Script service
- **i18n framework**: Existing Vue I18n setup

---

## Performance Considerations

### Frontend
- **Dialog Rendering**: <500ms (Quasar dialog is lightweight)
- **Validation**: Computed properties for instant feedback
- **Bundle Impact**: ~2KB gzipped for new dialog component

### Backend
- **Email Send Time**: Typically 1-3 seconds via GmailApp
- **Client Lookup**: O(n) sheet scan (acceptable for current scale)
- **Template Generation**: <10ms (string concatenation)

### Optimization Opportunities (Not Implemented in V1)
- Cache client email lookups (if lookup becomes bottleneck)
- Move templates to PropertiesService (if frequent content changes)
- Add retry logic with exponential backoff (if email failures exceed 5%)

---

## Security & Privacy

### Data Protection
- **Email Addresses**: Retrieved from existing client records (no new storage)
- **Email Content**: Contains case name, status, notes (already accessible to case manager)
- **Signature**: Stored in PropertiesService (admin-only configuration)

### Access Control
- **Feature Access**: Inherits existing case edit permissions
- **Email Sending**: Only triggered by authenticated users with case update rights
- **SIGNATURE Property**: Readable by app, not exposed to frontend

### Audit Trail
- **Logging**: Backend logs all email attempts (success/failure)
- **Case History**: lastUpdatedBy/lastUpdatedAt track who changed status (existing)
- **Email Receipts**: GmailApp automatically saves sent emails to user's Sent folder

---

## Rollout & Risk Mitigation

### Feature Flags
- Not needed: Feature is opt-in (user chooses to send email per update)
- Natural rollout: Users discover dialog organically when updating status

### Rollback Plan
- Remove EmailNotificationDialog component import from CaseEditor
- Backend gracefully handles missing email parameters (backward compatible)
- No database schema changes

### Monitoring
- Backend logging for email success/failure rates
- User feedback via existing support channels
- Quasar notification tracking via analytics (if configured)

---

## Open Questions & Future Enhancements

### Not In Scope for V1
- ❌ Email retry mechanism
- ❌ Email send history/audit log in UI
- ❌ Custom email templates per user/organization
- ❌ BCC admin on all client emails
- ❌ Email preview before sending
- ❌ Attachment support
- ❌ Store client language preference

### Potential V2 Features
- Email template editor in admin settings
- Email send history visible in case details
- Resend failed notifications from UI
- Email open tracking
- Multi-recipient support (CC client's lawyer, etc.)

---

## Conclusion

All design decisions documented with clear rationale. No unresolved technical questions. Ready for Phase 1 (data modeling and contracts).
