# Tasks: File Management Application with User Authentication

**Input**: Design documents from `/specs/001-use-the-information/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Constitution Compliance**: All tasks must adhere to the project constitution at `.specify/memory/constitution.md`. This includes:
- Using Vue 3 `<script setup>` and Composition API exclusively
- Plain JavaScript only (no TypeScript)
- Functional component splitting with single responsibility
- Component size limits (≤250 lines)
- Test file per component
- Design system adherence (colors, typography, layout)
- Performance requirements (lazy loading, efficient reactivity, cleanup)
- Accessibility and responsive design requirements

**Tests**: Tests are included per constitution requirements. Each component must have its own test file.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `src/` at repository root
- **Backend**: `gas/` at repository root (per constitution)
- **Tests**: `tests/` at repository root
- All file paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure needed by all features

- [X] T001 [P] Configure Quasar 2 project with Vue 3 Composition API in `quasar.config.js`
- [X] T002 [P] Setup Vite build configuration in `vite.config.js`
- [X] T003 [P] Configure Vitest test runner in `vitest.config.js`
- [X] T004 [P] Install dependencies: Vue 3, Quasar 2, Vue Router, Pinia, Vue I18n, Vitest, Vue Test Utils
- [X] T005 [P] Create environment configuration file `.env` with GAS_API_URL placeholder
- [X] T006 [P] Setup i18n with English and French locale files in `src/i18n/en.json` and `src/i18n/fr.json`
- [X] T007 [P] Create design system CSS with constitution color palette in `src/assets/styles/design-system.css`
- [X] T008 Initialize Google Apps Script project structure in `gas/` folder
- [X] T009 [P] Setup Google Sheets "users" sheet with required headers (documented in docs/google-setup.md)
- [X] T010 [P] Setup Google Sheets "metadata" sheet with required headers (documented in docs/google-setup.md)
- [X] T011 [P] Create Google Drive "cases" root folder and note folder ID (documented in docs/google-setup.md)
- [X] T012 Configure GAS script properties (USERS_SHEET_ID, METADATA_SHEET_ID, CASES_FOLDER_ID) (documented in docs/google-setup.md)

---

## Phase 2: Foundational (Blocking Prerequisites) 🚧 IN PROGRESS

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation ✅ COMPLETE

- [X] T013 [P] Implement ResponseHandler utility in `gas/utils/ResponseHandler.gs` for standardized JSON responses
- [X] T014 [P] Implement PasswordUtil utility in `gas/utils/PasswordUtil.gs` (hash, verify, generate salt)
- [X] T015 [P] Implement DateUtil utility in `gas/utils/DateUtil.gs` (Africa/Douala timezone handling)
- [X] T016 [P] Implement TokenManager in `gas/security/TokenManager.gs` (generate, validate, 15-min TTL)
- [X] T017 Implement SecurityInterceptor in `gas/security/SecurityInterceptor.gs` (validate tokens)
- [X] T018 Implement central Router in `gas/utils/Router.gs` with doPost entry point (Main.gs created)
- [X] T019 [P] Implement UserService in `gas/services/UserService.gs` (CRUD operations for users sheet)
- [ ] T020 [P] Implement DriveService in `gas/services/DriveService.gs` (folder/file operations)
- [X] T021 [P] Implement EmailService in `gas/services/EmailService.gs` (send verification, OTP, notification emails)

### Frontend Foundation ✅ COMPLETE

- [X] T022 [P] Setup Pinia authStore in `src/stores/authStore.js` (user, token, isAuthenticated, isAdmin)
- [ ] T023 [P] Setup Pinia metadataStore in `src/stores/metadataStore.js` (case data cache) - Deferred to US3
- [X] T024 Create Vue Router configuration in `src/router/routes.js` with lazy-loaded routes and auth guards
- [X] T025 [P] Implement API client service in `src/services/api.js` (POST wrapper with token handling)
- [X] T026 [P] Create MainLayout component in `src/layouts/MainLayout.vue` with navigation and user menu
- [X] T027 [P] Create EmptyLayout component in `src/layouts/EmptyLayout.vue` for auth pages (mobile menu in MainLayout)
- [X] T028 [P] Create LanguageSwitcher component in `src/components/LanguageSwitcher.vue` (EN/FR toggle)
- [X] T029 [P] Create LoadingIndicator component in `src/components/shared/LoadingIndicator.vue` (Quasar spinner)
- [X] T030 [P] Create ErrorDisplay component in `src/components/shared/ErrorDisplay.vue` (error messages)
- [ ] T031 Create main App.vue with AppLayout integration - Already exists in Quasar project
- [X] T032 [P] Create useNotifications composable in `src/composables/useNotifications.js` (Quasar notify wrapper)

### Tests for Foundation

- [ ] T033 [P] Test authStore in `tests/stores/authStore.spec.js`
- [ ] T034 [P] Test metadataStore in `tests/stores/metadataStore.spec.js`
- [ ] T035 [P] Test AppLayout in `tests/components/layout/AppLayout.spec.js`
- [ ] T036 [P] Test MobileMenu in `tests/components/layout/MobileMenu.spec.js`
- [ ] T037 [P] Test LanguageSwitcher in `tests/components/layout/LanguageSwitcher.spec.js`
- [ ] T038 [P] Test LoadingIndicator in `tests/components/shared/LoadingIndicator.spec.js`
- [ ] T039 [P] Test ErrorDisplay in `tests/components/shared/ErrorDisplay.spec.js`
- [ ] T040 [P] Test useNotifications in `tests/composables/useNotifications.spec.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Email Verification (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts and verify their email addresses

**Independent Test**: Complete sign-up form → receive verification email → click link → account verified → can log in

### Backend for US1 ✅ COMPLETE

- [X] T041 Implement AuthHandler.signup in `gas/handlers/AuthHandler.gs` (validate, hash password, create user, send verification email)
- [X] T042 Implement AuthHandler.verifyEmail in `gas/handlers/AuthHandler.gs` (validate token, update status to VERIFIED)
- [X] T043 Implement AuthHandler.resendVerification in `gas/handlers/AuthHandler.gs` (generate new token, send email)
- [X] T044 Add signup, verifyEmail, resendVerification routes to Router in `gas/utils/Router.gs` (routes available)

### Frontend for US1

- [ ] T045 [P] Implement authService.signup in `src/services/authService.js` (API call for signup)
- [ ] T046 [P] Implement authService.verifyEmail in `src/services/authService.js` (API call for email verification)
- [ ] T047 [P] Implement authService.resendVerification in `src/services/authService.js` (API call for resend)
- [ ] T048 Create useAuth composable in `src/composables/useAuth.js` (signup, verify, resend logic)
- [ ] T049 [P] Create SignUpForm component in `src/components/auth/SignUpForm.vue` (name, email, password inputs)
- [ ] T050 Create SignUpPage in `src/pages/SignUpPage.vue` (integrates SignUpForm)
- [ ] T051 Create EmailVerificationPage in `src/pages/EmailVerificationPage.vue` (handles verification link)
- [ ] T052 Add i18n keys for US1 in `src/i18n/en.json` and `src/i18n/fr.json` (signup, verification messages)

### Tests for US1

- [ ] T053 [P] Test SignUpForm in `tests/components/auth/SignUpForm.spec.js` (renders, validates, submits)
- [ ] T054 [P] Test SignUpPage in `tests/pages/SignUpPage.spec.js` (integrates form, handles success/error)
- [ ] T055 [P] Test EmailVerificationPage in `tests/pages/EmailVerificationPage.spec.js` (handles token, shows success)
- [ ] T056 [P] Test useAuth composable (signup flow) in `tests/composables/useAuth.spec.js`

**Checkpoint**: User Story 1 complete - users can sign up and verify email

---

## Phase 4: User Story 2 - User Login and Password Recovery (Priority: P1)

**Goal**: Enable users to log in and recover forgotten passwords via OTP

**Independent Test**: Log in with credentials → access granted OR forgot password → receive OTP → reset password → log in

### Backend for US2 ✅ COMPLETE

- [X] T057 Implement AuthHandler.login in `gas/handlers/AuthHandler.gs` (validate credentials, check status/type, generate token)
- [X] T058 Implement AuthHandler.requestPasswordReset in `gas/handlers/AuthHandler.gs` (generate OTP, set expiry, send email)
- [X] T059 Implement AuthHandler.verifyOTP in `gas/handlers/AuthHandler.gs` (validate OTP and expiry, generate reset token)
- [X] T060 Implement AuthHandler.resetPassword in `gas/handlers/AuthHandler.gs` (validate reset token, hash new password, clear OTP)
- [X] T061 Add login, requestPasswordReset, verifyOTP, resetPassword routes to Router in `gas/utils/Router.gs` (routes available)

### Frontend for US2

- [ ] T062 [P] Implement authService.login in `src/services/authService.js` (API call for login)
- [ ] T063 [P] Implement authService.requestPasswordReset in `src/services/authService.js` (API call for password reset)
- [ ] T064 [P] Implement authService.verifyOTP in `src/services/authService.js` (API call for OTP verification)
- [ ] T065 [P] Implement authService.resetPassword in `src/services/authService.js` (API call for password reset)
- [ ] T066 Update useAuth composable in `src/composables/useAuth.js` (add login, password recovery logic)
- [ ] T067 [P] Create LoginForm component in `src/components/auth/LoginForm.vue` (email, password, forgot password link)
- [ ] T068 [P] Create ForgotPasswordForm component in `src/components/auth/ForgotPasswordForm.vue` (email input, send OTP button)
- [ ] T069 [P] Create OTPVerificationForm component in `src/components/auth/OTPVerificationForm.vue` (6-digit OTP input)
- [ ] T070 [P] Create ResetPasswordForm component in `src/components/auth/ResetPasswordForm.vue` (new password, confirm password)
- [ ] T071 Create LoginPage in `src/pages/LoginPage.vue` (integrates LoginForm, ForgotPasswordForm)
- [ ] T072 Add i18n keys for US2 in `src/i18n/en.json` and `src/i18n/fr.json` (login, password recovery messages)

### Tests for US2

- [ ] T073 [P] Test LoginForm in `tests/components/auth/LoginForm.spec.js` (renders, validates, submits)
- [ ] T074 [P] Test ForgotPasswordForm in `tests/components/auth/ForgotPasswordForm.spec.js` (renders, submits email)
- [ ] T075 [P] Test OTPVerificationForm in `tests/components/auth/OTPVerificationForm.spec.js` (validates OTP format)
- [ ] T076 [P] Test ResetPasswordForm in `tests/components/auth/ResetPasswordForm.spec.js` (validates password match)
- [ ] T077 [P] Test LoginPage in `tests/pages/LoginPage.spec.js` (login flow, password recovery flow)
- [ ] T078 [P] Test useAuth composable (login and password recovery flows) in `tests/composables/useAuth.spec.js`

**Checkpoint**: User Stories 1 AND 2 complete - full authentication system working

---

## Phase 5: User Story 3 - Search and View Client Case Metadata (Priority: P2)

**Goal**: Allow authenticated users to search for cases and view case information

**Independent Test**: Log in → search by name or case ID → view case cards with metadata

### Backend for US3

- [ ] T079 [P] Implement MetadataHandler.searchCasesByName in `gas/handlers/MetadataHandler.gs` (search by first/last name)
- [ ] T080 [P] Implement MetadataHandler.searchCaseByCaseId in `gas/handlers/MetadataHandler.gs` (search by case ID)
- [ ] T081 Add searchCasesByName, searchCaseByCaseId routes to Router in `gas/Router.gs`

### Frontend for US3

- [ ] T082 [P] Implement metadataService.searchByName in `src/services/metadataService.js` (API call for name search)
- [ ] T083 [P] Implement metadataService.searchByCaseId in `src/services/metadataService.js` (API call for case ID search)
- [ ] T084 Create useSearch composable in `src/composables/useSearch.js` (search logic, debouncing, loading state)
- [ ] T085 [P] Create SearchBar component in `src/components/search/SearchBar.vue` (search inputs with debouncing)
- [ ] T086 [P] Create CaseCard component in `src/components/search/CaseCard.vue` (displays case metadata, excludes system fields)
- [ ] T087 Create SearchPage in `src/pages/SearchPage.vue` (integrates SearchBar and CaseCard list)
- [ ] T088 Add search route to Vue Router in `src/router/index.js` (protected route, requires authentication)
- [ ] T089 Add i18n keys for US3 in `src/i18n/en.json` and `src/i18n/fr.json` (search labels, no results message)

### Tests for US3

- [ ] T090 [P] Test SearchBar in `tests/components/search/SearchBar.spec.js` (renders inputs, debounces search)
- [ ] T091 [P] Test CaseCard in `tests/components/search/CaseCard.spec.js` (displays metadata, hides system fields)
- [ ] T092 [P] Test SearchPage in `tests/pages/SearchPage.spec.js` (search flow, displays results, handles empty)
- [ ] T093 [P] Test useSearch composable in `tests/composables/useSearch.spec.js` (search logic, debouncing)

**Checkpoint**: User Story 3 complete - users can search and view cases

---

## Phase 6: User Story 4 - Admin Case Editing with Automatic Metadata Tracking (Priority: P2)

**Goal**: Allow admin users to edit case metadata with automatic audit tracking

**Independent Test**: Log in as admin → search case → edit fields → save → verify auto-fields updated (assignedAt, lastUpdatedBy, version)

### Backend for US4

- [ ] T094 [P] Implement MetadataHandler.getCaseForEdit in `gas/handlers/MetadataHandler.gs` (fetch case with version, admin only)
- [ ] T095 Implement MetadataHandler.updateCaseMetadata in `gas/handlers/MetadataHandler.gs` (version check, auto-update fields, admin only)
- [ ] T096 [P] Implement MetadataHandler.createCaseMetadata in `gas/handlers/MetadataHandler.gs` (create new case entry, admin only)
- [ ] T097 Add getCaseForEdit, updateCaseMetadata, createCaseMetadata routes to Router in `gas/Router.gs`

### Frontend for US4

- [ ] T098 [P] Implement metadataService.getCaseForEdit in `src/services/metadataService.js` (API call for fetching case)
- [ ] T099 [P] Implement metadataService.updateCase in `src/services/metadataService.js` (API call for updating case)
- [ ] T100 [P] Implement metadataService.createCase in `src/services/metadataService.js` (API call for creating case)
- [ ] T101 Create useMetadata composable in `src/composables/useMetadata.js` (fetch, update, version conflict handling)
- [ ] T102 [P] Create CaseEditor component in `src/components/metadata/CaseEditor.vue` (editable form for all case fields)
- [ ] T103 [P] Create FieldInput component in `src/components/metadata/FieldInput.vue` (reusable input with validation)
- [ ] T104 Create CaseEditPage in `src/pages/CaseEditPage.vue` (integrates CaseEditor, admin-only route guard)
- [ ] T105 Add edit route to Vue Router in `src/router/index.js` (protected route, requires admin role)
- [ ] T106 Add i18n keys for US4 in `src/i18n/en.json` and `src/i18n/fr.json` (edit labels, conflict message)

### Tests for US4

- [ ] T107 [P] Test CaseEditor in `tests/components/metadata/CaseEditor.spec.js` (renders fields, submits changes)
- [ ] T108 [P] Test FieldInput in `tests/components/metadata/FieldInput.spec.js` (renders input, validates)
- [ ] T109 [P] Test CaseEditPage in `tests/pages/CaseEditPage.spec.js` (edit flow, version conflict handling, admin guard)
- [ ] T110 [P] Test useMetadata composable in `tests/composables/useMetadata.spec.js` (update logic, version checking)

**Checkpoint**: User Story 4 complete - admins can edit cases with audit tracking

---

## Phase 7: User Story 5 - Admin Client Folder Creation (Priority: P3)

**Goal**: Allow admin users to create client folders in Google Drive

**Independent Test**: Log in as admin → search client (not found) → fill client form → submit → verify folder created in Drive

### Backend for US5

- [ ] T111 [P] Implement FileHandler.searchClientFolder in `gas/handlers/FileHandler.gs` (search by name and ID card number)
- [ ] T112 Implement FileHandler.createClientFolder in `gas/handlers/FileHandler.gs` (create Drive folder, check duplicates, admin only)
- [ ] T113 Add searchClientFolder, createClientFolder routes to Router in `gas/Router.gs`

### Frontend for US5

- [ ] T114 [P] Implement fileService.searchClientFolder in `src/services/fileService.js` (API call for client search)
- [ ] T115 [P] Implement fileService.createClientFolder in `src/services/fileService.js` (API call for folder creation)
- [ ] T116 Create useFileOperations composable in `src/composables/useFileOperations.js` (folder creation logic)
- [ ] T117 [P] Create ClientFolderCreator component in `src/components/files/ClientFolderCreator.vue` (search and create form)
- [ ] T118 Create ClientManagementPage in `src/pages/ClientManagementPage.vue` (integrates ClientFolderCreator, admin-only)
- [ ] T119 Add client management route to Vue Router in `src/router/index.js` (protected route, admin only)
- [ ] T120 Add i18n keys for US5 in `src/i18n/en.json` and `src/i18n/fr.json` (client form labels)

### Tests for US5

- [ ] T121 [P] Test ClientFolderCreator in `tests/components/files/ClientFolderCreator.spec.js` (search, create, duplicate handling)
- [ ] T122 [P] Test ClientManagementPage in `tests/pages/ClientManagementPage.spec.js` (admin guard, folder creation flow)
- [ ] T123 [P] Test useFileOperations composable (folder creation) in `tests/composables/useFileOperations.spec.js`

**Checkpoint**: User Story 5 complete - admins can create client folders

---

## Phase 8: User Story 6 - Admin Case Folder Creation and File Upload (Priority: P3)

**Goal**: Allow admin users to create case folders and upload files with conflict resolution

**Independent Test**: Log in as admin → find client → create case folder → upload file → handle conflicts (overwrite/rename/cancel)

### Backend for US6

- [ ] T124 [P] Implement FileHandler.createCaseFolder in `gas/handlers/FileHandler.gs` (create case folder within client folder)
- [ ] T125 Implement FileHandler.uploadFile in `gas/handlers/FileHandler.gs` (upload with conflict detection, admin only)
- [ ] T126 Implement FileHandler.resolveFileConflict in `gas/handlers/FileHandler.gs` (overwrite/rename/cancel logic)
- [ ] T127 Add createCaseFolder, uploadFile, resolveFileConflict routes to Router in `gas/Router.gs`

### Frontend for US6

- [ ] T128 [P] Implement fileService.createCaseFolder in `src/services/fileService.js` (API call for case folder creation)
- [ ] T129 [P] Implement fileService.uploadFile in `src/services/fileService.js` (API call for file upload)
- [ ] T130 [P] Implement fileService.resolveConflict in `src/services/fileService.js` (API call for conflict resolution)
- [ ] T131 Update useFileOperations composable in `src/composables/useFileOperations.js` (upload logic, conflict handling)
- [ ] T132 [P] Create CaseFolderCreator component in `src/components/files/CaseFolderCreator.vue` (case ID input, create button)
- [ ] T133 [P] Create FileUploader component in `src/components/files/FileUploader.vue` (file selection, progress, conflict detection)
- [ ] T134 [P] Create FileConflictDialog component in `src/components/files/FileConflictDialog.vue` (overwrite/rename/cancel options)
- [ ] T135 Add file upload functionality to ClientManagementPage or create dedicated FileManagementPage
- [ ] T136 Add i18n keys for US6 in `src/i18n/en.json` and `src/i18n/fr.json` (upload labels, conflict options)

### Tests for US6

- [ ] T137 [P] Test CaseFolderCreator in `tests/components/files/CaseFolderCreator.spec.js` (creates case folder)
- [ ] T138 [P] Test FileUploader in `tests/components/files/FileUploader.spec.js` (file selection, upload, progress)
- [ ] T139 [P] Test FileConflictDialog in `tests/components/files/FileConflictDialog.spec.js` (displays options, user choice)
- [ ] T140 [P] Test useFileOperations composable (upload and conflict) in `tests/composables/useFileOperations.spec.js`

**Checkpoint**: User Story 6 complete - admins can create case folders and upload files

---

## Phase 9: User Story 7 - Admin Folder Navigation and File Management (Priority: P4)

**Goal**: Allow admin users to navigate folders, download files, and delete files

**Independent Test**: Log in as admin → navigate folder tree → view files → download file → delete file (with confirmation)

### Backend for US7

- [ ] T141 [P] Implement FileHandler.listFolderContents in `gas/handlers/FileHandler.gs` (list folders and files with metadata)
- [ ] T142 [P] Implement FileHandler.downloadFile in `gas/handlers/FileHandler.gs` (generate download URL)
- [ ] T143 [P] Implement FileHandler.deleteFile in `gas/handlers/FileHandler.gs` (delete file from Drive, admin only)
- [ ] T144 Add listFolderContents, downloadFile, deleteFile routes to Router in `gas/Router.gs`

### Frontend for US7

- [ ] T145 [P] Implement fileService.listFolderContents in `src/services/fileService.js` (API call for folder listing)
- [ ] T146 [P] Implement fileService.downloadFile in `src/services/fileService.js` (API call for download URL)
- [ ] T147 [P] Implement fileService.deleteFile in `src/services/fileService.js` (API call for file deletion)
- [ ] T148 Update useFileOperations composable in `src/composables/useFileOperations.js` (navigation, download, delete logic)
- [ ] T149 [P] Create FolderNavigator component in `src/components/files/FolderNavigator.vue` (tree view, breadcrumb, file list)
- [ ] T150 Create FileManagementPage in `src/pages/FileManagementPage.vue` (integrates FolderNavigator, admin-only)
- [ ] T151 Add file management route to Vue Router in `src/router/index.js` (protected route, admin only)
- [ ] T152 Add i18n keys for US7 in `src/i18n/en.json` and `src/i18n/fr.json` (navigation labels, delete confirmation)

### Tests for US7

- [ ] T153 [P] Test FolderNavigator in `tests/components/files/FolderNavigator.spec.js` (renders tree, lists files, navigates)
- [ ] T154 [P] Test FileManagementPage in `tests/pages/FileManagementPage.spec.js` (navigation flow, download, delete with confirmation)
- [ ] T155 [P] Test useFileOperations composable (navigation, download, delete) in `tests/composables/useFileOperations.spec.js`

**Checkpoint**: All user stories complete - full feature set implemented

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T156 [P] Add route guards to protect authenticated and admin-only routes in `src/router/index.js`
- [ ] T157 [P] Implement global error handling in App.vue (catch unhandled errors, show user-friendly messages)
- [ ] T158 [P] Add loading states for all async operations (use LoadingIndicator component)
- [ ] T159 [P] Verify all Quasar components use design system colors from `src/assets/styles/design-system.css`
- [ ] T160 [P] Verify all text uses i18n keys (no hardcoded strings)
- [ ] T161 [P] Add accessibility attributes (aria-labels, alt text) to interactive elements
- [ ] T162 [P] Test responsive layouts on mobile viewports (<768px) for all pages
- [ ] T163 [P] Optimize bundle size by reviewing Quasar component imports in `quasar.config.js`
- [ ] T164 [P] Add network request cleanup in all components (AbortController in `onUnmounted`)
- [ ] T165 [P] Test all user flows in both English and French languages
- [ ] T166 [P] Add success notifications for all successful operations (using useNotifications)
- [ ] T167 [P] Add error handling for network failures and timeout scenarios
- [ ] T168 [P] Verify file upload size validation (10MB limit) on frontend and backend
- [ ] T169 [P] Add confirmation dialogs for all destructive actions (delete file, overwrite)
- [ ] T170 [P] Test concurrent edit scenario (version conflict handling) in CaseEditPage
- [ ] T171 Create or update README.md with setup instructions from quickstart.md
- [ ] T172 Document API endpoints and usage in README or separate docs
- [ ] T173 Add production build configuration and deployment instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order
  - US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → US5 (P3) → US6 (P3) → US7 (P4)
- **Polish (Phase 10)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Requires US1/US2 for login
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Requires US1/US2 for login, US3 for search
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Requires US1/US2 for login
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Requires US1/US2 for login, US5 for client folders
- **User Story 7 (P4)**: Can start after Foundational (Phase 2) - Requires US1/US2 for login, US6 for files to navigate

### Within Each User Story

- Backend handlers before frontend services
- Services before components
- Components before pages
- Pages before tests (or tests first if TDD)
- Tests marked [P] can run in parallel (different components)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - US1 and US2 can be implemented in parallel (both P1)
  - US3 and US4 can be implemented in parallel after auth is working (both P2)
  - US5, US6, US7 can be implemented in parallel after auth is working (P3-P4)
- All tests marked [P] within a user story can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Backend (sequential due to Router dependency)
T041: AuthHandler.signup
T042: AuthHandler.verifyEmail
T043: AuthHandler.resendVerification
T044: Add routes to Router

# Then frontend services (parallel)
T045 [P]: authService.signup
T046 [P]: authService.verifyEmail
T047 [P]: authService.resendVerification

# Then composable
T048: useAuth composable

# Then components (parallel)
T049 [P]: SignUpForm component
T050: SignUpPage (depends on T049)
T051: EmailVerificationPage

# Then i18n
T052: Add i18n keys

# Then tests (all parallel)
T053 [P]: Test SignUpForm
T054 [P]: Test SignUpPage
T055 [P]: Test EmailVerificationPage
T056 [P]: Test useAuth composable
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Registration & Verification)
4. Complete Phase 4: User Story 2 (Login & Password Recovery)
5. **STOP and VALIDATE**: Test full authentication flow independently
6. Deploy/demo if ready (minimal viable authentication system)

