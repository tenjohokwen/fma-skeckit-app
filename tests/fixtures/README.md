# Test Fixtures

This directory contains mock data and helper functions for testing the application.

## Email Notification Fixtures

**File**: `emailNotificationFixtures.js`

Comprehensive test fixtures for the email notification feature (Feature 009).

### Contents

#### Case Data
- `mockCaseInitial` - Case before status change
- `mockCaseUpdated` - Case after status change
- `mockCaseOtherFieldsUpdated` - Case with non-status field changes

#### Client Data
- `mockClientWithEmail` - Client with valid email address
- `mockClientWithoutEmail` - Client without email (edge case)
- `mockClientWithInvalidEmail` - Client with invalid email format (edge case)

#### API Responses
- `mockSuccessResponseWithEmail` - Successful update with email sent
- `mockSuccessResponseEmailSkipped` - Update with email skipped (no email address)
- `mockSuccessResponseEmailFailed` - Update with email send failure
- `mockSuccessResponseNoEmail` - Update without email (user declined)
- `mockVersionConflictResponse` - Version conflict error (409)

#### Dialog Payloads
- `mockDialogConfirmEnglish` - User accepts email in English
- `mockDialogConfirmFrench` - User accepts email in French
- `mockDialogDecline` - User declines email

#### Email Content
- `mockEmailSubjectEnglish` - Expected English email subject
- `mockEmailSubjectFrench` - Expected French email subject
- `mockSignature` - Mock email signature
- `mockEmailBodyEnglishKeywords` - Keywords to verify in English email
- `mockEmailBodyFrenchKeywords` - Keywords to verify in French email

### Helper Functions

#### `createMockUpdateRequest(options)`
Creates a mock case update request payload.

```javascript
import { createMockUpdateRequest } from './fixtures/emailNotificationFixtures'

const request = createMockUpdateRequest({
  sendEmail: true,
  clientLanguage: 'en',
  status: 'In Progress',
  notes: 'Updated notes'
})
```

#### `createMockDialogProps(options)`
Creates mock props for EmailNotificationDialog component.

```javascript
import { createMockDialogProps } from './fixtures/emailNotificationFixtures'

const props = createMockDialogProps({
  modelValue: true,
  originalNotes: 'Original notes',
  currentNotes: 'Updated notes'
})
```

#### `createMockCaseEditorProps(options)`
Creates mock props for CaseEditor component.

```javascript
import { createMockCaseEditorProps } from './fixtures/emailNotificationFixtures'

const props = createMockCaseEditorProps({
  caseId: 'CASE-001',
  caseData: mockCaseInitial
})
```

### Mock API Functions

The `mockApi` object provides mock implementations for testing:

```javascript
import { mockApi } from './fixtures/emailNotificationFixtures'

// Test successful email send
const response = await mockApi.updateCaseWithEmailSuccess()

// Test email skipped scenario
const response = await mockApi.updateCaseEmailSkipped()

// Test email failure scenario
const response = await mockApi.updateCaseEmailFailed()

// Test version conflict
try {
  await mockApi.updateCaseVersionConflict()
} catch (error) {
  // Handle conflict
}
```

### Backend Test Mocks

For Google Apps Script backend testing:

```javascript
import {
  mockPropertiesService,
  mockGmailApp,
  mockSheetsServiceGetClientById
} from './fixtures/emailNotificationFixtures'

// Mock SIGNATURE property
const signature = mockPropertiesService.getScriptProperties().getProperty('SIGNATURE')

// Mock email sending
const result = mockGmailApp.sendEmail('client@example.com', 'Subject', 'Body', {})

// Mock client retrieval
const client = mockSheetsServiceGetClientById.withEmail()
```

## Usage Examples

### Frontend Component Test

```javascript
import { mount } from '@vue/test-utils'
import EmailNotificationDialog from '@/components/metadata/EmailNotificationDialog.vue'
import { createMockDialogProps } from '../fixtures/emailNotificationFixtures'

describe('EmailNotificationDialog', () => {
  it('renders with mock data', () => {
    const wrapper = mount(EmailNotificationDialog, {
      props: createMockDialogProps()
    })

    expect(wrapper.exists()).toBe(true)
  })
})
```

### API Integration Test

```javascript
import { createMockUpdateRequest, mockApi } from '../fixtures/emailNotificationFixtures'

describe('Email Notification API', () => {
  it('sends email successfully', async () => {
    const request = createMockUpdateRequest({
      sendEmail: true,
      clientLanguage: 'en'
    })

    const response = await mockApi.updateCaseWithEmailSuccess()

    expect(response.data.emailSent).toBe(true)
    expect(response.data.emailSkipped).toBe(false)
  })
})
```

### Backend Handler Test

```javascript
import {
  mockClientWithEmail,
  mockSignature,
  mockPropertiesService
} from '../fixtures/emailNotificationFixtures'

describe('Email Template Generation', () => {
  it('includes signature when configured', () => {
    const signature = mockPropertiesService.getScriptProperties().getProperty('SIGNATURE')

    expect(signature).toBe(mockSignature)
  })
})
```

## Best Practices

1. **Import only what you need**: Use named imports to keep test files clean
2. **Use helper functions**: Prefer `createMockUpdateRequest()` over manually building objects
3. **Test all scenarios**: Use the different mock responses to test success, failure, and edge cases
4. **Consistent data**: All mock data uses consistent IDs and timestamps for easier debugging
5. **Realistic values**: Mock data reflects realistic case and client information

## Adding New Fixtures

When adding new test fixtures:

1. Follow the existing naming convention (`mock[Entity][Scenario]`)
2. Add JSDoc comments explaining the fixture's purpose
3. Group related fixtures together in the file
4. Update this README with usage examples
5. Ensure fixtures are exported in the default export object

## Notes

- All fixtures use plain JavaScript (no TypeScript)
- Mock data includes realistic timestamps and UUIDs
- Email addresses use `@example.com` domain (safe for testing)
- Helper functions provide flexible configuration via options parameter
- Backend mocks are compatible with Google Apps Script testing utilities
