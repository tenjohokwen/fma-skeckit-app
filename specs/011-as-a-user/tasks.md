# Tasks: Simplified UI - Remove File and Client Management Pages

**Input**: Design documents from `/specs/011-as-a-user/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Constitution Compliance**: All tasks must adhere to the project constitution at `.specify/memory/constitution.md`. This includes:
- Using Vue 3 `<script setup>` and Composition API exclusively
- Plain JavaScript only (no TypeScript)
- Functional component splitting with single responsibility
- Component size limits (≤250 lines)
- Design system adherence (colors, typography, layout)
- Performance requirements (lazy loading, efficient reactivity, cleanup)
- Accessibility and responsive design requirements

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `src/` at repository root
- **Tests**: `tests/` at repository root
- **Layouts**: `src/layouts/`
- **Pages**: `src/pages/`
- **Router**: `src/router/`
- **i18n**: `src/i18n/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify branch and prepare for implementation

- [x] **T001** [Setup] Verify currently on branch `011-as-a-user` via `git branch --show-current`
- [x] **T002** [Setup] Ensure development server is running (`npm run dev`) for hot-reload testing
- [x] **T003** [P] [Setup] Read FileManagementPage.vue at `src/pages/FileManagementPage.vue` to analyze imports and dependencies
- [x] **T004** [P] [Setup] Read ClientManagementPage.vue at `src/pages/ClientManagementPage.vue` to analyze imports and dependencies

**Checkpoint**: Branch verified, development environment ready, dependencies analyzed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Search for hard-coded navigation references that must be fixed BEFORE removing pages

**⚠️ CRITICAL**: Complete this phase before any removal to identify all code that needs updating

- [x] **T005** [Foundational] Search codebase for programmatic navigation to "files" route using grep pattern `router.push.*name.*['"]files['"]` in `src/` directory
- [x] **T006** [Foundational] Search codebase for programmatic navigation to "clients" route using grep pattern `router.push.*name.*['"]clients['"]` in `src/` directory
- [x] **T007** [Foundational] Search codebase for template navigation to "files" route using grep pattern `to=.*name.*['"]files['"]` in `src/` directory
- [x] **T008** [Foundational] Search codebase for template navigation to "clients" route using grep pattern `to=.*name.*['"]clients['"]` in `src/` directory
- [x] **T009** [Foundational] Document all hard-coded navigation references found in T005-T008 for removal/updating

**Checkpoint**: All navigation references identified - safe to proceed with removal

---

## Phase 3: User Story 1 - Remove File Management Navigation (Priority: P1) 🎯 MVP

**Goal**: Remove FileManagementPage and its menu entry to simplify navigation for all users

**Independent Test**:
1. Log in as any user role
2. Check navigation menu does NOT contain "Files" or "File Management" entry
3. Navigate to `/files` in browser → should show ErrorNotFound page
4. Verify Dashboard, Search, and Profile pages still work

### Implementation for User Story 1

- [x] **T010** [US1] Remove "Files" navigation menu item from `src/layouts/MainLayout.vue` (lines 107-117: entire q-item block with icon "folder")
- [x] **T011** [US1] Remove any hard-coded navigation references to "files" route identified in T005 and T007
- [x] **T012** [US1] Delete FileManagementPage.vue component file at `src/pages/FileManagementPage.vue`
- [x] **T013** [P] [US1] Search for and delete test file for FileManagementPage at `tests/unit/FileManagementPage.spec.js` (if exists)
- [x] **T014** [P] [US1] Search for FileManagementPage references in E2E tests at `tests/e2e/` and remove/update them
- [x] **T015** [US1] Verify MainLayout.vue line count is under 250 lines after removal
- [x] **T016** [US1] Run linter to verify no errors: `npm run lint`

**Manual Testing for US1**:
- [ ] **T017** [US1] Start dev server and log in as regular user
- [ ] **T018** [US1] Verify navigation drawer does NOT show "Files" menu item
- [ ] **T019** [US1] Manually navigate to `/files` → verify ErrorNotFound page displays
- [ ] **T020** [US1] Verify Dashboard page loads correctly
- [ ] **T021** [US1] Verify Search page loads correctly
- [ ] **T022** [US1] Verify Profile page loads correctly
- [ ] **T023** [US1] Test mobile responsive view (< 768px) → verify "Files" not in mobile drawer

