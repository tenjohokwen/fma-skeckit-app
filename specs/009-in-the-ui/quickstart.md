# Developer Quickstart: Client Status Update Email Notifications

**Feature**: 009-in-the-ui
**Date**: 2025-10-21
**Target Audience**: Developers implementing this feature

## Overview

This guide provides a fast-track path to understanding and implementing the status update email notification feature. Follow these steps to get up to speed quickly.

## 5-Minute Overview

### What This Feature Does

When a case manager updates a case status in the CaseEditor:
1. A dialog prompts them to send an email notification to the client
2. They select the client's language (English or French)
3. If they choose to send email, they must update the notes field
4. The system sends a bilingual email with case details and signature
5. The system handles edge cases gracefully (missing email, send failures)

### Key Components

- **Frontend**: EmailNotificationDialog.vue (new), CaseEditor.vue (modified)
- **Backend**: MetadataHandler.gs (extended), EmailService.gs (extended), emailTemplates.gs (new)
- **i18n**: New translations for dialog UI and email templates
- **Tests**: EmailNotificationDialog.test.js (new)

---

## Quick Start Steps

### Step 1: Read the Essential Documents (15 minutes)

1. **Start here**: [spec.md](spec.md) - User scenarios and requirements
2. **Then read**: [research.md](research.md) - Design decisions (especially sections 1-3, 5, 8)
3. **Reference**: [api-contract.md](contracts/api-contract.md) - API request/response format
4. **Skim**: [data-model.md](data-model.md) - Data structures and validation rules

### Step 2: Understand the Integration Points (10 minutes)

#### Existing Code to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/metadata/CaseEditor.vue` | Modify | Add status change detection and dialog integration |
| `src/services/api.js` | Modify | Add optional email parameters to updateCase() |
| `src/i18n/en/index.js` | Modify | Add emailDialog translations |
| `src/i18n/fr/index.js` | Modify | Add emailDialog translations |
| `gas/handlers/MetadataHandler.gs` | Modify | Extend updateCaseMetadata to handle email params |
| `gas/services/EmailService.gs` | Modify | Add sendStatusNotificationEmail method |

#### New Code to Create

| File | Description |
|------|-------------|
| `src/components/metadata/EmailNotificationDialog.vue` | Dialog component for email prompt |
| `gas/utils/emailTemplates.gs` | Email template generation functions |
| `tests/unit/components/metadata/EmailNotificationDialog.test.js` | Component tests |

### Step 3: Set Up Your Development Environment (5 minutes)

1. **Checkout the feature branch**:
   ```bash
   git checkout 009-in-the-ui
   ```

2. **Ensure dependencies are installed**:
   ```bash
   npm install
   ```

3. **Configure the SIGNATURE property** (optional for testing):
   - Open Google Apps Script project
   - Go to Project Settings → Script Properties
   - Add property: `SIGNATURE` = `<p>Best regards,<br>Test Team</p>`

4. **Verify test client has email**:
   - Check your test client record has a valid email address
   - Or create a test client with email for testing

---

## Implementation Roadmap

### Phase 1: Frontend Dialog Component (2-3 hours)

1. **Create EmailNotificationDialog.vue**:
   - `<script setup>` with reactive state for sendEmail, language, notes validation
   - q-dialog with persistent mode
   - Radio buttons for language selection (en/fr)
   - Validation logic for notes field
   - Emit confirm/cancel events

2. **Add i18n translations**:
   - `src/i18n/en/index.js`: Add emailDialog namespace with all keys
   - `src/i18n/fr/index.js`: Add French translations

3. **Write component tests**:
   - `tests/unit/components/metadata/EmailNotificationDialog.test.js`
   - Test: renders correctly, language selection, notes validation, event emission

### Phase 2: Frontend Integration (1-2 hours)

1. **Modify CaseEditor.vue**:
   - Import EmailNotificationDialog
   - Add status change detection in handleSave()
   - Show dialog if status changed
   - Handle dialog events (confirm/cancel)
   - Pass email options to API call

2. **Extend api.js**:
   - Add emailOptions parameter to updateCase method
   - Conditionally include sendEmail and clientLanguage in payload

3. **Add user notifications**:
   - Success: "Case updated and email notification sent"
   - Warning: "Case updated but client has no email address"
   - Error: "Case updated but email notification failed to send"

