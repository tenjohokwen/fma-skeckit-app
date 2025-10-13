# Research: File Management Application with User Authentication

**Feature**: File Management Application with User Authentication
**Date**: 2025-10-13
**Status**: Complete

## Research Overview

This document consolidates research findings for implementing a Vue 3 + Quasar 2 frontend with Google Apps Script backend, Google Sheets database, and Google Drive file storage.

## 1. Vue 3 Composition API + Quasar 2 Integration

### Decision

Use Vue 3 with `<script setup>` syntax exclusively, integrated with Quasar 2 framework for UI components.

### Rationale

- **Constitution Compliance**: Meets Vue 3 Composition API requirement (Principle I)
- **Type Safety Without TypeScript**: JSDoc comments provide IDE autocomplete while staying JavaScript-only (Principle II)
- **Component Reusability**: Composables enable logic sharing across components without class inheritance
- **Quasar Benefits**: Pre-built mobile-responsive components, built-in theming, Material Icons, `useQuasar()` for notifications

### Best Practices

- **Component Size**: Keep components under 250 lines (constitution requirement)
- **Composables Pattern**: Extract reusable logic (auth, API calls, notifications) into `composables/`
- **Quasar Imports**: Import only needed components in `quasar.config.js` for tree-shaking
- **Reactive State**: Use `ref()` for primitives, `reactive()` for objects, `computed()` for derived values
- **Lifecycle**: Use `onMounted()`, `onUnmounted()` for component lifecycle; clean up timers/listeners in `onUnmounted()`

### Alternatives Considered

- **Vue 2 Options API**: Rejected - doesn't meet constitution requirements
- **Vuetify**: Rejected - Quasar specified in user input, better mobile support
- **TypeScript**: Rejected - violates constitution Principle II

### Implementation Notes

```javascript
// Composable pattern example
// composables/useAuth.js
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export function useAuth() {
  const $q = useQuasar()
  const router = useRouter()
  const user = ref(null)
  const loading = ref(false)

  async function login(email, password) {
    loading.value = true
    try {
      const response = await authService.login(email, password)
      user.value = response.data.user
      $q.notify({ type: 'positive', message: 'Login successful' })
      router.push('/search')
    } catch (error) {
      $q.notify({ type: 'negative', message: error.message })
    } finally {
      loading.value = false
    }
  }

  return { user, loading, login }
}
```

## 2. Google Apps Script Backend Architecture

### Decision

Implement layered backend architecture in `gas/` folder with Security Interceptor → Router → Handlers → Services → Utils pattern.

### Rationale

- **Constitution Compliance**: Follows GAS Architecture requirements (Request Flow pattern, folder structure)
- **Separation of Concerns**: Security, routing, business logic, and data access cleanly separated
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear responsibility boundaries prevent spaghetti code

### Best Practices

- **Security First**: All requests pass through SecurityInterceptor before routing
- **Standardized Responses**: Use ResponseHandler for consistent JSON format with status, msgKey, message, data, token
- **Token Management**: 15-minute TTL, refresh on successful authenticated requests
- **Error Handling**: Centralized in ResponseHandler, provides i18n keys for localization
- **PropertiesService**: Store sensitive config (sheet IDs, folder IDs, email templates)

### Alternatives Considered

- **Monolithic Code.gs**: Rejected - violates single responsibility, hard to maintain
- **Custom Authentication**: Rejected - token-based auth with Google Sheets provides adequate security
- **Direct Google Sheets API**: Rejected - GAS provides simpler Sheets access

### Implementation Notes

