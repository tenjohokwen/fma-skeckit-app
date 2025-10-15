---
description: "Task list for Improved File Navigation UX feature implementation"
---

# Tasks: Improved File Navigation UX

**Input**: Design documents from `/specs/002-improved-file-navigation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-spec.md

**Constitution Compliance**: All tasks must adhere to the project constitution at `.specify/memory/constitution.md`. This includes:
- Using Vue 3 `<script setup>` and Composition API exclusively
- Plain JavaScript only (no TypeScript)
- Functional component splitting with single responsibility
- Component size limits (≤250 lines)
- Design system adherence (colors, typography, layout)
- Performance requirements (lazy loading, efficient reactivity, cleanup)
- Accessibility and responsive design requirements
- Google Apps Script architecture (Security Interceptor → Router → Handler pattern)

**Tests**: Tests are NOT included as they were not requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Frontend: `src/` at repository root
- Backend: `gas/` at repository root
- Tests: `tests/` at repository root

---

## Phase 1: Setup & Configuration

**Purpose**: Install dependencies and configure project infrastructure

- [X] T001 [P] [SETUP] Install Fuse.js for fuzzy search: Run `npm install --save fuse.js` at project root
- [X] T002 [P] [SETUP] Verify Quasar 2, Vue 3, Pinia, and Vue Router dependencies are installed per package.json
- [ ] T003 [P] [SETUP] Create Google Sheets worksheet named "Clients" with columns: clientId, firstName, lastName, nationalId, telephone, email, folderId, createdAt, updatedAt

---

## Phase 2: Foundational Infrastructure (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] [FOUNDATION] Create authentication composable at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/composables/useAuth.js` with token management (get, set, refresh, clear) and 15-minute TTL handling
- [X] T005 [P] [FOUNDATION] Update API service at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/services/api.js` to include token in all requests, handle token refresh from responses, and implement error handling with Quasar notify
- [X] T006 [P] [FOUNDATION] Create notification composable at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/composables/useNotification.js` wrapping Quasar's $q.notify for consistent success/error messages
- [X] T007 [P] [FOUNDATION] Update Google Sheets service at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/services/SheetsService.gs` to include methods: getClientByNationalId, getClientById, getAllClients, createClient, updateClient with proper error handling
- [X] T008 [P] [FOUNDATION] Update Drive service at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/services/DriveService.gs` to include methods: createFolder, getFolderById, listFolderContents, uploadFile, deleteFile, renameFile, deleteFolder with proper error handling
- [X] T009 [FOUNDATION] Add routes to `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/router/routes.js` for SearchPage (/search), ClientManagementPage (/clients/:clientId), and FileManagementPage (/files/:pathMatch(.*)*) with lazy loading
- [X] T010 [P] [FOUNDATION] Add i18n key structure to `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/i18n/en-US/index.js` for client (search, create, validation), case (create, validation), file (upload, download, delete, rename), folder (delete), and validation messages
- [X] T011 [P] [FOUNDATION] Add i18n key structure to `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/i18n/fr-FR/index.js` with French translations matching en-US structure
- [X] T012 [P] [FOUNDATION] Create file icons composable at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/composables/useFileIcons.js` with getIconForFile and getIconForFolder functions using Material Icons mapping (pdf, doc, docx, xls, xlsx, jpg, png, zip, folder, default)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Client Search and Discovery (Priority: P1) 🎯 MVP

**Goal**: Users can search for existing clients using fuzzy search with first name, last name, and national ID

**Independent Test**: Search for clients with valid/typo data, verify results display correctly with client details

### Implementation for User Story 1

- [X] T013 [P] [US1] Create Client Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/client.js` with state: clients (array), selectedClient (object), searchQuery (string), searchResults (array), loading (boolean), error (string); actions: searchClients, selectClient, clearSearch
- [X] T014 [P] [US1] Create fuzzy search composable at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/composables/useSearch.js` wrapping Fuse.js with options: keys [firstName, lastName, nationalId], threshold 0.4, ignoreLocation true, minMatchCharLength 2; export searchClients function
- [X] T015 [US1] Implement GAS client.search endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/ClientHandler.gs` with search method that validates at least one search criterion exists, queries Sheets for matching clients, returns standardized response with clients array and count
- [X] T016 [US1] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "client.search" to ClientHandler.search
- [X] T017 [P] [US1] Create ClientSearchForm component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/search/ClientSearchForm.vue` with QForm, QInput fields for firstName, lastName, nationalId, QBtn for search; emit search event with form data; add debouncing (300ms); max 250 lines
- [X] T018 [P] [US1] Create ClientSearchResults component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/search/ClientSearchResults.vue` with QList of clients showing firstName, lastName, telephone, nationalId, email; display "Create New Case" button when results exist; display "Create New Client" option when no results; max 250 lines
- [X] T019 [US1] Create SearchPage at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/pages/SearchPage.vue` that composes ClientSearchForm and ClientSearchResults; handle search event by calling store searchClients action; wire up fuzzy search composable with Fuse.js on results; show loading state with QSpinner; max 250 lines
- [X] T020 [US1] Wire up client search flow in SearchPage: on form submit, call API client.search endpoint via api.js, store results in Client store, apply fuzzy search filtering, update ClientSearchResults with filtered results, show success/error notifications

**Checkpoint**: User Story 1 MVP complete - Users can search for clients with fuzzy matching and see results

---

## Phase 4: User Story 2 - Client Creation (Priority: P2)

**Goal**: Users can create new client records with automatic folder creation in Google Drive

**Independent Test**: Create client with valid/invalid data, verify folder created in Drive with format "FirstName_LastName_NationalID"

### Implementation for User Story 2

- [X] T021 [US2] Implement GAS client.create endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/ClientHandler.gs` with create method that validates required fields (firstName, lastName, nationalId), checks national ID uniqueness, generates UUID for clientId, sanitizes names for folder creation, creates folder "cases/{firstName}_{lastName}_{nationalId}", stores client record in Sheets with folderId, returns standardized response with client object and folderPath
- [X] T022 [US2] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "client.create" to ClientHandler.create
- [X] T023 [US2] Add client creation action to Client Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/client.js`: createClient function that calls API client.create endpoint, handles validation errors, adds new client to clients array, shows success notification
- [X] T024 [P] [US2] Create ClientForm component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/clients/ClientForm.vue` with QForm containing QInput fields for firstName (required), lastName (required), nationalId (required), telephone (optional), email (optional); implement validation rules (required fields, email format, max lengths); emit submit event; max 250 lines
- [X] T025 [US2] Add client creation to SearchPage at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/pages/SearchPage.vue`: show QDialog with ClientForm when "Create New Client" clicked; on form submit, call store createClient action; on success, close dialog, show success message, navigate to client details page; handle validation errors with field-specific messages
- [X] T026 [US2] Add form validation to ClientForm component: implement Quasar validation rules (required, maxLength, email format); show error messages below fields; disable submit button when form invalid; clear errors on input change

**Checkpoint**: User Story 2 complete - Users can create new clients with automatic folder creation

---

## Phase 5: User Story 3 - View Client Details and Cases (Priority: P3)

**Goal**: Users can view client information and see all associated cases with file counts

**Independent Test**: Select client with existing cases, verify all details and case information display with accurate file counts

### Implementation for User Story 3

- [X] T027 [US3] Implement GAS client.get endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/ClientHandler.gs` with get method that validates clientId exists in Sheets, retrieves client record, gets client's Drive folder, lists all subfolders (cases), counts files in each case folder, returns standardized response with client object, cases array (caseId, folderId, fileCount, timestamps), and caseCount
- [X] T028 [US3] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "client.get" to ClientHandler.get
- [X] T029 [US3] Add getClientDetails action to Client Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/client.js`: getClientDetails function that calls API client.get endpoint, stores client and cases data, handles 404 errors
- [X] T030 [P] [US3] Create ClientDetails component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/clients/ClientDetails.vue` with QCard showing client info in read-only format using QField: firstName, lastName, telephone, nationalId, email; use Quasar grid for responsive layout; max 250 lines
- [X] T031 [P] [US3] Create CaseList component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/cases/CaseList.vue` with QList of cases showing caseId, fileCount as "X files" badge; each case as clickable QItem; emit caseClick event with caseId and folderId; sort cases by creation date (newest first); max 250 lines
- [X] T032 [US3] Create ClientManagementPage at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/pages/ClientManagementPage.vue` that composes ClientDetails and CaseList; load client details on mount using route param clientId; handle caseClick event to navigate to FileManagementPage with folder path; show loading state with QSkeleton; handle errors with QBanner; max 250 lines
- [X] T033 [US3] Add case file count logic to GAS DriveService at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/services/DriveService.gs`: add countFilesInFolder method that recursively counts files (not folders) in given folder ID

**Checkpoint**: User Story 3 complete - Users can view client details and navigate to cases

---

## Phase 6: User Story 4 - Case Creation (Priority: P4)

**Goal**: Users can create cases for clients with automatic folder creation and navigation

**Independent Test**: Create case for existing client, verify folder structure "cases/ClientFolder/CaseID" and auto-navigation

### Implementation for User Story 4

- [X] T034 [US4] Create GAS CaseHandler at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/CaseHandler.gs` with create method that validates clientId exists in Sheets, gets client's folderId, checks case ID uniqueness within client folder, creates subfolder with caseId as name, returns standardized response with case object (caseId, clientId, folderId, folderPath, fileCount 0, timestamps)
- [X] T035 [US4] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "case.create" to CaseHandler.create
- [X] T036 [P] [US4] Create CaseForm component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/cases/CaseForm.vue` with QForm containing QInput field for caseId (required); validation rules: alphanumeric + underscore/hyphen, 1-100 chars; emit submit event; max 250 lines
- [X] T037 [US4] Add case creation to ClientDetailsPage at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/pages/ClientDetailsPage.vue`: add "Create New Case" button; show QDialog with CaseForm when clicked; on form submit, call API case.create endpoint via api.js with clientId from route; on success, close dialog, reload client details to show new case; handle validation errors (duplicate caseId, invalid format)
- [X] T038 [US4] Add uniqueness validation to case creation: in GAS CaseHandler.create, list all subfolders in client folder, check if caseId matches any existing folder name (case-sensitive), return 409 error with msgKey "case.create.error.duplicate" if duplicate found

