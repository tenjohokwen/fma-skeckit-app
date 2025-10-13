# Quickstart Guide: File Management Application

**Feature**: File Management Application with User Authentication
**Version**: 1.0.0
**Last Updated**: 2025-10-13

## Overview

This guide helps developers quickly set up and run the File Management Application locally for development and testing.

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher
- **npm** or **yarn**: Latest version
- **Git**: For version control
- **Google Account**: For Google Apps Script deployment
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Google Cloud Setup

1. **Google Drive Setup**:
   - Create a "cases" root folder in your Google Drive
   - Note the folder ID from the URL

2. **Google Sheets Setup**:
   - Create a new Google Spreadsheet
   - Add two sheets: "users" and "metadata"
   - Configure headers as per data model

3. **Google Apps Script Project**:
   - Create new Apps Script project
   - Enable Drive API and Gmail API
   - Configure OAuth scopes

### Required API Keys/Credentials

- Google Apps Script Web App URL (after deployment)
- Google Sheets ID (users sheet)
- Google Sheets ID (metadata sheet)
- Google Drive root folder ID ("cases" folder)

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd fma-skeckit-app
```

### 2. Install Frontend Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create `.env` file in project root:

```env
# Google Apps Script API URL
VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# App Configuration
VITE_APP_NAME=File Management System
VITE_DEFAULT_LANGUAGE=en
```

### 4. Configure Google Sheets

**Users Sheet Headers** (Row 1):
```
name | email | password | salt | type | url | otp | dateOfExpiry | role | status | verificationToken
```

**Metadata Sheet Headers** (Row 1):
```
Client First Name | Client Last Name | Client Email | Client Phone Number | Amount Paid | Payment Status | Folder Name | Folder Path | Assigned To | Assigned At | Last Updated By | Last Updated At | Tasks Remaining | Next Action | Comment | Due Date | status | Case Id | version
```

### 5. Deploy Google Apps Script

```bash
# Navigate to gas/ folder
cd gas

# Initialize clasp (Google Apps Script CLI)
npm install -g @google/clasp
clasp login
clasp create --title "File Management API" --type webapp

# Deploy
clasp push
clasp deploy --description "Initial deployment"
```

Copy the Web App URL from deployment output and add to `.env` file.

### 6. Configure GAS Properties

In Apps Script Editor:
1. Go to Project Settings → Script Properties
2. Add the following properties:

```
USERS_SHEET_ID: <your-users-sheet-id>
METADATA_SHEET_ID: <your-metadata-sheet-id>
CASES_FOLDER_ID: <your-cases-folder-id>
WEB_APP_URL: <your-frontend-url>
```

---

## Running the Application

### Development Mode

```bash
# Start Quasar dev server
quasar dev
# or
npm run dev

# Application will open at http://localhost:9000
```

### Production Build

```bash
# Build for production
quasar build
# or
npm run build

# Built files in dist/spa/
```

### Running Tests

```bash
# Run all tests
npm run test
# or
vitest

# Run tests in watch mode
npm run test:watch
# or
vitest --watch

# Run tests with coverage
npm run test:coverage
# or
vitest --coverage
```

---

## First-Time Setup Workflow

### 1. Create Admin Account

Since signup creates ROLE_USER by default, manually create first admin:

1. Open Users Google Sheet
2. Add row with:
   - name: "Admin User"
   - email: "admin@example.com"
   - password: (generate hash using PasswordUtil.gs)
   - salt: (generate using `Utilities.getUuid()`)
   - type: "ALLOWED"
   - role: "ROLE_ADMIN"
   - status: "VERIFIED"
   - verificationToken: (leave empty or any value)

Or run this in Apps Script:
```javascript
function createAdminUser() {
  const email = "admin@example.com";
  const password = "AdminPass123";
  const salt = Utilities.getUuid();
  const hash = PasswordUtil.hashPassword(password, salt);

  const sheet = SpreadsheetApp.openById(USERS_SHEET_ID).getSheetByName('users');
  sheet.appendRow([
    "Admin User",
    email,
    hash,
    salt,
    "ALLOWED",
    "",
    "",
    "",
    "ROLE_ADMIN",
    "VERIFIED",
    ""
  ]);

  Logger.log(`Admin user created: ${email}`);
}
```

### 2. Test Authentication Flow

1. Open application: `http://localhost:9000`
2. Click "Sign Up" and create a test user account
3. Check email for verification link (or check logs)
4. Click verification link
5. Log in with verified credentials
6. Verify redirect to search page

### 3. Test Admin Features

1. Log in as admin user
2. Navigate to "Client Management"
3. Create test client folder:
   - First Name: "Test"
   - Last Name: "Client"
   - ID Card No: "TEST123"
   - Phone: "+1234567890"
   - Email: "test@example.com"
4. Verify folder created in Google Drive under "cases"

### 4. Test File Operations

1. Search for test client
2. Create case folder: "CASE-TEST-001"
3. Upload test file (PDF or image)
4. Verify file appears in folder navigator
5. Download file and verify
6. Delete file (with confirmation)

---

## Project Structure Guide

