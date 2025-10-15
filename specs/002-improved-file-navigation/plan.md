# Implementation Plan: Improved File Navigation UX

**Branch**: `002-improved-file-navigation` | **Date**: 2025-10-15 | **Spec**: /Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/specs/002-improved-file-navigation/spec.md
**Input**: Feature specification from `/specs/002-improved-file-navigation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature provides an improved file navigation UX that abstracts away the underlying file system structure from users. Users can search for clients using fuzzy search, create and manage client records, organize work into cases, and perform file operations (upload, download, delete, rename) through an intuitive click-based navigation interface with breadcrumb trails. The system integrates with Google Drive for file storage and uses Google Apps Script for backend operations, while providing a responsive Vue 3 frontend with Quasar components.

**Technical Approach**:
- Frontend: Vue 3 Composition API with Quasar components for UI, Pinia stores for state management, Fuse.js for fuzzy search
- Backend: Google Apps Script endpoints in `gas/` folder following Security Interceptor → Router → Handler pattern
- Storage: Google Sheets for client metadata, Google Drive folders for file organization
- Navigation: Breadcrumb component tracking folder hierarchy via Pinia store
- File Operations: Google Drive API via GAS with multipart upload, progress tracking

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend)
**Primary Dependencies**: Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Fuse.js (fuzzy search)
**Storage**: Google Sheets (client metadata), Google Drive (file storage)
**Testing**: Vitest + Vue Test Utils (frontend unit/component tests)
**Target Platform**: Web browsers (desktop and mobile), Google Apps Script runtime
**Project Type**: Web application (Vue frontend + GAS backend)
**Performance Goals**: Search results in <2s for 1000 clients, file uploads <15s for files <5MB, UI updates <3s after operations
**Constraints**: Google Drive API quotas, 15-minute token TTL, mobile-responsive (≥375px width), WCAG AA contrast
**Scale/Scope**: Up to 1000 clients, 11 user stories (P1-P11), 47 functional requirements, multi-language (EN/FR)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively, no Options API or `export default`
- [x] **Plain JavaScript**: No TypeScript syntax, interfaces, or type annotations
- [x] **Functional Component Splitting**: Each distinct feature is its own component with single responsibility
- [x] **Quasar Integration**: Uses Quasar components and composables consistently
- [x] **Clean & Readable Code**: Components under 250 lines, reusable logic extracted to composables

### Testing Standards Compliance

- [x] **Component Isolation**: Each component has its own dedicated test file
- [x] **Vitest + Vue Test Utils**: Tests written in plain JavaScript
- [x] **Realistic Test Scenarios**: Tests simulate actual user flows with edge cases

### UX Consistency Compliance

- [x] **Design System**: Follows color palette, typography, and layout structure specifications
- [x] **Quasar Design Language**: Consistent padding, typography, Material Icons
- [x] **Clear Feedback & States**: Loading indicators, `$q.notify()` for errors, success confirmations
- [x] **Accessibility**: Form labels, WCAG AA contrast, keyboard navigation
- [x] **Responsive**: Uses Quasar grid system, mobile-tested

### Performance Requirements Compliance

- [x] **Lazy Loading**: Route components are async, heavy components dynamically imported
- [x] **Efficient Reactivity**: Uses `computed` for derived state, debounced search inputs
- [x] **Network & Memory Hygiene**: Cancels requests on unmount, cleans up timers/listeners
- [x] **Bundle Awareness**: Imports only needed Quasar components, evaluates dependency impact

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Designed for mobile viewports first
- [x] **Internationalization**: Supports English and French via i18n keys
- [x] **Progress Indicators**: Displays indicators for all async operations

### Google Apps Script Architecture Compliance (if applicable)

- [x] **Project Structure**: All GAS code written in `gas/` folder at project root
- [x] **Request Flow**: Follows Security Interceptor → Router → Handler → Response pattern
- [x] **Security**: Validates tokens, uses PropertiesService for credentials
- [x] **Response Format**: Returns standardized JSON with status, msgKey, message, data, token

## Project Structure

### Documentation (this feature)

```
specs/002-improved-file-navigation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.md      # GAS API endpoint specifications
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Web Application Structure**: This project follows a web application architecture with a Vue 3 frontend and Google Apps Script backend.