**Checkpoint**: User Story 4 complete - Users can create cases with folder structure and auto-navigation

---

## Phase 7: User Story 5 - File Upload to Case (Priority: P5)

**Goal**: Users can upload multiple files with optional display names and see upload progress

**Independent Test**: Upload multiple files to case folder, verify progress indicators, success messages, and list refresh

### Implementation for User Story 5

- [ ] T039 [US5] Create GAS FileHandler at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/FileHandler.gs` with upload method that validates caseFolderId exists, processes files array, decodes base64 content for each file, creates blob with MIME type, uses displayName if provided else fileName, creates file in Drive folder, returns standardized response with results array (per-file success/error), successCount, failureCount; handle 50MB size limit
- [ ] T040 [US5] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "file.upload" to FileHandler.upload
- [ ] T041 [P] [US5] Create Files Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/files.js` with state: currentFolderContents (object with files and folders arrays), uploadProgress (object map fileName to percentage), loading (boolean), error (string); actions: uploadFiles, listFolderContents, downloadFile, deleteFile, renameFile
- [ ] T042 [P] [US5] Create file operations composable at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/composables/useFileOperations.js` with uploadFile function that chunks large files (1MB chunks) for progress tracking, encodes to base64, sends to API file.upload endpoint, emits progress events; validate file size (<50MB)
- [ ] T043 [US5] Create FileUpload component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/files/FileUpload.vue` with QFile for multiple file selection, QList showing selected files with QInput for display name per file, QLinearProgress showing upload percentage per file, upload button that calls useFileOperations.uploadFile for each file, emit uploadComplete event; max 250 lines
- [ ] T044 [US5] Add file upload to FileManagementPage: integrate FileUpload component; on uploadComplete event, call Files store listFolderContents action to refresh list; show success notification for each successful upload; show error notification for failures; update uploadProgress state from FileUpload component
- [ ] T045 [US5] Add progress tracking to file upload flow: in useFileOperations.uploadFile composable, calculate progress as (currentChunk / totalChunks) * 100; emit progress events; update Files store uploadProgress map; FileUpload component binds QLinearProgress to store uploadProgress for each file

