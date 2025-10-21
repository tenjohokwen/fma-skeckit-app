# Feature Specification: Client Status Update Email Notifications

**Feature Branch**: `009-in-the-ui`
**Created**: 2025-10-21
**Status**: Draft
**Input**: User description: "In the UI, when a user updates the "status" field of an entry of the "metadata" sheet, a dialog should appear asking the user if he wants to send a notification email to the client (also provide French translations). In the same prompt the user has to select the preferred language of the client. There are only two languages from which to select: French and English. If the user accepts (to send an email) then he has to update the "notes" field as well. When the user submits the data, if he accepted that the system should send an email, an email is sent using the template that has the preferred language of the client. The system should get the email signature from the configured google apps script Script Properties called SIGNATURE"

**Note**: All features must comply with the project constitution at `.specify/memory/constitution.md`, including Vue 3 Composition API requirements, component isolation testing standards, design system specifications, and performance requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Status Update with Email Dialog (Priority: P1)

When a case manager updates a case status, the system prompts them to optionally notify the client via email in their preferred language.

**Why this priority**: This is the MVP - it delivers the primary value of client communication automation and must work independently before any enhancements.

**Independent Test**: Can be fully tested by loading a case, changing status, and verifying the email prompt appears with language selection. Delivers immediate value even if notes requirement is added later.

**Acceptance Scenarios**:

1. **Given** a user is editing a case in CaseEditor, **When** they change the status field value and attempt to save, **Then** a dialog appears asking if they want to send a notification email to the client
2. **Given** the email notification dialog is displayed, **When** the user views the dialog, **Then** they see options to select French or English as the client's preferred language
3. **Given** the user selects "No" to sending email, **When** they submit the dialog, **Then** the case updates normally without sending any email
4. **Given** the user selects "Yes" to sending email and chooses a language, **When** they confirm, **Then** the case updates and an email is sent to the client in the selected language
5. **Given** a user edits multiple fields but does NOT change the status, **When** they save the case, **Then** no email dialog appears and the save proceeds normally

---

### User Story 2 - Required Notes Field for Email Notifications (Priority: P2)

When a user chooses to send an email notification, they must also provide notes explaining the status change before the update can proceed.

**Why this priority**: Enforces data quality and ensures clients receive meaningful context, but the dialog can function without this validation initially.

**Independent Test**: Can be tested by accepting email notification and verifying that notes field becomes mandatory with appropriate validation messages.

**Acceptance Scenarios**:

1. **Given** the user accepts to send an email notification, **When** the notes field is empty or unchanged from its original value, **Then** the system displays a validation error requiring notes to be updated
2. **Given** the user accepts to send an email notification and updates the notes field, **When** they submit the form, **Then** the validation passes and the case updates with email sent
3. **Given** the user declines to send an email, **When** the notes field is empty, **Then** no validation error appears and the case updates normally

---

### User Story 3 - Bilingual Email Templates (Priority: P2)

Email notifications are sent using predefined templates in the client's selected language (English or French) with personalized case details and configured signature.

**Why this priority**: Template quality enhances professionalism but the notification mechanism can work with basic templates initially.

**Independent Test**: Can be tested by sending test emails in both languages and verifying content, formatting, and signature inclusion.

**Acceptance Scenarios**:

1. **Given** the user selects English as client language, **When** the email is sent, **Then** the client receives an email using the English template with case name, new status, and notes
2. **Given** the user selects French as client language, **When** the email is sent, **Then** the client receives an email using the French template with case name, new status, and notes
3. **Given** the SIGNATURE script property is configured, **When** any notification email is sent, **Then** the email includes the signature at the bottom of the message
4. **Given** the client's email address is available in the system, **When** the notification is sent, **Then** the email is delivered to the correct recipient address

---

### User Story 4 - Bilingual Dialog UI (Priority: P3)

The email notification dialog displays all text (prompts, labels, buttons) in the user's current application language (English or French).

**Why this priority**: Improves UX for French-speaking staff but functionality works with English-only UI initially.

**Independent Test**: Can be tested by switching application language and verifying all dialog text translates correctly.

**Acceptance Scenarios**:

1. **Given** the application is set to English, **When** the email dialog appears, **Then** all labels, prompts, and buttons display in English
2. **Given** the application is set to French, **When** the email dialog appears, **Then** all labels, prompts, and buttons display in French
3. **Given** either language is selected, **When** validation errors occur, **Then** error messages display in the current application language

---

### Edge Cases

- What happens when the client's email address is not available in the system?
  - System should display a warning notification and update the case without sending email
- What happens if email sending fails due to network/service errors?
  - System should still save the case update but notify the user that email delivery failed
  - User should be able to retry sending the email notification separately
- What happens when a user changes status multiple times rapidly?
  - Only the final status change should trigger the email dialog (prevent duplicate prompts)
