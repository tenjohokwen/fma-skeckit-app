/**
 * Test Fixtures for Email Notification Feature
 *
 * This file contains mock data for testing the email notification functionality
 * including case data, client data, and expected API responses.
 */

// ==================== CASE DATA FIXTURES ====================

/**
 * Mock case data with initial status
 */
export const mockCaseInitial = {
  caseId: 'CASE-TEST-001',
  caseName: 'Test Property Dispute',
  clientId: 'CLIENT-TEST-001',
  clientName: 'John Doe', // Enriched field
  status: 'Pending Review',
  notes: 'Initial notes about the case',
  assignedTo: 'admin@example.com',
  caseType: 'Property',
  createdBy: 'admin@example.com',
  createdAt: 1697500000000,
  lastUpdatedBy: 'admin@example.com',
  lastUpdatedAt: 1697500000000,
  version: 1
}

/**
 * Mock case data with updated status (simulates after status change)
 */
export const mockCaseUpdated = {
  ...mockCaseInitial,
  status: 'In Progress', // Status changed
  notes: 'Client meeting scheduled for next week. Documents reviewed and appear complete.',
  lastUpdatedBy: 'admin@example.com',
  lastUpdatedAt: 1697600000000,
  version: 2
}

/**
 * Mock case data with unchanged status (for testing dialog skip)
 */
export const mockCaseOtherFieldsUpdated = {
  ...mockCaseInitial,
  assignedTo: 'lawyer@example.com', // Only assignedTo changed
  lastUpdatedBy: 'admin@example.com',
  lastUpdatedAt: 1697600000000,
  version: 2
}

// ==================== CLIENT DATA FIXTURES ====================

/**
 * Mock client with valid email address
 */
export const mockClientWithEmail = {
  clientId: 'CLIENT-TEST-001',
  firstName: 'John',
  lastName: 'Doe',
  nationalId: 'TEST-001',
  telephone: '555-0100',
  email: 'john.doe@example.com',
  folderId: 'FOLDER-001',
  createdAt: 1697400000000,
  updatedAt: 1697400000000
}

/**
 * Mock client without email address (edge case)
 */
export const mockClientWithoutEmail = {
  clientId: 'CLIENT-TEST-002',
  firstName: 'Jane',
  lastName: 'Smith',
  nationalId: 'TEST-002',
  telephone: '555-0200',
  email: null, // No email
  folderId: 'FOLDER-002',
  createdAt: 1697400000000,
  updatedAt: 1697400000000
}

/**
 * Mock client with invalid email format (edge case)
 */
export const mockClientWithInvalidEmail = {
  clientId: 'CLIENT-TEST-003',
  firstName: 'Bob',
  lastName: 'Johnson',
  nationalId: 'TEST-003',
  telephone: '555-0300',
  email: 'invalid-email', // Invalid format
  folderId: 'FOLDER-003',
  createdAt: 1697400000000,
  updatedAt: 1697400000000
}

// ==================== API RESPONSE FIXTURES ====================

/**
 * Successful case update with email sent
 */
export const mockSuccessResponseWithEmail = {
  status: 200,
  msgKey: 'metadata.caseUpdated',
  message: 'Case updated successfully',
  data: {
    case: mockCaseUpdated,
    emailSent: true,
    emailSkipped: false,
    emailFailed: false
  },
  token: {
    value: 'encrypted_token_string',
    ttl: 1697600900000,
    username: 'admin@example.com'
  }
}

/**
 * Case update with email skipped (no email address)
 */
export const mockSuccessResponseEmailSkipped = {
  status: 200,
  msgKey: 'metadata.caseUpdated',
  message: 'Case updated successfully',
  data: {
    case: mockCaseUpdated,
    emailSent: false,
    emailSkipped: true,
    emailFailed: false,
    skipReason: 'NO_EMAIL'
  },
  token: {
    value: 'encrypted_token_string',
    ttl: 1697600900000,
    username: 'admin@example.com'
  }
}

/**
 * Case update with email send failure
 */
export const mockSuccessResponseEmailFailed = {
  status: 200,
  msgKey: 'metadata.caseUpdated',
  message: 'Case updated successfully',
  data: {
    case: mockCaseUpdated,
    emailSent: false,
    emailSkipped: false,
    emailFailed: true,
    failureReason: 'Service communication failure. Check the message and try again.'
  },
  token: {
    value: 'encrypted_token_string',
    ttl: 1697600900000,
    username: 'admin@example.com'
  }
}

/**
 * Case update without email notification (user declined)
 */
export const mockSuccessResponseNoEmail = {
  status: 200,
  msgKey: 'metadata.caseUpdated',
  message: 'Case updated successfully',
  data: {
    case: mockCaseUpdated,
    emailSent: false,
    emailSkipped: true,
    emailFailed: false,
    skipReason: 'USER_DECLINED'
  },
  token: {
    value: 'encrypted_token_string',
    ttl: 1697600900000,
    username: 'admin@example.com'
  }
}

/**
 * Version conflict error (concurrent edit)
 */
export const mockVersionConflictResponse = {
  status: 409,
  msgKey: 'metadata.versionConflict',
  message: 'Version conflict detected',
  data: {
    currentVersion: 3,
    requestedVersion: 2
  },
  token: {
    value: 'encrypted_token_string',
    ttl: 1697600900000,
    username: 'admin@example.com'
  }
}

// ==================== EMAIL NOTIFICATION DIALOG FIXTURES ====================

/**
 * Dialog confirm payload - user accepts email with English
 */
export const mockDialogConfirmEnglish = {
  sendEmail: true,
  clientLanguage: 'en'
}

/**
 * Dialog confirm payload - user accepts email with French
 */
export const mockDialogConfirmFrench = {
  sendEmail: true,
  clientLanguage: 'fr'
}