**Checkpoint**: User Story 5 complete - Users can upload files with progress tracking

---

## Phase 8: User Story 6 - Breadcrumb Navigation (Priority: P6)

**Goal**: Users can see current folder path and click to navigate to any parent level

**Independent Test**: Navigate deep into folders, click breadcrumbs at different levels, verify navigation works

### Implementation for User Story 6

- [ ] T046 [P] [US6] Create Navigation Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/navigation.js` with state: currentPath (array of PathSegment objects with folderId, folderName, type); computed: breadcrumbs (array derived from currentPath with isClickable and route properties); actions: navigateToFolder, navigateToIndex, reset, getCurrentFolderId, getParentFolderId
- [ ] T047 [P] [US6] Create navigation composable at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/composables/useNavigation.js` that wraps Navigation store for breadcrumb state management; export functions: pushFolder, popToIndex, resetToRoot, getCurrentFolder
- [ ] T048 [US6] Create BreadcrumbNav component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/files/BreadcrumbNav.vue` with QBreadcrumbs displaying Navigation store breadcrumbs; each crumb shows folderName; clickable crumbs (isClickable=true) call store navigateToIndex action; current location (last crumb) not clickable; use QBreadcrumbsEl for each segment; responsive design with text truncation on mobile (<375px); max 250 lines
- [ ] T049 [US6] Add breadcrumb state updates to FileManagementPage at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/pages/FileManagementPage.vue`: on mount, parse route param pathMatch to reconstruct breadcrumb path; when navigating into folder, call Navigation store navigateToFolder action; when breadcrumb clicked, call navigateToIndex and navigate to parent folder; integrate BreadcrumbNav component at top of page
- [ ] T050 [US6] Make breadcrumb segments clickable: in BreadcrumbNav component, add @click handler to each crumb except last; on click, call Navigation store navigateToIndex with crumb index; emit navigate event with target folderId; parent (FileManagementPage) listens to navigate event and loads folder contents
- [ ] T051 [US6] Add mobile responsiveness to BreadcrumbNav: use Quasar breakpoint composable to detect mobile; on mobile, show only last 2 breadcrumb segments with ellipsis (...) for earlier ones; add horizontal scroll for overflow; test on 375px width viewport; use q-breadcrumbs responsive props