### Phase 3: Backend Email Sending (2-3 hours)

1. **Create email template utility** (`gas/utils/emailTemplates.gs`):
   - Function: `generateStatusNotificationEmail(language, caseData, signature)`
   - Define English and French templates
   - Implement placeholder replacement
   - Return { subject, htmlBody, textBody }

2. **Extend EmailService.gs**:
   - Function: `sendStatusNotificationEmail(recipientEmail, language, caseData)`
   - Retrieve SIGNATURE from PropertiesService
   - Generate email from template
   - Send via GmailApp.sendEmail()
   - Handle exceptions gracefully

3. **Extend MetadataHandler.gs**:
   - Extract email parameters from request
   - Validate clientLanguage if sendEmail=true
   - After case update: check if sendEmail=true
   - Retrieve client email via SheetsService
   - Call EmailService.sendStatusNotificationEmail()
   - Return email status in response (emailSent, emailSkipped, emailFailed)

### Phase 4: Testing & Refinement (2-3 hours)

1. **Manual testing**:
   - Test: Status change triggers dialog
   - Test: Language selection (en/fr)
   - Test: Notes validation enforcement
   - Test: Email sent successfully (check recipient inbox)
   - Test: Email skipped (client with no email)
   - Test: Dialog cancellation aborts save
   - Test: Bilingual UI (switch app language)

2. **Backend testing**:
   - Write/update tests for MetadataHandler.gs
   - Mock SheetsService and EmailService
   - Test all email response states

3. **Refinement**:
   - Review UI/UX in mobile viewport
   - Test accessibility (keyboard navigation, screen reader)
   - Verify i18n completeness (no missing translations)

---

## Code Snippets

### EmailNotificationDialog.vue (Skeleton)

```vue
<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ $t('emailDialog.title') }}</div>
      </q-card-section>

      <q-card-section>
        <p>{{ $t('emailDialog.message') }}</p>

        <!-- Send Email Toggle -->
        <q-checkbox
          v-model="sendEmail"
          :label="$t('emailDialog.btnYes')"
        />

        <!-- Language Selection (shown if sendEmail=true) -->
        <div v-if="sendEmail" class="q-mt-md">
          <div class="text-subtitle2">{{ $t('emailDialog.languageLabel') }}</div>
          <q-radio v-model="selectedLanguage" val="en" :label="$t('emailDialog.languageEnglish')" />
          <q-radio v-model="selectedLanguage" val="fr" :label="$t('emailDialog.languageFrench')" />
        </div>

        <!-- Notes Validation Error -->
        <div v-if="showNotesError" class="text-negative q-mt-md">
          {{ $t('emailDialog.notesRequired') }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('emailDialog.btnCancel')" @click="handleCancel" />
        <q-btn
          unelevated
          color="primary"
          :label="$t('common.confirm')"
          @click="handleConfirm"
          :disable="!isValid"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  originalNotes: String,
  currentNotes: String
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const sendEmail = ref(false)
const selectedLanguage = ref('en')

const notesChanged = computed(() => {
  return props.currentNotes !== props.originalNotes &&
         props.currentNotes.trim() !== ''
})

const showNotesError = computed(() => {
  return sendEmail.value && !notesChanged.value
})

const isValid = computed(() => {
  if (!sendEmail.value) return true
  return notesChanged.value
})

function handleConfirm() {
  if (!isValid.value) return

  emit('confirm', {
    sendEmail: sendEmail.value,
    clientLanguage: selectedLanguage.value
  })
  showDialog.value = false
}

function handleCancel() {
  emit('cancel')
  showDialog.value = false
}
</script>
```

### CaseEditor.vue Integration (Key Changes)