/**
 * Dialog confirm payload - user declines email
 */
export const mockDialogDecline = {
  sendEmail: false
}

// ==================== EMAIL TEMPLATE FIXTURES ====================

/**
 * Expected email subject (English)
 */
export const mockEmailSubjectEnglish = 'Status Update: Test Property Dispute'

/**
 * Expected email subject (French)
 */
export const mockEmailSubjectFrench = 'Mise à jour du statut: Test Property Dispute'

/**
 * Mock signature from PropertiesService
 */
export const mockSignature = '<p>Best regards,<br>File Management Team<br>support@example.com</p>'

/**
 * Expected email body content (English) - key phrases to verify
 */
export const mockEmailBodyEnglishKeywords = [
  'Dear Client',
  'status update',
  'Test Property Dispute',
  'In Progress',
  'Client meeting scheduled'
]

/**
 * Expected email body content (French) - key phrases to verify
 */
export const mockEmailBodyFrenchKeywords = [
  'Cher client',
  'mise à jour du statut',
  'Test Property Dispute',
  'In Progress',
  'Client meeting scheduled'
]

// ==================== TEST HELPER FUNCTIONS ====================

/**
 * Creates a mock case update request payload
 * @param {Object} options - Configuration options
 * @param {boolean} options.sendEmail - Whether to send email
 * @param {string} options.clientLanguage - Client language ('en' or 'fr')
 * @param {string} options.status - New status value
 * @param {string} options.notes - Updated notes
 * @returns {Object} Request payload
 */
export function createMockUpdateRequest(options = {}) {
  const {
    sendEmail = false,
    clientLanguage = 'en',
    status = 'In Progress',
    notes = 'Updated notes'
  } = options

  const payload = {
    caseId: mockCaseInitial.caseId,
    updates: {
      status,
      notes
    },
    version: mockCaseInitial.version
  }

  if (sendEmail) {
    payload.sendEmail = true
    payload.clientLanguage = clientLanguage
  }

  return payload
}

/**
 * Creates mock component props for EmailNotificationDialog
 * @param {Object} options - Configuration options
 * @returns {Object} Component props
 */
export function createMockDialogProps(options = {}) {
  const {
    modelValue = true,
    originalNotes = mockCaseInitial.notes,
    currentNotes = mockCaseUpdated.notes
  } = options

  return {
    modelValue,
    originalNotes,
    currentNotes
  }
}

/**
 * Creates mock component props for CaseEditor
 * @param {Object} options - Configuration options
 * @returns {Object} Component props
 */
export function createMockCaseEditorProps(options = {}) {
  const {
    caseId = mockCaseInitial.caseId,
    caseData = mockCaseInitial
  } = options

  return {
    caseId,
    caseData
  }
}

// ==================== MOCK API FUNCTIONS ====================

/**
 * Mock API implementation for testing
 */
export const mockApi = {
  /**
   * Mock updateCase function that returns success with email sent
   */
  updateCaseWithEmailSuccess: async () => {
    return mockSuccessResponseWithEmail
  },

  /**
   * Mock updateCase function that returns success with email skipped
   */
  updateCaseEmailSkipped: async () => {
    return mockSuccessResponseEmailSkipped
  },

  /**
   * Mock updateCase function that returns success with email failed
   */
  updateCaseEmailFailed: async () => {
    return mockSuccessResponseEmailFailed
  },

  /**
   * Mock updateCase function that returns success without email
   */
  updateCaseNoEmail: async () => {
    return mockSuccessResponseNoEmail
  },

  /**
   * Mock updateCase function that returns version conflict error
   */
  updateCaseVersionConflict: async () => {
    throw {
      status: 409,
      message: 'Version conflict detected',
      data: mockVersionConflictResponse.data
    }
  }
}

// ==================== BACKEND TEST FIXTURES (for Google Apps Script tests) ====================

/**
 * Mock PropertiesService for backend testing
 */
export const mockPropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key) => {
      if (key === 'SIGNATURE') {
        return mockSignature
      }
      return null
    }
  })
}

/**
 * Mock GmailApp for backend testing
 */
export const mockGmailApp = {
  sendEmail: (recipient, subject, body, options) => {
    // Mock implementation - would normally send email
    return {
      recipient,
      subject,
      body,
      options
    }
  }
}

/**
 * Mock SheetsService.getClientById for backend testing
 */
export const mockSheetsServiceGetClientById = {
  withEmail: () => mockClientWithEmail,
  withoutEmail: () => mockClientWithoutEmail,
  withInvalidEmail: () => mockClientWithInvalidEmail,
  notFound: () => null
}

// ==================== EXPORTS ====================

export default {
  // Case data
  mockCaseInitial,
  mockCaseUpdated,
  mockCaseOtherFieldsUpdated,

  // Client data
  mockClientWithEmail,
  mockClientWithoutEmail,
  mockClientWithInvalidEmail,

  // API responses
  mockSuccessResponseWithEmail,
  mockSuccessResponseEmailSkipped,
  mockSuccessResponseEmailFailed,
  mockSuccessResponseNoEmail,
  mockVersionConflictResponse,

  // Dialog payloads
  mockDialogConfirmEnglish,
  mockDialogConfirmFrench,
  mockDialogDecline,

  // Email content
  mockEmailSubjectEnglish,
  mockEmailSubjectFrench,
  mockSignature,
  mockEmailBodyEnglishKeywords,
  mockEmailBodyFrenchKeywords,

  // Helper functions
  createMockUpdateRequest,
  createMockDialogProps,
  createMockCaseEditorProps,

  // Mock API
  mockApi,

  // Backend mocks
  mockPropertiesService,
  mockGmailApp,
  mockSheetsServiceGetClientById
}
