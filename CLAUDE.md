# fma-skeckit-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-18

## Active Technologies
- JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Vitest + Vue Test Utils (testing) (001-use-the-information)
- JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Fuse.js (fuzzy search) (002-improved-file-navigation)
- Google Sheets (client metadata), Google Drive (file storage) (002-improved-file-navigation)
- ApexCharts (data visualization) + Vue 3, Quasar 2 (008-dashboard-analytics)
- JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3 (Composition API), Quasar 2, Pinia, Vue Router, Vite, Vitest, Vue Test Utils (009-in-the-ui)
- Google Sheets (metadata), Google Drive (files), Script Properties (configuration) (009-in-the-ui)
- JavaScript ES6+ (frontend), Vue 3 Composition API + Vue 3, Quasar 2, Vue Router (010-in-the-footer)
- N/A (no data persistence required) (010-in-the-footer)
- JavaScript ES6+ (frontend), Vue 3.5.20 with Composition API + Vue 3, Quasar 2.16.0, Vue Router 4, Pinia 3, vue-i18n 11, Vite (build) (011-as-a-user)
- N/A (no data model changes - frontend only) (011-as-a-user)

## Project Structure
```
src/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend): Follow standard conventions

## Recent Changes
- 011-as-a-user: UI simplified by removing FileManagementPage and ClientManagementPage
  - Navigation menu streamlined (2 fewer items: "Files" and "Clients" removed)
  - Routes cleaned up (/files and /clients removed, catch-all handles gracefully)
  - Bundle size reduced via Vite tree-shaking (FileManagementPage and ClientManagementPage excluded from build)
  - All core functionality preserved (Dashboard, Search, Profile, case management, auth flows)
  - MainLayout.vue reduced to 201 lines (from 233 lines)
  - Shared file components preserved (FileUploader, CaseFolderCreator used by CaseFilesPage)
- 010-in-the-footer: Footer branding and copyright added to all pages
  - "Powered by Virtues Cafe | Copyright © [year]" displays on all pages
  - Automatic year updates via computed property
  - Responsive design meeting WCAG AA contrast requirements
  - Minimal implementation (12 lines per layout)
- 009-in-the-ui: Email notification system for case status updates with bilingual support (English/French)
  - EmailNotificationDialog component with language selection and notes validation
  - Professional HTML email templates with signature support
  - Complete i18n integration for bilingual UI
  - Comprehensive test suite with 20+ test cases

## Feature: Email Notifications (009-in-the-ui)

### Overview
When case managers update a case status, the system prompts them to optionally send email notifications to clients in English or French.

### Components
- **EmailNotificationDialog.vue** (152 lines): Modal dialog for email notification prompt
  - Language selection (English/French)
  - Notes validation (requires note updates when sending email)
  - Full i18n support with dynamic locale switching
  - Located: `src/components/metadata/EmailNotificationDialog.vue`

### Backend
- **emailTemplates.gs** (317 lines): Email template generation
  - Professional HTML templates for both languages
  - Plain text fallbacks
  - Signature injection from PropertiesService
  - XSS protection with HTML escaping
  - Located: `gas/utils/emailTemplates.gs`

### Testing
- **EmailNotificationDialog.test.js** (705 lines): Component tests
  - 20+ test cases covering dialog behavior, validation, and i18n
  - Tests for English and French rendering
  - Locale switching validation
  - Located: `tests/unit/components/metadata/EmailNotificationDialog.test.js`

- **emailTemplates.test.gs** (500+ lines): Backend tests
  - 21 automated test cases for template generation
  - Tests for both languages, signature injection, validation
  - Manual email formatting verification function
  - Located: `gas/tests/emailTemplates.test.gs`

### Configuration
- **SIGNATURE Property**: Optional email signature in Google Apps Script PropertiesService
  - See: `specs/009-in-the-ui/SIGNATURE_SETUP.md`
- **i18n Translations**: English and French keys in `src/i18n/en-US/` and `src/i18n/fr-FR/`

### Documentation
- Implementation summary: `specs/009-in-the-ui/PHASE_6_SUMMARY.md`
- Email templates testing: `specs/009-in-the-ui/EMAIL_TEMPLATES_TESTING.md`
- CaseEditor integration guide: `specs/009-in-the-ui/CASEEDITOR_INTEGRATION.md`
- Test client setup: `specs/009-in-the-ui/TEST_CLIENT_SETUP.md`

### User Stories Implemented
1. ✅ **US1 (P1)**: Core dialog with language selection (partial - dialog only, backend pending)
2. ✅ **US2 (P2)**: Required notes field for email context
3. ✅ **US3 (P2)**: Bilingual email templates with professional styling
4. ✅ **US4 (P3)**: Bilingual dialog UI with complete i18n

### Next Steps
- Complete Phase 3 backend integration (CaseEditor, API, EmailService, MetadataHandler)
- End-to-end testing with real email delivery
- Performance optimization and accessibility testing

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