```javascript
// gas/Router.gs
function doPost(e) {
  return ResponseHandler.handle(() => {
    SecurityInterceptor.validateRequest(e);
    const { action, data } = JSON.parse(e.postData.contents);

    switch(action) {
      case 'signup':
        return AuthHandler.signup(data);
      case 'login':
        return AuthHandler.login(data);
      case 'searchCases':
        return MetadataHandler.searchCases(data);
      case 'uploadFile':
        return FileHandler.uploadFile(data);
      default:
        throw new Error('Unknown action');
    }
  });
}

// gas/utils/ResponseHandler.gs
function handle(callback) {
  try {
    const result = callback();
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 200,
        msgKey: 'success',
        message: 'Operation successful',
        data: result.data,
        token: result.token
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 500,
        msgKey: 'error.generic',
        message: error.message,
        data: null,
        token: null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Google Sheets as Database

### Decision

Use Google Sheets for structured data with two sheets: "users" (authentication data) and "metadata" (case information).

### Rationale

- **Specified Requirement**: User input specifies Google Sheets as data source
- **Simple CRUD**: Google Apps Script provides native Sheets API
- **No Additional Infrastructure**: Sheets included with Google Workspace
- **Versioning Support**: Built-in version number column enables optimistic locking

### Best Practices

- **SheetsService Abstraction**: Create service layer to abstract Sheets API calls
- **Row-Based Operations**: Use `getDataRange()`, `getValues()` for reads; `appendRow()`, `setValues()` for writes
- **Indexing Strategy**: Use email as unique identifier for users, caseId for metadata
- **Atomic Updates**: Read-modify-write pattern with version check to prevent concurrent edit conflicts
- **Data Validation**: Validate all inputs before writing to sheets

### Alternatives Considered

- **Firebase Firestore**: Rejected - adds external dependency, user specified Sheets
- **Google Cloud SQL**: Rejected - overkill for this scale, increases complexity
- **JSON files in Drive**: Rejected - no querying capability, concurrent access issues

### Implementation Notes

```javascript
// gas/services/SheetsService.gs
function getUserByEmail(email) {
  const sheet = SpreadsheetApp.openById(USERS_SHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');

  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIndex] === email) {
      return rowToObject(headers, data[i], i + 1);
    }
  }
  return null;
}

function updateCaseMetadata(caseId, updates, expectedVersion) {
  const sheet = SpreadsheetApp.openById(METADATA_SHEET_ID).getSheetByName('metadata');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const caseIdIndex = headers.indexOf('Case Id');
  const versionIndex = headers.indexOf('version');

  for (let i = 1; i < data.length; i++) {
    if (data[i][caseIdIndex] === caseId) {
      const currentVersion = data[i][versionIndex];
      if (currentVersion !== expectedVersion) {
        throw new Error('Version conflict - case was modified by another user');
      }

      // Apply updates with automatic fields
      const row = data[i];
      Object.keys(updates).forEach(key => {
        const index = headers.indexOf(key);
        if (index !== -1) row[index] = updates[key];
      });

      // Set automatic fields
      row[headers.indexOf('Last Updated By')] = getCurrentUser();
      row[headers.indexOf('Last Updated At')] = getCurrentDateTime();
      row[headers.indexOf('version')] = currentVersion + 1;

      if (updates['Assigned To'] && updates['Assigned To'] !== data[i][headers.indexOf('Assigned To')]) {
        row[headers.indexOf('Assigned At')] = getCurrentDateTime();
      }

      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return rowToObject(headers, row, i + 1);
    }
  }
  throw new Error('Case not found');
}
```

## 4. Google Drive File Storage

### Decision

Use Google Drive for file storage with hierarchical folder structure: `cases/firstName_lastName_idCardNo/caseID/files`.

### Rationale

- **Specified Requirement**: User input specifies Google Drive as file storage backend
- **Native Integration**: GAS DriveApp provides seamless API access
- **Scalability**: Google Drive handles large file volumes and concurrent access
- **User Transparency**: Users remain unaware of backend storage (requirement FR-050)

### Best Practices

- **Folder Hierarchy**: Maintain consistent structure with client folders under "cases" root
- **File Metadata**: Store folder paths in Sheets metadata for quick lookups
- **Conflict Handling**: Implement prompt-based resolution (overwrite/rename/cancel) per user clarification
- **Error Handling**: Handle quota limits, network failures, permission errors gracefully
- **Cleanup**: Provide admin delete capability; warn before folder deletion

### Alternatives Considered

- **Google Cloud Storage**: Rejected - requires billing, adds complexity beyond user requirements
- **Flat File Structure**: Rejected - doesn't support case-based organization requirement
- **Database BLOB Storage**: Rejected - not using traditional database

### Implementation Notes

```javascript
// gas/services/DriveService.gs
function createClientFolder(firstName, lastName, idCardNo) {
  const casesFolder = DriveApp.getFolderById(CASES_FOLDER_ID);
  const folderName = `${firstName}_${lastName}_${idCardNo}`;

  // Check if folder already exists
  const existingFolders = casesFolder.getFoldersByName(folderName);
  if (existingFolders.hasNext()) {
    throw new Error('Client folder already exists');
  }

  const folder = casesFolder.createFolder(folderName);
  return {
    id: folder.getId(),
    name: folder.getName(),
    path: `cases/${folderName}`
  };
}

