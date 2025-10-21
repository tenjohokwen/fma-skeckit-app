# Email Templates Testing Guide

## Overview

Phase 5 implements professional bilingual email templates for case status notifications. This guide explains how to test the templates and verify email formatting.

## Files Created

### Implementation
- **[gas/utils/emailTemplates.gs](../../../gas/utils/emailTemplates.gs)** - Email template generation with HTML and text fallbacks

### Tests
- **[gas/tests/emailTemplates.test.gs](../../../gas/tests/emailTemplates.test.gs)** - Comprehensive test suite with 20+ test cases

## Template Features

### Professional HTML Styling
- ✅ Responsive design (mobile-friendly)
- ✅ Professional color scheme using brand colors (#2563eb)
- ✅ Info box layout with blue border and gray background
- ✅ Clean typography with proper spacing
- ✅ Structured layout with header, content, signature, and footer sections

### Bilingual Support
- ✅ English template (`language: 'en'`)
- ✅ French template (`language: 'fr'`)
- ✅ Proper HTML lang attributes for accessibility
- ✅ Translated labels and content

### Security
- ✅ HTML escaping to prevent XSS attacks
- ✅ Input validation for language and required fields
- ✅ Safe handling of user-provided content

### Signature Handling
- ✅ Retrieves signature from PropertiesService
- ✅ Gracefully handles missing signature (empty string)
- ✅ Supports HTML formatting in signature
- ✅ Strips HTML tags for plain text fallback

### Plain Text Fallback
- ✅ Full plain text version for email clients that don't support HTML
- ✅ Properly formatted with separators and structure
- ✅ HTML tags stripped from signature

## Running Tests

### Automated Tests

1. **Open Google Apps Script Editor**
   - Go to your Google Apps Script project
   - Open `gas/tests/emailTemplates.test.gs`

2. **Run the test suite**
   ```javascript
   // In Apps Script editor, select this function and click Run
   runEmailTemplateTests()
   ```

3. **View test results**
   - Check the Logs (View → Logs or Ctrl/Cmd + Enter)
   - You should see output like:
   ```
   === Starting Email Template Tests ===

   ✓ testEnglishTemplateGeneration
   ✓ testEnglishTemplateSubject
   ✓ testEnglishTemplateHtmlContent
   ...
   ✓ testStripHtmlTags

   === Test Results ===
   Passed: 21
   Failed: 0
   Total: 21
   Success Rate: 100%
   ```

### Manual Email Testing (T065)

To verify email formatting across different email clients:

1. **Update test recipient email**
   ```javascript
   // In gas/tests/emailTemplates.test.gs, line ~420
   const testEmail = 'your-email@example.com'; // UPDATE THIS
   ```

2. **Run the manual test function**
   ```javascript
   // In Apps Script editor, select and run:
   sendTestEmailsForManualVerification()
   ```

3. **Check your email inbox**
   - You'll receive 2 test emails (English and French)
   - Verify rendering in multiple email clients:

### Email Client Checklist

- [ ] **Gmail web** - Check styling renders correctly
- [ ] **Gmail mobile app** - Verify responsive layout
- [ ] **Outlook web** - Verify compatibility
- [ ] **Apple Mail** (if available) - Verify rendering
- [ ] **Info box styling** - Blue border (#2563eb) and gray background (#f1f5f9)
- [ ] **Signature section** - Properly separated with border
- [ ] **Plain text version** - Readable when HTML is disabled

## Template Usage

### Basic Usage

```javascript
// Generate English email
const data = {
  caseName: 'Property Dispute #12345',
  status: 'In Progress',
  notes: 'We are awaiting documentation from the client.'
};

const signature = getEmailSignature(); // Retrieves from PropertiesService
const email = generateStatusNotificationEmail('en', data, signature);

// Send email
GmailApp.sendEmail(
  clientEmail,
  email.subject,
  email.textBody,
  {
    htmlBody: email.htmlBody,
    name: 'Case Management System'
  }
);
```

### French Template

```javascript
// Generate French email
const email = generateStatusNotificationEmail('fr', data, signature);

GmailApp.sendEmail(
  clientEmail,
  email.subject,
  email.textBody,
  {
    htmlBody: email.htmlBody,
    name: 'Système de gestion des dossiers'
  }
);
```

### Handling Missing Signature

```javascript
// Template automatically handles missing signature
const signature = getEmailSignature(); // Returns '' if not configured
const email = generateStatusNotificationEmail('en', data, signature);

// Email will be sent without signature section if signature is empty
```

## Test Coverage

### T056: English Template Tests (5 tests)
- ✅ Template generation returns valid object structure
- ✅ Subject line matches English format
- ✅ HTML body contains all required English content
- ✅ Plain text body contains all required English content
- ✅ HTML structure includes DOCTYPE, lang, charset, and CSS

### T057: French Template Tests (5 tests)
- ✅ Template generation returns valid object structure
- ✅ Subject line matches French format
- ✅ HTML body contains all required French content
- ✅ Plain text body contains all required French content
- ✅ HTML lang attribute set to 'fr'

### T058: Signature Injection Tests (4 tests)
- ✅ Signature appears in English HTML template
- ✅ Signature appears in French HTML template
- ✅ Signature appears in both HTML and text versions
- ✅ HTML formatting preserved in signature

### T059: Missing Signature Handling (4 tests)
- ✅ Empty signature handled gracefully
- ✅ Null signature handled gracefully
- ✅ Undefined signature handled gracefully
- ✅ getEmailSignature() returns string when property missing

### Additional Tests (3 tests)
- ✅ Invalid language throws validation error
- ✅ Missing data fields throw validation error
- ✅ HTML escaping prevents XSS attacks
- ✅ stripHtmlTags removes HTML from plain text

## Template Customization

### Configuring Email Signature

1. **In Google Apps Script Editor**:
   - Project Settings → Script Properties
   - Add property:
     - Key: `SIGNATURE`
     - Value: Your HTML signature

2. **Example Signatures**:

   **Simple Text**:
   ```html
   <p>Best regards,<br>Support Team</p>
   ```

   **Professional**:
   ```html
   <p>
     <strong>Legal Support Team</strong><br>
     Email: support@example.com<br>
     Phone: (555) 123-4567<br>
     Office Hours: Mon-Fri 9AM-5PM
   </p>
   ```

   **With Branding**:
   ```html
   <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #2563eb;">
     <p style="margin: 0; font-weight: 600; color: #0f172a;">Your Company Name</p>
     <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">
       123 Main Street, Suite 100<br>
       City, State 12345<br>
       Phone: (555) 123-4567
     </p>
   </div>
   ```

## Troubleshooting

### Tests Fail with "Missing required fields"
- Ensure test data includes `caseName`, `status`, and `notes`
- Check that values are not null or undefined

### Signature Not Appearing in Emails
- Verify SIGNATURE property is set in Script Properties
- Check that getEmailSignature() returns non-empty string
- Ensure signature contains valid HTML

### HTML Rendering Issues
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Check that inline CSS styles are preserved
- Verify no external stylesheets (not supported in email)

### Plain Text Version Unreadable
- Check that stripHtmlTags() is working correctly
- Verify text formatting uses proper line breaks and separators

## Next Steps

Phase 5 is complete! The email templates are ready for integration with the email service.

**Phase 3 Remaining Tasks** (for full MVP):
- T020-T045: CaseEditor integration, API extension, EmailService implementation

**Phase 6** (optional enhancement):
- T066-T104: Bilingual dialog UI with complete i18n translations

**Phase 7** (polish):
- T105-T133: Code quality, accessibility, performance optimization

## Support

For issues or questions about email templates:
1. Review test output in Apps Script logs
2. Check [research.md](research.md) for design decisions
3. Refer to [data-model.md](data-model.md) for template structure