- What happens if the SIGNATURE script property is not configured?
  - Email should still send but without a signature section
  - System should log a warning for administrators
- What happens if the user cancels the email dialog?
  - The entire save operation should be cancelled and no changes persist
  - User returns to editing mode with their changes intact
- What happens when editing a case with no associated client?
  - Email dialog should not appear since there's no recipient
  - Case updates normally
- What happens if notes field exceeds maximum length?
  - Standard field validation should apply with appropriate error message
- What happens when concurrent users both update status for the same case?
  - Existing optimistic locking (version conflict detection) should handle this
  - Second user should see version conflict dialog and can refresh to see latest status

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect when the status field value has changed from its original value during a case update
- **FR-002**: System MUST display a confirmation dialog when status has changed, asking the user if they want to send an email notification to the client
- **FR-003**: The email confirmation dialog MUST include two language selection options: English and French
- **FR-004**: System MUST allow users to decline sending email notifications and proceed with case update only
- **FR-005**: When user accepts sending email notification, system MUST validate that the notes field has been updated from its original value
- **FR-006**: System MUST prevent save operation if user accepts email notification but notes field is empty or unchanged
- **FR-007**: System MUST send notification email in the language selected by the user (English or French)
- **FR-008**: Email template MUST include case name, new status value, and updated notes content
- **FR-009**: System MUST retrieve email signature from Script Properties using key "SIGNATURE" and append it to notification emails
- **FR-010**: System MUST retrieve client email address from the associated client record
- **FR-011**: If client email address is unavailable, system MUST update case without sending email and notify user of this condition
- **FR-012**: If email sending fails, system MUST still persist case updates and notify user of email delivery failure
- **FR-013**: Dialog interface MUST display all text (labels, buttons, messages) in the user's current application language
- **FR-014**: System MUST provide complete French translations for all dialog text
- **FR-015**: When user cancels the email dialog, system MUST abort the entire save operation and return user to editing mode
- **FR-016**: System MUST use existing optimistic locking mechanism for concurrent edit prevention
- **FR-017**: Email subject line MUST indicate case name and status update purpose
- **FR-018**: Notification emails MUST be sent using HTML format with proper text fallback

### Key Entities *(include if feature involves data)*

- **Email Notification Dialog**: UI component capturing user intent to send email, client language preference, and updated notes
  - Properties: sendEmail (boolean), clientLanguage (enum: 'en' | 'fr'), notesRequired (conditional validation)
  - Triggered when: status field value differs from original value during save operation

- **Email Template**: Pre-defined message structure in English and French
  - Properties: language, subject line, body content with placeholders for case name/status/notes, signature section
  - Variants: English template, French template

- **Client Record**: Existing entity that stores client email address
  - Relationship: Linked to case via clientId field
  - Required property: email address for notification delivery

- **Script Property (SIGNATURE)**: Server-side configuration value
  - Purpose: Store reusable email signature for all notifications
  - Format: Plain text or HTML snippet

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Case managers can complete a status update with email notification in under 1 minute (including dialog interaction and notes entry)
- **SC-002**: 95% of status change notifications are successfully delivered to client email addresses within 30 seconds of save confirmation
- **SC-003**: Email notification dialog appears within 500ms of save button click when status has changed
- **SC-004**: Zero instances of emails sent without required notes being provided
- **SC-005**: 100% of notification emails include case name, status, notes, and signature (when configured) in the correct language
- **SC-006**: Users can successfully cancel email notification and continue with case-only update 100% of the time
- **SC-007**: System handles missing client email gracefully in 100% of cases (updates case, notifies user, does not crash)
- **SC-008**: All dialog text displays correctly in both English and French with zero translation gaps
- **SC-009**: Email delivery failures do not prevent case updates from persisting in 100% of failure scenarios

## Assumptions

1. **Client Email Availability**: Client records already contain email addresses - no new data entry fields needed in client management
2. **Email Service Access**: Google Apps Script environment has permissions to send emails via GmailApp service
3. **Existing i18n Infrastructure**: Application already has internationalization framework in place for French/English translations
4. **Status Change Detection**: Comparing current status value to original value is sufficient to detect meaningful status changes
5. **Email Format**: HTML email format is acceptable for client communications and will render properly across common email clients
6. **Single Client Per Case**: Each case is associated with exactly one client whose email address should receive notifications
7. **Signature Format**: The SIGNATURE script property will contain properly formatted content (HTML or plain text) ready for email inclusion
8. **Synchronous Email Sending**: Email sending can complete within reasonable request timeout limits (no background job queue required)
9. **Network Reliability**: Email delivery failures are rare edge cases, not common occurrences requiring retry logic
10. **Language Selection**: User (case manager) can determine client's preferred language - no need to store language preference in client record
11. **Notes Context**: Updated notes will provide sufficient context for clients to understand the status change without additional explanation fields
12. **Single Email Per Update**: One email per status change is sufficient - no need for digest/batching of multiple updates