**Checkpoint**: User Story 6 complete - Breadcrumb navigation functional on desktop and mobile

---

## Phase 9: User Story 7 - Browse and View Folder Contents (Priority: P7)

**Goal**: Users can click folders to see contents with files and subfolders sorted and displaying metadata

**Independent Test**: Click into various folders, verify contents display with correct sorting (folders first, alphabetical), icons, and last modified dates

### Implementation for User Story 7

- [ ] T052 [US7] Implement GAS file.list endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/FileHandler.gs` with list method that validates folderId exists, gets all files and subfolders using DriveApp, extracts metadata (name, size, MIME type, timestamps, URLs) for files, extracts metadata (name, itemCount, timestamps) for folders, formats file sizes (bytes to KB/MB/GB), returns standardized response with folders array, files array, folderCount, fileCount
- [ ] T053 [US7] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "file.list" to FileHandler.list
- [ ] T054 [US7] Add listFolderContents action to Files Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/files.js`: listFolderContents function that calls API file.list endpoint with folderId, stores folders and files in currentFolderContents state, handles 404 errors, sorts results (folders first alphabetically, then files alphabetically)
- [ ] T055 [US7] Create FolderBrowser component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/files/FolderBrowser.vue` (renamed from FileList) with QList displaying folders first then files; each folder shows folder icon (from useFileIcons), name, item count badge (e.g., "8 items"), last modified date; each file shows file type icon (from useFileIcons), name, size formatted, last modified date; use QItem for each entry; emit folderClick and fileClick events; max 250 lines
- [ ] T056 [US7] Add file type icons to FolderBrowser: import useFileIcons composable; for each file, call getIconForFile(fileName) to get icon name and color; for each folder, call getIconForFolder() to get folder icon; render QIcon with icon name and color from composable; ensure icons align left in QItemSection avatar slot
- [ ] T057 [US7] Add folder/file sorting to Files store listFolderContents action: after receiving data from API, sort folders array alphabetically by name; sort files array alphabetically by name; concatenate sorted folders then sorted files for display order; store in currentFolderContents
- [ ] T058 [US7] Display item counts for folders in FolderBrowser: for each folder item, show itemCount as badge using QBadge with label "X items" (singular "1 item", plural "N items"); position badge on right side of QItem using QItemSection side slot
- [ ] T059 [US7] Add last modified dates to FolderBrowser: for each item (folder or file), format modifiedAt timestamp using date-fns or Quasar date utils to "YYYY-MM-DD HH:mm" format; display in QItemSection label slot below item name with smaller text size and grey color
- [ ] T060 [US7] Wire up folder browsing in FileManagementPage: on folderClick event from FolderBrowser, update Navigation store with navigateToFolder action; call Files store listFolderContents with new folderId; update browser URL with Vue Router push; show loading state with QSpinner while fetching

**Checkpoint**: User Story 7 complete - Users can browse folders and see organized contents

---

## Phase 10: User Story 8 - Download Files (Priority: P8)

**Goal**: Users can download files with display names preserved

**Independent Test**: Click download on various file types, verify files download with correct filenames

### Implementation for User Story 8

- [ ] T061 [US8] Implement GAS file.download endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/FileHandler.gs` with download method that validates fileId exists using DriveApp, generates download URL, retrieves file metadata (name, MIME type, size), returns standardized response with fileId, fileName, downloadUrl, mimeType, size
- [ ] T062 [US8] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "file.download" to FileHandler.download
- [ ] T063 [US8] Add downloadFile action to Files Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/files.js`: downloadFile function that calls API file.download endpoint with fileId, receives downloadUrl, triggers browser download via window.open(downloadUrl), handles 404 errors, shows success notification
- [ ] T064 [US8] Create FileActions component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/files/FileActions.vue` with QBtn download button showing download icon (Material Icons "download"); on click, emit download event with fileId; use QTooltip to show "Download" label; max 250 lines (will expand in US9, US11)
- [ ] T065 [US8] Add download button to FolderBrowser component: for each file item, integrate FileActions component in QItemSection side slot; listen to download event and call Files store downloadFile action with fileId; show loading indicator on button during download
- [ ] T066 [US8] Wire up download with display name preservation: in Files store downloadFile action, after calling API file.download, use returned fileName (which includes displayName if set) when triggering window.open; browser will download file with correct name