function uploadFileWithConflictCheck(caseFolder, fileName, fileBlob) {
  const files = caseFolder.getFilesByName(fileName);

  if (files.hasNext()) {
    // Return conflict info - frontend will prompt user
    return {
      conflict: true,
      existingFile: files.next().getId(),
      fileName: fileName
    };
  }

  const file = caseFolder.createFile(fileBlob.setName(fileName));
  return {
    conflict: false,
    fileId: file.getId(),
    fileName: file.getName(),
    mimeType: file.getMimeType(),
    size: file.getSize()
  };
}

function handleFileConflictResolution(caseFolder, fileName, fileBlob, resolution) {
  switch(resolution) {
    case 'overwrite':
      // Delete existing and create new
      const existingFiles = caseFolder.getFilesByName(fileName);
      while (existingFiles.hasNext()) {
        existingFiles.next().setTrashed(true);
      }
      return caseFolder.createFile(fileBlob.setName(fileName));

    case 'rename':
      // Auto-generate unique name with timestamp
      const timestamp = Utilities.formatDate(new Date(), 'Africa/Douala', 'yyyyMMdd_HHmmss');
      const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
      const extension = fileName.substring(fileName.lastIndexOf('.'));
      const newName = `${baseName}_${timestamp}${extension}`;
      return caseFolder.createFile(fileBlob.setName(newName));

    case 'cancel':
      throw new Error('Upload cancelled by user');

    default:
      throw new Error('Invalid conflict resolution');
  }
}
```

## 5. Password Hashing and Security

### Decision

Use Google Apps Script `Utilities.computeDigest()` with HMAC-SHA256 for password hashing with per-user salt.

### Rationale

- **GAS Native**: No external libraries required
- **Strong Hashing**: SHA-256 provides adequate security for this use case
- **Salting**: Prevents rainbow table attacks
- **Constitution Compliant**: Stores credentials securely (GAS Architecture best practice)

### Best Practices

- **Salt Generation**: Use `Utilities.getUuid()` for unique salt per user
- **Hash Storage**: Store hash and salt separately in users sheet
- **Token Security**: Use encrypted tokens with 15-minute expiry
- **OTP Security**: Random 6-digit OTP with 2-hour expiry
- **PropertiesService**: Store encryption keys in script properties (not in code)

### Alternatives Considered

- **bcrypt**: Rejected - not available in GAS without external library
- **Argon2**: Rejected - not available in GAS
- **Plain SHA-256**: Rejected - vulnerable to rainbow tables without salt

### Implementation Notes

```javascript
// gas/utils/PasswordUtil.gs
function hashPassword(password, salt) {
  const saltedPassword = password + salt;
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    saltedPassword,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64Encode(hash);
}

function generateSalt() {
  return Utilities.getUuid();
}