```vue
<script setup>
import { ref } from 'vue'
import EmailNotificationDialog from './EmailNotificationDialog.vue'

// Existing code...

const showEmailDialog = ref(false)
const originalCaseData = ref(null)

async function handleSave() {
  // Detect status change
  const statusChanged = formData.status !== originalCaseData.value.status

  if (statusChanged) {
    // Show email dialog and wait for user decision
    showEmailDialog.value = true
    return // Wait for dialog event
  }

  // No status change: save normally
  await saveCase(null)
}

async function handleEmailDialogConfirm(emailOptions) {
  await saveCase(emailOptions)
}

function handleEmailDialogCancel() {
  // User cancelled: abort save
  showEmailDialog.value = false
}

async function saveCase(emailOptions) {
  try {
    const updates = /* build updates object */
    const response = await updateCase(caseId, updates, version, emailOptions)

    // Handle email response
    if (response.data.emailSent) {
      notifySuccess($t('emailDialog.successSent'))
    } else if (response.data.emailSkipped && response.data.skipReason === 'NO_EMAIL') {
      notifyWarning($t('emailDialog.warnNoEmail'))
    } else if (response.data.emailFailed) {
      notifyError($t('emailDialog.errorEmailFailed'))
    } else {
      notifySuccess($t('emailDialog.successNoEmail'))
    }

    // Navigate or refresh...
  } catch (error) {
    notifyError(error.message)
  }
}
</script>

<template>
  <!-- Existing template... -->

  <EmailNotificationDialog
    v-model="showEmailDialog"
    :original-notes="originalCaseData?.notes"
    :current-notes="formData.notes"
    @confirm="handleEmailDialogConfirm"
    @cancel="handleEmailDialogCancel"
  />
</template>
```

### Backend Email Template (gas/utils/emailTemplates.gs)

```javascript
const EmailTemplates = {
  generateStatusNotificationEmail: function(language, caseData, signature) {
    const templates = {
      en: {
        subject: `Status Update: ${caseData.caseName}`,
        htmlBody: `
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
                <p><strong>Case:</strong> ${caseData.caseName}</p>
                <p><strong>New Status:</strong> ${caseData.status}</p>
                <p><strong>Notes:</strong> ${caseData.notes}</p>
              </div>
              ${signature ? signature : ''}
            </body>
          </html>
        `,
        textBody: `
Dear Client,

We would like to inform you of a status update for your case:

Case: ${caseData.caseName}
New Status: ${caseData.status}
Notes: ${caseData.notes}

${signature ? signature : ''}
        `
      },
      fr: {
        subject: `Mise à jour du statut: ${caseData.caseName}`,
        htmlBody: `
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
                <p><strong>Dossier:</strong> ${caseData.caseName}</p>
                <p><strong>Nouveau statut:</strong> ${caseData.status}</p>
                <p><strong>Notes:</strong> ${caseData.notes}</p>
              </div>
              ${signature ? signature : ''}
            </body>
          </html>
        `,
        textBody: `
Cher client,

Nous tenons à vous informer d'une mise à jour du statut de votre dossier:

Dossier: ${caseData.caseName}
Nouveau statut: ${caseData.status}
Notes: ${caseData.notes}

${signature ? signature : ''}
        `
      }
    }

    return templates[language] || templates.en
  }
}
```

### Backend Handler Extension (MetadataHandler.gs)

```javascript
// In MetadataHandler.gs
updateCaseMetadata: function(request) {
  // Existing validation...
  const { caseId, updates, version, sendEmail, clientLanguage } = request

  // Update case in sheets
  const updatedCase = SheetsService.updateCase(caseId, updates, version)

  // Email handling
  let emailResult = {
    emailSent: false,
    emailSkipped: true,
    emailFailed: false,
    skipReason: 'USER_DECLINED'
  }

  if (sendEmail) {
    try {
      // Validate language
      if (!clientLanguage || !['en', 'fr'].includes(clientLanguage)) {
        throw new Error('clientLanguage must be "en" or "fr"')
      }

      // Get client email
      const client = SheetsService.getClientById(updatedCase.clientId)
      if (!client || !client.email) {
        emailResult = {
          emailSent: false,
          emailSkipped: true,
          emailFailed: false,
          skipReason: 'NO_EMAIL'
        }
      } else {
        // Send email
        const signature = PropertiesService.getScriptProperties().getProperty('SIGNATURE') || ''
        const emailData = {
          caseName: updatedCase.caseName,
          status: updatedCase.status,
          notes: updatedCase.notes
        }

        EmailService.sendStatusNotificationEmail(client.email, clientLanguage, emailData, signature)

        emailResult = {
          emailSent: true,
          emailSkipped: false,
          emailFailed: false
        }
      }
    } catch (emailError) {
      console.error('Email send failed:', emailError)
      emailResult = {
        emailSent: false,
        emailSkipped: false,
        emailFailed: true,
        failureReason: emailError.message
      }
    }
  }

  return {
    case: updatedCase,
    ...emailResult
  }
}
```