**Checkpoint**: User Story 8 complete - Users can download files with correct names

---

## Phase 11: User Story 9 - Delete Files (Priority: P9)

**Goal**: Users can delete files with confirmation dialog

**Independent Test**: Delete file, verify confirmation dialog appears, file removed from list after confirmation

### Implementation for User Story 9

- [ ] T067 [US9] Implement GAS file.delete endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/FileHandler.gs` with delete method that validates fileId exists, gets file name before deletion, calls file.setTrashed(true) to move to trash, returns standardized response with fileId, fileName, deletedAt timestamp
- [ ] T068 [US9] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "file.delete" to FileHandler.delete
- [ ] T069 [US9] Add deleteFile action to Files Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/files.js`: deleteFile function that calls API file.delete endpoint with fileId, removes file from currentFolderContents.files array, shows success notification, handles 404 errors
- [ ] T070 [US9] Create deletion confirmation dialog in FileActions component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/files/FileActions.vue`: add delete QBtn with delete icon; on click, show QDialog with QCard confirming "Delete this file permanently?"; QCardActions with Cancel and Delete buttons; on Delete confirm, emit deleteFile event with fileId
- [ ] T071 [US9] Add delete button to FolderBrowser component: FileActions component already integrated (from US8); listen to deleteFile event from FileActions; call Files store deleteFile action with fileId; on success, file automatically removed from list via store reactivity
- [ ] T072 [US9] Wire up deletion with list refresh: in Files store deleteFile action, after successful API call, filter currentFolderContents.files array to remove deleted file by fileId; Vue reactivity will automatically update FolderBrowser component display; show success message using useNotification composable

**Checkpoint**: User Story 9 complete - Users can delete files with confirmation

---

## Phase 12: User Story 10 - Delete Folders (Priority: P10)

**Goal**: Users can delete entire folders with typed "DELETE" confirmation

**Independent Test**: Delete folder with contents, verify warning dialog, typed confirmation required, navigation to parent

### Implementation for User Story 10

- [ ] T073 [US10] Create GAS FolderHandler at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/FolderHandler.gs` with delete method that validates folderId exists, checks folder is not root "cases" folder (return 403 if protected), validates confirmation parameter is exactly "DELETE" (case-sensitive), counts total items recursively (files + subfolders), calls folder.setTrashed(true), returns standardized response with folderId, folderName, itemsDeleted count, deletedAt timestamp
- [ ] T074 [US10] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "folder.delete" to FolderHandler.delete
- [ ] T075 [US10] Add deleteFolder action to Files Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/files.js`: deleteFolder function that calls API folder.delete endpoint with folderId and confirmation string, handles validation errors (missing confirmation, protected folder), shows success notification
- [ ] T076 [US10] Create typed confirmation dialog in FileManagementPage at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/pages/FileManagementPage.vue`: add "Delete Folder" button in page header (QPageSticky or QBtn); on click, show QDialog with QCard; prominent warning text "This action is irreversible. All contents will be deleted."; QInput requiring user to type "DELETE" exactly; validate input matches "DELETE" case-sensitive; only enable Delete button when match confirmed; max 250 lines (component may be at limit, consider extracting dialog to separate component)
- [ ] T077 [US10] Add delete folder button to FileManagementPage: position "Delete Folder" button in header (top-right using Quasar QPageSticky or QToolbar); show only when not on root "cases" folder; on click, open typed confirmation dialog; on confirmation, call Files store deleteFolder action with current folderId and confirmation "DELETE"
- [ ] T078 [US10] Wire up deletion with parent navigation: in Files store deleteFolder action, after successful API call, get parent folderId from Navigation store using getParentFolderId; call Navigation store navigateToIndex with parent index; call Vue Router push to navigate to parent folder route; call listFolderContents for parent folder; show success message with itemsDeleted count