**Checkpoint**: User Story 1 complete - "Files" menu item removed, FileManagementPage deleted, all retained functionality works

---

## Phase 4: User Story 2 - Remove Client Management Navigation (Priority: P2)

**Goal**: Remove ClientManagementPage and its menu entry to simplify admin interface

**Independent Test**:
1. Log in as admin user
2. Check navigation menu does NOT contain "Clients" or "Client Management" entry
3. Navigate to `/clients` in browser → should show ErrorNotFound page
4. Verify Search page still allows client/case management

### Implementation for User Story 2

- [x] **T024** [US2] Remove "Clients" navigation menu item from `src/layouts/MainLayout.vue` admin section (lines 127-137: entire q-item block with icon "people")
- [x] **T025** [US2] Evaluate if admin section header and separator (lines 121-125) should be removed (remove if no other admin items remain)
- [x] **T026** [US2] Remove any hard-coded navigation references to "clients" route identified in T006 and T008
- [x] **T027** [US2] Delete ClientManagementPage.vue component file at `src/pages/ClientManagementPage.vue`
- [x] **T028** [P] [US2] Search for and delete test file for ClientManagementPage at `tests/unit/ClientManagementPage.spec.js` (if exists)
- [x] **T029** [P] [US2] Search for ClientManagementPage references in E2E tests at `tests/e2e/` and remove/update them
- [x] **T030** [US2] Verify MainLayout.vue line count is under 250 lines after removal
- [x] **T031** [US2] Run linter to verify no errors: `npm run lint`

**Manual Testing for US2**:
- [ ] **T032** [US2] Log in as admin user
- [ ] **T033** [US2] Verify navigation drawer does NOT show "Clients" menu item in admin section
- [ ] **T034** [US2] Manually navigate to `/clients` → verify ErrorNotFound page displays
- [ ] **T035** [US2] Navigate to Search page → verify client search and case management still works
- [ ] **T036** [US2] Log in as non-admin user → verify navigation unchanged from their perspective
- [ ] **T037** [US2] Test mobile responsive view (< 768px) → verify "Clients" not in mobile admin drawer

**Checkpoint**: User Story 2 complete - "Clients" menu item removed, ClientManagementPage deleted, Search page functionality preserved

---

## Phase 5: User Story 3 - Clean Up Route Definitions (Priority: P3)

**Goal**: Remove route definitions from router configuration for clean, maintainable routing table

**Independent Test**:
1. Review `src/router/routes.js` → no routes reference FileManagementPage or ClientManagementPage
2. Run production build → verify FileManagementPage and ClientManagementPage are tree-shaken out
3. Attempt programmatic navigation to removed routes → gracefully fails

### Implementation for User Story 3

- [x] **T038** [US3] Remove `/files/:pathMatch(.*)*` route definition from `src/router/routes.js` (lines 79-83)
- [x] **T039** [US3] Remove `/clients` route definition from `src/router/routes.js` (lines 85-89)
- [x] **T040** [US3] Verify catch-all route `/:catchAll(.*)*` still exists at end of routes array (line 100-103)
- [x] **T041** [US3] Run linter to verify routes.js has no errors: `npm run lint`
- [x] **T042** [US3] Run production build to verify tree-shaking: `npm run build`

**Manual Testing for US3**:
- [ ] **T043** [US3] Review `src/router/routes.js` file → confirm no references to FileManagementPage.vue or ClientManagementPage.vue
- [ ] **T044** [US3] Verify production build at `dist/` directory completed successfully
- [ ] **T045** [US3] Check build output for bundle size reduction (FileManagementPage and ClientManagementPage should be absent)
- [ ] **T046** [US3] Manually navigate to `/files` → verify catch-all redirects to ErrorNotFound
- [ ] **T047** [US3] Manually navigate to `/clients` → verify catch-all redirects to ErrorNotFound

**Checkpoint**: User Story 3 complete - Routes removed, catch-all handles removed paths, production build optimized

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and verification across all user stories

### i18n Translation Cleanup (Optional)

