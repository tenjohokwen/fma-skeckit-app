/**
 * Email Templates Test Suite
 *
 * Tests for gas/utils/emailTemplates.gs
 * Run these tests using the Google Apps Script test runner or manually
 *
 * @module emailTemplates.test
 */

/**
 * Test runner - executes all email template tests
 * Run this function from Apps Script editor to execute all tests
 */
function runEmailTemplateTests() {
  Logger.log('=== Starting Email Template Tests ===\n');

  const tests = [
    // T056: English template tests
    testEnglishTemplateGeneration,
    testEnglishTemplateSubject,
    testEnglishTemplateHtmlContent,
    testEnglishTemplateTextContent,
    testEnglishTemplateHtmlStructure,

    // T057: French template tests
    testFrenchTemplateGeneration,
    testFrenchTemplateSubject,
    testFrenchTemplateHtmlContent,
    testFrenchTemplateTextContent,
    testFrenchTemplateFrenchLanguage,

    // T058: Signature injection tests
    testSignatureInjectionEnglish,
    testSignatureInjectionFrench,
    testSignatureInHtmlAndText,
    testSignatureHtmlFormatting,

    // T059: Missing signature handling
    testEmptySignatureHandling,
    testNullSignatureHandling,
    testUndefinedSignatureHandling,
    testGetEmailSignatureWhenMissing,

    // Additional validation tests
    testInvalidLanguageThrowsError,
    testMissingDataFieldsThrowsError,
    testHtmlEscaping,
    testStripHtmlTags
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(function(test) {
    try {
      test();
      Logger.log('✓ ' + test.name);
      passed++;
    } catch (error) {
      Logger.log('✗ ' + test.name + ': ' + error.message);
      failed++;
    }
  });

  Logger.log('\n=== Test Results ===');
  Logger.log('Passed: ' + passed);
  Logger.log('Failed: ' + failed);
  Logger.log('Total: ' + tests.length);
  Logger.log('Success Rate: ' + Math.round((passed / tests.length) * 100) + '%');
}

// ============================================================================
// T056: English Template Tests
// ============================================================================

function testEnglishTemplateGeneration() {
  const data = {
    caseName: 'Test Property Dispute',
    status: 'In Progress',
    notes: 'Updated case notes with important details'
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertEqual(typeof result, 'object', 'Result should be an object');
  assertEqual(typeof result.subject, 'string', 'Subject should be a string');
  assertEqual(typeof result.htmlBody, 'string', 'htmlBody should be a string');
  assertEqual(typeof result.textBody, 'string', 'textBody should be a string');
}

function testEnglishTemplateSubject() {
  const data = {
    caseName: 'Test Case Name',
    status: 'Resolved',
    notes: 'Case resolved successfully'
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertEqual(result.subject, 'Status Update: Test Case Name', 'Subject should match English format');
}

function testEnglishTemplateHtmlContent() {
  const data = {
    caseName: 'Test Case',
    status: 'Pending Review',
    notes: 'Awaiting review'
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertContains(result.htmlBody, 'Dear Client', 'HTML should contain English greeting');
  assertContains(result.htmlBody, 'Test Case', 'HTML should contain case name');
  assertContains(result.htmlBody, 'Pending Review', 'HTML should contain status');
  assertContains(result.htmlBody, 'Awaiting review', 'HTML should contain notes');
  assertContains(result.htmlBody, 'Case Status Update', 'HTML should contain English header');
}

function testEnglishTemplateTextContent() {
  const data = {
    caseName: 'Test Case',
    status: 'Completed',
    notes: 'All done'
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertContains(result.textBody, 'Dear Client', 'Text should contain English greeting');
  assertContains(result.textBody, 'Test Case', 'Text should contain case name');
  assertContains(result.textBody, 'Completed', 'Text should contain status');
  assertContains(result.textBody, 'All done', 'Text should contain notes');
  assertContains(result.textBody, 'CASE STATUS UPDATE', 'Text should contain English header');
}

function testEnglishTemplateHtmlStructure() {
  const data = {
    caseName: 'Test',
    status: 'Active',
    notes: 'Testing'
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertContains(result.htmlBody, '<!DOCTYPE html>', 'HTML should have DOCTYPE');
  assertContains(result.htmlBody, '<html lang="en">', 'HTML should have English lang attribute');
  assertContains(result.htmlBody, '<meta charset="UTF-8">', 'HTML should have UTF-8 charset');
  assertContains(result.htmlBody, 'style=', 'HTML should contain inline CSS');
  assertContains(result.htmlBody, '#2563eb', 'HTML should use brand color');
}

// ============================================================================
// T057: French Template Tests
// ============================================================================

function testFrenchTemplateGeneration() {
  const data = {
    caseName: 'Litige de propriété test',
    status: 'En cours',
    notes: 'Notes du dossier mises à jour'
  };

  const result = generateStatusNotificationEmail('fr', data, '');

  assertEqual(typeof result, 'object', 'Result should be an object');
  assertEqual(typeof result.subject, 'string', 'Subject should be a string');
  assertEqual(typeof result.htmlBody, 'string', 'htmlBody should be a string');
  assertEqual(typeof result.textBody, 'string', 'textBody should be a string');
}

function testFrenchTemplateSubject() {
  const data = {
    caseName: 'Nom du dossier test',
    status: 'Résolu',
    notes: 'Dossier résolu avec succès'
  };

  const result = generateStatusNotificationEmail('fr', data, '');

  assertEqual(result.subject, 'Mise à jour du statut : Nom du dossier test', 'Subject should match French format');
}

function testFrenchTemplateHtmlContent() {
  const data = {
    caseName: 'Dossier test',
    status: 'En attente de révision',
    notes: 'En attente de révision'
  };

  const result = generateStatusNotificationEmail('fr', data, '');

  assertContains(result.htmlBody, 'Cher client', 'HTML should contain French greeting');
  assertContains(result.htmlBody, 'Dossier test', 'HTML should contain case name');
  assertContains(result.htmlBody, 'En attente de révision', 'HTML should contain status');
  assertContains(result.htmlBody, 'Mise à jour du statut du dossier', 'HTML should contain French header');
}

function testFrenchTemplateTextContent() {
  const data = {
    caseName: 'Dossier test',
    status: 'Terminé',
    notes: 'Tout est terminé'
  };

  const result = generateStatusNotificationEmail('fr', data, '');

  assertContains(result.textBody, 'Cher client', 'Text should contain French greeting');
  assertContains(result.textBody, 'Dossier test', 'Text should contain case name');
  assertContains(result.textBody, 'Terminé', 'Text should contain status');
  assertContains(result.textBody, 'MISE À JOUR DU STATUT DU DOSSIER', 'Text should contain French header');
}

function testFrenchTemplateFrenchLanguage() {
  const data = {
    caseName: 'Test',
    status: 'Actif',
    notes: 'Test'
  };

  const result = generateStatusNotificationEmail('fr', data, '');

  assertContains(result.htmlBody, '<html lang="fr">', 'HTML should have French lang attribute');
  assertContains(result.htmlBody, 'Dossier', 'HTML should use French labels');
  assertContains(result.htmlBody, 'Nouveau statut', 'HTML should use French status label');
}

// ============================================================================
// T058: Signature Injection Tests
// ============================================================================

function testSignatureInjectionEnglish() {
  const data = {
    caseName: 'Test Case',
    status: 'Active',
    notes: 'Test notes'
  };

  const signature = '<p>Best regards,<br>Support Team<br>support@example.com</p>';
  const result = generateStatusNotificationEmail('en', data, signature);

  assertContains(result.htmlBody, signature, 'HTML should contain signature');
  assertContains(result.htmlBody, 'Best regards', 'HTML signature should be visible');
}

function testSignatureInjectionFrench() {
  const data = {
    caseName: 'Dossier test',
    status: 'Actif',
    notes: 'Notes test'
  };

  const signature = '<p>Cordialement,<br>Équipe de support<br>support@example.com</p>';
  const result = generateStatusNotificationEmail('fr', data, signature);

  assertContains(result.htmlBody, signature, 'HTML should contain signature');
  assertContains(result.htmlBody, 'Cordialement', 'HTML signature should be visible');
}

function testSignatureInHtmlAndText() {
  const data = {
    caseName: 'Test',
    status: 'Active',
    notes: 'Test'
  };

  const signature = '<p>Contact: support@example.com</p>';
  const result = generateStatusNotificationEmail('en', data, signature);

  assertContains(result.htmlBody, signature, 'HTML should contain signature');
  assertContains(result.textBody, 'support@example.com', 'Text should contain stripped signature');
}

function testSignatureHtmlFormatting() {
  const data = {
    caseName: 'Test',
    status: 'Active',
    notes: 'Test'
  };

  const signature = '<p><strong>Team Name</strong><br>Email: test@example.com</p>';
  const result = generateStatusNotificationEmail('en', data, signature);

  assertContains(result.htmlBody, '<strong>Team Name</strong>', 'HTML signature should preserve HTML tags');
  assertContains(result.textBody, 'Team Name', 'Text signature should strip HTML tags');
}

// ============================================================================
// T059: Missing Signature Handling Tests
// ============================================================================

function testEmptySignatureHandling() {
  const data = {
    caseName: 'Test Case',
    status: 'Active',
    notes: 'Test notes'
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertNotContains(result.htmlBody, '<div style="background-color: #ffffff; padding: 24px; border-top: 1px solid #e2e8f0;">\n      <div style="font-size: 15px; color: #475569;">\n        \n      </div>\n    </div>', 'HTML should not contain empty signature section');
  assertEqual(typeof result.htmlBody, 'string', 'Should still return valid HTML');
}

function testNullSignatureHandling() {
  const data = {
    caseName: 'Test Case',
    status: 'Active',
    notes: 'Test notes'
  };

  const result = generateStatusNotificationEmail('en', data, null);

  assertEqual(typeof result.htmlBody, 'string', 'Should handle null signature gracefully');
  assertEqual(typeof result.textBody, 'string', 'Text body should be valid');
}

function testUndefinedSignatureHandling() {
  const data = {
    caseName: 'Test Case',
    status: 'Active',
    notes: 'Test notes'
  };

  const result = generateStatusNotificationEmail('en', data, undefined);

  assertEqual(typeof result.htmlBody, 'string', 'Should handle undefined signature gracefully');
  assertEqual(typeof result.textBody, 'string', 'Text body should be valid');
}

function testGetEmailSignatureWhenMissing() {
  // This test assumes getEmailSignature() returns empty string when property doesn't exist
  const signature = getEmailSignature();

  assertEqual(typeof signature, 'string', 'Should return a string');
  // Note: We can't reliably test PropertiesService in isolation
  // In production, verify this manually or with integration tests
}

// ============================================================================
// Additional Validation Tests
// ============================================================================

function testInvalidLanguageThrowsError() {
  const data = {
    caseName: 'Test',
    status: 'Active',
    notes: 'Test'
  };

  try {
    generateStatusNotificationEmail('es', data, '');
    throw new Error('Should have thrown error for invalid language');
  } catch (error) {
    assertContains(error.message, 'Language must be either "en" or "fr"', 'Should throw language validation error');
  }
}

function testMissingDataFieldsThrowsError() {
  const incompleteData = {
    caseName: 'Test',
    status: 'Active'
    // missing notes
  };

  try {
    generateStatusNotificationEmail('en', incompleteData, '');
    throw new Error('Should have thrown error for missing fields');
  } catch (error) {
    assertContains(error.message, 'Missing required fields', 'Should throw validation error');
  }
}

function testHtmlEscaping() {
  const data = {
    caseName: 'Test <script>alert("XSS")</script>',
    status: 'Active & "Special" Characters',
    notes: "Notes with 'quotes' and <tags>"
  };

  const result = generateStatusNotificationEmail('en', data, '');

  assertNotContains(result.htmlBody, '<script>', 'HTML should escape script tags');
  assertContains(result.htmlBody, '&lt;script&gt;', 'HTML should contain escaped script tag');
  assertContains(result.htmlBody, '&quot;', 'HTML should escape quotes');
  assertContains(result.htmlBody, '&#x27;', 'HTML should escape single quotes');
}

function testStripHtmlTags() {
  const htmlString = '<p><strong>Bold text</strong> and <em>italic</em></p>';
  const stripped = stripHtmlTags(htmlString);

  assertNotContains(stripped, '<p>', 'Should remove <p> tags');
  assertNotContains(stripped, '<strong>', 'Should remove <strong> tags');
  assertContains(stripped, 'Bold text', 'Should preserve text content');
  assertContains(stripped, 'and', 'Should preserve plain text');
}

// ============================================================================
// Test Assertion Helpers
// ============================================================================

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message + ' - Expected: ' + expected + ', Got: ' + actual);
  }
}

function assertContains(haystack, needle, message) {
  if (haystack.indexOf(needle) === -1) {
    throw new Error(message + ' - "' + needle + '" not found in string');
  }
}

function assertNotContains(haystack, needle, message) {
  if (haystack.indexOf(needle) !== -1) {
    throw new Error(message + ' - "' + needle + '" should not be in string');
  }
}

/**
 * Manual Test: Email Formatting Across Clients (T065)
 *
 * Run this function to send test emails and verify formatting manually
 * in Gmail, Outlook, Apple Mail, etc.
 *
 * IMPORTANT: Update the recipient email address before running
 */
function sendTestEmailsForManualVerification() {
  const testEmail = 'YOUR_TEST_EMAIL@example.com'; // UPDATE THIS

  const testData = {
    caseName: 'Test Property Dispute Case #12345',
    status: 'In Progress - Awaiting Documentation',
    notes: 'We are currently waiting for additional documentation from the client.\n\nPlease provide:\n1. Property deed\n2. Tax records\n3. Survey maps\n\nOnce received, we will proceed with the next steps.'
  };

  const signature = '<p><strong>Legal Support Team</strong><br>Email: support@example.com<br>Phone: (555) 123-4567</p>';

  // Send English test email
  const enTemplate = generateStatusNotificationEmail('en', testData, signature);
  GmailApp.sendEmail(testEmail, enTemplate.subject, enTemplate.textBody, {
    htmlBody: enTemplate.htmlBody,
    name: 'Case Management System'
  });

  Logger.log('English test email sent to: ' + testEmail);

  // Send French test email
  const frTemplate = generateStatusNotificationEmail('fr', testData, signature);
  GmailApp.sendEmail(testEmail, frTemplate.subject, frTemplate.textBody, {
    htmlBody: frTemplate.htmlBody,
    name: 'Système de gestion des dossiers'
  });

  Logger.log('French test email sent to: ' + testEmail);

  Logger.log('\nManual verification checklist:');
  Logger.log('1. Check Gmail web client - verify styling renders correctly');
  Logger.log('2. Check Gmail mobile app - verify responsive layout');
  Logger.log('3. Check Outlook web client - verify compatibility');
  Logger.log('4. Check Apple Mail (if available) - verify rendering');
  Logger.log('5. Verify info box has blue border and gray background');
  Logger.log('6. Verify signature section is properly separated');
  Logger.log('7. Verify text-only version is readable (disable HTML in email client)');
}