**Checkpoint**: User Story 10 complete - Users can delete folders with strong confirmation

---

## Phase 13: User Story 11 - File Renaming (Priority: P11)

**Goal**: Users can rename files with updated display in list

**Independent Test**: Rename file, verify new name displays immediately, change persists in Drive

### Implementation for User Story 11

- [ ] T079 [US11] Implement GAS file.rename endpoint in `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/handlers/FileHandler.gs` with rename method that validates fileId exists, validates newName is non-empty and within 255 chars, gets oldName before renaming, calls file.setName(newName), returns standardized response with fileId, oldName, newName, modifiedAt timestamp
- [ ] T080 [US11] Update GAS Router at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/gas/utils/Router.gs` to add route mapping for action "file.rename" to FileHandler.rename
- [ ] T081 [US11] Add renameFile action to Files Pinia store at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/stores/files.js`: renameFile function that calls API file.rename endpoint with fileId and newName, updates file name in currentFolderContents.files array by finding file with matching fileId, shows success notification, handles validation errors (empty name, invalid name)
- [ ] T082 [US11] Create rename dialog in FileActions component at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/components/files/FileActions.vue`: add rename QBtn with edit icon; on click, show QDialog with QCard; QInput pre-filled with current fileName; QCardActions with Cancel and Rename buttons; validate newName non-empty and max 255 chars; on Rename confirm, emit renameFile event with fileId and newName; max 250 lines (component may need refactoring if over limit)
- [ ] T083 [US11] Add rename button to FolderBrowser component: FileActions component already integrated (from US8, US9); listen to renameFile event from FileActions; call Files store renameFile action with fileId and newName; on success, file name automatically updated in list via store reactivity
- [ ] T084 [US11] Wire up rename with list refresh: in Files store renameFile action, after successful API call, find file in currentFolderContents.files array by fileId; update file.name property to newName; Vue reactivity will automatically update FolderBrowser component display; show success message with old and new names

**Checkpoint**: User Story 11 complete - Users can rename files with immediate feedback

---

## Phase 14: Polish & Integration

**Purpose**: Cross-cutting improvements affecting multiple user stories

- [ ] T085 [P] [POLISH] Add loading states to all components: ClientSearchForm, ClientSearchResults, ClientForm, ClientDetails, CaseList, CaseForm, FileUpload, FolderBrowser, BreadcrumbNav; use QSpinner, QSkeleton, or QInnerLoading as appropriate for each component type
- [ ] T086 [P] [POLISH] Complete English i18n translations at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/i18n/en-US/index.js`: add all msgKey values used in GAS endpoints (client.search.success, client.create.success, case.create.success, file.upload.success, file.delete.success, file.rename.success, folder.delete.success, validation errors, etc.)
- [ ] T087 [P] [POLISH] Complete French i18n translations at `/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/i18n/fr-FR/index.js`: translate all English msgKey values to French equivalents maintaining same key structure
- [ ] T088 [P] [POLISH] Add error handling to all API calls: wrap api.js calls in try-catch blocks; use useNotification composable to show error messages; handle specific error codes (401 unauthorized, 404 not found, 409 conflict, 500 server error); display user-friendly messages from i18n
- [ ] T089 [POLISH] Mobile responsiveness testing: test all pages and components on 375px width viewport (iPhone SE); verify SearchPage, ClientManagementPage, FileManagementPage layouts work on mobile; check BreadcrumbNav truncation; verify QDialog modals fit on mobile screens; adjust Quasar grid classes as needed (col-12, col-md-6, etc.)
- [ ] T090 [P] [POLISH] Edge case handling for client creation: handle special characters in names (spaces, accents, hyphens) by sanitizing in GAS ClientHandler.create; prevent folder name conflicts by appending UUID if folder exists; handle Drive API permission errors with user-friendly messages
- [ ] T091 [P] [POLISH] Edge case handling for file uploads: handle duplicate filenames (Drive auto-renames, inform user); handle network interruptions (show retry option); handle files >50MB (show error before upload attempt); validate MIME types match file extensions
- [ ] T092 [P] [POLISH] Performance optimization for search: implement debouncing (300ms) on ClientSearchForm input fields; cache Fuse.js index in Client store to avoid re-indexing on every search; limit search results to 100 clients; show "X of Y results" indicator
- [ ] T093 [P] [POLISH] Performance optimization for folder browsing: cache folder contents in Files store for recently visited folders (Map with folder ID keys); implement loading skeletons (QSkeleton) while fetching folder contents; lazy load file thumbnails if implemented
- [ ] T094 [POLISH] Accessibility improvements: add aria-labels to all icon buttons (download, delete, rename); ensure WCAG AA contrast ratios for all text (verify with Quasar color classes); add keyboard navigation support for breadcrumbs (tab + enter); ensure form validation errors are announced to screen readers
- [ ] T095 [POLISH] Security hardening: verify all GAS endpoints validate token via SecurityInterceptor; check all user inputs are sanitized before Drive/Sheets operations; validate file MIME types server-side in FileHandler.upload; ensure folder deletion checks user permissions; add rate limiting for file uploads if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-13)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (US1 → US2 → US3 → ... → US11)
- **Polish (Phase 14)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **US3 (P3)**: Can start after Foundational (Phase 2) - Uses Client store from US1/US2 but independently testable
- **US4 (P4)**: Can start after Foundational (Phase 2) - Integrates with US3 but independently testable
- **US5 (P5)**: Can start after Foundational (Phase 2) - Requires Files store but independently testable
- **US6 (P6)**: Can start after Foundational (Phase 2) - Uses Navigation store independently
- **US7 (P7)**: Can start after Foundational (Phase 2) - Integrates with US6 but independently testable
- **US8 (P8)**: Depends on US7 (needs FolderBrowser component) - Adds download to file display
- **US9 (P9)**: Depends on US7/US8 (needs FolderBrowser and FileActions) - Adds delete to file display
- **US10 (P10)**: Can start after Foundational (Phase 2) - Independent folder deletion
- **US11 (P11)**: Depends on US7/US8/US9 (needs FileActions component) - Adds rename to file display