---

## Testing Checklist

### Frontend Component Tests

- [ ] Dialog renders with correct i18n strings
- [ ] Language selection updates reactive state
- [ ] Notes validation shows error when notes unchanged
- [ ] Confirm event emitted with correct payload
- [ ] Cancel event emitted on cancel button click
- [ ] Dialog closes on confirm/cancel

### Integration Tests

- [ ] Status change triggers dialog display
- [ ] No status change skips dialog
- [ ] Dialog confirm with email calls API with email params
- [ ] Dialog confirm without email calls API without email params
- [ ] Dialog cancellation aborts save operation

### Backend Tests

- [ ] Email sent successfully when client has email
- [ ] Email skipped when client has no email
- [ ] Email skipped when sendEmail=false
- [ ] Email failed state handled gracefully
- [ ] SIGNATURE retrieved and injected correctly
- [ ] Case update succeeds even when email fails

### Manual Testing

- [ ] Mobile viewport: dialog displays correctly
- [ ] Keyboard navigation: Tab, Enter, Esc work as expected
- [ ] French UI: all dialog text translates correctly
- [ ] Email received: correct language, format, content
- [ ] Email signature: appears at bottom of message
- [ ] Error scenarios: missing email, send failure notifications work

---

## Common Pitfalls & Tips

### Frontend

❌ **Don't**: Import the entire Quasar library
✅ **Do**: Import only needed components (q-dialog, q-radio, q-btn)

❌ **Don't**: Use Options API or `export default`
✅ **Do**: Use `<script setup>` exclusively

❌ **Don't**: Hardcode text strings in the component
✅ **Do**: Use i18n keys for all user-facing text

### Backend

❌ **Don't**: Let email failures block case updates
✅ **Do**: Wrap email sending in try-catch, return success for case update even if email fails

❌ **Don't**: Throw exceptions for missing SIGNATURE
✅ **Do**: Gracefully handle missing SIGNATURE (send email without it)

❌ **Don't**: Validate notes on backend
✅ **Do**: Validate notes on frontend (backend accepts any notes value)

### Testing

❌ **Don't**: Test implementation details (internal state)
✅ **Do**: Test user-visible behavior (events, UI changes)

❌ **Don't**: Skip edge case testing (missing email, send failures)
✅ **Do**: Test all email response states thoroughly

---

## Resources

### Project Documentation

- [Feature Specification](spec.md)
- [Research & Design Decisions](research.md)
- [Data Model](data-model.md)
- [API Contract](contracts/api-contract.md)
- [Project Constitution](../../.specify/memory/constitution.md)

### External References

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Quasar Dialog Component](https://quasar.dev/vue-components/dialog)
- [Google Apps Script - GmailApp](https://developers.google.com/apps-script/reference/gmail/gmail-app)
- [Vitest Testing Guide](https://vitest.dev/guide/)

---

## Need Help?

### Common Questions

**Q: How do I test email sending without spamming real clients?**
A: Create a test client with your own email address, or configure a test email in the client record.

**Q: What if the SIGNATURE property is not configured?**
A: The feature works fine without it - emails just won't have a signature.

**Q: Can I change the email templates?**
A: Yes, edit `gas/utils/emailTemplates.gs`. Future enhancement: move templates to PropertiesService for runtime editing.

**Q: How do I handle a new language (e.g., Spanish)?**
A: Add 'es' to the clientLanguage enum, create Spanish email template, add Spanish i18n keys. (Not in V1 scope)

### Debugging Tips

- **Dialog not showing**: Check `showEmailDialog.value = true` is being set when status changes
- **Email not sending**: Check browser console and Google Apps Script logs for errors
- **Validation not working**: Verify `originalNotes` prop is being passed correctly
- **i18n missing**: Check that keys are added to both `en/index.js` and `fr/index.js`

---

## Next Steps

After reading this quickstart:

1. Review the [tasks.md](tasks.md) (generated by `/speckit.tasks`) for the detailed implementation breakdown
2. Start with Phase 1 (Frontend Dialog Component)
3. Run tests frequently to catch issues early
4. Request code review before merging to main

**Estimated Total Time**: 8-12 hours for complete implementation and testing

Good luck! 🚀