- [x] **T048** [P] [Polish] Identify translation keys used exclusively by FileManagementPage by reviewing the deleted file
- [x] **T049** [P] [Polish] Identify translation keys used exclusively by ClientManagementPage by reviewing the deleted file
- [x] **T050** [Polish] Remove `navigation.files` translation key from `src/i18n/en-US/index.js` if not used elsewhere
- [x] **T051** [Polish] Remove `navigation.files` translation key from `src/i18n/fr-FR/index.js` if not used elsewhere
- [x] **T052** [Polish] Verify `navigation.cases` key (used by ClientManagementPage) is still needed by SearchPage before removing

### Dependency Cleanup

- [x] **T053** [Polish] Review imports from T003 (FileManagementPage dependencies) → search codebase to verify if any components/composables are ONLY used by FileManagementPage
- [x] **T054** [Polish] Review imports from T004 (ClientManagementPage dependencies) → search codebase to verify if any components/composables are ONLY used by ClientManagementPage
- [x] **T055** [Polish] Delete any components/composables found in T053-T054 that are truly exclusive (NOT used by Dashboard, Search, Profile, CaseDetailsPage, CaseEditPage, CaseFilesPage)

### Final Verification

- [x] **T056** [Polish] Run full test suite: `npm test`
- [x] **T057** [Polish] Run E2E test suite (if applicable): `npm run test:e2e`
- [x] **T058** [Polish] Run production build one final time: `npm run build`
- [x] **T059** [Polish] Verify all checkpoints from US1, US2, US3 still pass
- [x] **T060** [Polish] Review CLAUDE.md to ensure feature is documented in Recent Changes section

### Documentation

- [x] **T061** [Polish] Update CLAUDE.md Recent Changes section with:
  ```
  - 011-as-a-user: UI simplified by removing FileManagementPage and ClientManagementPage
    - Navigation menu streamlined (2 fewer items)
    - Routes cleaned up (/files and /clients removed)
    - Bundle size reduced via tree-shaking
    - All core functionality preserved (Dashboard, Search, Profile, case management)
  ```

**Final Checkpoint**: All user stories complete, tests passing, production build successful, documentation updated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T003-T004 analysis) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion (T005-T009)
- **User Story 2 (Phase 4)**: Depends on Foundational completion (T005-T009) - Can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (routes removed AFTER pages deleted)
- **Polish (Phase 6)**: Depends on all user stories completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independent
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent (can run parallel with US1)
- **User Story 3 (P3)**: Depends on US1 AND US2 completion - MUST run after page files are deleted

### Within Each User Story

**User Story 1**:
- T010 (remove menu) can run in parallel with T011 (remove nav refs)
- T012 (delete page) must run after T011 (to avoid broken refs)
- T013, T014 (delete tests) can run in parallel after T012
- T015-T016 (verify) must run after all deletions
- T017-T023 (manual testing) can run in parallel

**User Story 2**:
- T024-T025 (remove menu) can run in parallel with T026 (remove nav refs)
- T027 (delete page) must run after T026
- T028, T029 (delete tests) can run in parallel after T027
- T030-T031 (verify) must run after all deletions
- T032-T037 (manual testing) can run in parallel

**User Story 3**:
- T038, T039 (remove routes) can run in parallel
- T040-T042 (verify) sequential after T038-T039
- T043-T047 (manual testing) can run in parallel

### Parallel Opportunities

- **Setup**: T003 and T004 can run in parallel (different files)
- **Foundational**: T005, T006, T007, T008 can all run in parallel (different search patterns)
- **US1**: T013 and T014 can run in parallel (different test files)
- **US2**: T028 and T029 can run in parallel (different test files)
- **US1 & US2 Together**: Can work on both user stories simultaneously (different files, independent)
- **Polish**: T048-T049 can run in parallel, T050-T051 can run in parallel, T053-T054 can run in parallel

---

## Parallel Example: User Story 1 & 2