### Incremental Delivery

1. **Foundation**: Setup + Foundational → Infrastructure ready
2. **Auth MVP**: Add US1 + US2 → Test independently → Deploy/Demo
3. **Search & View**: Add US3 → Test independently → Deploy/Demo
4. **Admin Edit**: Add US4 → Test independently → Deploy/Demo
5. **File Management**: Add US5 + US6 + US7 → Test independently → Deploy/Demo
6. **Polish**: Add Phase 10 polish tasks → Final testing → Production release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T041-T056)
   - **Developer B**: User Story 2 (T057-T078)
   - **Developer C**: Foundation tests (T033-T040)
3. After US1+US2 complete:
   - **Developer A**: User Story 3 (T079-T093)
   - **Developer B**: User Story 4 (T094-T110)
   - **Developer C**: User Story 5 (T111-T123)
4. Continue parallel development of US6 and US7
5. All developers work on Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label (US1-US7) maps task to specific user story for traceability
- Each user story is independently completable and testable
- Constitution requires tests for all components - tests are mandatory, not optional
- All components must be under 250 lines (constitution requirement)
- All datetime operations must use Africa/Douala timezone
- All text must use i18n keys for English/French support
- All admin operations require role check (ROLE_ADMIN)
- Version number provides optimistic locking for concurrent edits
- File uploads have 10MB size limit (enforced frontend and backend)
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 173
**Setup Phase**: 12 tasks
**Foundational Phase**: 28 tasks
**User Story 1**: 16 tasks
**User Story 2**: 22 tasks
**User Story 3**: 15 tasks
**User Story 4**: 17 tasks
**User Story 5**: 13 tasks
**User Story 6**: 17 tasks
**User Story 7**: 15 tasks
**Polish Phase**: 18 tasks

**Parallel Opportunities**: 85+ tasks can be executed in parallel with proper team coordination
**MVP Scope**: Phases 1-4 (70 tasks) - Delivers complete authentication system
**Full Feature**: All 173 tasks - Delivers complete file management application