### Within Each User Story

- GAS handlers before router updates
- Store actions before components that use them
- Composables before components that use them
- Parent components before child component integration
- Core implementation before integration with other stories

### Parallel Opportunities

- **Phase 1**: All tasks marked [P] can run in parallel (T001, T002, T003)
- **Phase 2**: Tasks T004-T012 marked [P] can run in parallel
- **User Stories**: US1, US2, US3, US4, US5, US6, US10 can start in parallel after Phase 2 (independent implementations)
- **Within US1**: T013, T014, T017, T018 marked [P] can run in parallel
- **Within US2**: T024 can run in parallel with T021-T023
- **Within US3**: T030, T031 marked [P] can run in parallel after T027-T029 complete
- **Within US4**: T036 can run in parallel with T034-T035
- **Within US5**: T041, T042 marked [P] can run in parallel after T039-T040 complete
- **Within US6**: T046, T047 marked [P] can run in parallel
- **Phase 14**: Tasks T085-T095 marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Client Search)
4. Complete Phase 4: User Story 2 (Client Creation)
5. Complete Phase 5: User Story 3 (Client Details)
6. **STOP and VALIDATE**: Test search → create → view flow independently
7. Deploy/demo MVP (client management core)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Search) → Test independently → Deploy/Demo
3. Add US2 (Create Client) → Test with US1 → Deploy/Demo
4. Add US3 (View Client) → Test with US1+US2 → Deploy/Demo
5. Add US4 (Create Case) → Test with US1-US3 → Deploy/Demo
6. Add US5 (File Upload) → Test independently → Deploy/Demo
7. Add US6 (Breadcrumbs) → Test independently → Deploy/Demo
8. Add US7 (Browse Folders) → Test with US6 → Deploy/Demo
9. Add US8 (Download) → Test with US7 → Deploy/Demo
10. Add US9 (Delete Files) → Test with US7-US8 → Deploy/Demo
11. Add US10 (Delete Folders) → Test independently → Deploy/Demo
12. Add US11 (Rename) → Test with US7-US9 → Deploy/Demo
13. Polish phase → Final testing → Production release

### Parallel Team Strategy

With multiple developers after Phase 2:

- **Developer A**: US1 → US2 → US3 (Client management flow)
- **Developer B**: US6 → US7 (Navigation + browsing)
- **Developer C**: US4 → US5 (Case creation + file upload)
- **Developer D**: US8 → US9 → US11 (File operations)
- **Developer E**: US10 (Folder deletion)

Stories integrate at checkpoints with minimal conflicts.

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability (US1-US11)
- Each user story should be independently completable and testable
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently
- Component size limit is 250 lines - if FileActions or FileManagementPage exceed this during US9-US11, refactor by extracting dialogs to separate components
- All file paths are absolute paths from repository root
- Tests are NOT included as they were not requested in the specification
- Constitution compliance verified: Vue 3 Composition API, plain JavaScript, Quasar components, no TypeScript, functional splitting, performance optimization
