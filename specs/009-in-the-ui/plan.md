# Implementation Plan: Client Status Update Email Notifications

**Branch**: `009-in-the-ui` | **Date**: 2025-10-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-in-the-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

When case managers update a case status, the system prompts them via dialog to optionally send bilingual (English/French) email notifications to clients. The dialog includes language selection, requires notes updates when sending email, and handles edge cases like missing email addresses and delivery failures. The feature integrates with existing CaseEditor component, adds a new dialog component, extends backend handlers for email sending with templating, and retrieves signatures from Google Apps Script properties.

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend)
**Primary Dependencies**: Vue 3 (Composition API), Quasar 2, Pinia, Vue Router, Vite, Vitest, Vue Test Utils
**Storage**: Google Sheets (metadata), Google Drive (files), Script Properties (configuration)
**Testing**: Vitest + Vue Test Utils (frontend unit/component), Google Apps Script test utilities (backend)
**Target Platform**: Web browsers (desktop + mobile), Google Workspace environment
**Project Type**: Web application (Vue frontend + Google Apps Script backend)
**Performance Goals**:
- Dialog display <500ms after save click
- Email delivery within 30 seconds
- 95% email success rate
**Constraints**:
- Must work within Google Apps Script execution limits
- Email sending via GmailApp API
- Bilingual UI/email support (English/French)
**Scale/Scope**:
- Single dialog component + backend handler extension
- 2 email templates (EN/FR)
- Integration with existing metadata editing flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively, no Options API or `export default`
  - EmailNotificationDialog component will use `<script setup>`
  - Integration into CaseEditor will maintain existing `<script setup>` pattern
- [x] **Plain JavaScript**: No TypeScript syntax, interfaces, or type annotations
  - All code in plain JavaScript (.js and .vue files)
- [x] **Functional Component Splitting**: Each distinct feature is its own component with single responsibility
  - EmailNotificationDialog: dedicated component for email prompt
  - CaseEditor: retains case editing responsibility, delegates email dialog to child component
- [x] **Quasar Integration**: Uses Quasar components and composables consistently
  - q-dialog for modal, q-radio for language selection, q-input for notes
  - $q.notify() for error/success feedback
- [x] **Clean & Readable Code**: Components under 250 lines, reusable logic extracted to composables
  - EmailNotificationDialog estimated <150 lines
  - Email template logic extracted to utility function

### Testing Standards Compliance

- [x] **Component Isolation**: Each component has its own dedicated test file
  - EmailNotificationDialog.test.js will test dialog behavior independently
- [x] **Vitest + Vue Test Utils**: Tests written in plain JavaScript
  - All tests in .js files using Vitest/Vue Test Utils
- [x] **Realistic Test Scenarios**: Tests simulate actual user flows with edge cases
  - Tests will cover: accept/decline email, language selection, notes validation, cancellation

### UX Consistency Compliance

- [x] **Design System**: Follows color palette, typography, and layout structure specifications
  - Uses primary blue (#2563eb) for buttons
  - White backgrounds, standard typography
- [x] **Quasar Design Language**: Consistent padding, typography, Material Icons
  - Material Icons for email/warning icons
  - Standard Quasar spacing classes (q-pa-md, q-mt-md)
- [x] **Clear Feedback & States**: Loading indicators, `$q.notify()` for errors, success confirmations
  - Loading state during email send
  - Success notification on email sent
  - Error notifications for missing email/send failures
- [x] **Accessibility**: Form labels, WCAG AA contrast, keyboard navigation
  - All form fields labeled
  - Dialog keyboard navigable (Esc to close, Tab navigation)
- [x] **Responsive**: Uses Quasar grid system, mobile-tested
  - Dialog responsive with Quasar's default responsive behavior
  - Mobile-friendly radio buttons and inputs

### Performance Requirements Compliance

- [x] **Lazy Loading**: Route components are async, heavy components dynamically imported
  - EmailNotificationDialog can be dynamically imported if needed (currently small component)
- [x] **Efficient Reactivity**: Uses `computed` for derived state, debounced search inputs
  - Computed properties for validation states
  - No search inputs in this feature
- [x] **Network & Memory Hygiene**: Cancels requests on unmount, cleans up timers/listeners
  - Email send request cancellable via AbortController
- [x] **Bundle Awareness**: Imports only needed Quasar components, evaluates dependency impact
  - Only imports q-dialog, q-radio, q-input, q-btn (already in bundle)
  - No new dependencies

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Designed for mobile viewports first
  - Dialog tested on mobile viewports
- [x] **Internationalization**: Supports English and French via i18n keys
  - All dialog text via i18n keys
  - Email templates in both languages
- [x] **Progress Indicators**: Displays indicators for all async operations
  - Loading spinner during email send operation

### Google Apps Script Architecture Compliance (if applicable)

- [x] **Project Structure**: All GAS code written in `gas/` folder at project root
  - New code in gas/handlers/MetadataHandler.gs and gas/services/EmailService.gs
- [x] **Request Flow**: Follows Security Interceptor → Router → Handler → Response pattern
  - New endpoint follows existing routing pattern
- [x] **Security**: Validates tokens, uses PropertiesService for credentials
  - Uses existing security interceptor
  - SIGNATURE retrieved via PropertiesService
- [x] **Response Format**: Returns standardized JSON with status, msgKey, message, data, token
  - Follows existing ResponseHandler pattern

**Status**: ✅ ALL CHECKS PASSED - No constitution violations

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Frontend (Vue 3 + Quasar)
src/
├── components/
│   └── metadata/
│       ├── EmailNotificationDialog.vue      # NEW: Email prompt dialog
│       └── CaseEditor.vue                   # MODIFIED: Add dialog integration
├── composables/
│   └── useNotifications.js                  # EXISTING: Use for success/error feedback
├── i18n/
│   ├── en/
│   │   └── index.js                         # MODIFIED: Add dialog translations
│   └── fr/
│       └── index.js                         # MODIFIED: Add dialog translations
├── services/
│   └── api.js                               # MODIFIED: Add sendStatusEmail endpoint
└── utils/
    └── emailTemplates.js                    # NEW: Email template builder

# Backend (Google Apps Script)
gas/
├── handlers/
│   └── MetadataHandler.gs                   # MODIFIED: Add sendStatusEmail handler
├── services/
│   ├── EmailService.gs                      # MODIFIED: Add status notification method
│   └── SheetsService.gs                     # EXISTING: Read client email addresses
└── utils/
    └── emailTemplates.gs                    # NEW: Template generation functions

# Tests
tests/
└── unit/
    └── components/
        └── metadata/
            └── EmailNotificationDialog.test.js  # NEW: Dialog component tests
```

**Structure Decision**: Web application with Vue frontend and Google Apps Script backend. Frontend components in `src/components/metadata/`, backend handlers in `gas/handlers/`, services in `gas/services/`. Email templates split between frontend utils (template builder) and backend utils (server-side rendering with signature injection).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations**: All constitution checks passed. No complexity tracking required.