```
fma-skeckit-app/
├── gas/                    # Google Apps Script backend
│   ├── security/          # SecurityInterceptor, TokenManager
│   ├── handlers/          # Auth, Metadata, File handlers
│   ├── services/          # Sheets, Drive, Email services
│   ├── utils/             # Response, Password, Date utilities
│   └── Router.gs          # Main request router
│
├── src/                   # Vue 3 frontend
│   ├── components/        # Vue components (auth, search, files)
│   ├── pages/             # Route pages
│   ├── composables/       # Reusable composition functions
│   ├── services/          # API service layer
│   ├── stores/            # Pinia state management
│   ├── router/            # Vue Router configuration
│   ├── i18n/              # English & French translations
│   ├── assets/            # Styles, images
│   └── App.vue            # Root component
│
├── tests/                 # Vitest component tests
│   ├── components/        # Component test files
│   └── composables/       # Composable test files
│
├── specs/                 # Feature documentation
│   └── 001-use-the-information/
│       ├── spec.md        # Feature specification
│       ├── plan.md        # Implementation plan
│       ├── research.md    # Technical research
│       ├── data-model.md  # Data entities & relationships
│       ├── contracts/     # API contracts
│       └── quickstart.md  # This file
│
├── .specify/              # Speckit templates & constitution
├── quasar.config.js       # Quasar framework configuration
├── vite.config.js         # Vite build configuration
├── vitest.config.js       # Vitest test configuration
├── package.json           # Dependencies & scripts
└── README.md              # Project README
```

---

## Common Development Tasks

### Add New Component

```bash
# Create component file
touch src/components/feature/NewComponent.vue

# Create test file
touch tests/components/feature/NewComponent.spec.js
```

Component template:
```vue
<script setup>
import { ref } from 'vue'

// Component logic here
const message = ref('Hello')
</script>

<template>
  <div class="new-component">
    <h2>{{ message }}</h2>
  </div>
</template>

<style scoped>
.new-component {
  /* Component styles */
}
</style>
```

### Add New API Endpoint

1. Add handler method in `gas/handlers/`
2. Add route case in `gas/Router.gs`
3. Add service method in `src/services/`
4. Update API contract documentation
5. Add tests

### Add Translation Key

```javascript
// src/i18n/en.json
{
  "feature": {
    "newKey": "English text"
  }
}

// src/i18n/fr.json
{
  "feature": {
    "newKey": "Texte français"
  }
}
```

Usage in component:
```vue
<template>
  <p>{{ $t('feature.newKey') }}</p>
</template>
```

---

## Troubleshooting

### Issue: CORS Error

**Symptom**: Browser console shows CORS policy error

**Solution**:
1. Redeploy Google Apps Script as Web App
2. Ensure "Execute as: Me" and "Who has access: Anyone"
3. Copy new Web App URL to `.env`

### Issue: Authentication Fails

**Symptom**: Login returns 401 error

**Solution**:
1. Verify Users sheet has correct headers
2. Check password hashing in GAS (test with Logger.log)
3. Verify user status is "VERIFIED" and type is "ALLOWED"

### Issue: Files Not Uploading

**Symptom**: Upload fails with 400 error

**Solution**:
1. Check file size (must be <= 10MB)
2. Verify case folder exists
3. Check Drive API is enabled in GAS project
4. Verify CASES_FOLDER_ID in script properties

### Issue: Email Not Sending

**Symptom**: Verification/OTP emails not received

**Solution**:
1. Check Gmail API is enabled
2. Verify `MailApp` quota (100 emails/day for free accounts)
3. Check spam folder
4. Use Logger.log to verify email sending code executes

### Issue: Tests Failing

**Symptom**: Vitest tests fail unexpectedly

**Solution**:
1. Clear test cache: `npx vitest --clearCache`
2. Check mock setup in test files
3. Verify test dependencies installed
4. Run single test for debugging: `npx vitest ComponentName`

---

## Development Best Practices

### Code Style

- Use Vue 3 `<script setup>` syntax exclusively
- Keep components under 250 lines
- Extract reusable logic into composables
- Use Quasar components for all UI elements
- Follow constitution requirements

### Testing

- Write tests before implementation (TDD)
- One test file per component
- Test user interactions, not implementation
- Mock API calls and external dependencies
- Aim for 80% coverage on critical paths

### Git Workflow

```bash
# Create feature branch
git checkout -b 001-feature-name

# Make changes and commit
git add .
git commit -m "feat: add user authentication"

# Push and create PR
git push origin 001-feature-name
```

### Debugging

Frontend:
```javascript
// Use Vue DevTools browser extension
// console.log for quick debugging
console.log('Debug:', someVariable)

// Use debugger statement
debugger;
```

Backend (GAS):
```javascript
// Use Logger.log
Logger.log('Debug:', someVariable);

// View logs in Apps Script Editor: View → Logs
```

---

## Performance Optimization Tips

1. **Lazy Load Routes**:
```javascript
// router/index.js
{
  path: '/search',
  component: () => import('pages/SearchPage.vue')
}
```

2. **Debounce Search Input**:
```javascript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(() => {
  // Search logic
}, 300)
```

3. **Cache API Responses**:
```javascript
// Use Pinia store to cache search results
const metadataStore = useMetadataStore()
if (metadataStore.hasCache(query)) {
  return metadataStore.getCache(query)
}
```

4. **Optimize Bundle Size**:
```javascript
// quasar.config.js
framework: {
  components: ['QBtn', 'QInput'], // Import only used components
  plugins: ['Notify', 'Loading']
}
```

---

## Deployment

### Frontend Deployment

Deploy to static hosting (Netlify, Vercel, GitHub Pages):

```bash
# Build production bundle
npm run build

# Deploy dist/spa/ folder to hosting service
```

### Backend Deployment

Deploy new GAS version:

```bash
cd gas
clasp push
clasp deploy --description "v1.0.0 - Initial release"
```

Update frontend `.env` with new Web App URL if changed.

---

## Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Quasar Framework Documentation](https://quasar.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Project Constitution](.specify/memory/constitution.md)
- [API Contracts](./contracts/)
- [Data Model](./data-model.md)

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review API contracts and data model
3. Check project constitution for requirements
4. Create issue in project repository

---

**Happy Coding! 🚀**