function verifyPassword(password, storedHash, salt) {
  const computedHash = hashPassword(password, salt);
  return computedHash === storedHash;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(userId, email) {
  const payload = {
    userId: userId,
    email: email,
    exp: new Date().getTime() + (15 * 60 * 1000) // 15 minutes
  };
  const payloadString = JSON.stringify(payload);
  return Utilities.base64EncodeWebSafe(payloadString);
}

function validateToken(token) {
  try {
    const payloadString = Utilities.newBlob(
      Utilities.base64DecodeWebSafe(token)
    ).getDataAsString();
    const payload = JSON.parse(payloadString);

    if (new Date().getTime() > payload.exp) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## 6. Email Service Integration

### Decision

Use Google Apps Script `MailApp` or `GmailApp` for sending verification and OTP emails.

### Rationale

- **GAS Native**: Built-in email capability
- **Quota**: 100 emails/day (free), sufficient for 50 concurrent users specification
- **Template Support**: HTML email templates for better UX
- **i18n Support**: Can send emails in English or French based on user preference

### Best Practices

- **HTML Templates**: Store templates in PropertiesService or separate HTML files
- **Verification Links**: Include token in URL pointing to frontend verification page
- **OTP Format**: Clear 6-digit code, bold and large font
- **From Address**: Use professional sender name
- **Error Handling**: Log email failures, provide retry mechanism

### Alternatives Considered

- **SendGrid**: Rejected - adds external dependency, quota sufficient
- **Mailgun**: Rejected - same reasoning
- **Custom SMTP**: Rejected - unnecessary complexity

### Implementation Notes

```javascript
// gas/services/EmailService.gs
function sendVerificationEmail(email, name, verificationToken, language) {
  const verificationUrl = `${WEB_APP_URL}/verify?token=${verificationToken}`;
  const subject = language === 'fr'
    ? 'Vérifiez votre adresse e-mail'
    : 'Verify your email address';

  const htmlBody = language === 'fr'
    ? getVerificationEmailTemplate_FR(name, verificationUrl)
    : getVerificationEmailTemplate_EN(name, verificationUrl);

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function sendOTPEmail(email, name, otp, language) {
  const subject = language === 'fr'
    ? 'Code de récupération de mot de passe'
    : 'Password Recovery Code';

  const htmlBody = language === 'fr'
    ? getOTPEmailTemplate_FR(name, otp)
    : getOTPEmailTemplate_EN(name, otp);

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function sendPasswordResetNotification(email, name, language) {
  const subject = language === 'fr'
    ? 'Mot de passe réinitialisé avec succès'
    : 'Password Reset Successful';

  const htmlBody = language === 'fr'
    ? getPasswordResetTemplate_FR(name)
    : getPasswordResetTemplate_EN(name);

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}
```

## 7. Internationalization (i18n) with Vue I18n

### Decision

Use Vue I18n plugin with English and French JSON locale files.

### Rationale

- **Specification Requirement**: FR-049 requires English and French support
- **Standard Solution**: Vue I18n is the de facto i18n solution for Vue applications
- **Quasar Compatible**: Works seamlessly with Quasar components
- **Message Keys**: Backend provides `msgKey` in responses for frontend translation

### Best Practices

- **Locale Files**: Store translations in `src/i18n/en.json` and `src/i18n/fr.json`
- **Nested Keys**: Use dot notation for organization (e.g., `auth.login.success`)
- **Pluralization**: Use Vue I18n plural rules for count-based messages
- **Date Formatting**: Use Vue I18n datetime formatting for consistent date display
- **Persistence**: Store user language preference in localStorage

### Implementation Notes

```javascript
// src/i18n/index.js
import { createI18n } from 'vue-i18n'
import en from './en.json'
import fr from './fr.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: { en, fr }
})

export default i18n

// src/i18n/en.json
{
  "auth": {
    "login": {
      "title": "Log In",
      "email": "Email Address",
      "password": "Password",
      "submit": "Log In",
      "success": "Login successful",
      "error": {
        "invalid": "Invalid email or password",
        "unverified": "Please verify your email before logging in",
        "blocked": "Your account has been blocked"
      }
    },
    "signup": {
      "title": "Sign Up",
      "name": "Full Name",
      "email": "Email Address",
      "password": "Password",
      "submit": "Sign Up",
      "success": "Account created! Please check your email for verification link",
      "error": {
        "duplicate": "This email is already registered"
      }
    }
  }
}
```

## 8. State Management with Pinia

### Decision

Use Pinia for global state management (authentication, case data caching).

### Rationale

- **Vue 3 Recommended**: Pinia is the official state management solution for Vue 3
- **Composition API Native**: Designed for Composition API, no Options API baggage
- **TypeScript-Free**: Works perfectly with plain JavaScript and JSDoc
- **DevTools Support**: Excellent Vue DevTools integration for debugging

### Best Practices

- **Minimal Stores**: Only create stores for truly shared state (auth, cached data)
- **Composables First**: Use composables for component-local state
- **Actions for Async**: Put API calls in store actions, not in components
- **Getters for Derived State**: Use getters for computed state based on store data

### Implementation Notes

```javascript
// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN')

  function setUser(userData) {
    user.value = userData
  }

  function setToken(tokenValue) {
    token.value = tokenValue
    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
    } else {
      localStorage.removeItem('token')
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setUser,
    setToken,
    logout
  }
})
```

## 9. Africa/Douala Timezone Handling

### Decision

Use `Utilities.formatDate()` with 'Africa/Douala' timezone in Google Apps Script for all datetime operations.

### Rationale

- **Specification Requirement**: All datetime operations must use Africa/Douala timezone (constraints)
- **GAS Native**: `Utilities.formatDate()` supports timezone parameter
- **Consistency**: Centralizing timezone handling prevents bugs

### Best Practices

- **DateUtil Service**: Create centralized utility for all datetime operations
- **ISO Format**: Store datetimes in ISO 8601 format for consistency
- **Frontend Display**: Convert to user's local timezone only for display (optional enhancement)
- **Comparison**: Always compare datetimes in the same timezone

### Implementation Notes

```javascript
// gas/utils/DateUtil.gs
const TIMEZONE = 'Africa/Douala';

function getCurrentDateTime() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function getCurrentDateTimeISO() {
  return Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

function addHours(dateString, hours) {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return Utilities.formatDate(date, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function isExpired(expiryDateString) {
  const expiry = new Date(expiryDateString);
  const now = new Date();
  return now > expiry;
}

function formatForDisplay(dateString) {
  const date = new Date(dateString);
  return Utilities.formatDate(date, TIMEZONE, 'MMM dd, yyyy HH:mm');
}
```

## 10. Testing Strategy with Vitest + Vue Test Utils

### Decision

Use Vitest with Vue Test Utils for component testing, following constitution requirements.

### Rationale

- **Constitution Compliance**: Vitest + Vue Test Utils mandated by Testing Standards
- **Fast Execution**: Vitest is significantly faster than Jest
- **Vue 3 Native**: Vue Test Utils designed for Vue 3 Composition API
- **Plain JavaScript**: No TypeScript required

### Best Practices

- **One Test Per Component**: Each component has dedicated `.spec.js` file (constitution requirement)
- **User-Centric Tests**: Test user interactions, not implementation details
- **Mock API Calls**: Use `vi.mock()` to mock service layer
- **Mock Quasar**: Mock `useQuasar()` for notification testing
- **Coverage Goals**: Aim for 80% coverage on critical paths (auth, metadata, file operations)

### Implementation Notes

```javascript
// tests/components/auth/LoginForm.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { Quasar } from 'quasar'
import LoginForm from '@/components/auth/LoginForm.vue'

describe('LoginForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginForm, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn }),
          [Quasar, {}]
        ]
      }
    })
  })

  it('renders email and password inputs', () => {
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('displays error when login fails with unverified account', async () => {
    const authService = vi.mocked(await import('@/services/authService'))
    authService.login.mockRejectedValue({
      msgKey: 'auth.error.unverified'
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Please verify your email')
  })
})
```

## Research Completion Summary

All technical decisions have been researched and documented. The stack is:

**Frontend**: Vue 3 (Composition API, `<script setup>`), Quasar 2, Pinia, Vue Router, Vue I18n, Vite, Vitest
**Backend**: Google Apps Script (layered architecture)
**Data Storage**: Google Sheets (users, metadata)
**File Storage**: Google Drive (hierarchical folders)
**Security**: HMAC-SHA256 password hashing, token-based auth (15min TTL), OTP (2hr TTL)
**Email**: Google Apps Script MailApp
**Timezone**: Africa/Douala for all datetime operations
**i18n**: English and French via Vue I18n

All decisions align with project constitution and user requirements. Ready to proceed to Phase 1: Design & Contracts.