```
src/                                    # Vue 3 Frontend
├── components/
│   ├── search/
│   │   ├── ClientSearchForm.vue        # Client search interface (US1)
│   │   └── ClientSearchResults.vue     # Display search results (US1)
│   ├── files/
│   │   ├── FileList.vue                # Display files and folders (US7)
│   │   ├── FileUpload.vue              # File upload with progress (US5)
│   │   ├── FileActions.vue             # Download/Delete/Rename buttons (US8-11)
│   │   └── BreadcrumbNav.vue           # Breadcrumb navigation (US6)
│   ├── clients/
│   │   ├── ClientForm.vue              # Create new client (US2)
│   │   └── ClientDetails.vue           # View client details (US3)
│   └── cases/
│       ├── CaseForm.vue                # Create new case (US4)
│       └── CaseList.vue                # Display client cases (US3)
├── pages/
│   ├── SearchPage.vue                  # Main search page
│   ├── ClientManagementPage.vue        # Client details and cases page
│   └── FileManagementPage.vue          # Folder browsing and file operations
├── composables/
│   ├── useSearch.js                    # Fuzzy search logic with Fuse.js
│   ├── useFileOperations.js            # Upload/download/delete/rename logic
│   ├── useAuth.js                      # Token management
│   └── useNavigation.js                # Breadcrumb state management
├── stores/
│   ├── client.js                       # Client state (Pinia)
│   ├── files.js                        # File/folder state (Pinia)
│   └── navigation.js                   # Navigation/breadcrumb state (Pinia)
├── services/
│   └── api.js                          # GAS API communication layer
├── i18n/
│   ├── en-US/
│   │   └── index.js                    # English translations
│   └── fr-FR/
│       └── index.js                    # French translations
└── router/
    └── routes.js                       # Route definitions

gas/                                    # Google Apps Script Backend
├── handlers/
│   ├── ClientHandler.gs                # Client operations (search, create, get)
│   ├── CaseHandler.gs                  # Case operations (create)
│   ├── FileHandler.gs                  # File operations (upload, list, download, delete, rename)
│   └── FolderHandler.gs                # Folder operations (delete)
├── services/
│   ├── DriveService.gs                 # Google Drive API wrapper
│   └── SheetsService.gs                # Google Sheets API wrapper for client metadata
├── utils/
│   ├── SecurityInterceptor.gs          # Token validation (existing)
│   ├── Router.gs                       # Request routing (existing)
│   └── ResponseHandler.gs              # Standardized response formatting (existing)
└── Code.gs                             # Main entry point with doPost

tests/                                  # Frontend Tests
├── components/
│   ├── search/
│   │   ├── ClientSearchForm.test.js
│   │   └── ClientSearchResults.test.js
│   ├── files/
│   │   ├── FileList.test.js
│   │   ├── FileUpload.test.js
│   │   ├── FileActions.test.js
│   │   └── BreadcrumbNav.test.js
│   ├── clients/
│   │   ├── ClientForm.test.js
│   │   └── ClientDetails.test.js
│   └── cases/
│       ├── CaseForm.test.js
│       └── CaseList.test.js
├── composables/
│   ├── useSearch.test.js
│   ├── useFileOperations.test.js
│   └── useNavigation.test.js
└── stores/
    ├── client.test.js
    ├── files.test.js
    └── navigation.test.js
```

**Structure Decision**: Selected web application structure to clearly separate Vue 3 frontend code (in `src/`) from Google Apps Script backend code (in `gas/`). This aligns with the constitution requirement that all GAS code must reside in the `gas/` folder at project root. The frontend follows Quasar's recommended structure with feature-based component organization, while the backend follows the Security Interceptor → Router → Handler pattern defined in the constitution.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected. All constitution requirements are satisfied by the planned architecture.