```bash
# After Foundational phase completes, launch both stories in parallel:

# Developer A or Agent 1: User Story 1
Task T010: "Remove Files menu item from MainLayout.vue"
Task T011: "Remove hard-coded navigation to files route"
Task T012: "Delete FileManagementPage.vue"
# ... continue US1 tasks

# Developer B or Agent 2: User Story 2
Task T024: "Remove Clients menu item from MainLayout.vue"
Task T026: "Remove hard-coded navigation to clients route"
Task T027: "Delete ClientManagementPage.vue"
# ... continue US2 tasks

# After both US1 and US2 complete:
# Single developer or Agent: User Story 3
Task T038: "Remove /files route from routes.js"
Task T039: "Remove /clients route from routes.js"
# ... continue US3 tasks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - CRITICAL
3. Complete Phase 3: User Story 1 (T010-T023)
4. **STOP and VALIDATE**:
   - Navigation menu has no "Files" entry
   - `/files` shows ErrorNotFound
   - Dashboard, Search, Profile all work
5. Can deploy at this point if desired (Files menu removed, simpler UI)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)** - "Files" removed
3. Add User Story 2 → Test independently → Deploy/Demo - "Clients" also removed
4. Add User Story 3 → Test independently → Deploy/Demo - Routes cleaned, bundle optimized
5. Polish → Final production release

### Parallel Team Strategy

With multiple developers or parallel agents:

1. Everyone completes Setup + Foundational together (T001-T009)
2. Once Foundational done (no hard-coded nav refs found):
   - **Developer A / Agent 1**: User Story 1 (T010-T023) - Remove Files
   - **Developer B / Agent 2**: User Story 2 (T024-T037) - Remove Clients
3. After both US1 and US2 complete:
   - **Single Developer / Agent**: User Story 3 (T038-T047) - Clean routes
4. **Everyone**: Polish tasks (T048-T061) - can parallelize i18n and dependency cleanup

### Sequential Strategy (Single Developer/Agent)

1. Setup (T001-T004): ~15 minutes
2. Foundational (T005-T009): ~15 minutes
3. User Story 1 (T010-T023): ~45 minutes
4. User Story 2 (T024-T037): ~45 minutes
5. User Story 3 (T038-T047): ~30 minutes
6. Polish (T048-T061): ~30 minutes
7. **Total**: ~3 hours

---

## Success Criteria

This feature is complete when:

1. ✅ Navigation menu contains NO "Files" or "Clients" menu items (SC-001)
2. ✅ Routes `/files` and `/clients` correctly show ErrorNotFound page (SC-004)
3. ✅ All retained pages function without degradation (SC-005):
   - Dashboard loads and displays correctly
   - Search page loads and allows searching/case management
   - Profile page loads and shows user info
   - CaseDetailsPage, CaseEditPage, CaseFilesPage work correctly
   - Auth pages (Login, Signup, EmailVerification) work correctly
4. ✅ Production build succeeds with smaller bundle size (SC-003)
5. ✅ All tests pass (SC-004)
6. ✅ Zero navigation errors or broken links (SC-004)
7. ✅ Zero dead code remains (SC-006)
8. ✅ Linter passes with no errors
9. ✅ CLAUDE.md updated with feature documentation

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **No tests included** - spec did not request TDD or test creation
- **CaseFilesPage preservation**: Distinct from FileManagementPage - KEEP IT
- **SearchPage preservation**: Admin users still manage clients via search
- Commit after each user story phase completion
- Stop at any checkpoint to validate story independently
- **Avoid**: Same file conflicts (US1 and US2 both modify MainLayout - do sequentially or coordinate carefully)

---

## Risk Mitigation

### Risk: Breaking Shared Components

**Mitigation**: Tasks T053-T055 specifically identify and verify exclusive vs. shared dependencies before deletion

### Risk: Hard-coded Navigation References

**Mitigation**: Foundational phase (T005-T009) finds ALL navigation references BEFORE any deletion

### Risk: Test Suite Failures

**Mitigation**: T056-T057 run full test suites after all changes to catch issues

### Risk: Same File Conflicts (MainLayout.vue)

**Mitigation**:
- If sequential: US1 removes Files item (T010), then US2 removes Clients item (T024)
- If parallel: Coordinate or merge both changes in single commit

---

## Total Task Count: 61 Tasks

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (User Story 1)**: 14 tasks
- **Phase 4 (User Story 2)**: 14 tasks
- **Phase 5 (User Story 3)**: 10 tasks
- **Phase 6 (Polish)**: 14 tasks

**Parallelizable Tasks**: 16 tasks marked [P]
**Sequential Tasks**: 45 tasks (order-dependent)

**Estimated Total Effort**: 3-5 hours (sequential), 2-3 hours (with parallelization)
